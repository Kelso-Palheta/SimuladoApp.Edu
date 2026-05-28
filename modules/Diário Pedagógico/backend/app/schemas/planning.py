from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class GerarPlanejamentoRequest(BaseModel):
    professor_id: str = Field(..., min_length=1, max_length=255)
    disciplina: str = Field(..., min_length=2, max_length=255)
    serie: str = Field(..., min_length=2, max_length=100)
    turma: str | None = Field(default=None, max_length=100)
    carga_horaria_semanal: int = Field(..., ge=1, le=50)
    ano_letivo: int = Field(..., ge=2024, le=2100)
    temas_curriculares: list[str] = Field(default_factory=list, max_length=20)

    model_config = {
        "json_schema_extra": {
            "example": {
                "professor_id": "prof-123",
                "disciplina": "Língua Portuguesa",
                "serie": "3º Ano Ensino Médio",
                "carga_horaria_semanal": 5,
                "ano_letivo": 2026,
                "temas_curriculares": ["Gramática", "Literatura", "Redação"],
            }
        }
    }


class ConteudoResponse(BaseModel):
    id: UUID
    titulo: str
    descricao: str | None = None
    tipo: str | None = None
    carga_horaria_estimada: int

    model_config = {"from_attributes": True}


class BimestreResponse(BaseModel):
    id: UUID
    numero: int
    titulo: str | None = None
    temas_principais: str | None = None
    carga_horaria: int
    conteudos: list[ConteudoResponse] = []

    model_config = {"from_attributes": True}


class PlanejamentoResponse(BaseModel):
    id: UUID
    professor_id: str
    disciplina: str
    serie: str
    turma: str | None = None
    carga_horaria_semanal: int
    carga_horaria_anual: int
    ano_letivo: int
    status: str
    carga_warning: bool = False
    bimestres: list[BimestreResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class ErrorResponse(BaseModel):
    error: str
    detail: str
    retryable: bool = False


# RF-003 — Sequência Didática

class GerarSequenciaRequest(BaseModel):
    conteudo_id: UUID


class EtapaResponse(BaseModel):
    numero: int
    descricao: str
    duracao_minutos: int
    estrategia: str


class SequenciaResponse(BaseModel):
    id: UUID
    conteudo_id: UUID
    titulo: str
    objetivo_geral: str
    objetivos_especificos: list[str]
    metodologia: str
    recursos: list[str]
    etapas: list[EtapaResponse]
    avaliacao: str
    referencias: list[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# RF-005 — Confirmação de Aula

class ConfirmarAulaRequest(BaseModel):
    aula_id: UUID
    status: str  # completa, parcial, nao_realizada
    observacao: str | None = None
    engajamento: str | None = None  # baixo, medio, alto
    dificuldades: str | None = None
    recursos_utilizados: str | None = None


class ConfirmarAulaResponse(BaseModel):
    id: UUID
    status_execucao: str
    realizado_em: datetime | None = None
    reagendamento_sugerido: bool = False


# RF-006 — Reagendamento

class ReagendarRequest(BaseModel):
    conteudo_id: UUID
    aula_original_id: UUID
    professor_id: str


class PropostaReagendamento(BaseModel):
    id: UUID
    conteudo_id: UUID
    nova_data_proposta: str
    justificativa: str
    status: str


class ReagendarResponse(BaseModel):
    propostas: list[PropostaReagendamento]
    total_conteudos_pendentes: int


# RF-007 — Observações + Relatórios

class CriarObservacaoRequest(BaseModel):
    aula_id: UUID
    professor_id: str
    texto: str
    engajamento: str | None = None
    dificuldades: str | None = None
    recursos_utilizados: str | None = None


class ObservacaoResponse(BaseModel):
    id: UUID
    aula_id: UUID
    professor_id: str
    texto: str
    engajamento: str | None = None
    dificuldades: str | None = None
    recursos_utilizados: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    total_aulas: int
    aulas_completas: int
    aulas_parciais: int
    aulas_nao_realizadas: int
    taxa_execucao: float
    total_conteudos: int
    conteudos_cobertos: int
    taxa_cobertura: float
    engajamento_alto: int
    engajamento_medio: int
    engajamento_baixo: int


class PlanejamentoHorarioItem(BaseModel):
    dia_semana: int = Field(..., ge=1, le=7)
    horario_inicio: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    duracao_minutos: int = Field(default=50, ge=10, le=300)


class SalvarHorariosRequest(BaseModel):
    horarios: list[PlanejamentoHorarioItem]


class PlanejamentoHorarioResponse(BaseModel):
    id: UUID
    dia_semana: int
    horario_inicio: str
    duracao_minutos: int

    model_config = {"from_attributes": True}


class AulaDistribuida(BaseModel):
    id: UUID
    data: str
    conteudo_id: UUID
    titulo: str


class DistribuirManualResponse(BaseModel):
    aulas_criadas: list[AulaDistribuida]
    total: int
    nao_alocados: int


class DistribuirManualRequest(BaseModel):
    professor_id: str


class EditarPlanejamentoRequest(BaseModel):
    disciplina: str | None = None
    serie: str | None = None
    turma: str | None = Field(default=None, max_length=100)
    carga_horaria_semanal: int | None = Field(default=None, ge=1, le=15)
    ano_letivo: int | None = Field(default=None, ge=2024, le=2100)


# ── Schemas para Upload Autônomo e Sincronização em Lote (Fase 2) ──

class ConteudoTemporarioResponse(BaseModel):
    titulo: str
    descricao: str | None = None
    tipo: str | None = None
    carga_estimada: int
    habilidade_bncc: str | None = None

class BimestreTemporarioResponse(BaseModel):
    numero: int
    titulo: str | None = None
    temas_principais: str | None = None
    carga_horaria: int
    conteudos: list[ConteudoTemporarioResponse]

class PlanejamentoTemporarioResponse(BaseModel):
    disciplina: str
    serie: str
    carga_horaria_semanal: int
    carga_horaria_anual: int
    ano_letivo: int
    bimestres: list[BimestreTemporarioResponse]


class ConteudoImportRequest(BaseModel):
    titulo: str
    descricao: str | None = None
    tipo: str | None = None
    carga_estimada: int
    habilidade_bncc: str | None = None

class BimestreImportRequest(BaseModel):
    numero: int
    titulo: str | None = None
    temas_principais: str | None = None
    carga_horaria: int
    conteudos: list[ConteudoImportRequest]

class PlanejamentoImportRequest(BaseModel):
    disciplina: str
    serie: str
    carga_horaria_semanal: int
    carga_horaria_anual: int | None = None
    ano_letivo: int
    turmas: list[str] = []
    bimestres: list[BimestreImportRequest]

class BatchSalvarPlanejamentosRequest(BaseModel):
    professor_id: str
    planejamentos: list[PlanejamentoImportRequest]

