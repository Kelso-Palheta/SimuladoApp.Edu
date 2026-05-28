import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ObservacaoAula(Base):
    __tablename__ = "observacoes_aula"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aula_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("aulas_plano.id"), nullable=False)
    professor_id: Mapped[str] = mapped_column(String(255), nullable=False)
    texto: Mapped[str] = mapped_column(Text, nullable=True)
    engajamento: Mapped[str | None] = mapped_column(String(20), nullable=True)  # baixo, medio, alto
    dificuldades: Mapped[str | None] = mapped_column(Text, nullable=True)
    recursos_utilizados: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    aula: Mapped["AulaPlano"] = relationship(back_populates="observacoes")
