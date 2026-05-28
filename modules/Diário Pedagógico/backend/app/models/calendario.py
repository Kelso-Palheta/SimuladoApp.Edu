import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class CalendarioEscolar(Base):
    __tablename__ = "calendario_escolar"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professor_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    ano_letivo: Mapped[int] = mapped_column(Integer, nullable=False)
    data_inicio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    data_fim: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    dias_semana: Mapped[str] = mapped_column(String(100), nullable=False)  # "2,3,4,5,6" = seg a sex
    horario_inicio: Mapped[str] = mapped_column(String(5), nullable=False)  # "07:30"
    duracao_aula_minutos: Mapped[int] = mapped_column(Integer, default=50)
    feriados_json: Mapped[str | None] = mapped_column(String, nullable=True)  # JSON com datas de feriados/recessos
    fonte_calendario: Mapped[str] = mapped_column(String(50), default="manual")  # manual, google, outlook
    google_tokens_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    google_calendar_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sincronizado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
