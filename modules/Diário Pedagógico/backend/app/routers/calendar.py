import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.calendar import (
    AuthUrlResponse,
    CalendarEventsResponse,
    DistributeRequest,
    DistributeResultResponse,
    SyncRequest,
)
from app.services.calendar_service import CalendarAuthError, CalendarSyncError, GoogleCalendarService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/calendar", tags=["calendario"])


@router.post("/sync", response_model=AuthUrlResponse)
def iniciar_sync(body: SyncRequest, db: Session = Depends(get_db)):
    service = GoogleCalendarService(db)
    try:
        auth_url = service.get_auth_url(body.professor_id, body.redirect_uri)
        return AuthUrlResponse(auth_url=auth_url)
    except Exception as e:
        logger.exception("Erro ao iniciar OAuth")
        raise HTTPException(status_code=500, detail={"error": "oauth_error", "detail": str(e)})


@router.get("/callback")
def callback_oauth(
    code: str = Query(...),
    state: str = Query(...),
    professor_id: str = Query(...),
    redirect_uri: str = Query("http://localhost:3000/calendario/callback"),
    db: Session = Depends(get_db),
):
    service = GoogleCalendarService(db)
    try:
        result = service.handle_callback(code=code, state=state, professor_id=professor_id, redirect_uri=redirect_uri)
        return {"status": "ok", **result}
    except CalendarAuthError as e:
        raise HTTPException(status_code=401, detail={"error": "auth_failed", "detail": str(e)})
    except Exception as e:
        logger.exception("Erro no callback OAuth")
        raise HTTPException(status_code=500, detail={"error": "callback_error", "detail": str(e)})


@router.get("/events", response_model=CalendarEventsResponse)
def listar_eventos(
    professor_id: str = Query(...),
    data_inicio: str = Query(...),
    data_fim: str = Query(...),
    db: Session = Depends(get_db),
):
    from datetime import datetime

    service = GoogleCalendarService(db)
    try:
        return service.import_events(
            professor_id=professor_id,
            data_inicio=datetime.fromisoformat(data_inicio),
            data_fim=datetime.fromisoformat(data_fim),
        )
    except CalendarAuthError as e:
        raise HTTPException(status_code=401, detail={"error": "not_authenticated", "detail": str(e)})
    except Exception as e:
        logger.exception("Erro ao importar eventos")
        raise HTTPException(status_code=500, detail={"error": "import_error", "detail": str(e)})


@router.post("/distribute", status_code=201, response_model=DistributeResultResponse)
def distribuir_conteudos(body: DistributeRequest, db: Session = Depends(get_db)):
    service = GoogleCalendarService(db)
    try:
        return service.distribuir_conteudos(body.planejamento_bimestral_id, body.professor_id)
    except CalendarSyncError as e:
        raise HTTPException(status_code=404, detail={"error": "not_found", "detail": str(e)})
    except CalendarAuthError as e:
        raise HTTPException(status_code=401, detail={"error": "not_authenticated", "detail": str(e)})
    except Exception as e:
        logger.exception("Erro ao distribuir conteúdos")
        raise HTTPException(status_code=500, detail={"error": "distribute_error", "detail": str(e)})
