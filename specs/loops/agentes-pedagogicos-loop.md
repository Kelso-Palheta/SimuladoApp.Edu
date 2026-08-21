# 🔄 Ciclo: Hub de Agentes Pedagógicos — MVP 2 Agentes

- **Data:** 2026-08-21 20:53
- **Status:** CONCLUIDO

## 1. Perceber
- Especificações consultadas: `specs/PRD.md`, `specs/RULES.md`.
- **Gap detectado:** A rota `/agentes/linguagens` era um stub sem funcionalidade. Não havia agentes pedagógicos especificados nos docs.
- **Decisão do usuário:** MVP com 2 agentes — Ensino Médio e Fundamental II.

## 2. Decidir
- Atualizar PRD e RULES antes de qualquer código (SDD).
- TDD: escrever testes (Red) → criar config (Green) → implementar componentes.
- API segura: `systemPrompts` imutáveis apenas no servidor.

## 3. Agir
Arquivos criados/modificados:
- `specs/RULES.md` — RN-13 a RN-16
- `specs/PRD.md` — Seção 6: Agentes Pedagógicos
- `tests/unit/agentes_config.test.js` — 6 novos testes
- `frontend/src/data/agentes/agentesConfig.js`
- `frontend/src/app/api/agentes/route.js`
- `frontend/src/hooks/agentes/useAgentChat.js`
- `frontend/src/components/agentes/AgentCard.jsx`
- `frontend/src/components/agentes/ChatWindow.jsx`
- `frontend/src/components/agentes/PromptChips.jsx`
- `frontend/src/app/agentes/page.js`
- `frontend/src/app/agentes/linguagens/page.js` → redirect

## 4. Verificar
```
✓ agentes_config.test.js  (6 tests)
✓ calculos.test.js         (5 tests)
✓ calendario_*.test.js     (4 tests)
Tests: 15 passed (100%)
```
