# Inventário de Documentos do Projeto — SimuladoApp.Edu

**Data:** 25 de maio de 2026
**Referência:** PRD v4.2
**Escopo:** classificação de todos os arquivos da pasta `/Users/kelsopalheta/Developer/SimuladoApp.Edu/` em **UTILIZADOS** (entram na implementação do PRD v4.2) e **NÃO UTILIZADOS** (fora de escopo, experimentos antigos, ou conceitos descartados como Simulação de Turma).

---

## SUMÁRIO ESTATÍSTICO

| Categoria | Quantidade |
|---|---|
| Documentos UTILIZADOS (entram no escopo do PRD v4.2) | **22** |
| Documentos NÃO UTILIZADOS (fora de escopo) | **65** |
| Subprojeto de código (Planejador_e_Organizador) | **1 (com sub-itens — ver §3)** |
| **TOTAL de documentos avaliados** | **~88** |

Há também ~5.000 arquivos de cache npm (`.npm-cache/`) e Git (`.git/`) que **não são documentos** — não entram nesta análise. Recomendado: adicioná-los a `.gitignore` se ainda não estão.

---

## 1. DOCUMENTOS UTILIZADOS (entram na implementação do PRD v4.2)

São os arquivos que servem de **referência ativa** para implementar o PRD v4.2. Divididos por papel.

### 1.1 PRD vigente — fonte da verdade

| # | Arquivo | Caminho | Papel na implementação |
|---|---|---|---|
| 1 | **SimuladoAppEdu_PRD_v42.docx** | `docs/PRD/v42/` | PRD vigente — referência primária para qualquer decisão de produto, escopo e arquitetura. |
| 2 | **SimuladoAppEdu_PRD_v42.md** | `docs/PRD/v42/` | Fonte editável do PRD (versionável em Git). |
| 3 | **CHANGELOG_v41_v42.docx** | `docs/PRD/v42/` | Rastreabilidade do que mudou em relação ao v4.1. Útil em revisões. |
| 4 | **CHANGELOG_v41_v42.md** | `docs/PRD/v42/` | Fonte editável do changelog. |
| 5 | **SimuladoAppEdu_PRD_v41_Final.docx** | uploads (referência) | PRD anterior — manter como histórico, **não é a fonte da verdade**. |

### 1.2 Análise crítica que gerou o v4.2

| # | Arquivo | Caminho | Papel |
|---|---|---|---|
| 6 | **Analise_Critica_PRD_v41.docx** | `docs/analises/PRD_v41_analise_critica/` | Documenta o raciocínio por trás das mudanças do v4.2. Útil para justificar decisões. |
| 7 | **Analise_Critica_PRD_v41.md** | `docs/analises/PRD_v41_analise_critica/` | Fonte editável. |

### 1.3 Especificações técnicas ativas (descritas no PRD v4.2)

Estes documentos detalham módulos específicos do PRD v4.2 e são **referência técnica direta** para implementação:

| # | Arquivo | Localização atual | Papel | Onde entra no PRD v4.2 |
|---|---|---|---|---|
| 8 | **ESPECIFICACAO_Organizadores_Horario.docx** | raiz do projeto | Especificação técnica do CSP solver (backtracking, forward-checking, AC-3), com algoritmos e roadmap de 4 fases para o organizador de horário convencional + tempo integral. | §4.10 "Organizadores de Horário Escolar" |
| 9 | **RESUMO_Novos_Organizadores.docx** | raiz do projeto | Resumo executivo dos organizadores de horário com proposição de valor e diferenciais. Útil para vendas/marketing. | §4.10 + Resumo Executivo |
| 10 | **Analise_Niveis_Assistentes.docx** | raiz do projeto | Análise dos 3 níveis de implementação dos assistentes pedagógicos (MVP de 3 agentes → 12 agentes → full-stack). Subsidia decisões de roadmap. | §3 (motor único parametrizado) + §11 (roadmap por fases) |
| 11 | **analise_niveis_assistentes.md** | raiz do projeto | Versão Markdown do anterior. | idem |
| 12 | **Relatorio_Funcionalidades_AulaGamificada.docx** | raiz do projeto | Lista de funcionalidades implementáveis para módulo de aula gamificada (relatórios, recompensas/XP, persistência). | §3.0.2 (Gamificação Básica) + §4.1 (Avançada) |

### 1.4 Subprojeto Planejador_e_Organizador (código + docs do MVP existente)

O subprojeto **JÁ TEM CÓDIGO RODANDO** (FastAPI + Next.js 15 + PostgreSQL) que cobre parcialmente o Calendário Pedagógico (§4.4 do PRD v4.2). É a base de implementação concreta a evoluir.

#### 1.4.1 Documentação do subprojeto que vale como referência

| # | Arquivo | Papel | Vincula com PRD v4.2 |
|---|---|---|---|
| 13 | `Planejador_e_Organizador/README.md` | Visão geral do MVP atual (stack, quick start). | §4.4 |
| 14 | `Planejador_e_Organizador/docs/PRD_SSD_PLANEJAMENTO_COMPLETO.docx` | PRD/SSD completo do módulo de planejamento — 7 RFs, arquitetura em 5 camadas, 5 casos de uso, 11 semanas de roadmap. **Referência técnica detalhada para Calendário Pedagógico e Planejador Curricular.** | §4.4 (Calendário) + §4.8 (Planejador Curricular) |
| 15 | `Planejador_e_Organizador/docs/PRD_SSD_PLANEJAMENTO_PARTE1.docx` a `PARTE6.docx` | Versões particionadas do mesmo PRD/SSD acima. Útil para leitura focada. | idem |
| 16 | `Planejador_e_Organizador/docs/PRD_SSD_SKILLS_MAPPING.docx` | Mapeamento de skills/habilidades BNCC com o módulo de planejamento. | §3.0 (RAG sobre BNCC/DCEPA) |
| 17 | `Planejador_e_Organizador/docs/SKILLS_MAPPING_PLANEJAMENTO.md` | Versão Markdown do anterior. | idem |
| 18 | `Planejador_e_Organizador/docs/architecture.md` | Arquitetura técnica do MVP atual. **Base para o "Documento de Arquitetura Técnica separado" listado no apêndice B do PRD v4.2.** | §15.2 (gap a resolver) |
| 19 | `Planejador_e_Organizador/docs/gerador-planejamento-spec.md` | Especificação do gerador de planejamento com Gemini. | §4.8 + §5 (Governança IA) |
| 20 | `Planejador_e_Organizador/docs/sequencia-calendario-spec.md` | Spec de sincronização sequência didática × calendário. | §4.4 + §4.8 |
| 21 | `Planejador_e_Organizador/docs/sequencia-didatica-pedagogia.md` | Fundamentação pedagógica das sequências didáticas. | §3 (agentes disciplinares) |
| 22 | `Planejador_e_Organizador/docs/PRD_SSD_LEIA_ME.md` | Guia de uso do PRD/SSD do subprojeto. | onboarding |

#### 1.4.2 Código-fonte do subprojeto (também UTILIZADO — base de implementação)

A pasta `Planejador_e_Organizador/` inteira é **código a evoluir, não a descartar**. Itens-chave:

- `backend/` — FastAPI + SQLAlchemy + Alembic (migrações já existem para `planejamento` e `horario`). Base para os agentes de IA e endpoints.
- `frontend/` — Next.js 15 + React 19 + Tailwind. Já tem páginas para `/aula`, `/calendario`, `/planejamento`, `/relatorios`.
- `docker/` + `docker-compose.yml` — infra local funcional.
- `.github/workflows/ci.yml` — CI já configurada.

**Atenção crítica para v4.2:** o subprojeto hoje usa **Google Gemini** (`gemini_service.py`). O PRD v4.2 §5.1 define **Anthropic Claude como primário, OpenAI como fallback**. Isso é uma **divergência a resolver na Fase 0** — provavelmente substituir o `gemini_service.py` por `anthropic_service.py`. Decisão de arquitetura.

---

## 2. DOCUMENTOS NÃO UTILIZADOS (fora do escopo do PRD v4.2)

Estes arquivos **não devem ser referência ativa** para a implementação. Estão fora de escopo por uma destas razões:

- (A) **Experimentos antigos de prompt engineering** (março/2026, anteriores ao PRD).
- (B) **Protótipos visuais descartados** ("Escola Virtual" — conceito superado pelo PRD v4.2).
- (C) **Conceito explicitamente descartado** — Simulação de Turma (mencionado no apêndice da v4.1 como "removido nesta versão").
- (D) **Cache/binários** sem valor documental.

**Recomendação geral:** mover para `archive/2026-03-experimentos/` em vez de excluir — têm valor histórico e podem inspirar features futuras (ex: sistema de alunos virtuais pode virar feature em v5+).

### 2.1 Conceito Simulação de Turma — explicitamente fora de escopo

Conforme decisão na v4.1 (mantida na v4.2): "Simulação de Turma" foi **removida do escopo**. Documentos relacionados:

| # | Arquivo | Razão |
|---|---|---|
| 1 | 🧠 Sistema de 20 Alunos Virtuais.docx | Núcleo do conceito Simulação de Turma — descartado |
| 2 | 🧠 Sistema de Simulação de Aula com IA.docx | Idem |
| 3 | 🧠 Sistema de Simulação de Aula em Tempo Real.docx | Idem |
| 4 | 🏫 Demonstração Escola Virtual 5.0 – Interface Operacional.docx | Protótipo da Escola Virtual com 20 alunos simulados |
| 5 | 🏫 Escola Virtual 5.0 – Demo Completa Pronta para Uso.docx | Idem |
| 6 | 🏫 Escola Virtual 5.0 – Prompt Pronto para Chat IA.docx | Idem |
| 7 | 🏫 Escola Virtual 5.0 – Protótipo Interativo Completo.docx | Idem |
| 8 | 🏫 Escola Virtual Executável 4.0 – Software de IA Completo.docx | Idem |
| 9 | 🏫 Escola Virtual Interativa 3.0 – Dashboard Ultra-Realista.docx | Idem |
| 10 | 🏫 Escola Virtual Interativa – Dashboard Ultra-Visual.docx | Idem |
| 11 | 🏫 Plataforma de Ensino Virtual Autônoma – Versão Escola Completa.docx | Idem |
| 12 | 🏫 Plataforma de Escola Virtual Interativa – Dashboard IA.docx | Idem |
| 13 | 🧠 Laboratório Virtual Interativo 2.0 – Painel de Controle de Aula.docx | Idem (laboratório = simulação) |
| 14 | 🧠 Laboratório Virtual de Professor de IA.docx | Idem |
| 15 | 🧠 Laboratório de Ensino Virtual Autônomo – Versão Interativa.docx | Idem |
| 16 | 🧠 Sistema de Ensino Contínuo Autônomo com IA.docx | "Autônomo" sem mediação humana — fora da política de "professor é o responsável pedagógico" (§5.3) |
| 17 | 🧠 Sistema de Professor de IA Autônomo.docx | Idem |
| 18 | 🧠 Sistema de Treinamento de Professor com IA.docx | Treinamento de professor (não cobre escopo do PRD) |

### 2.2 Experimentos de arquiteturas de prompt/agentes — superados pelo PRD v4.2

A v4.2 (§3.0) define explicitamente "motor único parametrizado" com 13 system prompts por disciplina + RAG. Os experimentos abaixo propunham arquiteturas alternativas (5, 7, 9, 12, 15, 20, 24 agentes, "meta-prompts auto-evolutivos", etc.) que foram **superadas** pela decisão arquitetural do PRD v4.2.

| # | Arquivo | Conceito experimental |
|---|---|---|
| 19 | 🧠 Arquitetura Cognitiva de 24 Camadas para Agentes de IA.docx | 24 camadas cognitivas |
| 20 | 🧠 Arquitetura Cognitiva de Professor IA (12 Agentes).docx | 12 agentes (similar ao Nível 2 do `Analise_Niveis_Assistentes`) |
| 21 | 🧠 Arquitetura de 16 Camadas para Agentes de IA.docx | 16 camadas |
| 22 | 🧠 Arquitetura de 7 Agentes Educacionais.docx | 7 agentes |
| 23 | 🧠 Arquitetura de Prompt de 12 Camadas.docx | 12 camadas |
| 24 | 🧠 Arquitetura do Agente Educacional.docx | agente único |
| 25 | 🧠 Arquitetura do GPT Professor Gamificador.docx | GPT focado em gamificação |
| 26 | 🧠 Arquitetura do Sistema GPT Professor Anual.docx | Sistema anual de 8 níveis |
| 27 | 🧠 Arquitetura do Sistema de 3 Níveis.docx | 3 níveis (similar ao Nível 1 do `Analise_Niveis_Assistentes`) |
| 28 | 🧠 Arquitetura do Super Prompt Mestre.docx | super-prompt mestre |
| 29 | 🧠 Arquitetura do "GPT Professor".docx | GPT genérico |
| 30 | 🧠 Como Converter 24 Camadas em um Super-Prompt.docx | conversão arquitetural |
| 31 | 🧠 Como funciona um Meta-Prompt.docx | meta-prompt |
| 32 | 🧠 Estrutura da Arquitetura de 15 Agentes.docx | 15 agentes |
| 33 | 🧠 Estrutura da Arquitetura de 20 Agentes.docx | 20 agentes |
| 34 | 🧠 Estrutura do Prompt Universal.docx | prompt universal |
| 35 | 🧠 Estrutura do Prompt de Aula Gamificada.docx | prompt de aula gamificada (conteúdo já incorporado em §3.0.2 + §4.1 do PRD v4.2) |
| 36 | 🧠 Estrutura do Sistema de 5 Agentes.docx | 5 agentes |
| 37 | 🧠 Estrutura do Sistema de 9 Agentes.docx | 9 agentes |
| 38 | 🧠 Estrutura do Super-Prompt (CPE + Tree-of-Thought).docx | CPE/ToT |
| 39 | 🧠 Estrutura do Super-Prompt de Aula Completa.docx | super-prompt de aula |
| 40 | 🧠 Estrutura pedagógica da sequência didática.docx | sequência didática (conteúdo já em `Planejador_e_Organizador/docs/sequencia-didatica-pedagogia.md`) |
| 41 | 🧠 Ideia central do Meta-Prompt Auto-Evolutivo.docx | meta-prompt evolutivo |
| 42 | 🧠 Ideia central do Prompt Compiler.docx | prompt compiler |
| 43 | 🧠 Meta-Prompt Auto-Evolutivo Educacional.docx | idem |
| 44 | 🧠 Meta-Sistema Educacional de IA (30 Agentes).docx | 30 agentes |
| 45 | 🧠 O que é Cognitive Prompt Engineering.docx | conceito CPE |
| 46 | 🧠 O que é Graph-of-Thought.docx | GoT |
| 47 | 🧠 O que é Reflection Loop.docx | reflection loop |
| 48 | 🧠 O que é Tree-of-Thought.docx | ToT |
| 49 | 🧠 O que é um Prompt Compiler Evolutivo.docx | idem |
| 50 | 🧠 O que é um Prompt Memory System.docx | memory system |
| 51 | 🧠 PROMPT MESTRE — ASSISTENTE EDUCACIONAL AVANÇADO.docx | prompt mestre |
| 52 | 🧠 Professor de IA Ultra-Profissional.docx | versão alternativa |
| 53 | 🧠 Prompt Universal de Professor 2.0.docx | versão 2.0 |
| 54 | 🧠 Prompt Universal de Professor 3.0.docx | versão 3.0 |
| 55 | 🧠 Prompt Universal de Professor.docx | versão original |
| 56 | 🧠 SUPER PROMPT DE 5 CAMADAS.docx | 5 camadas |
| 57 | 🧠 SUPER PROMPT PROFISSIONAL — ARQUITETURA DE 8 CAMADAS.docx | 8 camadas |
| 58 | 🧠 SYSTEM PROMPT PROFISSIONAL - GPT Educacional Especialista em Metodologias Ativas.docx | system prompt |
| 59 | 🧠 Sistema de Prompts em Cascata (Educação).docx | prompts em cascata |
| 60 | 🚀 SUPER PROMPT MESTRE DE EDUCAÇÃO (profissional).docx | prompt mestre |

### 2.3 Cache e arquivos técnicos sem valor documental

| Tipo | Localização | Recomendação |
|---|---|---|
| `.npm-cache/` (raiz) | ~5.000 arquivos | Excluir + adicionar ao `.gitignore` |
| `.DS_Store` | vários locais | Excluir + adicionar ao `.gitignore` |
| `Planejador_e_Organizador/.next/` | cache do Next.js | Adicionar ao `.gitignore` (provavelmente já está) |
| `Planejador_e_Organizador/.pytest_cache/` | cache do pytest | Adicionar ao `.gitignore` |
| `Planejador_e_Organizador/backend/.pytest_cache/` | idem | idem |
| `__pycache__/` (vários) | bytecode Python | Adicionar ao `.gitignore` |

---

## 3. RECOMENDAÇÕES DE ORGANIZAÇÃO

### 3.1 Estrutura sugerida

```
SimuladoApp.Edu/
├── docs/
│   ├── PRD/
│   │   └── v42/                  ← PRD vigente (já organizado)
│   ├── analises/
│   │   ├── PRD_v41_analise_critica/
│   │   └── Inventario_Documentos_v42/  ← este inventário
│   ├── especificacoes/                  ← MOVER para cá:
│   │   ├── Organizadores_Horario/       ← ESPECIFICACAO_*, RESUMO_Novos_*
│   │   ├── Assistentes_Pedagogicos/     ← Analise_Niveis_Assistentes.*
│   │   └── Aula_Gamificada/             ← Relatorio_Funcionalidades_*
│   └── README.md                        ← criar índice geral dos docs
│
├── archive/
│   └── 2026-03-experimentos-prompt/     ← MOVER todos os 60 docs com emoji
│       ├── arquiteturas-de-agentes/
│       ├── simulacao-de-turma/           ← conceito descartado
│       ├── escola-virtual/                ← protótipos descartados
│       ├── meta-prompts/
│       └── prompts-universais/
│
├── Planejador_e_Organizador/             ← MANTER (código + docs ativos)
│
└── .gitignore                            ← incluir .npm-cache, .DS_Store, __pycache__, etc.
```

### 3.2 Por que arquivar e não excluir

- Os experimentos têm **valor histórico** — mostram a evolução do pensamento sobre o produto.
- Algumas ideias podem **inspirar features futuras** (Sistema de 20 Alunos pode virar feature de simulação opcional para professores ensaiar aulas, em v5+).
- Manter em `archive/` separado deixa claro o que é referência ativa vs. histórico.

### 3.3 Ações imediatas recomendadas

1. **Criar pasta `archive/2026-03-experimentos-prompt/`** e mover os 60 docs com emoji.
2. **Criar pasta `docs/especificacoes/`** e mover os 5 docs especificação ativos da raiz.
3. **Atualizar `.gitignore`** para excluir caches.
4. **Criar `docs/README.md`** com índice geral apontando para PRD v4.2, análises, especificações.
5. **Resolver a divergência Gemini→Anthropic** no `Planejador_e_Organizador` (decisão de Fase 0).

---

## 4. CHECKLIST DE LINKAGEM PRD v4.2 ↔ DOCUMENTOS DE REFERÊNCIA

Para cada capítulo do PRD v4.2, qual(is) documento(s) de referência detalham a implementação:

| Capítulo do PRD v4.2 | Documento de referência ativo |
|---|---|
| §1 Visão Geral | PRD v4.2 (self-contained) |
| §2 Perfis de Usuário | PRD v4.2 (self-contained) — refinar com pesquisa do §12 |
| §3 Agentes de Disciplina | `Analise_Niveis_Assistentes.docx` (níveis de implementação) + `Planejador_e_Organizador/docs/sequencia-didatica-pedagogia.md` |
| §3.0.2 Gamificação Básica | `Relatorio_Funcionalidades_AulaGamificada.docx` (mecânicas implementáveis) |
| §4.1 Gamificação Avançada | `Relatorio_Funcionalidades_AulaGamificada.docx` |
| §4.4 Calendário Pedagógico | `Planejador_e_Organizador/docs/PRD_SSD_PLANEJAMENTO_*.docx` + código existente |
| §4.8 Planejador Curricular | `Planejador_e_Organizador/docs/gerador-planejamento-spec.md` + `sequencia-calendario-spec.md` |
| §4.10 Organizadores de Horário | `ESPECIFICACAO_Organizadores_Horario.docx` + `RESUMO_Novos_Organizadores.docx` |
| §5 Arquitetura de IA | PRD v4.2 (self-contained) — refatorar `gemini_service.py` → `anthropic_service.py` |
| §6 Briefing Pedagógico | PRD v4.2 (self-contained) — implementar do zero |
| §7-8 Segurança e LGPD | PRD v4.2 (self-contained) — auditoria externa em Fase 0 |
| §10 Unit Economics | PRD v4.2 (self-contained) |
| §11 Roadmap com KPIs | PRD v4.2 + `Analise_Niveis_Assistentes.docx` (estimativas de horas) |
| §12 Validação de Usuário | PRD v4.2 (self-contained) — executar pesquisa antes de Fase 1 |
| §14 Análise Competitiva | PRD v4.2 (self-contained) |

---

## 5. RESUMO FINAL — DUAS LISTAS ENXUTAS

### Lista A — DOCUMENTOS A USAR NA IMPLEMENTAÇÃO (22 itens)

**Raiz do projeto:**
1. Analise_Niveis_Assistentes.docx
2. analise_niveis_assistentes.md
3. ESPECIFICACAO_Organizadores_Horario.docx
4. RESUMO_Novos_Organizadores.docx
5. Relatorio_Funcionalidades_AulaGamificada.docx

**docs/PRD/v42/:**
6. SimuladoAppEdu_PRD_v42.docx ⭐ (fonte da verdade)
7. SimuladoAppEdu_PRD_v42.md
8. CHANGELOG_v41_v42.docx
9. CHANGELOG_v41_v42.md

**docs/analises/PRD_v41_analise_critica/:**
10. Analise_Critica_PRD_v41.docx
11. Analise_Critica_PRD_v41.md

**Planejador_e_Organizador/ (subprojeto de código + docs):**
12. README.md
13. docs/PRD_SSD_PLANEJAMENTO_COMPLETO.docx (e suas 6 partes — PARTE1..PARTE6)
14. docs/PRD_SSD_SKILLS_MAPPING.docx
15. docs/SKILLS_MAPPING_PLANEJAMENTO.md
16. docs/architecture.md
17. docs/gerador-planejamento-spec.md
18. docs/sequencia-calendario-spec.md
19. docs/sequencia-didatica-pedagogia.md
20. docs/PRD_SSD_LEIA_ME.md
21. docs/INDICE_COMPLETO_PRD_SSD.md
22. Código-fonte completo (backend/, frontend/, docker/, .github/, docker-compose.yml, Makefile)

### Lista B — DOCUMENTOS A NÃO USAR / ARQUIVAR (65 itens)

**Conceito Simulação de Turma — explicitamente descartado (18 itens):**

Os documentos das séries "🏫 Escola Virtual *" (8 arquivos), "🧠 Sistema de 20 Alunos Virtuais", "🧠 Sistema de Simulação de Aula *" (2 arquivos), "🧠 Laboratório Virtual *" (3 arquivos) e "🧠 Sistema de * Autônomo *" (4 arquivos) descrevem o conceito de Simulação de Turma que foi explicitamente removido do escopo.

**Experimentos antigos de prompt engineering — superados pelo PRD v4.2 (42 itens):**

Toda a série "🧠 Arquitetura de N Agentes/Camadas" (~10 arquivos), "🧠 Prompt Universal de Professor *" (3 versões), "🧠 Meta-Prompt *" (3 arquivos), "🧠 O que é * (CPE/ToT/GoT/Reflection)" (6 arquivos), "🧠 SUPER PROMPT *" (3 arquivos), "🧠 Estrutura do Sistema de N Agentes" (3 arquivos), e os demais experimentos individuais.

**Caches e binários (~5.000 arquivos):**

`.npm-cache/`, `.DS_Store`, `.next/cache/`, `.pytest_cache/`, `__pycache__/`. Adicionar a `.gitignore`.

---

*Fim do inventário.*
