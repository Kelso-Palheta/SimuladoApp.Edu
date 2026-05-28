import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PlanejamentoAnual(Base):
    __tablename__ = "planejamentos_anuais"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professor_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    disciplina: Mapped[str] = mapped_column(String(255), nullable=False)
    serie: Mapped[str] = mapped_column(String(100), nullable=False)
    turma: Mapped[str | None] = mapped_column(String(100), nullable=True)
    carga_horaria_semanal: Mapped[int] = mapped_column(Integer, nullable=False)
    carga_horaria_anual: Mapped[int] = mapped_column(Integer, nullable=False)
    ano_letivo: Mapped[int] = mapped_column(Integer, nullable=False)
    temas_curriculares: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="rascunho")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    bimestres: Mapped[list["PlanejamentoBimestral"]] = relationship(back_populates="planejamento_anual", cascade="all, delete-orphan")
    horarios: Mapped[list["PlanejamentoHorario"]] = relationship(back_populates="planejamento_anual", cascade="all, delete-orphan")


class PlanejamentoBimestral(Base):
    __tablename__ = "planejamentos_bimestrais"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planejamento_anual_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("planejamentos_anuais.id"), nullable=False)
    bimestre: Mapped[int] = mapped_column(Integer, nullable=False)
    titulo: Mapped[str] = mapped_column(String(255), nullable=True)
    temas_principais: Mapped[str] = mapped_column(Text, nullable=True)
    carga_horaria: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="planejado")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    planejamento_anual: Mapped["PlanejamentoAnual"] = relationship(back_populates="bimestres")
    conteudos: Mapped[list["Conteudo"]] = relationship("Conteudo", back_populates="planejamento_bimestral", cascade="all, delete-orphan")
    aulas: Mapped[list["AulaPlano"]] = relationship("AulaPlano", cascade="all, delete-orphan")


class PlanejamentoHorario(Base):
    __tablename__ = "planejamento_horarios"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    planejamento_anual_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("planejamentos_anuais.id"), nullable=False)
    dia_semana: Mapped[int] = mapped_column(Integer, nullable=False)  # 2=Segunda, 3=Terça, ..., 7=Sábado, 1=Domingo
    horario_inicio: Mapped[str] = mapped_column(String(5), nullable=False)  # "08:00"
    duracao_minutos: Mapped[int] = mapped_column(Integer, default=50)

    planejamento_anual: Mapped["PlanejamentoAnual"] = relationship(back_populates="horarios")
