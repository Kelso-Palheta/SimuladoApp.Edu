"""
Modelos ORM para o app horario_escolar_inteligente.
"""
from .infraestrutura.models import (
    EscolaModel,
    TurmaModel,
    ProfessorModel,
    SalaTematicaModel,
    MatrizCurricularModel,
    GradeModel,
    SlotGradeModel,
    ChangelogPermutaModel,
)

__all__ = [
    "EscolaModel",
    "TurmaModel",
    "ProfessorModel",
    "SalaTematicaModel",
    "MatrizCurricularModel",
    "GradeModel",
    "SlotGradeModel",
    "ChangelogPermutaModel",
]
