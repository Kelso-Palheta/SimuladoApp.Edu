"""
Camada de Infraestrutura (src/infraestrutura/)
"""
from .repositorios import JSONGradeRepository
from .adaptadores_ia import MaritacaAIAdapter
from .adaptadores_pdf import PDFPlumberAdapter

__all__ = [
    "JSONGradeRepository",
    "MaritacaAIAdapter",
    "PDFPlumberAdapter",
]
