#!/usr/bin/env python3
"""
Validador de Horário Escolar

Uso:
    python validador.py <horario.json>

Verifica todos os conflitos e violações de restrições.
Sai com código 0 se OK, código 1 se há problemas.
"""

import json
import sys
from collections import defaultdict


# Definição de turnos
TEMPOS_MANHA = ["1", "2", "3", "4"]
TEMPOS_TARDE = ["5", "6", "7", "8", "9"]


def expandir_planejamento(prof, config):
    """Converte planejamento do professor em set de slots bloqueados."""
    plan = prof.get("planejamento")
    if not plan:
        return set()
    tempos_ids = [t["id"] for t in config["tempos"]]
    bloqueados = set()
    modalidade = plan.get("modalidade")
    if modalidade == "dia_inteiro":
        for dia in plan.get("dias", []):
            for tempo in tempos_ids:
                bloqueados.add((dia, tempo))
    elif modalidade == "dois_turnos":
        for ti in plan.get("turnos", []):
            tempos_turno = TEMPOS_MANHA if ti["turno"] == "manha" else TEMPOS_TARDE
            for tempo in tempos_turno:
                if tempo in tempos_ids:
                    bloqueados.add((ti["dia"], tempo))
    return bloqueados


def validar(resultado):
    horario = resultado["horario"]
    entrada = resultado["entrada"]
    areas = entrada["areas"]

    # mapear sala -> área
    sala_para_area = {}
    sala_para_tipo = {}
    for area, info in areas.items():
        for s in info["salas"]:
            sala_para_area[s["nome"]] = area
            sala_para_tipo[s["nome"]] = s["tipo"]

    # mapear professor -> area
    prof_area = {p["nome"]: p["area"] for p in entrada["professores"]}

    problemas = {
        "conflito_professor": [],
        "conflito_turma": [],
        "conflito_sala": [],
        "carga_horaria": [],
        "sala_fora_area": [],
        "tipo_sala_incompativel": [],
        "violacao_planejamento": [],
    }

    # 1, 2, 3: conflitos básicos (mesmo slot, duas alocações concorrentes)
    for slot_key, aulas_no_slot in horario.items():
        professores_no_slot = defaultdict(list)
        salas_no_slot = defaultdict(list)
        for turma, info in aulas_no_slot.items():
            professores_no_slot[info["professor"]].append(turma)
            salas_no_slot[info["sala"]].append(turma)
        for prof, turmas in professores_no_slot.items():
            if len(turmas) > 1:
                problemas["conflito_professor"].append({
                    "slot": slot_key,
                    "professor": prof,
                    "turmas": turmas,
                })
        for sala, turmas in salas_no_slot.items():
            if len(turmas) > 1:
                problemas["conflito_sala"].append({
                    "slot": slot_key,
                    "sala": sala,
                    "turmas": turmas,
                })
        # conflito de turma é implícito - se uma turma aparece duas vezes no mesmo slot
        # (na nossa estrutura não pode, mas para garantir):
        # (cada slot tem dict com turmas como chaves, então naturalmente único)

    # 4: carga horária
    contagem = defaultdict(lambda: defaultdict(int))  # contagem[turma][disciplina] = n
    for slot_key, aulas_no_slot in horario.items():
        for turma, info in aulas_no_slot.items():
            contagem[turma][info["disciplina"]] += 1
    for atrib in entrada["atribuicoes"]:
        turma = atrib["turma"]
        disc = atrib["disciplina"]
        esperado = atrib["carga_semanal"]
        real = contagem[turma].get(disc, 0)
        if real != esperado:
            problemas["carga_horaria"].append({
                "turma": turma,
                "disciplina": disc,
                "esperado": esperado,
                "alocado": real,
            })

    # 5: professor em sala fora de sua área
    for slot_key, aulas_no_slot in horario.items():
        for turma, info in aulas_no_slot.items():
            prof = info["professor"]
            sala = info["sala"]
            area_prof = prof_area.get(prof)
            area_sala = sala_para_area.get(sala)
            atrib_area = info.get("area")
            # se a atribuição é "qualquer" (Projeto de Vida, Estudo Orientado), ok
            if atrib_area == "qualquer":
                continue
            if area_prof and area_sala and area_prof != area_sala:
                problemas["sala_fora_area"].append({
                    "slot": slot_key,
                    "turma": turma,
                    "professor": prof,
                    "area_professor": area_prof,
                    "sala": sala,
                    "area_sala": area_sala,
                })

    # 6: tipo de sala incompatível
    # vamos calcular quantas aulas em lab cada atribuição tinha como esperado
    lab_esperado = {}
    for atrib in entrada["atribuicoes"]:
        chave = (atrib["turma"], atrib["disciplina"])
        lab_esperado[chave] = atrib.get("aulas_em_laboratorio", 0)

    lab_alocado = defaultdict(int)
    for slot_key, aulas_no_slot in horario.items():
        for turma, info in aulas_no_slot.items():
            chave = (turma, info["disciplina"])
            if sala_para_tipo.get(info["sala"]) == "laboratorio":
                lab_alocado[chave] += 1

    for chave, esperado in lab_esperado.items():
        if esperado > 0 and lab_alocado[chave] < esperado:
            problemas["tipo_sala_incompativel"].append({
                "turma": chave[0],
                "disciplina": chave[1],
                "aulas_lab_esperadas": esperado,
                "aulas_lab_alocadas": lab_alocado[chave],
            })

    # 7: violação de horário de planejamento
    for prof in entrada["professores"]:
        bloqueados = expandir_planejamento(prof, entrada["configuracao"])
        if not bloqueados:
            continue
        nome = prof["nome"]
        for slot_key, aulas_no_slot in horario.items():
            dia, tempo = slot_key.rsplit("_", 1)
            if (dia, tempo) not in bloqueados:
                continue
            for turma, info in aulas_no_slot.items():
                if info["professor"] == nome:
                    problemas["violacao_planejamento"].append({
                        "slot": slot_key,
                        "professor": nome,
                        "turma": turma,
                        "disciplina": info["disciplina"],
                    })

    total_problemas = sum(len(v) for v in problemas.values())
    return problemas, total_problemas


def imprimir_relatorio(problemas, total):
    print("=" * 60)
    print("RELATÓRIO DE VALIDAÇÃO DO HORÁRIO")
    print("=" * 60)
    if total == 0:
        print("\n✓ Nenhum problema encontrado. Horário válido!")
        return
    print(f"\n⚠ {total} problema(s) encontrado(s):\n")
    for tipo, lista in problemas.items():
        if lista:
            print(f"\n[{tipo}] - {len(lista)} ocorrência(s):")
            for p in lista[:10]:  # mostrar até 10 por categoria
                print(f"  • {json.dumps(p, ensure_ascii=False)}")
            if len(lista) > 10:
                print(f"  ... e mais {len(lista) - 10}")


def main():
    if len(sys.argv) < 2:
        print("Uso: python validador.py <horario.json>")
        sys.exit(1)
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        resultado = json.load(f)
    problemas, total = validar(resultado)
    imprimir_relatorio(problemas, total)
    sys.exit(0 if total == 0 else 1)


if __name__ == "__main__":
    main()
