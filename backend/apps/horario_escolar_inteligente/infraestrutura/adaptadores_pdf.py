"""
Adaptador de Extração de PDF (src/infraestrutura/adaptadores_pdf.py)
Implementação de IPDFParser utilizando pdfplumber para extração local rápida
"""
import io
import re
from typing import List, Dict, Any, Optional
import pdfplumber

from apps.horario_escolar_inteligente.aplicacao.portas import IPDFParser
from apps.horario_escolar_inteligente.dominio.servicos import normalizar_texto


class PDFPlumberAdapter(IPDFParser):
    """
    Adaptador para extração de texto e tabelas de arquivos PDF de horário escolar.
    Opera localmente, sem custos de API e com altíssima velocidade.
    """

    def extrair_texto(self, pdf_bytes: bytes) -> str:
        """
        Extrai todo o texto contido no documento PDF.
        """
        if not pdf_bytes:
            return ""

        texto_completo = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                texto_pagina = page.extract_text()
                if texto_pagina:
                    texto_completo.append(texto_pagina)

        return "\n".join(texto_completo)

    def extrair_tabelas(self, pdf_bytes: bytes) -> List[List[List[Optional[str]]]]:
        """
        Extrai matrizes de tabelas de todas as páginas do PDF.
        """
        if not pdf_bytes:
            return []

        tabelas_documento = []
        try:
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    tabelas = page.extract_tables()
                    if tabelas:
                        tabelas_documento.extend(tabelas)
        except Exception:
            return []

        return tabelas_documento

    def estruturar_linhas_em_slots(self, linhas: List[List[Optional[str]]]) -> List[Dict[str, Any]]:
        """
        Converte linhas tabulares extraídas em dicionários no formato estruturado de Slot:
        (turma, dia, aula, prof, disc, sala)
        """
        slots: List[Dict[str, Any]] = []

        for linha in linhas:
            if not linha or len(linha) < 4:
                continue

            # Limpar valores nulos ou espaços
            valores_limpos = [str(col).strip() if col is not None else "" for col in linha]

            # Verificar se a linha contém dados de aula (espera-se: turma, dia, aula, prof, disc, sala)
            turma = valores_limpos[0]
            dia = valores_limpos[1] if len(valores_limpos) > 1 else ""
            aula_str = valores_limpos[2] if len(valores_limpos) > 2 else ""
            prof = valores_limpos[3] if len(valores_limpos) > 3 else ""
            disc = valores_limpos[4] if len(valores_limpos) > 4 else ""
            sala = valores_limpos[5] if len(valores_limpos) > 5 else ""

            # Extrair número da aula
            aula_num = 1
            numeros = re.findall(r"\d+", aula_str)
            if numeros:
                aula_num = int(numeros[0])

            if turma and prof and prof != "None":
                slots.append({
                    "turma": turma,
                    "dia": dia,
                    "aula": aula_num,
                    "prof": prof,
                    "disc": disc,
                    "sala": sala
                })

        return slots
