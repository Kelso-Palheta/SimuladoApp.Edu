# 📦 Archive — material histórico

Esta pasta contém documentos **não usados na implementação atual** do SimuladoApp.Edu, mas preservados por valor histórico ou inspiracional.

**Importante:** nada aqui deve ser usado como referência ativa para implementar o PRD v4.2. Para isso, ir em [`../docs/`](../docs/).

---

## 📁 O que está aqui

### `2026-03-experimentos-prompt/`

60 documentos de **março de 2026**, anteriores à formalização do PRD do SimuladoApp.Edu. São experimentos de prompt engineering, arquiteturas de agentes alternativas e protótipos visuais que foram **superados** pelas decisões do PRD v4.2.

Subdivididos em 6 categorias:

| Subpasta | O que tem | Por que foi arquivado |
|---|---|---|
| `arquiteturas-de-agentes/` | 19 docs descrevendo arquiteturas de N agentes/camadas (3, 5, 7, 9, 12, 15, 20, 24, 30 agentes; 8, 12, 16, 24 camadas) | Superado pela decisão do PRD v4.2 §3.0 — "motor único parametrizado" com 13 system prompts por disciplina |
| `meta-prompts-e-frameworks/` | 18 docs sobre meta-prompts, prompt compilers, CPE (Cognitive Prompt Engineering), Tree-of-Thought, Graph-of-Thought, Reflection Loop, Memory Systems | Conceitos teóricos não adotados — PRD v4.2 usa Anthropic SDK + RAG simples + prompt caching |
| `prompts-universais/` | 5 versões diferentes de "Prompt Universal de Professor" (1.0, 2.0, 3.0 + variações) | Substituído por system prompts disciplinares específicos validados por especialistas (PRD §3.0) |
| `simulacao-de-turma/` | 6 docs sobre Sistema de 20 Alunos Virtuais, Simulação de Aula, Laboratório Virtual | **Conceito explicitamente removido do escopo** na transição v4.0 → v4.1 (manter para possível feature em v5+) |
| `escola-virtual/` | 9 docs de protótipos "Escola Virtual 3.0/4.0/5.0" com dashboards interativos | Protótipos visuais descartados — UX será redesenhada conforme §3.5 do PRD v4.2 (wireframes a fazer) |
| `sistemas-autonomos/` | 3 docs sobre sistemas educacionais autônomos (sem mediação humana) | Incompatível com a política de governança do PRD v4.2 §5.3 — "professor é o responsável pedagógico final" |

---

## 🤔 Por que arquivar e não excluir?

1. **Valor histórico** — mostram a evolução do pensamento sobre o produto antes da formalização do PRD.
2. **Inspiração para o futuro** — algumas ideias podem virar features em versões posteriores:
   - Sistema de 20 Alunos Virtuais → possível feature de "ensaio de aula" em v5+.
   - Meta-prompts → possível otimização de custo de inferência via prompts evolutivos.
   - Frameworks CPE/ToT → podem informar fine-tuning futuro (PRD §5.7).
3. **Auditoria de decisões** — quando alguém perguntar "por que não fizemos X?", a resposta está documentada aqui.

---

## ⚠️ O que NÃO fazer

- ❌ Usar estes documentos como especificação técnica de implementação.
- ❌ Misturar a arquitetura proposta aqui com a do PRD v4.2.
- ❌ Copiar prompts daqui direto para produção (não foram validados).

---

## ✅ O que PODE fazer

- ✅ Consultar para entender a história do produto.
- ✅ Buscar inspiração para features futuras.
- ✅ Referenciar em discussões de "por que descartamos X".

---

*Arquivado em: 25 de maio de 2026 (organização pós-PRD v4.2)*
