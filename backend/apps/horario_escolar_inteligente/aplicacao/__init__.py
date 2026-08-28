"""
Camada de Aplicação (src/aplicacao/)
"""
from .portas import IGradeRepository, IPDFParser, IAssistenteIA
from .dtos import (
    PosicaoSlotDTO,
    RemanejarAulaDTO,
    ResultadoOperacaoDTO,
    ValidarGradeRequisicaoDTO,
    ValidarGradeRespostaDTO,
)
from .casos_de_uso import ValidarGradeUseCase, RemanejarAulaUseCase

__all__ = [
    "IGradeRepository",
    "IPDFParser",
    "IAssistenteIA",
    "PosicaoSlotDTO",
    "RemanejarAulaDTO",
    "ResultadoOperacaoDTO",
    "ValidarGradeRequisicaoDTO",
    "ValidarGradeRespostaDTO",
    "ValidarGradeUseCase",
    "RemanejarAulaUseCase",
]
