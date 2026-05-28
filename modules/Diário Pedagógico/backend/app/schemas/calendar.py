from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SyncRequest(BaseModel):
    professor_id: str = Field(..., min_length=1)
    redirect_uri: str = Field("http://localhost:3000/calendario/callback")


class DistributeRequest(BaseModel):
    planejamento_bimestral_id: UUID
    professor_id: str


class SlotAula(BaseModel):
    data: str
    horario_inicio: str
    duracao: int
    summary: str


class AulaPlanejada(BaseModel):
    id: UUID
    data: str
    conteudo_id: str | None = None
    titulo: str
    status: str


class CalendarEventsResponse(BaseModel):
    eventos_google: list[dict]
    slots_aula: list[dict]
    aulas_planejadas: list[dict]


class AuthUrlResponse(BaseModel):
    auth_url: str


class DistributeResultResponse(BaseModel):
    aulas_criadas: list[dict]
    total: int
    nao_alocados: int
