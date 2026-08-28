"""
Entidades e Objetos de Valor Puros da Camada de Domínio
Clean Architecture - Totalmente desacoplado de infraestrutura e frameworks
"""
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AreaConhecimento(str, Enum):
    LINGUAGENS = "Linguagens"
    MATEMATICA = "Matemática"
    NATUREZA = "Natureza"
    HUMANAS = "Humanas"
    ESPECIAIS = "Especiais"


class TipologiaSala(str, Enum):
    TEORICA = "Teórica"
    PRATICA = "Prática"
    LABORATORIO = "Laboratório"
    ESPECIAL = "Especial"


class Slot(BaseModel):
    dia: str
    aula: int
    turma: str
    prof: str
    disc: str
    sala: str

    model_config = {"frozen": False}


class Professor(BaseModel):
    id: str
    nome: str
    area: AreaConhecimento
    dia_planejamento: Optional[str] = None
    turno_planejamento: Optional[str] = None
    disciplinas: List[str] = Field(default_factory=list)


class SalaTematica(BaseModel):
    id: str
    nome: str
    area: AreaConhecimento
    tipologia: TipologiaSala = TipologiaSala.TEORICA
    capacidade: int = 40


class MatrizCurricularItem(BaseModel):
    disciplina: str
    carga_semanal: int


class Turma(BaseModel):
    id: str
    nome: str
    serie: str
    matriz: List[MatrizCurricularItem] = Field(default_factory=list)


class Conflito(BaseModel):
    codigo_regra: str
    gravidade: str = "CRITICA"
    mensagem: str
    slots_envolvidos: List[Slot] = Field(default_factory=list)


class AvisoPedagogico(BaseModel):
    codigo_regra: str
    mensagem: str


class ScoreResultado(BaseModel):
    score: float
    avisos: List[AvisoPedagogico] = Field(default_factory=list)


class RelatorioAuditoria(BaseModel):
    valido: bool = True
    total_slots: int = 0
    conflitos_rigidos: List[Conflito] = Field(default_factory=list)
    avisos_pedagogicos: List[AvisoPedagogico] = Field(default_factory=list)
    score_pedagogico: float = 100.0
    ch_preservada: bool = True

    @property
    def total_conflitos_rigidos(self) -> int:
        return len(self.conflitos_rigidos)


class ChangelogEntry(BaseModel):
    data: str
    tipo: str
    descricao: str


class GradeEscolar(BaseModel):
    slots: List[Slot] = Field(default_factory=list)
    professores: List[Professor] = Field(default_factory=list)
    salas: List[SalaTematica] = Field(default_factory=list)
    turmas: List[Turma] = Field(default_factory=list)
    espacos_compartilhados: List[str] = Field(default_factory=list)
    changelog: List[ChangelogEntry] = Field(default_factory=list)
