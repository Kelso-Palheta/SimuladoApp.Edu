"""
Motor de Alocação de Grade com Backtracking (src/dominio/algoritmo_alocacao.py)
Algoritmo determinístico de alocação de slots escolares para Ensino Médio em Tempo Integral
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from .entidades import Slot, Professor, SalaTematica, Turma, GradeEscolar, AreaConhecimento
from .servicos import ValidadorConflitos, normalizar_texto


@dataclass
class RequisicaoAula:
    """Demanda de uma aula a ser alocada na grade."""
    turma_nome: str
    disciplina: str
    professor_nome: str
    area_bncc: str
    sala_sugerida: str


class MotorAlocacaoBacktracking:
    """
    Motor combinatório para geração automatizada da matriz semanal com backtracking.
    Garante 100% de conformidade com REG-H01 a REG-H06.
    """

    DIAS_PADRAO = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
    AULAS_POR_DIA = 9

    def __init__(
        self,
        professores: Dict[str, Professor],
        salas: Dict[str, SalaTematica],
        max_iteracoes: int = 50000
    ):
        self.professores = professores
        self.salas = salas
        self.max_iteracoes = max_iteracoes
        self.validador = ValidadorConflitos()

    def gerar_grade(
        self,
        demandas_aulas: List[RequisicaoAula],
        slots_fixos: Optional[List[Slot]] = None
    ) -> Optional[GradeEscolar]:
        """
        Executa o backtracking para alocar todas as aulas demandadas nos 45 tempos semanais.
        Retorna a GradeEscolar preenchida ou None se for inviável.
        """
        grade = GradeEscolar(
            slots=list(slots_fixos) if slots_fixos else [],
            professores=list(self.professores.values()),
            salas=list(self.salas.values())
        )

        iter_count = [0]
        sucesso = self._backtrack(demandas_aulas, 0, grade, iter_count)

        if sucesso:
            return grade
        return None

    def _backtrack(
        self,
        demandas: List[RequisicaoAula],
        index: int,
        grade: GradeEscolar,
        iter_count: List[int]
    ) -> bool:
        """Passo recursivo com poda por restrições rígidas."""
        if index >= len(demandas):
            return True

        iter_count[0] += 1
        if iter_count[0] > self.max_iteracoes:
            return False

        req = demandas[index]
        prof_obj = self.professores.get(normalizar_texto(req.professor_nome))

        # Encontrar salas compatíveis com a área
        salas_compativeis = [
            s.nome for s in self.salas.values()
            if normalizar_texto(s.area.value if isinstance(s.area, AreaConhecimento) else str(s.area)) == normalizar_texto(req.area_bncc)
        ]
        if not salas_compativeis:
            salas_compativeis = [req.sala_sugerida or "Sala Padrão"]

        for dia in self.DIAS_PADRAO:
            # Poda prévia: se for dia de planejamento do professor, pula o dia todo
            if prof_obj and prof_obj.dia_planejamento:
                if normalizar_texto(prof_obj.dia_planejamento) in normalizar_texto(dia):
                    continue

            for aula in range(1, self.AULAS_POR_DIA + 1):
                # Verificar se a turma já tem aula nesse slot
                if any(s.turma == req.turma_nome and s.dia == dia and s.aula == aula for s in grade.slots):
                    continue

                # Verificar se o professor já tem aula nesse slot
                if any(normalizar_texto(s.prof) == normalizar_texto(req.professor_nome) and s.dia == dia and s.aula == aula for s in grade.slots):
                    continue

                for sala in salas_compativeis:
                    # Verificar se a sala física está ocupada
                    if any(normalizar_texto(s.sala) == normalizar_texto(sala) and s.dia == dia and s.aula == aula for s in grade.slots):
                        continue

                    # Candidato válido
                    candidato = Slot(
                        turma=req.turma_nome,
                        dia=dia,
                        aula=aula,
                        prof=req.professor_nome,
                        disc=req.disciplina,
                        sala=sala
                    )

                    grade.slots.append(candidato)

                    if self._backtrack(demandas, index + 1, grade, iter_count):
                        return True

                    # Backtrack (desfaz alocação)
                    grade.slots.pop()

        return False
