from uuid import UUID
import logging
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.planning_repo import ContentNotFoundError
from app.schemas.planning import (
    ErrorResponse,
    GerarPlanejamentoRequest,
    GerarSequenciaRequest,
    PlanejamentoResponse,
    SequenciaResponse,
    SalvarHorariosRequest,
    PlanejamentoHorarioResponse,
    DistribuirManualRequest,
    DistribuirManualResponse,
    EditarPlanejamentoRequest,
    PlanejamentoTemporarioResponse,
    BatchSalvarPlanejamentosRequest,
)
from app.services.gemini_service import GeminiAPIError, GeminiParseError
from app.services.planning_service import PlanningService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/planning", tags=["planejamento"])


@router.get(
    "",
    status_code=200,
    response_model=list[PlanejamentoResponse],
    responses={
        500: {"model": ErrorResponse},
    },
)
async def listar_planejamentos(
    professor_id: str,
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        return service.listar_planejamentos(professor_id)
    except Exception:
        logger.exception("Erro ao listar planejamentos")
        raise HTTPException(
            status_code=500,
            detail={"error": "internal_error", "detail": "Erro interno ao listar planejamentos.", "retryable": True},
        )


@router.post(
    "/annual",
    status_code=201,
    response_model=PlanejamentoResponse,
    responses={
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def gerar_planejamento_anual(
    body: GerarPlanejamentoRequest,
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        return await service.gerar(body)
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
        logger.exception("Erro inesperado ao gerar planejamento")
        raise HTTPException(
            status_code=500,
            detail={"error": "internal_error", "detail": "Erro interno ao gerar planejamento.", "retryable": True},
        )


@router.post(
    "/sequence",
    status_code=201,
    response_model=SequenciaResponse,
    responses={
        404: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def gerar_sequencia_didatica(
    body: GerarSequenciaRequest,
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        return await service.gerar_sequencia(body.conteudo_id)
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


@router.post(
    "/upload",
    status_code=201,
    response_model=list[PlanejamentoTemporarioResponse],
    responses={
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
    },
)
async def upload_planejamento(
    file: UploadFile = File(...),
    professor_id: str = Form(...),
    disciplina: str | None = Form(None),
    serie: str | None = Form(None),
    carga_horaria_semanal: int | None = Form(None),
    ano_letivo: int | None = Form(None),
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        content = await file.read()
        return await service.importar_por_arquivo(
            file_content=content,
            file_name=file.filename,
            disciplina_sugerida=disciplina,
            serie_sugerida=serie,
            ano_letivo_sugerido=ano_letivo,
        )
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
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"error": "bad_request", "detail": str(e), "retryable": False},
        )
    except Exception:
        logger.exception("Erro inesperado ao importar planejamento por arquivo")
        raise HTTPException(
            status_code=500,
            detail={"error": "internal_error", "detail": "Erro interno ao processar arquivo.", "retryable": True},
        )


@router.post(
    "/batch",
    status_code=201,
    response_model=list[PlanejamentoResponse],
    responses={
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def batch_salvar_planejamentos(
    body: BatchSalvarPlanejamentosRequest,
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        planejamentos_dict = [p.model_dump() for p in body.planejamentos]
        return service.salvar_planejamentos_lote(planejamentos_dict, body.professor_id)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"error": "bad_request", "detail": str(e), "retryable": False},
        )
    except Exception:
        logger.exception("Erro inesperado ao salvar planejamentos em lote")
        raise HTTPException(
            status_code=500,
            detail={"error": "internal_error", "detail": "Erro interno ao salvar planejamentos.", "retryable": True},
        )


@router.post(
    "/{id}/schedule",
    status_code=200,
    response_model=list[PlanejamentoHorarioResponse],
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def salvar_horarios_semanais(
    id: UUID,
    body: SalvarHorariosRequest,
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        horarios_dict = [h.model_dump() for h in body.horarios]
        return service.salvar_horarios(id, horarios_dict)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": "bad_request", "detail": str(e)})
    except Exception:
        logger.exception("Erro ao salvar horarios")
        raise HTTPException(status_code=500, detail={"error": "internal_error", "detail": "Erro interno ao salvar horarios."})


@router.get(
    "/{id}/schedule",
    status_code=200,
    response_model=list[PlanejamentoHorarioResponse],
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def obter_horarios_semanais(
    id: UUID,
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        return service.obter_horarios(id)
    except Exception:
        logger.exception("Erro ao obter horarios")
        raise HTTPException(status_code=500, detail={"error": "internal_error", "detail": "Erro interno ao obter horarios."})


@router.post(
    "/{id}/distribute-manual",
    status_code=200,
    response_model=DistribuirManualResponse,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def distribuir_aulas_manual(
    id: UUID,
    body: DistribuirManualRequest,
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        return await service.distribuir_conteudos_manual(id, body.professor_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": "bad_request", "detail": str(e)})
    except Exception:
        logger.exception("Erro ao distribuir aulas manualmente")
        raise HTTPException(status_code=500, detail={"error": "internal_error", "detail": "Erro interno ao distribuir aulas."})


@router.delete(
    "/{id}",
    status_code=200,
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def deletar_planejamento(
    id: UUID,
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        service.deletar_planejamento(id)
        return {"status": "success", "message": "Planejamento excluído com sucesso."}
    except ContentNotFoundError as e:
        raise HTTPException(status_code=404, detail={"error": "not_found", "detail": str(e)})
    except Exception:
        logger.exception("Erro ao deletar planejamento")
        raise HTTPException(status_code=500, detail={"error": "internal_error", "detail": "Erro interno ao deletar planejamento."})


@router.patch(
    "/{id}",
    status_code=200,
    response_model=PlanejamentoResponse,
    responses={
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def editar_planejamento(
    id: UUID,
    body: EditarPlanejamentoRequest,
    db: Session = Depends(get_db),
):
    service = PlanningService(db)
    try:
        return service.editar_planejamento(id, body)
    except ContentNotFoundError as e:
        raise HTTPException(status_code=404, detail={"error": "not_found", "detail": str(e)})
    except Exception:
        logger.exception("Erro ao editar planejamento")
        raise HTTPException(status_code=500, detail={"error": "internal_error", "detail": "Erro interno ao editar planejamento."})


