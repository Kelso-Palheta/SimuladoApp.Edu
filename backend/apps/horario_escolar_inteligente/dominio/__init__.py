"""
Camada de Domínio (src/dominio/)
"""
from .entidades import (
    Slot,
    Professor,
    SalaTematica,
    Turma,
    GradeEscolar,
    AreaConhecimento,
    RelatorioAuditoria,
    Conflito,
    AvisoPedagogico,
)
from .servicos import ValidadorConflitos, CalculadorScorePedagogico, normalizar_texto
from .algoritmo_alocacao import MotorAlocacaoBacktracking, RequisicaoAula

__all__ = [
    "Slot",
    "Professor",
    "SalaTematica",
    "Turma",
    "GradeEscolar",
    "RelatorioAuditoria",
    "Conflito",
    "AvisoPedagogico",
    "AreaConhecimento",
    "ValidadorConflitos",
    "CalculadorScorePedagogico",
    "normalizar_texto",
    "MotorAlocacaoBacktracking",
    "RequisicaoAula",
]
