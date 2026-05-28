# Resolução de Conflitos: estratégias

Quando o validador acusar problemas, use estas estratégias por tipo de conflito.

## 1. Conflito: professor em dois lugares ao mesmo tempo

**Sintoma:** o validador reporta `professor=X em turma=A e turma=B no slot (dia, tempo)`.

**Causa típica:** o gerador atribuiu o mesmo professor a duas turmas no mesmo horário (bug raro, mas pode ocorrer em casos de backtracking incompleto).

**Resolução:**
1. Identifique a aula com menor flexibilidade (qual das duas tem mais opções de outros slots?)
2. Mova a aula MAIS flexível para outro slot
3. Revalide

## 2. Conflito: turma em dois lugares ao mesmo tempo

**Sintoma:** `turma=A em disciplina=X e disciplina=Y no slot (dia, tempo)`.

**Causa:** mesmo problema, outro lado da moeda. Provavelmente conflito de geração.

**Resolução:** mover a aula que tem mais alternativas de horário compatíveis com seu professor.

## 3. Conflito: sala dupla ocupada

**Sintoma:** `sala=S ocupada por turma=A (disc=X) e turma=B (disc=Y) no slot (dia, tempo)`.

**Resolução:**
1. Verifique se há outra sala compatível (mesma área, mesmo tipo) livre nesse slot
2. Se sim, realoque uma das aulas para essa outra sala
3. Se não, mova uma das aulas para outro slot

## 4. Carga horária não bate

**Sintoma:** `turma=A, disciplina=X — esperado 5 aulas/sem, alocado 4`.

**Causas:**
- O algoritmo desistiu antes de completar
- Restrições impossíveis (ex.: 5 aulas de uma disciplina, mas o professor só tem 4 slots livres na semana inteira)

**Resolução:**
1. Verifique a "demanda restante" daquela disciplina+professor — quais slots ele tem livre que a turma também tem livre?
2. Se há slots compatíveis: força a alocação e revalida (pode quebrar outra coisa, aí itera)
3. Se não há: problema de dado de entrada — comunique ao usuário que precisa relaxar alguma restrição

## 5. Professor fora de sua área

**Sintoma:** `professor=X (área=Matemática) alocado em sala=Lab Bio (área=Ciências da Natureza)`.

**Causa:** bug — não deveria acontecer se a geração respeitou as áreas. Verifique se o professor tem alguma atribuição multi-área (itinerário integrado).

**Resolução:** mover para sala da área correta.

## 6. Tipo de sala incompatível

**Sintoma:** `aula de Química (precisa laboratório) alocada em Sala Teórica de C.N.`.

**Resolução:**
1. Buscar laboratório da área livre no mesmo slot — se existir, trocar
2. Senão, trocar o slot da aula para um onde há laboratório livre

## 7. Janelas no horário do professor

**Sintoma:** professor com aula no 1º tempo, vago no 2º e 3º, aula no 4º tempo.

**Não é um conflito que invalida o horário**, mas é problema pedagógico/trabalhista.

**Resolução:**
1. Buscar aulas do mesmo professor em slots adjacentes que possam ser trocadas
2. Tentar "compactar" o dia desse professor

## 8. Distribuição ruim de disciplinas

**Sintoma:** 1ºA tem 3 aulas de Matemática na segunda (1º, 2º, 5º tempos) e zero na sexta.

**Resolução:**
1. Trocar uma aula de matemática da segunda com uma aula de outra disciplina na sexta
2. Validar que a troca não cria novo conflito

## Princípio geral: trocas locais

A maioria dos refinamentos é uma TROCA entre duas células do horário. Antes de fazer trocas grandes, tente:

```
Aula A no slot S1, Aula B no slot S2
↓
Aula A no slot S2, Aula B no slot S1
```

Se a troca é válida (não cria conflito) E melhora alguma métrica pedagógica, faça.

## Quando relaxar restrições (com aprovação do usuário)

Algumas escolas dão flexibilidade em situações específicas. Pergunte ao usuário se aceita:

- Professor com 1 janela máxima por semana (em vez de zero janelas)
- Uma disciplina pesada pode cair no último tempo no máximo 1x por semana
- Aulas geminadas em laboratório podem ser à tarde (último horário) em casos extremos

Documente a restrição relaxada no relatório final.
