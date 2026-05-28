import logging

from sqlalchemy.orm import Session, joinedload

from app.models.planejamento import PlanejamentoAnual, PlanejamentoBimestral
from app.models.aula import Conteudo, AulaPlano
from app.models.sequencia import SequenciaDidatica

logger = logging.getLogger(__name__)


class ContentNotFoundError(Exception):
    pass


class PlanningRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_conteudo_com_contexto(self, conteudo_id) -> dict:
        conteudo = (
            self.db.query(Conteudo)
            .options(
                joinedload(Conteudo.planejamento_bimestral).joinedload(PlanejamentoBimestral.planejamento_anual)
            )
            .filter(Conteudo.id == conteudo_id)
            .first()
        )
        if not conteudo:
            raise ContentNotFoundError(f"Conteúdo {conteudo_id} não encontrado")

        bim = conteudo.planejamento_bimestral
        anual = bim.planejamento_anual
        return {
            "conteudo": conteudo,
            "disciplina": anual.disciplina,
            "serie": anual.serie,
            "bimestre": bim.bimestre,
            "carga_estimada": conteudo.carga_horaria_estimada,
            "habilidade_bncc": conteudo.habilidade_bncc or "",
        }

    def upsert_sequencia(self, conteudo_id, gemini_output: dict) -> SequenciaDidatica:
        existing = self.db.query(SequenciaDidatica).filter_by(conteudo_id=conteudo_id).first()

        if existing:
            existing.titulo = gemini_output["titulo"]
            existing.objetivo_geral = gemini_output["objetivo_geral"]
            existing.objetivos_especificos = gemini_output["objetivos_especificos"]
            existing.metodologia = gemini_output["metodologia"]
            existing.recursos = gemini_output["recursos"]
            existing.etapas = gemini_output["etapas"]
            existing.avaliacao = gemini_output["avaliacao"]
            existing.referencias = gemini_output["referencias"]
            self.db.commit()
            self.db.refresh(existing)
            return existing

        seq = SequenciaDidatica(
            conteudo_id=conteudo_id,
            titulo=gemini_output["titulo"],
            objetivo_geral=gemini_output["objetivo_geral"],
            objetivos_especificos=gemini_output["objetivos_especificos"],
            metodologia=gemini_output["metodologia"],
            recursos=gemini_output["recursos"],
            etapas=gemini_output["etapas"],
            avaliacao=gemini_output["avaliacao"],
            referencias=gemini_output["referencias"],
        )
        self.db.add(seq)
        self.db.commit()
        self.db.refresh(seq)
        return seq

    def criar_planejamento(
        self,
        professor_id: str,
        disciplina: str,
        serie: str,
        carga_horaria_semanal: int,
        carga_horaria_anual: int,
        ano_letivo: int,
        gemini_output: dict,
        status: str,
        turma: str | None = None,
    ) -> PlanejamentoAnual:
        try:
            planejamento = PlanejamentoAnual(
                professor_id=professor_id,
                disciplina=disciplina,
                serie=serie,
                turma=turma,
                carga_horaria_semanal=carga_horaria_semanal,
                carga_horaria_anual=carga_horaria_anual,
                ano_letivo=ano_letivo,
                temas_curriculares=", ".join(gemini_output.get("temas_curriculares", []))
                if isinstance(gemini_output.get("temas_curriculares"), list)
                else None,
                status=status,
            )
            self.db.add(planejamento)
            self.db.flush()

            for bim_data in gemini_output.get("bimestres", []):
                bim = PlanejamentoBimestral(
                    planejamento_anual_id=planejamento.id,
                    bimestre=bim_data["numero"],
                    titulo=bim_data.get("titulo"),
                    temas_principais=bim_data.get("temas_principais"),
                    carga_horaria=bim_data["carga_horaria"],
                )
                self.db.add(bim)
                self.db.flush()

                for cont_data in bim_data.get("conteudos", []):
                    conteudo = Conteudo(
                        planejamento_bimestral_id=bim.id,
                        titulo=cont_data["titulo"],
                        descricao=cont_data.get("descricao"),
                        tipo=cont_data.get("tipo"),
                        carga_horaria_estimada=cont_data.get("carga_estimada", cont_data.get("carga_horaria_estimada", 1)),
                        habilidade_bncc=cont_data.get("habilidade_bncc"),
                    )
                    self.db.add(conteudo)


            self.db.commit()
            self.db.refresh(planejamento)
            return planejamento

        except Exception:
            self.db.rollback()
            logger.exception("Falha ao persistir planejamento — rollback executado")
            raise

    # ── RF-005 Confirmação ──

    def confirmar_aula(self, aula_id, status: str, professor_id: str,
                       observacao: str | None = None, engajamento: str | None = None,
                       dificuldades: str | None = None, recursos: str | None = None) -> dict:
        from datetime import datetime as dt
        from app.models.observacao import ObservacaoAula

        aula = self.db.query(AulaPlano).filter_by(id=aula_id).first()
        if not aula:
            raise ContentNotFoundError(f"Aula {aula_id} não encontrada")

        aula.status_execucao = status
        if status in ("completa", "parcial"):
            aula.realizado_em = dt.utcnow()

        reagendamento_sugerido = False
        if status == "nao_realizada":
            reagendamento_sugerido = True

        if observacao:
            obs = ObservacaoAula(
                aula_id=aula_id,
                professor_id=professor_id,
                texto=observacao,
                engajamento=engajamento,
                dificuldades=dificuldades,
                recursos_utilizados=recursos,
            )
            self.db.add(obs)

        self.db.commit()
        self.db.refresh(aula)
        return {
            "id": aula.id,
            "status_execucao": aula.status_execucao,
            "realizado_em": aula.realizado_em,
            "reagendamento_sugerido": reagendamento_sugerido,
        }

    # ── RF-006 Reagendamento ──

    def get_conteudos_nao_cobertos(self, professor_id: str) -> list:
        aulas_nao_realizadas = (
            self.db.query(AulaPlano)
            .filter_by(status_execucao="nao_realizada")
            .all()
        )
        conteudos_pendentes = []
        for aula in aulas_nao_realizadas:
            if aula.conteudo_id:
                conteudo = self.db.query(Conteudo).filter_by(id=aula.conteudo_id).first()
                if conteudo:
                    conteudos_pendentes.append({
                        "conteudo": conteudo,
                        "aula_original_id": str(aula.id),
                        "data_original": aula.data.isoformat() if aula.data else None,
                    })
        return conteudos_pendentes

    def get_slots_disponiveis(self, professor_id: str, data_apos: str) -> list:
        from datetime import datetime as dt
        data_ref = dt.fromisoformat(data_apos) if data_apos else dt.utcnow()

        slots = (
            self.db.query(AulaPlano)
            .filter(
                AulaPlano.data >= data_ref,
                AulaPlano.conteudo_id.is_(None),
            )
            .order_by(AulaPlano.data)
            .all()
        )
        return [{"id": str(s.id), "data": s.data.isoformat()} for s in slots]

    def criar_reagendamento(self, conteudo_id, aula_original_id, nova_data: str,
                            professor_id: str, justificativa: str):
        from app.models.reagendamento import ReagendamentoConteudo
        from datetime import datetime as dt

        reag = ReagendamentoConteudo(
            aula_plano_original_id=aula_original_id,
            conteudo_id=conteudo_id,
            nova_data_proposta=dt.fromisoformat(nova_data),
            justificativa=justificativa,
            status="pendente",
            professor_id=professor_id,
        )
        self.db.add(reag)
        self.db.commit()
        self.db.refresh(reag)
        return reag

    # ── RF-007 Reports ──

    def get_report(self, professor_id: str) -> dict:
        from app.models.observacao import ObservacaoAula

        aulas = self.db.query(AulaPlano).all()
        total = len(aulas)
        completas = sum(1 for a in aulas if a.status_execucao == "completa")
        parciais = sum(1 for a in aulas if a.status_execucao == "parcial")
        nao_realizadas = sum(1 for a in aulas if a.status_execucao == "nao_realizada")
        taxa_exec = (completas / total * 100) if total > 0 else 0

        conteudos_total = self.db.query(Conteudo).count()
        conteudos_com_aula = self.db.query(AulaPlano.conteudo_id).filter(
            AulaPlano.conteudo_id.isnot(None),
            AulaPlano.status_execucao.in_(["completa", "parcial"]),
        ).distinct().count()
        taxa_cob = (conteudos_com_aula / conteudos_total * 100) if conteudos_total > 0 else 0

        obs = self.db.query(ObservacaoAula).all()
        eng_alto = sum(1 for o in obs if o.engajamento == "alto")
        eng_medio = sum(1 for o in obs if o.engajamento == "medio")
        eng_baixo = sum(1 for o in obs if o.engajamento == "baixo")

        return {
            "total_aulas": total,
            "aulas_completas": completas,
            "aulas_parciais": parciais,
            "aulas_nao_realizadas": nao_realizadas,
            "taxa_execucao": round(taxa_exec, 1),
            "total_conteudos": conteudos_total,
            "conteudos_cobertos": conteudos_com_aula,
            "taxa_cobertura": round(taxa_cob, 1),
            "engajamento_alto": eng_alto,
            "engajamento_medio": eng_medio,
            "engajamento_baixo": eng_baixo,
        }

    def deletar_planejamento(self, planejamento_id) -> bool:
        plano = self.db.query(PlanejamentoAnual).filter_by(id=planejamento_id).first()
        if not plano:
            raise ContentNotFoundError(f"Planejamento {planejamento_id} não encontrado")
        self.db.delete(plano)
        self.db.commit()
        return True

    def editar_planejamento(self, planejamento_id, dados: dict) -> PlanejamentoAnual:
        plano = self.db.query(PlanejamentoAnual).filter_by(id=planejamento_id).first()
        if not plano:
            raise ContentNotFoundError(f"Planejamento {planejamento_id} não encontrado")
        
        for campo, valor in dados.items():
            if valor is not None:
                setattr(plano, campo, valor)
        
        # Se alterou a carga horaria semanal, atualiza a carga horaria anual correspondente (40 semanas)
        if "carga_horaria_semanal" in dados and dados["carga_horaria_semanal"] is not None:
            plano.carga_horaria_anual = plano.carga_horaria_semanal * 40

        self.db.commit()
        self.db.refresh(plano)
        return plano

