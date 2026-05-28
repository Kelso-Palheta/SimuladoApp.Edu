import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SequenciaDidatica(Base):
    __tablename__ = "sequencias_didaticas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conteudo_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("conteudos.id"), unique=True, nullable=False)
    titulo: Mapped[str] = mapped_column(Text, nullable=False)
    objetivo_geral: Mapped[str] = mapped_column(Text, nullable=False)
    objetivos_especificos: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    metodologia: Mapped[str] = mapped_column(Text, nullable=False)
    recursos: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    etapas: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    avaliacao: Mapped[str] = mapped_column(Text, nullable=False)
    referencias: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
