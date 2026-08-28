"""
Adaptador Maritaca AI (src/infraestrutura/adaptadores_ia.py)
Implementação da porta IAssistenteIA para o provedor Maritaca AI (Sabiá-3)
"""
import os
from typing import Dict, Any, Optional
import requests
from apps.horario_escolar_inteligente.aplicacao.portas import IAssistenteIA


class MaritacaAIAdapter(IAssistenteIA):
    """
    Cliente HTTP para comunicação com o modelo Sabiá-3 da Maritaca AI.
    """

    MARITACA_API_URL = "https://chat.maritaca.ai/api/chat/completions"

    def __init__(self, api_key: Optional[str] = None, model: str = "sabiazinho-4", timeout_seconds: int = 30):
        self.api_key = api_key or os.getenv("MARITACA_API_KEY")
        if not self.api_key:
            raise ValueError("MARITACA_API_KEY não configurada")
        self.model = model
        self.timeout = timeout_seconds

    def processar_mensagem(self, prompt_sistema: str, mensagem_usuario: str, contexto: Dict[str, Any]) -> str:
        headers = {
            "Authorization": f"Key {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": prompt_sistema},
                {"role": "user", "content": mensagem_usuario},
            ],
            "temperature": 0.2,
            "max_tokens": 1500,
        }

        try:
            response = requests.post(self.MARITACA_API_URL, headers=headers, json=payload, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except requests.exceptions.RequestException as e:
            return f"Erro de comunicação com a Maritaca AI: {str(e)}"
