import logging
import io
from uuid import UUID
from datetime import datetime, timedelta
import json

from sqlalchemy.orm import Session

from app.repositories.planning_repo import PlanningRepository
from app.schemas.planning import (
    BimestreResponse,
    ConteudoResponse,
    EtapaResponse,
    GerarPlanejamentoRequest,
    PlanejamentoResponse,
    SequenciaResponse,
)
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)


SEMANAS_LETIVAS = 40


class PlanningService:
    def __init__(self, db: Session):
        self.db = db
        self.gemini = GeminiService()
        self.repo = PlanningRepository(db)

    async def gerar(self, req: GerarPlanejamentoRequest) -> PlanejamentoResponse:
        carga_anual = req.carga_horaria_semanal * SEMANAS_LETIVAS

        gemini_output = await self.gemini.gerar_planejamento(
            disciplina=req.disciplina,
            serie=req.serie,
            carga_horaria_semanal=req.carga_horaria_semanal,
            carga_horaria_anual=carga_anual,
            ano_letivo=req.ano_letivo,
            temas=req.temas_curriculares,
        )

        carga_warning = self._validar_carga(gemini_output, carga_anual)
        status = "carga_desalinhada" if carga_warning else "ativo"

        planejamento = self.repo.criar_planejamento(
            professor_id=req.professor_id,
            disciplina=req.disciplina,
            serie=req.serie,
            carga_horaria_semanal=req.carga_horaria_semanal,
            carga_horaria_anual=carga_anual,
            ano_letivo=req.ano_letivo,
            gemini_output=gemini_output,
            status=status,
            turma=req.turma,
        )

        return self._to_response(planejamento, carga_warning)

    def listar_planejamentos(self, professor_id: str) -> list[PlanejamentoResponse]:
        from app.models.planejamento import PlanejamentoAnual
        planejamentos = self.db.query(PlanejamentoAnual).filter_by(professor_id=professor_id).all()
        return [self._to_response(p, p.status == "carga_desalinhada") for p in planejamentos]

    def _validar_carga(self, output: dict, carga_esperada: int) -> bool:
        bimestres = output.get("bimestres", [])
        if not bimestres:
            return True
        soma = sum(b.get("carga_horaria", 0) for b in bimestres)
        if carga_esperada == 0:
            return soma != 0
        return abs(soma - carga_esperada) / carga_esperada > 0.05

    def _to_response(self, p, carga_warning: bool) -> PlanejamentoResponse:
        return PlanejamentoResponse(
            id=p.id,
            professor_id=p.professor_id,
            disciplina=p.disciplina,
            serie=p.serie,
            turma=p.turma,
            carga_horaria_semanal=p.carga_horaria_semanal,
            carga_horaria_anual=p.carga_horaria_anual,
            ano_letivo=p.ano_letivo,
            status=p.status,
            carga_warning=carga_warning,
            bimestres=[
                BimestreResponse(
                    id=b.id,
                    numero=b.bimestre,
                    titulo=b.titulo,
                    temas_principais=b.temas_principais,
                    carga_horaria=b.carga_horaria,
                    conteudos=[
                        ConteudoResponse(
                            id=c.id,
                            titulo=c.titulo,
                            descricao=c.descricao,
                            tipo=c.tipo,
                            carga_horaria_estimada=c.carga_horaria_estimada,
                        )
                        for c in (b.conteudos if hasattr(b, "conteudos") and b.conteudos else [])
                    ],
                )
                for b in (p.bimestres if hasattr(p, "bimestres") and p.bimestres else [])
            ],
            created_at=p.created_at,
        )

    async def gerar_sequencia(self, conteudo_id: UUID) -> SequenciaResponse:
        ctx = self.repo.get_conteudo_com_contexto(conteudo_id)

        gemini_output = await self.gemini.gerar_sequencia_didatica(
            disciplina=ctx["disciplina"],
            serie=ctx["serie"],
            bimestre=ctx["bimestre"],
            conteudo_titulo=ctx["conteudo"].titulo,
            conteudo_descricao=ctx["conteudo"].descricao or "",
            carga_estimada=ctx["carga_estimada"],
            habilidade_bncc=ctx["habilidade_bncc"],
        )

        seq = self.repo.upsert_sequencia(conteudo_id, gemini_output)
        return self._seq_to_response(seq)

    def _seq_to_response(self, seq) -> SequenciaResponse:
        return SequenciaResponse(
            id=seq.id,
            conteudo_id=seq.conteudo_id,
            titulo=seq.titulo,
            objetivo_geral=seq.objetivo_geral,
            objetivos_especificos=seq.objetivos_especificos or [],
            metodologia=seq.metodologia,
            recursos=seq.recursos or [],
            etapas=[EtapaResponse(**e) for e in (seq.etapas or [])],
            avaliacao=seq.avaliacao,
            referencias=seq.referencias or [],
            created_at=seq.created_at,
        )

    # ── RF-005 ──

    def confirmar_aula(self, aula_id: UUID, status: str, professor_id: str,
                       observacao: str | None = None, engajamento: str | None = None,
                       dificuldades: str | None = None, recursos: str | None = None) -> dict:
        return self.repo.confirmar_aula(
            aula_id=aula_id, status=status, professor_id=professor_id,
            observacao=observacao, engajamento=engajamento,
            dificuldades=dificuldades, recursos=recursos,
        )

    # ── RF-006 ──

    async def propor_reagendamento(self, conteudo_id: UUID, aula_original_id: UUID, professor_id: str) -> dict:
        ctx = self.repo.get_conteudo_com_contexto(conteudo_id)
        conteudo = ctx["conteudo"]
        pendentes = self.repo.get_conteudos_nao_cobertos(professor_id)

        data_original = ""
        for p in pendentes:
            if p["conteudo"].id == conteudo_id:
                data_original = p["data_original"] or ""
                break

        slots = self.repo.get_slots_disponiveis(professor_id, data_original or "2026-01-01")

        gemini_output = await self.gemini.gerar_reagendamento(
            disciplina=ctx["disciplina"],
            serie=ctx["serie"],
            conteudo_titulo=conteudo.titulo,
            conteudo_descricao=conteudo.descricao or "",
            prioridade=conteudo.prioridade,
            data_original=data_original,
            slots_disponiveis=slots,
        )

        propostas = []
        for p in gemini_output.get("propostas", [])[:3]:
            reag = self.repo.criar_reagendamento(
                conteudo_id=conteudo_id,
                aula_original_id=aula_original_id,
                nova_data=p["data"],
                professor_id=professor_id,
                justificativa=p.get("justificativa", ""),
            )
            propostas.append({
                "id": str(reag.id),
                "conteudo_id": str(conteudo_id),
                "nova_data_proposta": p["data"],
                "justificativa": p.get("justificativa", ""),
                "status": reag.status,
            })

        return {"propostas": propostas, "total_conteudos_pendentes": len(pendentes)}

    # ── RF-007 ──

    def criar_observacao(self, aula_id: UUID, professor_id: str, texto: str,
                         engajamento: str | None = None, dificuldades: str | None = None,
                         recursos_utilizados: str | None = None) -> dict:
        from app.models.observacao import ObservacaoAula

        obs = ObservacaoAula(
            aula_id=aula_id,
            professor_id=professor_id,
            texto=texto,
            engajamento=engajamento,
            dificuldades=dificuldades,
            recursos_utilizados=recursos_utilizados,
        )
        self.db.add(obs)
        self.db.commit()
        self.db.refresh(obs)

        from app.schemas.planning import ObservacaoResponse
        return ObservacaoResponse(
            id=obs.id, aula_id=obs.aula_id, professor_id=obs.professor_id,
            texto=obs.texto, engajamento=obs.engajamento,
            dificuldades=obs.dificuldades, recursos_utilizados=obs.recursos_utilizados,
            created_at=obs.created_at,
        ).model_dump()

    def get_reports(self, professor_id: str) -> dict:
        return self.repo.get_report(professor_id)

    def _extrair_texto_pdf(self, content: bytes) -> str:
        from pypdf import PdfReader
        try:
            reader = PdfReader(io.BytesIO(content))
            texto = ""
            for page in reader.pages:
                texto += page.extract_text() or ""
            return texto
        except Exception as e:
            logger.error(f"Erro ao extrair texto do PDF: {e}")
            raise ValueError(f"Não foi possível ler o arquivo PDF: {e}")

    def _extrair_texto_docx(self, content: bytes) -> str:
        import docx
        try:
            doc = docx.Document(io.BytesIO(content))
            texto = ""
            for para in doc.paragraphs:
                texto += para.text + "\n"
            return texto
        except Exception as e:
            logger.error(f"Erro ao extrair texto do DOCX: {e}")
            raise ValueError(f"Não foi possível ler o arquivo DOCX: {e}")

    async def importar_por_arquivo(
        self,
        file_content: bytes,
        file_name: str,
        disciplina_sugerida: str | None = None,
        serie_sugerida: str | None = None,
        ano_letivo_sugerido: int | None = None,
    ) -> list[dict]:
        ext = file_name.split(".")[-1].lower()
        if ext == "pdf":
            document_text = self._extrair_texto_pdf(file_content)
        elif ext in ("docx", "doc"):
            document_text = self._extrair_texto_docx(file_content)
        else:
            raise ValueError("Formato de arquivo não suportado. Use PDF ou DOCX.")

        if not document_text.strip():
            raise ValueError("O documento enviado está vazio ou não possui texto extraível.")

        gemini_output = await self.gemini.importar_planejamento_de_texto(
            document_text=document_text,
            disciplina_sugerida=disciplina_sugerida,
            serie_sugerida=serie_sugerida,
            ano_letivo_sugerido=ano_letivo_sugerido,
        )

        # Trata o formato envelopado em lista ou formato antigo direto
        if isinstance(gemini_output, dict) and "planejamentos" in gemini_output:
            plan_list = gemini_output["planejamentos"]
        else:
            plan_list = [gemini_output]

        propostas = []
        for plan_data in plan_list:
            disciplina_extraida = plan_data.get("disciplina") or disciplina_sugerida or "Disciplina Não Identificada"
            serie_extraida = plan_data.get("serie") or serie_sugerida or "Série Não Identificada"
            ano_letivo_extraido = plan_data.get("ano_letivo") or ano_letivo_sugerido or datetime.now().year
            
            carga_semanal = plan_data.get("carga_horaria_semanal") or 2
            carga_anual = plan_data.get("carga_horaria_anual") or (carga_semanal * SEMANAS_LETIVAS)

            propostas.append({
                "disciplina": disciplina_extraida,
                "serie": serie_extraida,
                "carga_horaria_semanal": carga_semanal,
                "carga_horaria_anual": carga_anual,
                "ano_letivo": ano_letivo_extraido,
                "bimestres": plan_data.get("bimestres", []),
            })

        return propostas

    def salvar_planejamentos_lote(self, planejamentos: list[dict], professor_id: str) -> list[PlanejamentoResponse]:
        created_plans = []
        for plan in planejamentos:
            disciplina = plan["disciplina"]
            serie = plan["serie"]
            carga_semanal = plan.get("carga_horaria_semanal") or 2
            carga_anual = plan.get("carga_horaria_anual") or (carga_semanal * SEMANAS_LETIVAS)
            ano_letivo = plan.get("ano_letivo") or datetime.now().year
            
            # turmas pode vir do request como array de strings
            turmas = plan.get("turmas") or []
            if not isinstance(turmas, list):
                turmas = [turmas] if turmas else []
                
            # Se for fornecido turmas vazia, salva uma vez com turma=None
            if not turmas:
                turmas = [None]

            for turma in turmas:
                carga_warning = self._validar_carga(plan, carga_anual)
                status = "carga_desalinhada" if carga_warning else "ativo"
                
                planejamento = self.repo.criar_planejamento(
                    professor_id=professor_id,
                    disciplina=disciplina,
                    serie=serie,
                    carga_horaria_semanal=carga_semanal,
                    carga_horaria_anual=carga_anual,
                    ano_letivo=ano_letivo,
                    gemini_output=plan,
                    status=status,
                    turma=turma,
                )
                created_plans.append(self._to_response(planejamento, carga_warning))
                
        return created_plans

    def salvar_horarios(self, planejamento_id: UUID, horarios_data: list[dict]) -> list[dict]:
        from app.models.planejamento import PlanejamentoHorario

        # Deletar horários antigos deste planejamento
        self.db.query(PlanejamentoHorario).filter_by(planejamento_anual_id=planejamento_id).delete()

        created = []
        for h in horarios_data:
            horario = PlanejamentoHorario(
                planejamento_anual_id=planejamento_id,
                dia_semana=h["dia_semana"],
                horario_inicio=h["horario_inicio"],
                duracao_minutos=h.get("duracao_minutos", 50),
            )
            self.db.add(horario)
            created.append(horario)

        self.db.commit()

        return [
            {
                "id": str(x.id),
                "dia_semana": x.dia_semana,
                "horario_inicio": x.horario_inicio,
                "duracao_minutos": x.duracao_minutos,
            }
            for x in created
        ]

    def obter_horarios(self, planejamento_id: UUID) -> list[dict]:
        from app.models.planejamento import PlanejamentoHorario
        horarios = self.db.query(PlanejamentoHorario).filter_by(planejamento_anual_id=planejamento_id).all()
        return [
            {
                "id": str(x.id),
                "dia_semana": x.dia_semana,
                "horario_inicio": x.horario_inicio,
                "duracao_minutos": x.duracao_minutos,
            }
            for x in horarios
        ]

    async def distribuir_conteudos_manual(self, planejamento_id: UUID, professor_id: str) -> dict:
        from app.models.planejamento import PlanejamentoAnual, PlanejamentoBimestral, PlanejamentoHorario
        from app.models.aula import Conteudo, AulaPlano
        from app.models.calendario import CalendarioEscolar

        anual = self.db.query(PlanejamentoAnual).filter_by(id=planejamento_id).first()
        if not anual:
            raise ValueError("Planejamento anual não encontrado")

        horarios = self.db.query(PlanejamentoHorario).filter_by(planejamento_anual_id=planejamento_id).all()
        if not horarios:
            raise ValueError("Nenhum horário semanal cadastrado para este planejamento. Cadastre os horários antes de distribuir.")

        # Buscar calendário escolar do professor para obter datas de início/fim e feriados
        cal = self.db.query(CalendarioEscolar).filter_by(professor_id=professor_id, ano_letivo=anual.ano_letivo).first()
        if cal:
            data_inicio = cal.data_inicio
            data_fim = cal.data_fim
            try:
                feriados = json.loads(cal.feriados_json) if cal.feriados_json else {}
                feriados_datas = feriados.get("datas", []) if isinstance(feriados, dict) else []
            except Exception:
                feriados_datas = []
        else:
            # Padrão: início de fevereiro a meio de dezembro do ano letivo do planejamento
            data_inicio = datetime(anual.ano_letivo, 2, 1)
            data_fim = datetime(anual.ano_letivo, 12, 15)
            feriados_datas = []

        # Coletar todos os conteúdos ordenados por bimestre e depois pela ordem natural no banco
        bimestres = self.db.query(PlanejamentoBimestral).filter_by(planejamento_anual_id=planejamento_id).order_by(PlanejamentoBimestral.bimestre).all()
        
        conteudos = []
        for bim in bimestres:
            conteudos_bim = self.db.query(Conteudo).filter_by(planejamento_bimestral_id=bim.id).order_by(Conteudo.created_at).all()
            conteudos.extend(conteudos_bim)

        # Gerar os slots de aula
        slots = []
        dia_atual = data_inicio
        
        # Mapeamento do dia da semana (dia_semana no banco: 2=Segunda, 3=Terça, ..., 7=Sábado, 1=Domingo)
        # weekday() no Python: 0=Segunda, 1=Terça, ..., 5=Sábado, 6=Domingo
        def python_to_banco_weekday(dt_obj):
            pw = dt_obj.weekday()
            return (pw + 1) % 7 + 1

        while dia_atual <= data_fim:
            data_str = dia_atual.strftime("%Y-%m-%d")
            # Pular feriados
            if data_str in feriados_datas:
                dia_atual += timedelta(days=1)
                continue

            dia_banco = python_to_banco_weekday(dia_atual)
            
            # Verificar se o dia da semana atual possui aulas cadastradas na grade do planejamento
            dia_horarios = [h for h in horarios if h.dia_semana == dia_banco]
            
            # Ordenar horários do dia
            dia_horarios.sort(key=lambda h: h.horario_inicio)
            
            for h in dia_horarios:
                h_parts = h.horario_inicio.split(":")
                hora = int(h_parts[0])
                minuto = int(h_parts[1]) if len(h_parts) > 1 else 0
                
                dt_aula = datetime(dia_atual.year, dia_atual.month, dia_atual.day, hora, minuto)
                slots.append({
                    "data": dt_aula,
                    "duracao_minutos": h.duracao_minutos
                })

            dia_atual += timedelta(days=1)

        # Deletar aulas antigas deste planejamento
        bimestres_ids = [b.id for b in bimestres]
        if bimestres_ids:
            self.db.query(AulaPlano).filter(AulaPlano.planejamento_bimestral_id.in_(bimestres_ids)).delete(synchronize_session=False)

        aulas_criadas = []
        slot_idx = 0

        # Alocar os conteúdos sequencialmente nos slots
        for conteudo in conteudos:
            # Um conteúdo pode ocupar múltiplos slots se sua carga horária estimada for maior que 1
            aulas_necessarias = conteudo.carga_horaria_estimada or 1
            for _ in range(aulas_necessarias):
                if slot_idx >= len(slots):
                    break
                
                slot = slots[slot_idx]
                aula = AulaPlano(
                    planejamento_bimestral_id=conteudo.planejamento_bimestral_id,
                    conteudo_id=conteudo.id,
                    data=slot["data"],
                    titulo=conteudo.titulo,
                    objetivo=conteudo.descricao,
                    duracao_minutos=slot["duracao_minutos"],
                    status_execucao="pendente",
                )
                self.db.add(aula)
                aulas_criadas.append(aula)
                slot_idx += 1

        self.db.commit()

        return {
            "aulas_criadas": [
                {"id": str(a.id), "data": a.data.isoformat(), "conteudo_id": str(a.conteudo_id), "titulo": a.titulo}
                for a in aulas_criadas
            ],
            "total": len(aulas_criadas),
            "nao_alocados": max(0, len(conteudos) - len(aulas_criadas)),
        }

    def deletar_planejamento(self, planejamento_id: UUID) -> bool:
        from app.repositories.planning_repo import PlanningRepository
        repo = PlanningRepository(self.db)
        return repo.deletar_planejamento(planejamento_id)

    def editar_planejamento(self, planejamento_id: UUID, req) -> PlanejamentoResponse:
        from app.repositories.planning_repo import PlanningRepository
        from app.schemas.planning import PlanejamentoResponse
        repo = PlanningRepository(self.db)
        
        dados = {
            "disciplina": req.disciplina,
            "serie": req.serie,
            "turma": req.turma,
            "carga_horaria_semanal": req.carga_horaria_semanal,
            "ano_letivo": req.ano_letivo,
        }
        dados_filtrados = {k: v for k, v in dados.items() if v is not None}
        
        plano = repo.editar_planejamento(planejamento_id, dados_filtrados)
        return self._to_response(plano, False)


