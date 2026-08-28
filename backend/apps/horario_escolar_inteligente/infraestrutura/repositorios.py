"""
Adaptadores de Persistência (src/infraestrutura/repositorios.py)
Implementação de IGradeRepository para arquivos JSON
"""
import json
import os
from datetime import datetime
from typing import Optional, Dict, Any, List

from apps.horario_escolar_inteligente.aplicacao.portas import IGradeRepository
from apps.horario_escolar_inteligente.dominio.entidades import (
    GradeEscolar,
    Slot,
    Professor,
    SalaTematica,
    Turma,
    AreaConhecimento,
    ChangelogEntry,
)


class JSONGradeRepository(IGradeRepository):
    """
    Adaptador de repositório que lê e escreve o estado da GradeEscolar
    em formato JSON padronizado no sistema de arquivos.
    """

    def __init__(self, caminho_arquivo: str = "data.json"):
        self.caminho_arquivo = caminho_arquivo

    def carregar(self, escola_id: str = "default") -> Optional[GradeEscolar]:
        if not os.path.exists(self.caminho_arquivo):
            return None

        with open(self.caminho_arquivo, "r", encoding="utf-8") as f:
            data = json.load(f)

        slots = [
            Slot(
                dia=s["dia"],
                aula=s["aula"],
                turma=s["turma"],
                prof=s["prof"],
                disc=s["disc"],
                sala=s["sala"],
            )
            for s in data.get("slots", [])
        ]

        professores: List[Professor] = []
        salas: List[SalaTematica] = []

        for area_str, dados in data.get("salas_alocacao", {}).items():
            area_enum = AreaConhecimento.ESPECIAIS
            if area_str == "Linguagens":
                area_enum = AreaConhecimento.LINGUAGENS
            elif area_str == "Matemática":
                area_enum = AreaConhecimento.MATEMATICA
            elif area_str == "Natureza":
                area_enum = AreaConhecimento.NATUREZA
            elif area_str == "Humanas":
                area_enum = AreaConhecimento.HUMANAS

            for s_nome in dados.get("salas", []):
                salas.append(SalaTematica(id=f"sala-{s_nome}", nome=s_nome, area=area_enum))

            for p_nome in dados.get("profs", []):
                professores.append(Professor(id=f"prof-{p_nome}", nome=p_nome, area=area_enum))

        changelog = [
            ChangelogEntry(
                data=c["data"],
                tipo=c["tipo"],
                descricao=c["descricao"],
            )
            for c in data.get("changelog", [])
        ]

        return GradeEscolar(
            slots=slots,
            professores=professores,
            salas=salas,
            espacos_compartilhados=["Quadra", "Auditório", "Sala Info", "Sala Arte", "Sala Leitura"],
            changelog=changelog,
        )

    def salvar(self, escola_id: str, grade: GradeEscolar) -> bool:
        # Montar salas_alocacao a partir de grade.professores e grade.salas
        salas_alocacao: Dict[str, Dict[str, List[str]]] = {
            "Linguagens": {"salas": [], "profs": []},
            "Matemática": {"salas": [], "profs": []},
            "Natureza": {"salas": [], "profs": []},
            "Humanas": {"salas": [], "profs": []},
            "Especiais": {"salas": [], "profs": []},
        }

        for s in grade.salas:
            area_key = s.area.value if s.area.value in salas_alocacao else "Especiais"
            if s.nome not in salas_alocacao[area_key]["salas"]:
                salas_alocacao[area_key]["salas"].append(s.nome)

        for p in grade.professores:
            area_key = p.area.value if p.area.value in salas_alocacao else "Especiais"
            if p.nome not in salas_alocacao[area_key]["profs"]:
                salas_alocacao[area_key]["profs"].append(p.nome)

        data_dict: Dict[str, Any] = {
            "meta": {
                "nome_escola": "Escola Ensino Médio Integral",
                "versao_grade": "v2.0",
                "data_geracao": datetime.now().strftime("%Y-%m-%d"),
                "total_slots": len(grade.slots),
                "violacoes_planejamento": 0,
                "conflitos_prof": 0,
                "ch_preservada": True,
            },
            "slots": [s.model_dump() for s in grade.slots],
            "salas_alocacao": salas_alocacao,
            "changelog": [c.model_dump() for c in grade.changelog],
        }

        os.makedirs(os.path.dirname(os.path.abspath(self.caminho_arquivo)), exist_ok=True)
        with open(self.caminho_arquivo, "w", encoding="utf-8") as f:
            json.dump(data_dict, f, ensure_ascii=False, indent=2)

        return True
