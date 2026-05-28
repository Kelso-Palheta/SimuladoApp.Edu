# Planejamento (HTPL/HTPC): regra obrigatória

## O que é

Em escolas de tempo integral, todo professor tem direito a uma **carga horária de planejamento** que é cumprida **fora da sala de aula**. Pode ter vários nomes:

- **HTPC** (Hora de Trabalho Pedagógico Coletivo) — geralmente na escola
- **HTPL** (Hora de Trabalho Pedagógico Livre) — geralmente fora da escola
- **Hora-atividade** ou **Hora-planejamento** — termo genérico
- Em algumas redes: simplesmente "dia de planejamento"

Independente do nome, **o professor não pode ter aulas alocadas nesse período**.

## Regra padrão adotada por esta skill

Cada professor tem direito a:

- **1 dia inteiro de planejamento por semana** (todos os tempos daquele dia bloqueados), OU
- **2 turnos de planejamento em dias diferentes** (manhã de um dia + tarde de outro dia)

A escola/coordenação define qual modalidade cada professor usa e em quais dias/turnos. Esses dados entram no JSON de entrada.

## Como modelar nos dados de entrada

No objeto `professores`, cada professor recebe um campo `planejamento`:

```json
{
  "nome": "Ana Silva",
  "area": "Linguagens",
  "disciplinas": ["Português"],
  "planejamento": {
    "modalidade": "dia_inteiro",
    "dias": ["qua"]
  },
  "indisponivel": [],
  "max_aulas_dia": 6
}
```

OU para 2 turnos:

```json
{
  "nome": "Bruno Costa",
  "area": "Linguagens",
  "disciplinas": ["Inglês"],
  "planejamento": {
    "modalidade": "dois_turnos",
    "turnos": [
      {"dia": "ter", "turno": "manha"},
      {"dia": "qui", "turno": "tarde"}
    ]
  },
  "indisponivel": [],
  "max_aulas_dia": 6
}
```

Definição dos turnos (com 9 tempos e almoço entre o 4º e o 5º):

- **Manhã:** tempos 1, 2, 3, 4 (4 tempos)
- **Tarde:** tempos 5, 6, 7, 8, 9 (5 tempos)

## Como o algoritmo trata o planejamento

O gerador converte automaticamente o campo `planejamento` em entradas no campo `indisponivel`. Por exemplo:

```
"planejamento": {"modalidade": "dia_inteiro", "dias": ["qua"]}
```

vira internamente:

```
indisponivel: [["qua", "1"], ["qua", "2"], ["qua", "3"], ["qua", "4"],
               ["qua", "5"], ["qua", "6"], ["qua", "7"], ["qua", "8"], ["qua", "9"]]
```

Assim, esses slots não entram nos candidatos para alocação.

## Validação automática

O validador checa, para cada professor, se ele realmente tem o planejamento cumprido:

- Modalidade `dia_inteiro`: zero aulas atribuídas no(s) dia(s) declarado(s)
- Modalidade `dois_turnos`: zero aulas nos turnos declarados

Caso encontre uma aula no horário de planejamento, reporta como conflito crítico.

## Como mostrar o planejamento nos arquivos de saída

### Na aba do professor (Excel)
Os tempos de planejamento aparecem com a célula preenchida em cinza e o texto "PLANEJAMENTO" centralizado. Isso comunica visualmente que o tempo está protegido.

### Na aba da turma (Excel)
Aulas no horário de planejamento de um professor simplesmente não aparecem para a turma — outro professor/disciplina vai ocupar aquele slot. Não precisa mostrar nada especial.

### No relatório (DOCX)
Inclua uma seção "Planejamento dos professores" listando dia/turno de cada um.

## Considerações pedagógicas

**Boas práticas comuns nas escolas:**

1. **Distribuir os planejamentos ao longo da semana** — não concentrar todos os professores da mesma área no mesmo dia (a escola fica sem cobertura daquela área)
2. **Evitar planejamento na segunda e sexta** sempre que possível (planejamento perto de fim de semana ou pós-feriado pode virar "dia livre prolongado", o que gera problemas trabalhistas e pedagógicos)
3. **Priorizar terça/quarta/quinta** para planejamento
4. **Coordenadores podem ter planejamento em horários específicos** (não necessariamente um dia inteiro)
5. **Professores com poucas aulas** (carga semanal baixa) podem ter o planejamento dividido em menos tempo, dependendo da legislação

**A skill respeita as escolhas da escola** — ela não opina sobre o dia, apenas aloca conforme informado. Mas no relatório de análise, se a skill notar que TODOS os professores de uma área estão de planejamento no mesmo dia, ela sinaliza como ponto de atenção.

## Como pedir a informação ao coordenador

Quando o usuário pedir para gerar um horário e não informar planejamento, pergunte (de forma agrupada):

> "Antes de gerar, preciso saber sobre o planejamento dos professores:
>
> 1. A modalidade é a mesma para todos (ex.: 1 dia inteiro/semana) ou varia por professor?
> 2. Você já tem definido qual dia cada professor faz planejamento, ou quer que eu sugira uma distribuição equilibrada?
> 3. Há restrições (ex.: ninguém pode ter planejamento na segunda)?"

Se o coordenador pedir sugestão de distribuição, gere uma proposta inicial distribuindo os professores entre terça/quarta/quinta de forma equilibrada por área (evitando que toda uma área pare no mesmo dia).
