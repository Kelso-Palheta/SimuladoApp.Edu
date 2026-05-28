import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ReagendamentoConteudo(Base):
    __tablename__ = "reagendamentos_conteudo"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    aula_plano_original_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("aulas_plano.id"), nullable=False)
    conteudo_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("conteudos.id"), nullable=False)
    nova_data_proposta: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    justificativa: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pendente")  # pendente, aprovado, rejeitado
    professor_id: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
