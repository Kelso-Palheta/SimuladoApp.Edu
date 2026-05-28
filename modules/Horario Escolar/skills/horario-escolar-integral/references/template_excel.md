# Padrão da Planilha de Saída (Excel)

## Estrutura geral do arquivo `horario_escolar.xlsx`

O arquivo tem as seguintes abas, nesta ordem:

1. **Resumo** — visão geral, estatísticas, índice
2. **Turma_[NOME]** — uma aba por turma (1A, 1B, 2A, ...)
3. **Prof_[NOME]** — uma aba por professor
4. **Sala_[NOME]** — uma aba por sala (mostra ocupação)
5. **Conflitos** — vazia se tudo OK; caso contrário, lista de problemas

## Layout de uma aba de turma

```
                Segunda          Terça           Quarta          Quinta          Sexta
1º tempo    Português        Matemática       Português       Biologia        Matemática
07:00-07:50 Ana Silva        Carlos Souza     Ana Silva       Mariana Lima    Carlos Souza
            Sala Ling 1      Sala Mat 1       Sala Ling 1     Lab Bio         Sala Mat 1

2º tempo    Matemática       Português        ...
...
4º tempo    Inglês           ...
ALMOÇO
5º tempo    História         ...
...
9º tempo    Estudo Orient.   ...
```

Cada célula tem 3 linhas:
- Linha 1 (negrito): nome da disciplina
- Linha 2: nome do professor
- Linha 3 (itálico, fonte menor): nome da sala

A célula é colorida conforme a área da disciplina (ver código de cores em `bncc_areas_disciplinas.md`).

## Mesclagem de aulas geminadas

Quando há aulas geminadas (duplas) no mesmo dia, mescle as 2 células verticalmente. Isso comunica visualmente que é um bloco contínuo.

## Coluna de tempos (à esquerda)

A primeira coluna tem o tempo (1º, 2º, ...) e o horário real do relógio. Configure horários típicos:

| Tempo | Horário |
|---|---|
| 1º | 07:00–07:50 |
| 2º | 07:50–08:40 |
| 3º | 08:40–09:30 |
| Intervalo | 09:30–09:45 |
| 4º | 09:45–10:35 |
| Almoço | 10:35–11:35 |
| 5º | 11:35–12:25 |
| 6º | 12:25–13:15 |
| 7º | 13:15–14:05 |
| Intervalo | 14:05–14:20 |
| 8º | 14:20–15:10 |
| 9º | 15:10–16:00 |

(Esses horários são exemplo — pergunte ao usuário os horários reais da escola.)

## Aba "Resumo"

Deve conter:

```
HORÁRIO ESCOLAR 2026 — [Nome da Escola]
Gerado em: [data]

ÍNDICE
  → Aba "Turma_1A"  (link)
  → Aba "Turma_1B"  (link)
  ...
  → Aba "Prof_AnaSilva"  (link)
  ...

ESTATÍSTICAS GERAIS
  Total de turmas:        5
  Total de professores:   18
  Total de salas:         15
  Total de aulas/semana:  225

OCUPAÇÃO DE SALAS
  Sala               Taxa de ocupação
  Sala Mat 1         87%
  Sala Mat 2         78%
  Lab Bio            45%
  ...

CARGA DOS PROFESSORES
  Professor          Aulas/sem    Status
  Ana Silva          25           OK
  Carlos Souza       40           NO LIMITE
  ...

ALERTAS PEDAGÓGICOS
  - Turma 3A tem 2 aulas de Matemática nos 8-9º tempos na quinta — considerar revisão
  - Lab. de Química com 95% de ocupação — pouca margem para reposições
```

## Aba por professor

Igual ao layout da turma, mas em cada célula:
- Linha 1: turma
- Linha 2: disciplina
- Linha 3: sala

Inclua no rodapé: total de aulas semanais, carga horária total.

## Aba por sala

Mesmo grid (dia × tempo), em cada célula:
- Linha 1: turma
- Linha 2: disciplina
- Linha 3: professor

Inclua no rodapé: taxa de ocupação (%), aulas vagas (slots disponíveis).

## Formatação técnica

- Fonte: Calibri 10pt (texto normal), 11pt negrito (cabeçalhos), 9pt itálico (nome de sala)
- Bordas: todas as células com borda fina cinza
- Cabeçalhos (linha dos dias, coluna dos tempos): preenchimento cinza-claro, negrito
- Almoço/Intervalo: linha inteira mesclada, preenchimento cinza-escuro, texto centralizado em branco
- Largura de coluna: 20-22 caracteres para os dias, 12 para a coluna de tempos
- Altura de linha: 60-70 pontos para acomodar 3 linhas de texto

## Cabeçalho impressão

Configure a planilha para impressão em A4 paisagem, com cabeçalho repetido em cada página contendo:
- Nome da escola (esquerda)
- "Horário 2026 — [Turma/Prof/Sala X]" (centro)
- Nº da página (direita)
