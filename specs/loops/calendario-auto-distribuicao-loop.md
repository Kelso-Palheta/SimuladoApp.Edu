# 🔄 Ciclo: Calendário Pedagógico Flexível (Auto-Schedule & Decisão de Status)

- **Data:** 2026-08-22 19:48
- **Status:** CONCLUIDO

## 1. Perceber
- Especificações consultadas: `specs/PRD.md`, `specs/RULES.md`.
- **Diretrizes do Áudio do Usuário:**
  1. Auto-agendamento deve permitir escolher a data de início (hoje, início do ano ou data específica).
  2. Ao marcar aula como `PARCIAL` ou `NAO_REALIZADA`, o professor deve poder escolher entre **Reagendar (Smart Shift)** ou **Pular Tópico** (manter cronograma futuro inalterado).
  3. Gestão completa de tópicos (adicionar manual, editar título/descrição e excluir).
  4. Indicador visual de cumprimento curricular (% concluído, agendado, pendente).

## 2. Decidir
- Seguir SDD: Adicionar **RN-19** e **RN-20** em `specs/RULES.md` e atualizar `specs/PRD.md`.
- TDD: Escrever testes unitários em `tests/unit/calendario_auto_schedule.test.js` (Red) $\rightarrow$ implementar `ScheduleGeneratorEngine` e `useCalendarioPedagogico` (Green).
- Modais e UI: Criar `AutoDistribuirModal`, `DecisaoStatusModal`, `TopicoModal` e atualizar `Sidebar` e `CardAula`.

## 3. Agir
Arquivos criados/modificados:
- `specs/RULES.md` — RN-19 e RN-20
- `specs/PRD.md` — Seção 3.3 atualizada
- `specs/TASKS.md` — TASK-13 marcada como concluída
- `tests/unit/calendario_auto_schedule.test.js` — 4 novos testes unitários
- `frontend/src/lib/engines/ScheduleGeneratorEngine.js` — Métodos `autoDistribuirTopicos` e `atualizarStatusComDecisao`
- `frontend/src/hooks/calendario/useCalendarioPedagogico.js` — Métodos no hook
- `frontend/src/components/calendario/AutoDistribuirModal.jsx` — Novo modal
- `frontend/src/components/calendario/DecisaoStatusModal.jsx` — Novo modal
- `frontend/src/components/calendario/TopicoModal.jsx` — Novo modal
- `frontend/src/components/calendario/Sidebar.jsx` — Progresso curricular e gestão de tópicos
- `frontend/src/components/calendario/CardAula.jsx` — Conexão com diálogo de decisão
- `frontend/src/app/calendario/page.js` — Integração de modais e handlers

## 4. Verificar
```
✓ tests/unit/calculos.test.js                 (5 tests)
✓ tests/unit/agentes_config.test.js            (6 tests)
✓ tests/unit/analytics_calculos.test.js        (7 tests)
✓ tests/unit/calendario_remanejamento.test.js   (2 tests)
✓ tests/unit/calendario_feriados.test.js       (2 tests)
✓ tests/unit/calendario_auto_schedule.test.js  (4 tests)
Suíte completa: 26 testes passando (100%)
```
