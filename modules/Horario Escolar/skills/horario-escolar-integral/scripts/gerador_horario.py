#!/usr/bin/env python3
"""
Gerador de Horário Escolar - Ensino Médio Tempo Integral com Salas Temáticas

Uso:
    python gerador_horario.py <entrada.json> <saida.json>

Recebe um JSON com configuração de turmas/professores/salas/atribuições,
gera um horário tentando:
  - respeitar a carga horária de cada disciplina
  - evitar conflitos de professor/turma/sala
  - usar salas da área de cada professor
  - distribuir as aulas pedagogicamente bem
"""

import json
import sys
import random
from copy import deepcopy
from collections import defaultdict

# pesos de heurística (ajustáveis)
PESO_CARGA = 3
PESO_LAB = 5
PESO_INDISP = 2
PESO_FLEX_SALAS = 1

# tempos pesados (1-5 são preferidos para Matemática/Português/etc)
TEMPOS_PESADOS = ["1", "2", "3", "4", "5"]
DISCIPLINAS_PESADAS = {"Português", "Matemática", "Biologia", "Física", "Química", "História", "Geografia"}


def carregar_entrada(caminho):
    with open(caminho, "r", encoding="utf-8") as f:
        return json.load(f)


def construir_slots(config):
    """Retorna lista de tuplas (dia, tempo) - todos os slots da semana."""
    return [(d, t["id"]) for d in config["dias"] for t in config["tempos"]]


# Definição de turnos (manhã = 1-4, tarde = 5-9)
TEMPOS_MANHA = ["1", "2", "3", "4"]
TEMPOS_TARDE = ["5", "6", "7", "8", "9"]


def expandir_planejamento(prof, config):
    """
    Converte o campo 'planejamento' do professor em uma lista de slots indisponíveis.
    Retorna lista de tuplas (dia, tempo) bloqueadas.
    """
    plan = prof.get("planejamento")
    if not plan:
        return []

    tempos_ids = [t["id"] for t in config["tempos"]]
    bloqueados = []

    modalidade = plan.get("modalidade")
    if modalidade == "dia_inteiro":
        for dia in plan.get("dias", []):
            for tempo in tempos_ids:
                bloqueados.append((dia, tempo))
    elif modalidade == "dois_turnos":
        for turno_info in plan.get("turnos", []):
            dia = turno_info["dia"]
            turno = turno_info["turno"]
            tempos_do_turno = TEMPOS_MANHA if turno == "manha" else TEMPOS_TARDE
            for tempo in tempos_do_turno:
                if tempo in tempos_ids:
                    bloqueados.append((dia, tempo))
    return bloqueados


def calcular_dificuldade(atrib, areas):
    """Score de quão difícil é alocar essa atribuição (maior = aloca primeiro)."""
    score = atrib["carga_semanal"] * PESO_CARGA
    if atrib.get("aulas_em_laboratorio", 0) > 0:
        score += PESO_LAB * atrib["aulas_em_laboratorio"]
    # flexibilidade de salas: quanto mais salas na área, menor a dificuldade
    area = atrib["area"]
    if area in areas:
        n_salas = len(areas[area]["salas"])
        score -= PESO_FLEX_SALAS * n_salas
    return score


def salas_compativeis(atrib, areas, precisa_lab=False):
    """Retorna lista de salas onde essa atribuição pode acontecer."""
    area = atrib["area"]
    if area == "qualquer":
        # pode usar qualquer sala teórica
        todas = []
        for a, info in areas.items():
            todas.extend([s["nome"] for s in info["salas"] if s["tipo"] == "teorica"])
        return todas
    if area not in areas:
        return []
    salas = areas[area]["salas"]
    if precisa_lab:
        return [s["nome"] for s in salas if s["tipo"] == "laboratorio"]
    # caso contrário, prefere teórica mas aceita qualquer
    teoricas = [s["nome"] for s in salas if s["tipo"] == "teorica"]
    return teoricas if teoricas else [s["nome"] for s in salas]


def score_pedagogico(slot, atrib, horario, ocupacao_prof):
    """Score de qualidade pedagógica de alocar atrib nesse slot."""
    dia, tempo = slot
    score = 0
    disciplina = atrib["disciplina"]

    # bonus se disciplina pesada em tempo pesado
    if disciplina in DISCIPLINAS_PESADAS and tempo in TEMPOS_PESADOS:
        score += 5
    # penaliza disciplina pesada em tempo final
    if disciplina in DISCIPLINAS_PESADAS and tempo in ["8", "9"]:
        score -= 3

    # contar aulas dessa disciplina já alocadas nesse dia para essa turma
    turma = atrib["turma"]
    aulas_no_dia = sum(
        1 for (d, t), info in horario.items()
        if d == dia and info.get(turma, {}).get("disciplina") == disciplina
    )
    if aulas_no_dia >= 2:
        score -= 10  # evita 3 aulas da mesma disciplina no mesmo dia
    elif aulas_no_dia == 0:
        score += 3  # prefere espalhar entre dias

    # também penaliza usar sempre o mesmo tempo na semana (clustering vertical)
    aulas_no_mesmo_tempo = sum(
        1 for (d, t), info in horario.items()
        if t == tempo and info.get(turma, {}).get("disciplina") == disciplina
    )
    if aulas_no_mesmo_tempo >= 2:
        score -= 4  # evita disciplina cair sempre no mesmo tempo

    # janela do professor: se o professor já tem aula em (dia, tempo-1) ou (dia, tempo+1), bonus
    prof = atrib["professor"]
    if (dia, str(int(tempo) - 1)) in ocupacao_prof.get(prof, set()):
        score += 2
    if (dia, str(int(tempo) + 1)) in ocupacao_prof.get(prof, set()):
        score += 2

    return score


def gerar_horario(entrada):
    config = entrada["configuracao"]
    areas = entrada["areas"]
    turmas = [t["id"] for t in entrada["turmas"]]
    professores = {p["nome"]: p for p in entrada["professores"]}
    atribuicoes = entrada["atribuicoes"]

    slots = construir_slots(config)

    # horario[(dia, tempo)] = { turma: {disciplina, professor, sala, area} }
    horario = defaultdict(dict)
    # ocupacao_prof[prof] = set de (dia, tempo)
    ocupacao_prof = defaultdict(set)
    # ocupacao_sala[sala] = set de (dia, tempo)
    ocupacao_sala = defaultdict(set)
    # ocupacao_turma[turma] = set de (dia, tempo)
    ocupacao_turma = defaultdict(set)

    # expandir atribuições em "aulas individuais" - cada aula é um slot a alocar
    aulas_a_alocar = []
    for idx, atrib in enumerate(atribuicoes):
        carga = atrib["carga_semanal"]
        lab = atrib.get("aulas_em_laboratorio", 0)
        for i in range(carga):
            aulas_a_alocar.append({
                **atrib,
                "indice_aula": i,
                "precisa_lab": i < lab,
                "atrib_id": idx,
            })

    # ordenar por dificuldade (mais difícil primeiro)
    aulas_a_alocar.sort(key=lambda a: -calcular_dificuldade(a, areas))

    nao_alocadas = []

    for aula in aulas_a_alocar:
        turma = aula["turma"]
        prof = aula["professor"]
        prof_info = professores.get(prof, {})
        indisp = set(tuple(x) for x in prof_info.get("indisponivel", []))
        # adiciona slots de planejamento à indisponibilidade
        indisp.update(expandir_planejamento(prof_info, config))
        max_aulas_dia = prof_info.get("max_aulas_dia", 9)

        # encontrar slots candidatos
        candidatos = []
        for slot in slots:
            dia, tempo = slot
            # turma ocupada?
            if slot in ocupacao_turma[turma]:
                continue
            # professor ocupado?
            if slot in ocupacao_prof[prof]:
                continue
            # professor indisponível?
            if slot in indisp:
                continue
            # respeitar max aulas/dia do professor
            aulas_prof_dia = sum(1 for (d, _) in ocupacao_prof[prof] if d == dia)
            if aulas_prof_dia >= max_aulas_dia:
                continue
            # sala compatível disponível?
            salas_possiveis = salas_compativeis(aula, areas, precisa_lab=aula["precisa_lab"])
            salas_livres = [s for s in salas_possiveis if slot not in ocupacao_sala[s]]
            if not salas_livres:
                continue
            candidatos.append((slot, salas_livres))

        if not candidatos:
            nao_alocadas.append(aula)
            continue

        # escolher melhor slot por score
        melhor = max(
            candidatos,
            key=lambda c: score_pedagogico(c[0], aula, horario, ocupacao_prof)
        )
        slot, salas_livres = melhor
        # sala menos usada
        sala_escolhida = min(salas_livres, key=lambda s: len(ocupacao_sala[s]))

        # alocar
        horario[slot][turma] = {
            "disciplina": aula["disciplina"],
            "professor": prof,
            "sala": sala_escolhida,
            "area": aula["area"],
            "tipo": aula.get("tipo", "fgb"),
        }
        ocupacao_prof[prof].add(slot)
        ocupacao_sala[sala_escolhida].add(slot)
        ocupacao_turma[turma].add(slot)

    return {
        "horario": {f"{d}_{t}": v for (d, t), v in horario.items()},
        "metadados": {
            "total_aulas_alocadas": sum(len(v) for v in horario.values()),
            "nao_alocadas": [
                {"turma": a["turma"], "disciplina": a["disciplina"], "professor": a["professor"], "indice_aula": a["indice_aula"]}
                for a in nao_alocadas
            ],
            "ocupacao_professores": {p: len(s) for p, s in ocupacao_prof.items()},
            "ocupacao_salas": {s: len(o) for s, o in ocupacao_sala.items()},
        },
        "entrada": entrada,
    }


def main():
    if len(sys.argv) < 3:
        print("Uso: python gerador_horario.py <entrada.json> <saida.json>")
        sys.exit(1)
    entrada = carregar_entrada(sys.argv[1])
    resultado = gerar_horario(entrada)
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    print(f"Horário gerado em {sys.argv[2]}")
    print(f"Aulas alocadas: {resultado['metadados']['total_aulas_alocadas']}")
    if resultado["metadados"]["nao_alocadas"]:
        print(f"\n⚠ {len(resultado['metadados']['nao_alocadas'])} aulas não foram alocadas:")
        for na in resultado["metadados"]["nao_alocadas"]:
            print(f"  - {na['turma']} / {na['disciplina']} ({na['professor']}) [aula {na['indice_aula']+1}]")


if __name__ == "__main__":
    main()
