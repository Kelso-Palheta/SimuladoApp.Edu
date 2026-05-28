# Assistentes Pedagógicos (Agentes de IA)

**Vincula com:** [PRD v4.2 §3 (13 Agentes)](../../PRD/v42/SimuladoAppEdu_PRD_v42.md#3-os-13-agentes-de-disciplina) e [§11 (Roadmap)](../../PRD/v42/SimuladoAppEdu_PRD_v42.md#11-roadmap)

## Documentos

| Arquivo | Conteúdo |
|---|---|
| [`Analise_Niveis_Assistentes.docx`](./Analise_Niveis_Assistentes.docx) | Análise dos 3 níveis de implementação: MVP de 3 agentes → 12 agentes → full-stack. Inclui estimativas de horas por nível |
| [`analise_niveis_assistentes.md`](./analise_niveis_assistentes.md) | Versão Markdown (fonte editável) |

## Como usar

O PRD v4.2 §3.0 define **motor único parametrizado** (não 13 agentes distintos). Esta análise é referência para:

- **Estimativas de esforço** por fase do roadmap.
- **Decisões de priorização** — começar com Arte na Fase 1 é decisão pragmática vinda desta análise.
- **Roadmap híbrido** — Sprint 1 com 3 agentes, depois expandir para 12, depois full-stack.

## Stack alvo (PRD v4.2 §5.1)

- **Provider primário:** Anthropic Claude (Sonnet 4.5+)
- **Fallback:** OpenAI GPT-4o
- **RAG:** PostgreSQL + pgvector
- **Orquestração:** Anthropic SDK + Vercel AI SDK (streaming)

> ⚠️ **Atenção:** o documento original sugere Google Gemini. O PRD v4.2 mudou para **Anthropic Claude**. Refatorar conforme.
