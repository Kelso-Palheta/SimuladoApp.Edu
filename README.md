# SimuladoApp.Edu

> Plataforma integrada SaaS de gestão pedagógica e suporte pedagógico com IA generativa, construída para o contexto educacional brasileiro real (ENEM, BNCC, DCEPA, escolas de tempo integral, realidade amazônica).

---

## 📌 Por onde começar

| Quem é você | Comece por |
|---|---|
| **Quero entender o produto** | [PRD v4.2](./docs/PRD/v42/SimuladoAppEdu_PRD_v42.docx) — fonte da verdade |
| **Vou implementar** | [PRD v4.2](./docs/PRD/v42/SimuladoAppEdu_PRD_v42.md) + [especificações](./docs/especificacoes/) + [subprojeto Planejador_e_Organizador](./Planejador_e_Organizador/) |
| **Quero rodar o MVP existente** | [`Planejador_e_Organizador/README.md`](./Planejador_e_Organizador/README.md) |
| **Quero ver o que mudou desde v4.1** | [CHANGELOG v4.1 → v4.2](./docs/PRD/v42/CHANGELOG_v41_v42.md) |
| **Quero entender as decisões de produto** | [Análise crítica](./docs/analises/PRD_v41_analise_critica/Analise_Critica_PRD_v41.md) |

---

## 🗂️ Estrutura do projeto

```
SimuladoApp.Edu/
│
├── 📘 docs/                              ← Toda a documentação
│   ├── PRD/v42/                          ← PRD vigente (fonte da verdade)
│   ├── especificacoes/                   ← Specs técnicas de módulos
│   │   ├── organizadores_horario/        →  §4.10 do PRD
│   │   ├── assistentes_pedagogicos/      →  §3 do PRD
│   │   └── aula_gamificada/              →  §3.0.2 + §4.1 do PRD
│   ├── analises/                         ← Análises e inventários
│   │   ├── PRD_v41_analise_critica/      →  análise crítica que gerou v4.2
│   │   └── Inventario_Documentos_v42/    →  inventário desta organização
│   └── README.md                         ← Índice navegável dos docs
│
├── 🛠️ Planejador_e_Organizador/          ← MVP em desenvolvimento (código)
│   ├── backend/                          → FastAPI + SQLAlchemy + Alembic
│   ├── frontend/                         → Next.js 15 + React 19 + Tailwind
│   ├── docker/                           → Dockerfiles
│   ├── docs/                             → PRD/SSD do subprojeto
│   ├── docker-compose.yml
│   ├── Makefile
│   └── README.md
│
├── 📦 archive/                           ← Material histórico (não usar para implementar)
│   └── 2026-03-experimentos-prompt/      ← 60 docs antigos de prompt engineering
│       ├── arquiteturas-de-agentes/      → arquiteturas alternativas (superadas)
│       ├── meta-prompts-e-frameworks/    → meta-prompts, CPE, ToT, GoT etc.
│       ├── prompts-universais/           → versões de "Prompt Universal"
│       ├── simulacao-de-turma/           → conceito descartado
│       ├── escola-virtual/               → protótipos descartados
│       └── sistemas-autonomos/           → sistemas autônomos (fora de política)
│
├── .env                                  → variáveis de ambiente (não commitado)
├── .gitignore
└── README.md                             ← este arquivo
```

---

## 🎯 Os três pilares do produto (PRD v4.2)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   PILAR 1                  PILAR 2                  PILAR 3     │
│  ┌──────────┐            ┌──────────┐            ┌──────────┐   │
│  │  13      │            │ Calend.  │            │ Briefing │   │
│  │ Agentes  │  ◄─────►   │ Pedagóg. │  ◄─────►   │ Pedagóg. │   │
│  │  de IA   │            │ + Diário │            │(SimuladoApp)│
│  └──────────┘            └──────────┘            └──────────┘   │
│       │                       │                       │         │
│       └───────────────────────┼───────────────────────┘         │
│                               ▼                                 │
│                    ┌─────────────────────┐                      │
│                    │  Governança de IA   │                      │
│                    │  (pseudonimização,  │                      │
│                    │   alucinação, etc)  │                      │
│                    └─────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

**Pilar 1 — Agentes de IA Pedagógicos:** 13 disciplinares + Redação + Corretor + Gamificação Avançada + Planejador + Gerador de Slides.

**Pilar 2 — Calendário Pedagógico com Diário de Bordo:** o módulo mais sticky, compatível com diário oficial brasileiro (DCEPA).

**Pilar 3 — Briefing Pedagógico:** integração nativa com SimuladoApp via webhook — único no mercado.

---

## 🚀 Status atual

| Item | Estado |
|---|---|
| PRD v4.2 | ✅ Finalizado |
| Análise crítica | ✅ Finalizada |
| Inventário e organização da pasta | ✅ Concluído |
| MVP do Calendário Pedagógico | 🟡 Em desenvolvimento (em `Planejador_e_Organizador/`) |
| Fase 0 (fundação técnica + segurança) | ⏳ A iniciar |
| Pesquisa pré-Fase 1 (entrevistas) | ⏳ A executar |

Roadmap completo (5 fases / 12-14 meses) em [`docs/PRD/v42/SimuladoAppEdu_PRD_v42.md`](./docs/PRD/v42/SimuladoAppEdu_PRD_v42.md) capítulo 11.

---

## ⚠️ Atenção crítica antes da Fase 0

1. **Divergência de stack de IA:** o subprojeto `Planejador_e_Organizador` hoje usa **Google Gemini**, mas o PRD v4.2 §5.1 define **Anthropic Claude como primário**. Resolver na Fase 0 — provavelmente refatorar `backend/app/services/gemini_service.py`.

2. **Orçamento revisado:** o PRD v4.1 estimava R$103k-218k; o v4.2 revisou para **R$450k-850k**. Validar com 2-3 devs/agências antes de fechar contrato.

3. **POC obrigatório do CSP solver** de horário antes da Fase 3 (2 semanas) — ver [`docs/especificacoes/organizadores_horario/`](./docs/especificacoes/organizadores_horario/).

4. **Pesquisa de usuário pré-Fase 1:** 15-30 entrevistas com professores antes de iniciar desenvolvimento da Fase 1. Plano em §12 do PRD.

---

## 📜 Convenções

- **Idioma:** documentação em português brasileiro; código em inglês (variáveis, funções, comentários).
- **Versionamento de docs:** PRDs ficam em `docs/PRD/v{N}/` com CHANGELOG.
- **Material descontinuado:** vai para `archive/` com data e justificativa, nunca é excluído.
- **Specs técnicas:** ficam em `docs/especificacoes/{modulo}/`.

---

## 📞 Contato

- **Owner do produto:** Kelso Palheta
- **DPO (a designar):** privacidade@simuladoapp.edu.br

---

*Última atualização da organização: 25 de maio de 2026*
