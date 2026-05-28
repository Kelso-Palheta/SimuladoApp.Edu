import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.planning_repo import ContentNotFoundError
from app.schemas.planning import (
    ConfirmarAulaRequest,
    ConfirmarAulaResponse,
    CriarObservacaoRequest,
    ObservacaoResponse,
    ReagendarRequest,
    ReagendarResponse,
    ReportResponse,
)
from app.services.gemini_service import GeminiAPIError, GeminiParseError
from app.services.planning_service import PlanningService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["aula"])


@router.post("/class/confirm", response_model=ConfirmarAulaResponse)
def confirmar_aula(body: ConfirmarAulaRequest, db: Session = Depends(get_db)):
    service = PlanningService(db)
    try:
        result = service.confirmar_aula(
            aula_id=body.aula_id,
            status=body.status,
            professor_id="prof-123",  # TODO: JWT
            observacao=body.observacao,
            engajamento=body.engajamento,
            dificuldades=body.dificuldades,
            recursos=body.recursos_utilizados,
        )
        return ConfirmarAulaResponse(**result)
    except ContentNotFoundError as e:
        raise HTTPException(status_code=404, detail={"error": "not_found", "detail": str(e)})
    except Exception:
        logger.exception("Erro ao confirmar aula")
        raise HTTPException(status_code=500, detail={"error": "internal_error", "detail": "Erro ao confirmar aula."})


@router.post("/content/reschedule", status_code=201, response_model=ReagendarResponse)
async def propor_reagendamento(body: ReagendarRequest, db: Session = Depends(get_db)):
    service = PlanningService(db)
    try:
        result = await service.propor_reagendamento(
            conteudo_id=body.conteudo_id,
            aula_original_id=body.aula_original_id,
            professor_id=body.professor_id,
        )
        return ReagendarResponse(**result)
    except ContentNotFoundError as e:
        raise HTTPException(status_code=404, detail={"error": "not_found", "detail": str(e)})
    except GeminiParseError as e:
        raise HTTPException(
            status_code=502,
            detail={"error": "gemini_invalid_response", "detail": str(e), "retryable": True},
        )
    except GeminiAPIError as e:
        raise HTTPException(
            status_code=502,
            detail={"error": "gemini_api_error", "detail": str(e), "retryable": True},
        )
    except Exception:
        logger.exception("Erro ao propor reagendamento")
        raise HTTPException(status_code=500, detail={"error": "internal_error", "detail": "Erro ao reagendar."})


@router.post("/observation/create", status_code=201, response_model=ObservacaoResponse)
def criar_observacao(body: CriarObservacaoRequest, db: Session = Depends(get_db)):
    service = PlanningService(db)
    try:
        return service.criar_observacao(
            aula_id=body.aula_id, professor_id=body.professor_id,
            texto=body.texto, engajamento=body.engajamento,
            dificuldades=body.dificuldades, recursos_utilizados=body.recursos_utilizados,
        )
    except Exception:
        logger.exception("Erro ao criar observação")
        raise HTTPException(status_code=500, detail={"error": "internal_error", "detail": "Erro ao salvar observação."})


@router.get("/reports/execution", response_model=ReportResponse)
def get_report(professor_id: str = "prof-123", db: Session = Depends(get_db)):
    service = PlanningService(db)
    try:
        return service.get_reports(professor_id)
    except Exception:
        logger.exception("Erro ao gerar relatório")
        raise HTTPException(status_code=500, detail={"error": "internal_error", "detail": "Erro ao gerar relatório."})
