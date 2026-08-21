# ⚖️ Regras Invariantes de Negócio (RULES) — SimuladoApp.Edu

Este documento define as regras de negócio inegociáveis do sistema. Qualquer código que viole estas regras será rejeitado pela suíte de testes.

---

## 1. Regras do Diário Pedagógico (Gestão de Notas)
1. **RN-01 (Cálculo da Média Bimestral):**
   - A média final de um aluno no bimestre é a soma ponderada de:
     - **Nota do Simulado Convertida** (conforme peso de lançamento vs. peso final configurado).
     - **Nota das Atividades Convertida** (soma das atividades proporcional ao peso de atividades configurado).
2. **RN-02 (Arredondamento Padrão):**
   - Todas as notas finais devem ser arredondadas com 2 casas decimais (`round2`).
3. **RN-03 (Status de Aprovação):**
   - Média $\ge$ `mediaAprovacao` (padrão 5.0) $\rightarrow$ **Aprovado** (`good`).
   - `mediaRecuperacao` $\le$ Média $<$ `mediaAprovacao` $\rightarrow$ **Em Recuperação** (`warn`).
   - Média $<$ `mediaRecuperacao` $\rightarrow$ **Risco de Reprovação** (`bad`).
4. **RN-04 (Blindagem de Sobrecarga de Atividades):**
   - Se a soma dos valores máximos das atividades exceder o peso total configurado para atividades, o sistema deve emitir um alerta visual de extrapolação.

---

## 2. Regras da Correção de Redação ENEM
1. **RN-05 (Grade Oficial ENEM):**
   - A pontuação total varia de 0 a 1000 pontos, dividida estritamente em 5 competências (C1, C2, C3, C4, C5).
   - Cada competência admite pontuações em múltiplos de 40 pontos: `0, 40, 80, 120, 160, 200`.
2. **RN-06 (Modelo de IA Exclusivo):**
   - O endpoint de IA deve obrigatoriamente acionar o modelo `sabiazinho-4`. É terminantemente proibido utilizar aliases como `Sabia-4`.
3. **RN-07 (Devolutiva Pedagógica):**
   - Toda correção deve conter justificativa textual por competência e sugestões práticas de reescrita/melhoria.

---

## 3. Regras do Calendário Pedagógico
1. **RN-08 (Alocação Temporal):**
   - Nenhuma aula pode ser agendada fora dos horários configurados na Grade Semanal da turma.
2. **RN-09 (Remanejamento e Associação):**
   - Ao desassociar ou remover um tópico de uma aula, o tópico deve retornar imediatamente à lista de tópicos disponíveis para reagendamento.
3. **RN-10 (Transição de Status da Aula):**
   - Uma aula agendada pode transitar entre os status: `AGENDADA`, `CONCLUIDA`, `PARCIAL` e `NAO_REALIZADA`.
4. **RN-11 (Remanejamento Automático em Cascata - Smart Shift):**
   - Se uma aula que possui tópicos associados for cancelada (`NAO_REALIZADA`), seus tópicos devem ser transferidos para a próxima aula ativa disponível no cronograma (`AGENDADA`), e os tópicos das aulas subsequentes devem ser deslocados em cascata (+1 slot) sem sobrescrita destrutiva.
5. **RN-12 (Bloqueio de Dias Não Letivos & Feriados):**
   - Dias registrados como Feriado ou Recesso Escolar não comportam aulas ativas. Ao registrar um feriado em data que possua aulas com tópicos, o sistema deve acionar automaticamente o Smart Shift para transferir o conteúdo para o próximo dia letivo subsequente.
