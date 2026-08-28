"""
Serviços de Domínio Puros (src/dominio/servicos.py)
Implementa os algoritmos determinísticos de validação de regras (Hard & Soft Constraints)
"""
import unicodedata
from collections import defaultdict
from typing import Dict, List, Set, Tuple

from .entidades import (
    GradeEscolar,
    Slot,
    Professor,
    SalaTematica,
    Turma,
    Conflito,
    AvisoPedagogico,
    RelatorioAuditoria,
    ScoreResultado,
    AreaConhecimento,
)


def normalizar_texto(texto: str) -> str:
    """
    Remove acentos, converte para maiúsculas e remove espaços extras
    para comparação segura e determinística de nomes.
    """
    if not texto:
        return ""
    nfkd = unicodedata.normalize("NFKD", texto)
    sem_acento = "".join([c for c in nfkd if not unicodedata.combining(c)])
    return " ".join(sem_acento.upper().split())


class ValidadorConflitos:
    """
    Motor determinístico de validação de restrições rígidas (Hard Constraints)
    e compatibilidade de salas por área da BNCC.
    """

    def validar(self, grade: GradeEscolar) -> RelatorioAuditoria:
        conflitos: List[Conflito] = []
        avisos: List[AvisoPedagogico] = []
        ch_preservada = True

        slots = grade.slots
        total_slots = len(slots)

        # Mapeamentos de apoio
        prof_map: Dict[str, Professor] = {
            normalizar_texto(p.nome): p for p in grade.professores
        }
        sala_map: Dict[str, SalaTematica] = {
            normalizar_texto(s.nome): s for s in grade.salas
        }
        turma_map: Dict[str, Turma] = {
            normalizar_texto(t.nome): t for t in grade.turmas
        }
        espacos_comp_norm: Set[str] = {
            normalizar_texto(e) for e in grade.espacos_compartilhados
        }

        # -------------------------------------------------------------
        # REG-H01: Unicidade de Professor no Slot
        # -------------------------------------------------------------
        prof_slots_map: Dict[Tuple[str, int, str], List[Slot]] = defaultdict(list)
        for s in slots:
            prof_norm = normalizar_texto(s.prof)
            if prof_norm and prof_norm != "VAGO":
                prof_slots_map[(normalizar_texto(s.dia), s.aula, prof_norm)].append(s)

        for (dia, aula, prof), slots_colisao in prof_slots_map.items():
            if len(slots_colisao) > 1:
                turmas_envolvidas = ", ".join(s.turma for s in slots_colisao)
                conflitos.append(
                    Conflito(
                        codigo_regra="REG-H01",
                        gravidade="CRITICA",
                        mensagem=f"Professor '{slots_colisao[0].prof}' alocado em múltiplas turmas ({turmas_envolvidas}) no mesmo horário: {dia}, {aula}ª aula",
                        slots_envolvidos=slots_colisao,
                    )
                )

        # -------------------------------------------------------------
        # REG-H02: Unicidade de Turma no Slot
        # -------------------------------------------------------------
        turma_slots_map: Dict[Tuple[str, int, str], List[Slot]] = defaultdict(list)
        for s in slots:
            turma_norm = normalizar_texto(s.turma)
            if turma_norm:
                turma_slots_map[(normalizar_texto(s.dia), s.aula, turma_norm)].append(s)

        for (dia, aula, turma), slots_colisao in turma_slots_map.items():
            if len(slots_colisao) > 1:
                conflitos.append(
                    Conflito(
                        codigo_regra="REG-H02",
                        gravidade="CRITICA",
                        mensagem=f"Turma '{slots_colisao[0].turma}' possui {len(slots_colisao)} aulas simultâneas em: {dia}, {aula}ª aula",
                        slots_envolvidos=slots_colisao,
                    )
                )

        # -------------------------------------------------------------
        # REG-H03: Unicidade de Sala Física no Slot
        # -------------------------------------------------------------
        sala_slots_map: Dict[Tuple[str, int, str], List[Slot]] = defaultdict(list)
        for s in slots:
            sala_norm = normalizar_texto(s.sala)
            if sala_norm and sala_norm not in espacos_comp_norm:
                sala_slots_map[(normalizar_texto(s.dia), s.aula, sala_norm)].append(s)

        for (dia, aula, sala), slots_colisao in sala_slots_map.items():
            if len(slots_colisao) > 1:
                turmas_envolvidas = ", ".join(s.turma for s in slots_colisao)
                conflitos.append(
                    Conflito(
                        codigo_regra="REG-H03",
                        gravidade="CRITICA",
                        mensagem=f"Sala física '{slots_colisao[0].sala}' ocupada por mais de uma turma ({turmas_envolvidas}) em: {dia}, {aula}ª aula",
                        slots_envolvidos=slots_colisao,
                    )
                )

        # -------------------------------------------------------------
        # REG-H04: Respeito ao Planejamento Docente
        # -------------------------------------------------------------
        for s in slots:
            prof_norm = normalizar_texto(s.prof)
            prof_obj = prof_map.get(prof_norm)
            if prof_obj and prof_obj.dia_planejamento:
                if normalizar_texto(s.dia) == normalizar_texto(prof_obj.dia_planejamento):
                    conflitos.append(
                        Conflito(
                            codigo_regra="REG-H04",
                            gravidade="CRITICA",
                            mensagem=f"Professor '{s.prof}' possui aula na {s.dia} ({s.aula}ª aula), que é seu dia de Planejamento Pedagógico",
                            slots_envolvidos=[s],
                        )
                    )

        # -------------------------------------------------------------
        # REG-H05: Preservação de Carga Horária Curricular
        # -------------------------------------------------------------
        for turma_norm, turma_obj in turma_map.items():
            if turma_obj.matriz:
                # Contar ocorrências por disciplina
                contagem_disc: Dict[str, int] = defaultdict(int)
                for s in slots:
                    if normalizar_texto(s.turma) == turma_norm:
                        contagem_disc[normalizar_texto(s.disc)] += 1

                for item in turma_obj.matriz:
                    disc_norm = normalizar_texto(item.disciplina)
                    qtd_alocada = contagem_disc.get(disc_norm, 0)
                    if qtd_alocada != item.carga_semanal:
                        ch_preservada = False
                        conflitos.append(
                            Conflito(
                                codigo_regra="REG-H05",
                                gravidade="CRITICA",
                                mensagem=f"Turma '{turma_obj.nome}' possui {qtd_alocada} aulas alocadas para '{item.disciplina}' (esperado: {item.carga_semanal})",
                                slots_envolvidos=[],
                            )
                        )

        # -------------------------------------------------------------
        # REG-H06: Compatibilidade Docente ↔ Área da Sala Temática
        # -------------------------------------------------------------
        for s in slots:
            prof_norm = normalizar_texto(s.prof)
            sala_norm = normalizar_texto(s.sala)
            prof_obj = prof_map.get(prof_norm)
            sala_obj = sala_map.get(sala_norm)

            if prof_obj and sala_obj:
                # Se a sala for de área específica e diferente da área do professor e não for especial/compartilhada
                if (
                    sala_obj.area != AreaConhecimento.ESPECIAIS
                    and prof_obj.area != AreaConhecimento.ESPECIAIS
                    and sala_obj.area != prof_obj.area
                ):
                    conflitos.append(
                        Conflito(
                            codigo_regra="REG-H06",
                            gravidade="CRITICA",
                            mensagem=f"Professor '{s.prof}' (Área {prof_obj.area.value}) alocado na sala '{s.sala}' (Área {sala_obj.area.value})",
                            slots_envolvidos=[s],
                        )
                    )

        valido = len(conflitos) == 0 and ch_preservada

        return RelatorioAuditoria(
            valido=valido,
            total_slots=total_slots,
            conflitos_rigidos=conflitos,
            avisos_pedagogicos=avisos,
            score_pedagogico=100.0 if valido else max(0.0, 100.0 - (len(conflitos) * 15.0)),
            ch_preservada=ch_preservada,
        )


class CalculadorScorePedagogico:
    """
    Calculador de qualidade pedagógica e ergonomia (Soft Constraints - REG-S01 a REG-S05).
    Score varia de 0.0 a 100.0.
    """

    def calcular(self, grade: GradeEscolar) -> ScoreResultado:
        score = 100.0
        avisos: List[AvisoPedagogico] = []
        slots = grade.slots

        if not slots:
            return ScoreResultado(score=100.0, avisos=[])

        # -------------------------------------------------------------
        # REG-S01: Bonificação por Aulas Geminadas em Disciplinas Práticas
        # -------------------------------------------------------------
        # Agrupar por (turma, disc) na semana
        turma_disc_slots: Dict[Tuple[str, str], List[Slot]] = defaultdict(list)
        for s in slots:
            turma_disc_slots[(normalizar_texto(s.turma), normalizar_texto(s.disc))].append(s)

        sem_geminada_count = 0
        total_disc_multi = 0

        for (turma, disc), lista_slots in turma_disc_slots.items():
            if len(lista_slots) >= 2:
                total_disc_multi += 1
                # Agrupar por dia
                dia_aulas: Dict[str, List[int]] = defaultdict(list)
                for s in lista_slots:
                    dia_aulas[normalizar_texto(s.dia)].append(s.aula)

                # Verificar se há geminadas em algum dia
                tem_geminada = False
                for dia, aulas in dia_aulas.items():
                    if len(aulas) >= 2:
                        aulas_ord = sorted(aulas)
                        if any(aulas_ord[i + 1] - aulas_ord[i] == 1 for i in range(len(aulas_ord) - 1)):
                            tem_geminada = True
                            break

                if not tem_geminada:
                    sem_geminada_count += 1
                    avisos.append(
                        AvisoPedagogico(
                            codigo_regra="REG-S01",
                            mensagem=f"Disciplina '{lista_slots[0].disc}' na turma '{lista_slots[0].turma}' possui aulas isoladas sem blocos geminados",
                        )
                    )

        if total_disc_multi > 0 and sem_geminada_count > 0:
            taxa_sem_geminada = sem_geminada_count / total_disc_multi
            score -= taxa_sem_geminada * 40.0

        # -------------------------------------------------------------
        # REG-S05: Penalização por Janelas Excessivas no Horário do Professor
        # -------------------------------------------------------------
        prof_dia_aulas: Dict[Tuple[str, str], List[int]] = defaultdict(list)
        total_aulas_prof = 0
        for s in slots:
            prof_norm = normalizar_texto(s.prof)
            if prof_norm and prof_norm != "VAGO":
                prof_dia_aulas[(prof_norm, normalizar_texto(s.dia))].append(s.aula)
                total_aulas_prof += 1

        total_janelas = 0
        for (prof, dia), aulas in prof_dia_aulas.items():
            if len(aulas) >= 2:
                aulas_ord = sorted(aulas)
                span = aulas_ord[-1] - aulas_ord[0] + 1
                janelas = span - len(aulas_ord)
                if janelas > 0:
                    total_janelas += janelas

        if total_janelas > 0:
            taxa_janelas = total_janelas / max(1, total_aulas_prof)
            score -= min(40.0, taxa_janelas * 80.0)
            avisos.append(
                AvisoPedagogico(
                    codigo_regra="REG-S05",
                    mensagem=f"Foram detectadas {total_janelas} janelas/tempos ociosos na grade dos professores",
                )
            )

        score = round(max(0.0, min(100.0, score)), 1)
        return ScoreResultado(score=score, avisos=avisos)
