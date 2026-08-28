"""
Objetos de Transferência de Dados (DTOs)
Camada de Aplicação (src/aplicacao/dtos.py)
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from apps.horario_escolar_inteligente.dominio.entidades import Slot, GradeEscolar, RelatorioAuditoria, ChangelogEntry


class PosicaoSlotDTO(BaseModel):
    dia: str
    aula: int
    turma: str


class RemanejarAulaDTO(BaseModel):
    origem: PosicaoSlotDTO
    destino: PosicaoSlotDTO
    forcar_se_invalido: bool = False


class ResultadoOperacaoDTO(BaseModel):
    sucesso: bool
    mensagem: str
    grade: GradeEscolar
    relatorio: RelatorioAuditoria


class ValidarGradeRequisicaoDTO(BaseModel):
    escola_id: str
    slots: List[Dict[str, Any]] = Field(default_factory=list)
    regras_customizadas: Dict[str, Any] = Field(default_factory=dict)


class ValidarGradeRespostaDTO(BaseModel):
    valido: bool
    total_slots: int
    conflitos_rigidos: List[Dict[str, Any]] = Field(default_factory=list)
    score_pedagogico: float = 100.0
    avisos_pedagogicos: List[Dict[str, Any]] = Field(default_factory=list)
