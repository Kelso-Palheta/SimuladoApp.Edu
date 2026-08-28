"""
Portas e Contratos Abstratos (src/aplicacao/portas.py)
Inversão de Dependência (DIP) - Portas e Adaptadores
"""
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from apps.horario_escolar_inteligente.dominio.entidades import GradeEscolar


class IGradeRepository(ABC):
    """
    Porta para persistência e recuperação de grade escolar.
    """

    @abstractmethod
    def carregar(self, escola_id: str) -> Optional[GradeEscolar]:
        pass

    @abstractmethod
    def salvar(self, escola_id: str, grade: GradeEscolar) -> bool:
        pass


class IPDFParser(ABC):
    """
    Porta para extração estruturada de texto de documentos PDF de horário.
    """

    @abstractmethod
    def extrair_texto(self, pdf_bytes: bytes) -> str:
        pass


class IAssistenteIA(ABC):
    """
    Porta para comunicação com provedores de Inteligência Artificial (Maritaca AI / LLMs).
    """

    @abstractmethod
    def processar_mensagem(self, prompt_sistema: str, mensagem_usuario: str, contexto: Dict[str, Any]) -> str:
        pass
