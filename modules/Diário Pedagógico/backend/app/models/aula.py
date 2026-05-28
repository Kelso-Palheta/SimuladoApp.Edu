import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Conteudo(Base):
    __tablename__ = "conteudos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planejamento_bimestral_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("planejamentos_bimestrais.id"), nullable=False)
    titulo: Mapped[str] = mapped_column(String(500), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=True)
    tipo: Mapped[str] = mapped_column(String(100), nullable=True)  # teoria, pratica, revisao, avaliacao
    prioridade: Mapped[int] = mapped_column(Integer, default=1)
    carga_horaria_estimada: Mapped[int] = mapped_column(Integer, default=1)
    habilidade_bncc: Mapped[str] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    planejamento_bimestral: Mapped["PlanejamentoBimestral"] = relationship(back_populates="conteudos")


class AulaPlano(Base):
    __tablename__ = "aulas_plano"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planejamento_bimestral_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("planejamentos_bimestrais.id"), nullable=False)
    conteudo_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("conteudos.id"), nullable=True)
    data: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    titulo: Mapped[str] = mapped_column(String(500), nullable=False)
    objetivo: Mapped[str] = mapped_column(Text, nullable=True)
    metodologia: Mapped[str] = mapped_column(Text, nullable=True)
    recursos: Mapped[str] = mapped_column(Text, nullable=True)
    duracao_minutos: Mapped[int] = mapped_column(Integer, default=50)
    status_execucao: Mapped[str] = mapped_column(String(50), default="pendente")  # pendente, completa, parcial, nao_realizada
    realizado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    google_event_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    conteudo: Mapped["Conteudo | None"] = relationship()
    observacoes: Mapped[list["ObservacaoAula"]] = relationship(back_populates="aula", cascade="all, delete-orphan")
