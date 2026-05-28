import json
import logging
from datetime import datetime, timedelta

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from sqlalchemy.orm import Session

from app.config import settings
from app.models.calendario import CalendarioEscolar
from app.models.aula import AulaPlano, Conteudo
from app.models.planejamento import PlanejamentoBimestral

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]


class CalendarAuthError(Exception):
    pass


class CalendarSyncError(Exception):
    pass


class GoogleCalendarService:
    def __init__(self, db: Session):
        self.db = db

    def get_auth_url(self, professor_id: str, redirect_uri: str) -> str:
        from google_auth_oauthlib.flow import Flow

        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri],
                }
            },
            scopes=SCOPES,
        )
        flow.redirect_uri = redirect_uri
        auth_url, state = flow.authorization_url(
            access_type="offline", include_granted_scopes="true", prompt="consent"
        )
        # Store state temporarily for CSRF check
        self._store_oauth_state(professor_id, state)
        return auth_url

    def handle_callback(self, code: str, state: str, professor_id: str, redirect_uri: str) -> dict:
        from google_auth_oauthlib.flow import Flow

        expected_state = self._get_oauth_state(professor_id)
        if state != expected_state:
            raise CalendarAuthError("CSRF check failed — state mismatch")

        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
            state=state,
        )
        flow.redirect_uri = redirect_uri
        flow.fetch_token(code=code)

        credentials = flow.credentials
        self._store_tokens(professor_id, credentials)
        self._clear_oauth_state(professor_id)

        return self._sync_events(professor_id)

    def import_events(self, professor_id: str, data_inicio: datetime, data_fim: datetime) -> dict:
        creds = self._get_credentials(professor_id)
        if not creds:
            aulas_planejadas = self._get_aulas_planejadas(professor_id, data_inicio, data_fim)
            return {
                "eventos_google": [],
                "slots_aula": [],
                "aulas_planejadas": aulas_planejadas,
            }

        service = build("calendar", "v3", credentials=creds)
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=data_inicio.isoformat() + "Z",
                timeMax=data_fim.isoformat() + "Z",
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

        eventos_google = events_result.get("items", [])
        slots_aula = self._detectar_slots(eventos_google, professor_id)
        aulas_planejadas = self._get_aulas_planejadas(professor_id, data_inicio, data_fim)

        return {
            "eventos_google": eventos_google,
            "slots_aula": slots_aula,
            "aulas_planejadas": aulas_planejadas,
        }

    def distribuir_conteudos(self, planejamento_bimestral_id, professor_id: str) -> dict:
        bim = self.db.query(PlanejamentoBimestral).filter_by(id=planejamento_bimestral_id).first()
        if not bim:
            raise CalendarSyncError("Planejamento bimestral não encontrado")

        conteudos = (
            self.db.query(Conteudo)
            .filter_by(planejamento_bimestral_id=planejamento_bimestral_id)
            .order_by(Conteudo.prioridade)
            .all()
        )

        # Get all slots for the bimestre period (approximate: use ano letivo + bimestre)
        anual = bim.planejamento_anual
        data_inicio = datetime(anual.ano_letivo, max(1, (bim.bimestre - 1) * 3 + 1), 1)
        data_fim = data_inicio + timedelta(days=90)

        dados = self.import_events(professor_id, data_inicio, data_fim)
        slots = dados["slots_aula"]

        # Remove existing aulas for this bimestre
        self.db.query(AulaPlano).filter_by(planejamento_bimestral_id=planejamento_bimestral_id).delete()

        aulas_criadas = []
        for i, conteudo in enumerate(conteudos):
            if i >= len(slots):
                break
            slot = slots[i]
            aula = AulaPlano(
                planejamento_bimestral_id=planejamento_bimestral_id,
                conteudo_id=conteudo.id,
                data=datetime.fromisoformat(slot["data"]),
                titulo=conteudo.titulo,
                objetivo=conteudo.descricao,
                duracao_minutos=slot.get("duracao", 50),
            )
            self.db.add(aula)
            aulas_criadas.append(aula)

        self.db.commit()

        return {
            "aulas_criadas": [
                {"id": str(a.id), "data": a.data.isoformat(), "conteudo_id": str(a.conteudo_id), "titulo": a.titulo}
                for a in aulas_criadas
            ],
            "total": len(aulas_criadas),
            "nao_alocados": len(conteudos) - len(aulas_criadas),
        }

    def _detectar_slots(self, eventos_google: list, professor_id: str) -> list:
        slots = []
        for evento in eventos_google:
            summary = evento.get("summary", "")
            start = evento.get("start", {})
            end = evento.get("end", {})

            date_str = start.get("date") or start.get("dateTime", "")

            # Skip feriados/recessos
            if any(p in summary.lower() for p in ["feriado", "recesso", "férias", "ferias"]):
                continue

            # Try to match discipline in summary
            calendarios = (
                self.db.query(CalendarioEscolar)
                .filter_by(professor_id=professor_id)
                .all()
            )
            for cal in calendarios:
                # Simple match: if the calendar entry is linked to a discipline
                if date_str and "dateTime" not in start:
                    continue  # Skip all-day events

                if date_str:
                    slots.append({
                        "data": date_str[:10] if "T" in date_str else date_str,
                        "horario_inicio": date_str[11:16] if "T" in date_str else start.get("dateTime", "")[11:16] if "dateTime" in start else "",
                        "duracao": cal.duracao_aula_minutos,
                        "summary": summary,
                    })

        slots.sort(key=lambda s: s["data"])
        return slots

    def _get_aulas_planejadas(self, professor_id: str, data_inicio: datetime, data_fim: datetime) -> list:
        aulas = (
            self.db.query(AulaPlano)
            .filter(AulaPlano.data >= data_inicio, AulaPlano.data <= data_fim)
            .all()
        )
        return [
            {"id": str(a.id), "data": a.data.isoformat(), "conteudo_id": str(a.conteudo_id) if a.conteudo_id else None,
             "titulo": a.titulo, "status": a.status_execucao}
            for a in aulas
        ]

    def _get_credentials(self, professor_id: str) -> Credentials | None:
        cal = self.db.query(CalendarioEscolar).filter_by(professor_id=professor_id).first()
        if not cal or not cal.google_tokens_json:
            return None

        tokens = json.loads(cal.google_tokens_json)
        creds = Credentials(
            token=tokens.get("access_token"),
            refresh_token=tokens.get("refresh_token"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            scopes=SCOPES,
        )

        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            self._store_tokens(professor_id, creds)

        return creds

    def _store_tokens(self, professor_id: str, credentials: Credentials):
        cal = self.db.query(CalendarioEscolar).filter_by(professor_id=professor_id).first()
        tokens_json = json.dumps({
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
        })
        if cal:
            cal.google_tokens_json = tokens_json
            cal.fonte_calendario = "google"
            cal.sincronizado_em = datetime.utcnow()
        else:
            cal = CalendarioEscolar(
                professor_id=professor_id,
                ano_letivo=datetime.utcnow().year,
                data_inicio=datetime.utcnow(),
                data_fim=datetime.utcnow() + timedelta(days=365),
                dias_semana="2,3,4,5,6",
                horario_inicio="07:30",
                google_tokens_json=tokens_json,
                fonte_calendario="google",
                sincronizado_em=datetime.utcnow(),
            )
            self.db.add(cal)
        self.db.commit()

    def _store_oauth_state(self, professor_id: str, state: str):
        cal = self.db.query(CalendarioEscolar).filter_by(professor_id=professor_id).first()
        if cal:
            cal.feriados_json = json.dumps({"oauth_state": state})
        else:
            cal = CalendarioEscolar(
                professor_id=professor_id,
                ano_letivo=datetime.utcnow().year,
                data_inicio=datetime.utcnow(),
                data_fim=datetime.utcnow() + timedelta(days=365),
                dias_semana="2,3,4,5,6",
                horario_inicio="07:30",
                feriados_json=json.dumps({"oauth_state": state}),
            )
            self.db.add(cal)
        self.db.commit()

    def _get_oauth_state(self, professor_id: str) -> str | None:
        cal = self.db.query(CalendarioEscolar).filter_by(professor_id=professor_id).first()
        if not cal or not cal.feriados_json:
            return None
        try:
            data = json.loads(cal.feriados_json)
            return data.get("oauth_state")
        except json.JSONDecodeError:
            return None

    def _clear_oauth_state(self, professor_id: str):
        cal = self.db.query(CalendarioEscolar).filter_by(professor_id=professor_id).first()
        if cal:
            cal.feriados_json = None
            self.db.commit()

    def _sync_events(self, professor_id: str) -> dict:
        cal = self.db.query(CalendarioEscolar).filter_by(professor_id=professor_id).first()
        if not cal:
            raise CalendarSyncError("Calendário não encontrado")

        data_inicio = cal.data_inicio
        data_fim = cal.data_fim
        return self.import_events(professor_id, data_inicio, data_fim)
