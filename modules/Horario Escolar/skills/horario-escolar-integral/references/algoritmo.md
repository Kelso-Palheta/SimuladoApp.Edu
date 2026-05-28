# Algoritmo de Geração de Horário

## Visão geral

O problema de gerar horário escolar com salas temáticas é um problema de **satisfação de restrições (CSP)**. A heurística usada é:

1. **Pré-processamento:** transformar todos os requisitos em uma lista de "aulas a alocar" (cada aula é uma unidade: turma × disciplina × 1 slot semanal)
2. **Ordenação por dificuldade:** aulas mais difíceis de alocar primeiro
3. **Alocação gulosa com backtracking:** tenta colocar cada aula no melhor slot disponível, voltando atrás se não conseguir
4. **Refinamento:** depois de alocar tudo, faz trocas locais para melhorar qualidade pedagógica

## Estrutura de dados

```python
{
  "configuracao": {
    "dias": ["seg", "ter", "qua", "qui", "sex"],
    "aulas_por_dia": 9,
    "tempos": ["1", "2", "3", "4", "almoco", "5", "6", "7", "8", "9"]  # almoço entre 4 e 5
  },
  "turmas": ["1A", "1B", "2A", "2B", "3A"],
  "areas": {
    "Linguagens": {
      "salas": [
        {"nome": "Sala Ling 1", "tipo": "teorica"},
        {"nome": "Sala Ling 2", "tipo": "teorica"},
        {"nome": "Lab Línguas", "tipo": "laboratorio"},
        {"nome": "Ateliê de Arte", "tipo": "laboratorio"},
        {"nome": "Quadra", "tipo": "laboratorio"}
      ]
    },
    ...
  },
  "professores": [
    {
      "nome": "Ana Silva",
      "area": "Linguagens",
      "disciplina_principal": "Português",
      "indisponivel": [["seg", "1"], ["sex", "9"]],
      "max_aulas_dia": 6
    }
  ],
  "atribuicoes": [
    {
      "turma": "1A",
      "disciplina": "Português",
      "professor": "Ana Silva",
      "carga_semanal": 5,
      "tipo_sala_preferida": "teorica",
      "aulas_em_laboratorio": 0,
      "max_geminadas": 1
    }
  ]
}
```

## Heurística de ordenação (mais difícil primeiro)

Calcule um score de "dificuldade" para cada atribuição:

```
dificuldade = (carga_semanal * peso_carga)
            + (restricao_laboratorio * peso_lab)
            + (indisponibilidade_professor * peso_indisp)
            - (flexibilidade_salas_da_area * peso_flex)
```

Aloque as atribuições em ordem decrescente de dificuldade.

## Algoritmo passo a passo

Para cada atribuição (turma + disciplina + professor + carga):

1. Determine os **slots candidatos** — todos os (dia, tempo) onde:
   - A turma está livre
   - O professor está livre e disponível
   - Existe pelo menos uma sala compatível da área livre
   
2. Filtre por **distribuição pedagógica:**
   - Não colocar 3+ aulas da mesma disciplina no mesmo dia (exceto se carga > 4 e for inevitável)
   - Preferir slots em dias ainda sem essa disciplina

3. Para cada slot candidato, calcule um **score pedagógico:**
   - +pontos se preenche "buracos" no horário do professor
   - +pontos se é um tempo adequado para a disciplina (Matemática/Português → 1-5; Arte/Ed.Física/Itinerários → 6-9)
   - -pontos se cria janela no horário do professor ou da turma
   - -pontos se é a 3ª aula da disciplina no dia

4. Escolha o slot de maior score. Aloque uma sala compatível (preferência: tipo correto + menor uso até agora).

5. Se nenhum slot é viável: **backtrack** — desfaça as últimas N alocações e tente outra ordem.

## Critérios de qualidade pedagógica

Pontos verificados após geração:

- **Distribuição:** desvio-padrão das aulas/dia para uma mesma disciplina deve ser baixo
- **Janelas do professor:** total de tempos vagos entre aulas — minimizar
- **Janelas da turma:** zero (turma sempre tem aula em todo slot do dia letivo)
- **Tempos pesados no início:** % de Matemática+Português nos tempos 1-5 deve ser >70%
- **Uso equilibrado de salas:** desvio na taxa de ocupação entre salas da mesma área <20%

## Quando o algoritmo falha

Causas comuns de falha:
1. Sobrecarga real (mais aulas demandadas que slots disponíveis) — não é falha do algoritmo, é dado inviável
2. Restrições muito apertadas (um professor com muitas indisponibilidades e muitas turmas)
3. Falta de sala do tipo certo

Em caso de falha, o script reporta:
- Quais atribuições não conseguiu alocar
- Por que (qual restrição bloqueou)
- Sugestões de relaxamento (ex.: "se a Sala Ling 3 estivesse disponível na sexta, conseguiria")
