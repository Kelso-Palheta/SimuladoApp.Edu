"""
Casos de Uso da Aplicação (src/aplicacao/casos_de_uso.py)
Orquestração de regras de negócio e serviços de domínio
"""
import copy
from datetime import datetime
from typing import List, Optional

from apps.horario_escolar_inteligente.dominio.entidades import (
    GradeEscolar,
    Slot,
    ChangelogEntry,
    RelatorioAuditoria,
)
from apps.horario_escolar_inteligente.dominio.servicos import ValidadorConflitos, CalculadorScorePedagogico, normalizar_texto
from .dtos import (
    RemanejarAulaDTO,
    ResultadoOperacaoDTO,
    ValidarGradeRequisicaoDTO,
    ValidarGradeRespostaDTO,
)


class ValidarGradeUseCase:
    """
    Caso de Uso: Executa a validação completa de uma grade escolar e retorna o DTO de resposta.
    """

    def __init__(self, validador: Optional[ValidadorConflitos] = None, calculador: Optional[CalculadorScorePedagogico] = None):
        self.validador = validador or ValidadorConflitos()
        self.calculador = calculador or CalculadorScorePedagogico()

    def executar(self, requisicao: ValidarGradeRequisicaoDTO) -> ValidarGradeRespostaDTO:
        # Instanciar slots a partir do DTO
        slots = [Slot(**s) for s in requisicao.slots]
        grade = GradeEscolar(slots=slots)

        relatorio = self.validador.validar(grade)
        score_resultado = self.calculador.calcular(grade)

        conflitos_json = [
            {
                "codigo_regra": c.codigo_regra,
                "gravidade": c.gravidade,
                "mensagem": c.mensagem,
                "slots_envolvidos": [s.model_dump() for s in c.slots_envolvidos],
            }
            for c in relatorio.conflitos_rigidos
        ]

        avisos_json = [
            {
                "codigo_regra": a.codigo_regra,
                "mensagem": a.mensagem,
            }
            for a in score_resultado.avisos
        ]

        return ValidarGradeRespostaDTO(
            valido=relatorio.valido,
            total_slots=len(slots),
            conflitos_rigidos=conflitos_json,
            score_pedagogico=score_resultado.score if relatorio.valido else 0.0,
            avisos_pedagogicos=avisos_json,
        )


class RemanejarAulaUseCase:
    """
    Caso de Uso: Executa permuta (swap) ou movimentação atômica entre 2 slots de aula.
    Garante rollback caso o remanejamento introduza conflitos rígidos.
    """

    def __init__(self, validador: Optional[ValidadorConflitos] = None):
        self.validador = validador or ValidadorConflitos()

    def executar(self, grade: GradeEscolar, dto: RemanejarAulaDTO) -> ResultadoOperacaoDTO:
        # Clonar a grade para aplicar a operação em memória isolada
        grade_clone = copy.deepcopy(grade)

        origem_dia = normalizar_texto(dto.origem.dia)
        origem_aula = dto.origem.aula
        origem_turma = normalizar_texto(dto.origem.turma)

        dest_dia = normalizar_texto(dto.destino.dia)
        dest_aula = dto.destino.aula
        dest_turma = normalizar_texto(dto.destino.turma)

        # Localizar os slots
        slot_origem = None
        slot_destino = None

        for s in grade_clone.slots:
            if (
                normalizar_texto(s.dia) == origem_dia
                and s.aula == origem_aula
                and normalizar_texto(s.turma) == origem_turma
            ):
                slot_origem = s
            elif (
                normalizar_texto(s.dia) == dest_dia
                and s.aula == dest_aula
                and normalizar_texto(s.turma) == dest_turma
            ):
                slot_destino = s

        if not slot_origem:
            relatorio_erro = self.validador.validar(grade)
            return ResultadoOperacaoDTO(
                sucesso=False,
                mensagem=f"Slot de origem ({dto.origem.dia}, aula {dto.origem.aula}, turma {dto.origem.turma}) não encontrado",
                grade=grade,
                relatorio=relatorio_erro,
            )

        # Aplicar troca (Swap) de propriedades de disciplina/professor/sala mantendo coordenadas
        if slot_destino:
            # Troca mútua
            slot_origem.prof, slot_destino.prof = slot_destino.prof, slot_origem.prof
            slot_origem.disc, slot_destino.disc = slot_destino.disc, slot_origem.disc
            slot_origem.sala, slot_destino.sala = slot_destino.sala, slot_origem.sala
            descricao = f"Permuta: {dto.origem.turma} {dto.origem.dia} A{dto.origem.aula} ({slot_destino.disc}) ↔ {dto.destino.dia} A{dto.destino.aula} ({slot_origem.disc})"
        else:
            # Movimentação para slot vago
            novo_slot = Slot(
                dia=dto.destino.dia,
                aula=dto.destino.aula,
                turma=dto.destino.turma,
                prof=slot_origem.prof,
                disc=slot_origem.disc,
                sala=slot_origem.sala,
            )
            grade_clone.slots.remove(slot_origem)
            grade_clone.slots.append(novo_slot)
            descricao = f"Movimentação: {dto.origem.turma} {dto.origem.dia} A{dto.origem.aula} → {dto.destino.dia} A{dto.destino.aula}"

        # Validar o estado resultante
        relatorio = self.validador.validar(grade_clone)

        if not relatorio.valido and not dto.forcar_se_invalido:
            # Rollback: retorna o estado original intacto
            return ResultadoOperacaoDTO(
                sucesso=False,
                mensagem="Operação cancelada: o remanejamento causaria violação de regras rígidas",
                grade=grade,
                relatorio=relatorio,
            )

        # Registrar entrada no Changelog
        entry = ChangelogEntry(
            data=datetime.now().isoformat(),
            tipo="Remanejamento",
            descricao=descricao,
        )
        grade_clone.changelog.append(entry)

        return ResultadoOperacaoDTO(
            sucesso=True,
            mensagem="Remanejamento realizado com sucesso",
            grade=grade_clone,
            relatorio=relatorio,
        )
