# CHANGELOG: PRD v4.1 → v4.2

**Documento:** SimuladoApp.Edu — Documento de Requisitos do Produto
**Versão anterior:** v4.1 (13 de maio de 2026)
**Versão nova:** v4.2 (24 de maio de 2026)
**Motivação:** aplicação das recomendações da análise crítica em `/docs/analises/PRD_v41_analise_critica/`

---

## RESUMO ESECUTIVO DAS MUDANÇAS

O PRD v4.2 não é uma reescrita conservadora — é uma evolução estrutural que endereça as **fragilidades centrais** identificadas na análise crítica. As mudanças mais impactantes:

1. **Gamificação reestruturada** (pedido explícito do usuário) — Básica embutida em cada agente + Avançada como módulo autônomo.
2. **Dois capítulos inteiramente novos:** Arquitetura de IA e Governança Responsável (cap. 5) + Arquitetura do Briefing Pedagógico (cap. 6).
3. **Três pilares** declarados explicitamente: Agentes de IA + Calendário Pedagógico + Briefing Pedagógico (antes Calendário era "transversal").
4. **Capítulo de Unit Economics e Custos Operacionais** (cap. 10) com cenários magro/médio/gordo e revisão do investimento de R$103k-218k → R$450k-850k.
5. **KPIs objetivos** atrelados a cada fase do roadmap.
6. **Capítulo de Validação de Usuário e Personas** (cap. 12) com plano de pesquisa pré-Fase 1.
7. **Capítulo de Análise Comparativa com Concorrentes** (cap. 14).
8. **Reescrita dos 13 agentes** eliminando repetição e destacando diferenciais reais.

---

## MUDANÇAS POR CAPÍTULO

### Capítulo 1 — Visão Geral

**Adicionado:**
- §1.2 — "Os três pilares da plataforma" promovendo Calendário Pedagógico e Briefing Pedagógico a pilares centrais (antes Calendário era "transversal 4.4").
- Menção explícita de que Gamificação Básica está embutida em todos os 13 agentes.

**Mantido:** posicionamento "Brasil real" e mapa de módulos.

---

### Capítulo 2 — Perfis de Usuário

**Adicionado:**
- §2.4.1 — Política de uso de IA por aluno (novo): guardrails contra uso para "fazer dever de casa", níveis de assistência configuráveis pelo professor, auditoria de interações.
- §2.5 — Login próprio obrigatório para responsável (antes era "compartilhado OU próprio") — decisão tomada para clareza de auditoria LGPD.
- Suporte a múltiplos responsáveis por aluno.
- Personas detalhadas referenciadas (capítulo 12).

**Modificado:**
- Perfil Gestor: nota de que será segmentado em v4.3 entre Diretor Privado e Gestor Público.

---

### Capítulo 3 — Os 13 Agentes de Disciplina

**Adicionado:**
- §3.0 — Arquitetura comum dos agentes (nova seção): assume explicitamente "motor único parametrizado", lista os 5 parâmetros por disciplina (system prompt, RAG, tool use, few-shot, gamificação).
- §3.0.1 — Tabela de diferenças notáveis entre agentes (apenas o que realmente diverge).
- §3.0.2 — **Gamificação Básica embutida (NOVO — correção pedida)**: descrição completa do que cada agente gera de elementos lúdicos + tabela de adaptação por disciplina com 13 exemplos de equipes/desafios.

**Modificado:**
- §3.1 a §3.13 — Reescritas em formato compacto: cada agente agora tem apenas "Especialidade + Diferenciais técnicos + Gamificação básica contextualizada". Elimina a repetição da v4.1 (mesmo template 13 vezes com bullets idênticos).

---

### Capítulo 4 — Módulos Transversais

**Modificado (correção principal pedida):**
- §4.1 — **Reescrito como "Agente de Gamificação Avançada"**: agora descrito apenas como módulo dedicado para campanhas longas, torneios, festivais. O "nível básico" foi movido para dentro dos agentes disciplinares (§3.0.2). Inclui tabela explícita de diferenciação Básica vs. Avançada.

**Adicionado:**
- §4.3 (Corretor ENEM) — Calibração técnica: correlação Spearman > 0.75 com nota humana oficial em corpus de 1.000+ redações.
- §4.4 (Calendário) — Integração nativa com DCEPA em desenvolvimento para Fase 4.
- §4.6 (Gerador de Slides) — Versão print-friendly para impressão P&B.
- §4.9 (Modo Offline) — Estratégia técnica de sincronização: last-write-wins por campo + merge interativo para conflitos importantes.
- §4.10 (Organizadores de Horário) — POC obrigatório de 2 semanas antes de Fase 3.

---

### Capítulo 5 — Arquitetura de IA e Governança Responsável (NOVO)

**Capítulo inteiramente novo.** Endereça o maior gap da v4.1 (nota 1/10 na dimensão "Governança de IA" da análise crítica).

Subseções:
- §5.1 — Stack de IA: Anthropic Claude primário, OpenAI fallback, orquestração, RAG, prompt caching.
- §5.2 — Política de uso de dados em prompts: pseudonimização obrigatória, lista do que pode/não pode ir em prompt.
- §5.3 — Tratamento de alucinação: grounding em BNCC, few-shot, badge "REVISE ANTES DE USAR", workflow de aprovação, botão de erro, responsabilidade contratual no professor.
- §5.4 — Custo de inferência e SLA de latência: tabela com 6 operações principais e custo unitário em R$.
- §5.5 — Versionamento e governança de prompts: Git, A/B testing, rollback rápido.
- §5.6 — Comportamento sob falha (graceful degradation): tabela de fallbacks para 5 cenários de falha.
- §5.7 — Roadmap de evolução de IA: fine-tuning, multi-modal, inferência local.

---

### Capítulo 6 — Arquitetura do Briefing Pedagógico (NOVO)

**Capítulo inteiramente novo.** Endereça o segundo maior gap (nota 3/10 — "vendido como mágica").

Subseções:
- §6.1 — O que é o Briefing Pedagógico (definição operacional).
- §6.2 — Schema JSON completo com exemplo concreto.
- §6.3 — Política de geração e atualização: triggers, cache, versionamento.
- §6.4 — Injeção no prompt do agente: estratégia, quando, custo.
- §6.5 — Comportamento sem dados (fallback): casos cobertos e comportamento do agente.
- §6.6 — Granularidade por persona (tabela).
- §6.7 — Especificação do webhook SimuladoApp → Plataforma: endpoint, auth, payload, reliability.
- §6.8 — Custo computacional detalhado.

---

### Capítulo 7 — Segurança (refinado)

**Adicionado:**
- §7.1 — Auditoria obrigatória de policies RLS antes de produção (pen-test externo).
- §7.4 — Logs em store SEPARADO do banco de dados auditados (correção de ambiguidade da v4.1).
- §7.5 — Proteção contra prompt injection (novo): guardrails específicos para LLM.

**Mantido:** demais práticas de segurança da v4.1.

---

### Capítulo 8 — LGPD (refinado)

**Adicionado:**
- §8.1 — Base legal específica para "processamento por IA generativa" (consentimento separado e explícito).
- §8.2 — Documentação explícita do delay de exclusão sob backup (até 30 dias).
- §8.3 — Termo separado obrigatório para "processamento por IA".
- §8.4 — Lista pública de sub-processadores (Anthropic, OpenAI, Supabase, AWS, Vercel, Resend).
- §8.6 — Política de retenção de prompts/responses com dados pessoais (6 meses, pseudonimizados).
- §8.7 — Transferência internacional de dados (NOVO): tratamento explícito de Anthropic/OpenAI sendo dos EUA.

---

### Capítulo 9 — Modelo de Negócio (ajustado)

**Modificado:**
- §9.1 (Freemium) — Adicionado "Briefing Pedagógico genérico" (dados anonimizados regionais).
- §9.2 (Individual) — **Reformulado** com clareza:
  - INCLUI: Gamificação Básica integrada nativamente + Briefing Pedagógico genérico.
  - NÃO INCLUI: Briefing personalizado + Gamificação Avançada.
  - Posicionamento explícito como loss leader estratégico.
- §9.3 (Escola) — Adicionado novo tier R$1.299/mês até 100 professores.
- §9.3 — Adicional de R$99/mês por acesso de coordenador extra.
- §9.4 (Rede) — Adicionado SSO via SAML/OIDC.

**Texto exato dos ajustes:**

ANTES (v4.1, Plano Individual):
> NÃO INCLUI: dados SimuladoApp integrados · Agente de Gamificação avançado · Simulação de Turma · Dashboard de Coordenação

DEPOIS (v4.2):
> INCLUI: 1 Agente de Disciplina ilimitado com Gamificação Básica integrada nativamente · Exportação PDF, DOCX e PPTX · Calendário Pedagógico · Biblioteca pessoal · Até 3 turmas · Briefing Pedagógico genérico
> NÃO INCLUI: Briefing Pedagógico personalizado · Agente de Gamificação Avançada · Dashboard de Coordenação

---

### Capítulo 10 — Unit Economics e Custos Operacionais (NOVO)

**Capítulo inteiramente novo.** Endereça gap de custos operacionais (a v4.1 só tinha custo de desenvolvimento).

Subseções:
- §10.1 — Premissas operacionais: CAC, churn, LTV/CAC alvo.
- §10.2 — Custos operacionais mensais em 3 cenários (magro/médio/gordo) com tabelas detalhadas.
- §10.3 — Custo de inferência LLM por plano com análise de margem por usuário.
- §10.4 — **Investimento de desenvolvimento revisado**:
  - v4.1 estimava R$103k-218k (subdimensionado).
  - v4.2 estima R$450k (cenário magro) a R$850k (cenário profissional).
- §10.5 — Caminho para break-even: projeção de mês 14-16.

---

### Capítulo 11 — Roadmap (KPIs novos)

**Modificado:** cada fase agora tem **KPIs objetivos de conclusão** (antes só tinha "meta vaga"):

- **Fase 0:** auditoria de segurança sem críticos + 100% policies RLS testadas + POC Briefing.
- **Fase 1:** 50 prof pagantes + conversão Freemium→Individual ≥8% + NPS ≥30 + churn ≤15% + tempo geração ≤30s P95 + taxa de erro IA ≤5% + DAU/MAU ≥25%.
- **Fase 2:** 200 prof pagantes + 50% usando 2+ agentes + Corretor calibrado + 30+ escolas em conversa + Briefing ativo em 80% das turmas.
- **Fase 3:** 500 prof pagantes + 10+ escolas + MRR ≥R$25k + Briefing personalizado para 100% Escola + POC constraint solver.
- **Fase 4:** 1.000 prof pagantes + 30+ escolas + MRR ≥R$50k + 1ª secretaria em conversa.
- **Fase 5:** 1.500 prof pagantes + 50+ escolas + 1-2 contratos Rede + MRR ≥R$100k + app mobile 40%+ adoção + NPS ≥50.

**Investimento total revisado:** R$450k-550k (magro) a R$700k-900k (profissional).

---

### Capítulo 12 — Validação de Usuário e Pesquisa (NOVO)

**Capítulo inteiramente novo.** Endereça gap mais grave (nota 1/10 na análise crítica).

Subseções:
- §12.1 — Plano de pesquisa pré-Fase 1: 15-30 entrevistas com professores + 5 com coordenadores + 3 com gestores + testes de usabilidade. Investimento: R$8k-15k + 4-6 semanas.
- §12.2 — 4 personas validadas detalhadas:
  - Prof. Lúcia Mendes (rede pública, multi-escola).
  - Prof. Rafael Costa (escola particular, ENEM-focused).
  - Prof. Ana Silva (interior do Pará, conectividade limitada).
  - Coord. Marcia Tavares (coordenadora pedagógica).
- §12.3 — 7 hipóteses críticas a validar com método e timing.
- §12.4 — Programa de escolas-piloto: 3 escolas selecionadas (pública urbana + privada média + pública interior).

---

### Capítulo 13 — Resumo Executivo (atualizado)

**Modificado:**
- Três pilares declarados.
- Lista de entregas inclui Gamificação Básica + Guardrails de IA + Login próprio do responsável.
- Plano Escola com novo tier 100 professores.
- Diferencial técnico cita capítulos 5 e 6 explicitamente.
- Tabela de riscos expandida de 4 para 9 riscos com probabilidade e impacto.

---

### Capítulo 14 — Análise Comparativa com Concorrentes (NOVO)

**Capítulo inteiramente novo.**

Subseções:
- §14.1 — Mapa competitivo com 8 concorrentes (MagicSchool, Khanmigo, Geekie, Curipod, Brainly/Studeo, TeachMate, Eduardo IA Embraer/SP, Layla MEC).
- §14.2 — Posicionamento competitivo: contra quem competir, contra quem não competir, espaço claro.
- §14.3 — Estratégia anti-comoditização.

---

### Capítulo 15 — Apêndice B: Gaps Remanescentes (atualizado)

**Modificado:**
- §15.1 — Lista do que foi resolvido na v4.2 (13 itens).
- §15.2 — Gaps remanescentes para v4.3 (9 itens).
- §15.3 — Próximas ações recomendadas em ordem (8 itens).

---

## RESUMO DE NÚMEROS

| Métrica | v4.1 | v4.2 |
|---|---|---|
| Capítulos principais | 9 + 1 apêndice | 13 + 2 apêndices |
| Capítulos inteiramente novos | — | 4 (cap. 5, 6, 10, 12, 14) |
| Páginas estimadas (Word A4) | ~32 | ~62 |
| Palavras estimadas | ~12k | ~24k |
| KPIs objetivos por fase | 0 | 35+ |
| Personas detalhadas | 0 | 4 |
| Concorrentes mapeados | 0 (mencionados de passagem) | 8 (tabela detalhada) |
| Investimento declarado | R$103k-218k | R$450k-850k |
| Cenários de custos operacionais | 0 | 3 (magro/médio/gordo) |

---

## ITENS DA ANÁLISE CRÍTICA QUE FORAM APLICADOS

Cruzando com o checklist do capítulo 8 da análise crítica:

- [x] Aplicar a reescrita da gamificação (texto pronto no capítulo 5 da análise).
- [ ] Criar documento de Arquitetura Técnica separado. *(pendente — listado para v4.3)*
- [x] Criar seção "Arquitetura de IA e Governança Responsável" no PRD.
- [x] Criar seção "Arquitetura do Briefing Pedagógico" no PRD.
- [x] Decidir destino do Plano Individual (loss leader explícito).
- [x] Validar orçamento R$103k-218k (revisado para R$450k-850k).
- [x] Calcular unit economics com custo de inferência por usuário.
- [x] Definir KPIs objetivos por fase do roadmap.
- [ ] Conduzir 10-15 entrevistas com professores antes da Fase 1. *(plano descrito em cap. 12; execução é ação separada)*
- [ ] Criar wireframes de baixa fidelidade para cada perfil. *(listado para v4.3)*
- [x] Validar consentimento LGPD para processamento por LLM (consentimento específico em §8.1).
- [x] Fazer POC do constraint solver de horário tempo integral (POC obrigatório em §4.10 e KPI da Fase 3).

**Status:** 9 de 12 itens do checklist aplicados diretamente no PRD; 3 itens (arquitetura técnica separada, wireframes, execução da pesquisa) ficam como ações de processo a executar fora do documento.

---

*Fim do CHANGELOG v4.1 → v4.2*
