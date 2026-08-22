# 🔄 Ciclo: Dashboard Analytics Pedagógico

- **Data:** 2026-08-22 13:09
- **Status:** CONCLUIDO

## 1. Perceber
- Especificações consultadas: `specs/PRD.md`, `specs/RULES.md`.
- **Necessidade:** Professores e coordenadores precisam visualizar o desempenho de turmas em gráficos, identificar curvas de evolução ao longo dos 4 bimestres e detectar precocemente alunos em risco de retenção.

## 2. Decidir
- Seguir SDD: Atualizar PRD (Seção 7) e RULES (RN-17 e RN-18).
- TDD: Escrever testes unitários em `tests/unit/analytics_calculos.test.js` (Red) $\rightarrow$ implementar `src/utils/analytics/metricas.js` (Green).
- Interface: Criar componentes modulares com Recharts, Framer Motion e design tokens (`MetricCard`, `EvolucaoChart`, `DistribuicaoChart`, `ComparativoTurmasChart`, `AlunosRiscoTable`, `AnalyticsHeader`).
- Acessibilidade: Conectar rota `/analytics` no Dashboard principal e no Diário Pedagógico.

## 3. Agir
Arquivos criados/modificados:
- `specs/RULES.md` — RN-17 e RN-18 adicionadas
- `specs/PRD.md` — Seção 7 adicionada
- `specs/TASKS.md` — TASK-12 marcada como concluída
- `tests/unit/analytics_calculos.test.js` — 7 testes unitários
- `frontend/src/utils/analytics/metricas.js` — Lógica de cálculo e agregações estatísticas
- `frontend/src/components/analytics/MetricCard.jsx`
- `frontend/src/components/analytics/EvolucaoChart.jsx`
- `frontend/src/components/analytics/DistribuicaoChart.jsx`
- `frontend/src/components/analytics/ComparativoTurmasChart.jsx`
- `frontend/src/components/analytics/AlunosRiscoTable.jsx`
- `frontend/src/components/analytics/AnalyticsHeader.jsx`
- `frontend/src/app/analytics/page.js`
- `frontend/src/config/modules.js`
- `frontend/src/components/Dashboard.js`
- `frontend/src/app/diario/page.js`

## 4. Verificar
```
✓ tests/unit/calculos.test.js               (5 tests)
✓ tests/unit/agentes_config.test.js          (6 tests)
✓ tests/unit/analytics_calculos.test.js      (7 tests)
✓ tests/unit/calendario_remanejamento.test.js (2 tests)
✓ tests/unit/calendario_feriados.test.js     (2 tests)
Suíte completa: 22 testes passando (100%)
```
