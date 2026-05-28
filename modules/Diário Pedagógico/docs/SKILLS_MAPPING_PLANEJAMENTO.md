# 🎯 MAPEAMENTO DE SKILLS - PLANEJAMENTO E ORGANIZAÇÃO DE CONTEÚDOS

**Documento de Rastreabilidade: Skills Globais → Tarefas de Implementação**

Data: 20 de maio de 2026  
Projeto: Aula Gamificada - Módulo de Planejamento e Organização de Conteúdos  
Status: Pronto para Implementação

---

## 📚 SKILLS GLOBAIS CONFIGURADAS

Todas as skills estão localizadas em: `/Users/kelsopalheta/Developer/SKILLS/`

| # | Skill | Categoria | Responsabilidade Principal |
|---|-------|-----------|---------------------------|
| 1 | `caveman` | Utilidade | Comunicação ultra-comprimida (economia de tokens) |
| 2 | `design` | Design | Design visual (base) |
| 3 | `design-system` | Design | Sistema de design e componentes |
| 4 | `prd-manager` | Produto | Criação, análise e melhoria de PRDs |
| 5 | `revisor-gramatical` | QA/Escrita | Revisão de textos e documentação |
| 6 | `sandeco-maestro` | Arquitetura | Maestro de arquitetura de soluções |
| 7 | `sdd-spec` | Especificação | Spec-Driven Development (SDD) |
| 8 | `software-architecture` | Arquitetura | Arquitetura de software e sistemas |
| 9 | `skill-injection-auditor` | Segurança | Auditoria de injeção de skills |
| 10 | `superpowers` | DevOps/Dev | Superpowers para desenvolvimento avançado |

### 🆕 NOVA SKILL A CRIAR

| # | Skill | Categoria | Responsabilidade |
|---|-------|-----------|-----------------|
| 11 | `design` | Design Avançado | Design web profissional de altíssimo nível (GSAP, Three.js, transições, 3D, efeitos premium) |

---

## 📋 MAPEAMENTO POR COMPONENTE

### **REQUISITOS FUNCIONAIS (RF-001 a RF-007)**

#### RF-001: Gerador de Planejamento Anual
**Descrição:** Gera automaticamente planejamento anual com IA

| Fase | Skill Responsável | Atividade |
|------|------------------|-----------|
| Especificação | `sdd-spec` | Detalhar comportamento esperado do gerador |
| Especificação | `prd-manager` | Validar requisito com stakeholders |
| Arquitetura | `software-architecture` | Desenhar componentes e fluxo de IA |
| Implementação Backend | `superpowers` | Coordenar desenvolvimento ágil |
| Testes | `skill-injection-auditor` | Validar segurança da integração com IA |
| Documentação | `revisor-gramatical` | Revisar prompts e documentação técnica |

**Skills Envolvidas:** `sdd-spec`, `prd-manager`, `software-architecture`, `superpowers`, `revisor-gramatical`

---

#### RF-002: Planejamento Bimestral Detalhado
**Descrição:** Divide planejamento anual em 4 planejamentos bimestrais

| Fase | Skill Responsável | Atividade |
|------|------------------|-----------|
| Especificação | `sdd-spec` | Definir algoritmo de divisão e sequência |
| Arquitetura | `software-architecture` | Design de estrutura de dados bimestral |
| Implementação | `superpowers` | Desenvolvimento do módulo |
| QA | `skill-injection-auditor` | Validar integridade dos dados |

**Skills Envolvidas:** `sdd-spec`, `software-architecture`, `superpowers`, `skill-injection-auditor`

---

#### RF-003: Gerador de Sequência Didática
**Descrição:** Cria sequências didáticas a partir de conteúdos

| Fase | Skill Responsável | Atividade |
|------|------------------|-----------|
| Especificação | `sdd-spec` | Definir estrutura pedagógica da sequência |
| Arquitetura | `sandeco-maestro` | Orquestração de componentes educacionais |
| Implementação | `superpowers` | Desenvolvimento do gerador |

**Skills Envolvidas:** `sdd-spec`, `sandeco-maestro`, `superpowers`

---

#### RF-004: Sincronização com Calendário de Aulas
**Descrição:** Integra com Google Calendar / Outlook

| Fase | Skill Responsável | Atividade |
|------|------------------|-----------|
| Especificação | `sdd-spec` | Definir fluxo de sincronização |
| Arquitetura | `software-architecture` | Design de integração com APIs externas |
| Implementação | `superpowers` | Implementar conectores |

**Skills Envolvidas:** `sdd-spec`, `software-architecture`, `superpowers`

---

#### RF-005: Confirmação de Execução de Aulas
**Descrição:** Interface para confirmar aula (✅/⚠️/❌)

| Fase | Skill Responsável | Atividade |
|------|------------------|-----------|
| Especificação | `sdd-spec` | Definir estados e fluxo de confirmação |
| UI/UX | `design` | Desenhar interface profissional com feedback visual |
| Implementação Frontend | `superpowers` | Implementar componentes React |

**Skills Envolvidas:** `sdd-spec`, `design`, `superpowers`

---

#### RF-006: Reagendamento Automático de Conteúdos
**Descrição:** Redistribui conteúdos não cobertos automaticamente

| Fase | Skill Responsável | Atividade |
|------|------------------|-----------|
| Especificação | `sdd-spec` | Definir algoritmo de reagendamento |
| Arquitetura | `software-architecture` | Design de engine de distribuição |
| Implementação | `superpowers` | Implementar lógica de reagendamento |

**Skills Envolvidas:** `sdd-spec`, `software-architecture`, `superpowers`

---

#### RF-007: Sistema de Observações e Notas de Aula
**Descrição:** Captura feedback do professor após aula

| Fase | Skill Responsável | Atividade |
|------|------------------|-----------|
| Especificação | `sdd-spec` | Definir campos e estrutura de notas |
| UI/UX | `design-system` | Componentes para form de observações |
| Implementação | `superpowers` | Implementar persistência e analytics |

**Skills Envolvidas:** `sdd-spec`, `design-system`, `superpowers`

---

## 🎨 CASOS DE USO (CU-001 a CU-005)

### CU-001: Gerar Planejamento Anual
**Skills Responsáveis:**
- `sdd-spec` — Especificar entrada/saída esperada
- `software-architecture` — Desenhar fluxo do caso de uso
- `prd-manager` — Validar requisitos do caso de uso
- `superpowers` — Implementar orquestração

### CU-002: Sincronizar Calendário com Aulas
**Skills Responsáveis:**
- `sdd-spec` — Definir protocolo de sincronização
- `software-architecture` — Design de integrações
- `superpowers` — Implementação de conectores

### CU-003: Confirmar Execução de Aula
**Skills Responsáveis:**
- `sdd-spec` — Especificar estados e transições
- `design` — UX/UI profissional
- `superpowers` — Implementação frontend + backend

### CU-004: Reagendar Conteúdos Não Cobertos
**Skills Responsáveis:**
- `sdd-spec` — Especificar lógica de reagendamento
- `software-architecture` — Engine de distribuição
- `superpowers` — Implementação do algoritmo

### CU-005: Registrar Observações de Aula
**Skills Responsáveis:**
- `sdd-spec` — Estrutura de dados de notas
- `design-system` — Componentes de formulário
- `superpowers` — Implementação de persistência

---

## 🎨 TELAS DE INTERFACE (7 Telas)

### Tela 1: Dashboard Inicial
**Skills Responsáveis:**
- `design` — Design visual e layout
- `design-system` — Componentes de dashboard
- `superpowers` — Implementação React

**Detalhes:** Cards com status dos planejamentos, atalhos rápidos, últimas ações

---

### Tela 2: Visualização Planejamento Anual
**Skills Responsáveis:**
- `design` — Timeline visual com transições
- `superpowers` — Renderização com D3/Chart.js

**Detalhes:** Timeline anual, divisão bimestral, distribuição de conteúdos

---

### Tela 3: Visualização Calendário
**Skills Responsáveis:**
- `design` — Calendar UI com animações
- `superpowers` — Integração com React Calendar

**Detalhes:** Calendário sincronizado com aulas do professor

---

### Tela 4: Detalhe da Aula
**Skills Responsáveis:**
- `design-system` — Componentes de detalhe
- `superpowers` — Modal/página de detalhe

**Detalhes:** Conteúdo previsto, status, observações passadas

---

### Tela 5: Formulário de Confirmação
**Skills Responsáveis:**
- `design` — UX com feedback visual (✅/⚠️/❌)
- `superpowers` — Validação e submissão

**Detalhes:** Radio buttons/buttons para confirmar execução da aula

---

### Tela 6: Proposta de Reagendamento
**Skills Responsáveis:**
- `design` — Apresentação visual de propostas
- `superpowers` — Modal interativo com aprovação/rejeição

**Detalhes:** Mostra conteúdos a reagendar e slots disponíveis

---

### Tela 7: Relatórios
**Skills Responsáveis:**
- `design` — Gráficos com animações e efeitos 3D
- `superpowers` — Geração de relatórios com dados

**Detalhes:** Taxa de execução, conteúdos cobertos, observações compiladas

---

## 🔌 ENDPOINTS DA API (10 Endpoints)

### Backend - POST Endpoints

**POST /api/planning/annual**
- **Spec:** `sdd-spec` (definir schema de entrada/saída)
- **Arquitetura:** `software-architecture` (design de camadas)
- **Implementação:** `superpowers` (backend Node/Python)
- **QA:** `skill-injection-auditor` (validação de segurança)

**POST /api/planning/bimonthly**
- **Spec:** `sdd-spec`
- **Implementação:** `superpowers`

**POST /api/class/confirm**
- **Spec:** `sdd-spec`
- **Implementação:** `superpowers`

**POST /api/content/reschedule**
- **Spec:** `sdd-spec`
- **Arquitetura:** `software-architecture`
- **Implementação:** `superpowers`

**POST /api/observation/create**
- **Spec:** `sdd-spec`
- **Implementação:** `superpowers`

### Backend - GET Endpoints

**GET /api/planning/annual/{id}**
- **Implementação:** `superpowers`

**GET /api/calendar/events**
- **Spec:** `sdd-spec`
- **Implementação:** `superpowers`

**GET /api/reports/execution**
- **Implementação:** `superpowers`

### Backend - PUT Endpoints

**PUT /api/planning/bimonthly/{id}**
- **Implementação:** `superpowers`

**PUT /api/class/notes/{id}**
- **Implementação:** `superpowers`

---

## 🤖 PROMPTS DE IA (3 Prompts)

### Prompt 1: Gerador de Planejamento Anual
**Estrutura especificada por:** `sdd-spec`  
**Validação de qualidade:** `revisor-gramatical`  
**Implementação:** `superpowers` (integração com Gemini/ChatGPT)

---

### Prompt 2: Gerador de Sequência Didática
**Estrutura especificada por:** `sdd-spec`  
**Pedagogia:** `sandeco-maestro`  
**Validação:** `revisor-gramatical`

---

### Prompt 3: Gerador de Reagendamento Inteligente
**Lógica especificada por:** `sdd-spec`  
**Algoritmo:** `software-architecture`  
**Validação:** `skill-injection-auditor`

---

## 📅 CRONOGRAMA DE IMPLEMENTAÇÃO (11 semanas)

### Fase 1: Fundação (Semanas 1-2)
**Skills Responsáveis:**
- `superpowers` — Setup repositório Git, CI/CD
- `software-architecture` — Arquitetura inicial
- `sdd-spec` — Documentação de interfaces

**Tarefas:**
- [ ] Setup backend (Node/Python + Express/FastAPI)
- [ ] Setup banco de dados (PostgreSQL)
- [ ] Criar estrutura de diretórios
- [ ] Configurar CI/CD
- [ ] Documentação initial das entidades de dados

---

### Fase 2: Gerador de Planejamento (Semanas 3-4)
**Skills Responsáveis:**
- `superpowers` — Implementação do módulo
- `sdd-spec` — Especificação do gerador
- `software-architecture` — Design da integração com IA

**Tarefas:**
- [ ] Implementar endpoint POST /api/planning/annual
- [ ] Integrar com Gemini/ChatGPT API
- [ ] Criar algoritmo de divisão bimestral
- [ ] Testes unitários do gerador

---

### Fase 3: Sincronização de Calendário (Semana 5)
**Skills Responsáveis:**
- `superpowers` — Implementação de conectores
- `software-architecture` — Design de integrações

**Tarefas:**
- [ ] Integração com Google Calendar API
- [ ] Integração com Outlook API
- [ ] Mapeamento de horários para aulas

---

### Fase 4: Interface (Semanas 6-7)
**Skills Responsáveis:**
- `design` — Design das 7 telas
- `superpowers` — Implementação React

**Tarefas:**
- [ ] Criar 7 telas com Next.js/React
- [ ] Integrar com APIs do backend
- [ ] Adicionar animações e transições
- [ ] Responsividade e acessibilidade

---

### Fase 5: Confirmação e Reagendamento (Semana 8)
**Skills Responsáveis:**
- `superpowers` — Implementação de fluxos

**Tarefas:**
- [ ] Implementar confirmação de aulas
- [ ] Criar engine de reagendamento
- [ ] Modal de propostas

---

### Fase 6: Observações e Relatórios (Semana 9)
**Skills Responsáveis:**
- `design` — Gráficos com efeitos
- `superpowers` — Implementação de analytics

**Tarefas:**
- [ ] Form de observações
- [ ] Persistência de notas
- [ ] Gerador de relatórios
- [ ] Dashboards com gráficos

---

### Fase 7: Testes e Deploy (Semanas 10-11)
**Skills Responsáveis:**
- `skill-injection-auditor` — Testes de segurança
- `superpowers` — Testes de integração e deploy
- `revisor-gramatical` — Revisão de documentação final

**Tarefas:**
- [ ] Testes unitários (backend + frontend)
- [ ] Testes de integração
- [ ] Testes de segurança (injections, XSS, CSRF)
- [ ] Load testing
- [ ] Deploy em staging
- [ ] Deploy em produção
- [ ] Documentação final

---

## ✅ CHECKLIST COMPLETO (51 itens) COM SKILLS

### BACKEND (15 itens)

- [ ] **Setup inicial** → `superpowers`
  - [ ] Criar repositório Git
  - [ ] Estrutura de diretórios
  - [ ] Configurar variáveis de ambiente
  - [ ] CI/CD pipeline (GitHub Actions)

- [ ] **Banco de dados** → `superpowers`, `software-architecture`
  - [ ] Design do schema
  - [ ] Criar tabelas (PlanejamentoAnual, PlanejamentoBimestral, AulaPlano, etc.)
  - [ ] Migrations versionadas
  - [ ] Índices e foreign keys

- [ ] **Requisitos Funcionais** → `sdd-spec`, `superpowers`
  - [ ] RF-001: Gerador Anual
  - [ ] RF-002: Planejamento Bimestral
  - [ ] RF-003: Sequência Didática
  - [ ] RF-004: Sincronização Calendar
  - [ ] RF-005: Confirmação de Aulas
  - [ ] RF-006: Reagendamento
  - [ ] RF-007: Observações

- [ ] **APIs** → `superpowers`, `sdd-spec`
  - [ ] 10 endpoints implementados
  - [ ] Validação de entrada
  - [ ] Tratamento de erros
  - [ ] Autenticação/Autorização

- [ ] **Integração com IA** → `superpowers`, `skill-injection-auditor`
  - [ ] Integração Gemini
  - [ ] Integração ChatGPT
  - [ ] Validação de prompts
  - [ ] Rate limiting

---

### FRONTEND (18 itens)

- [ ] **Setup React** → `superpowers`
  - [ ] Create Next.js app
  - [ ] Configurar TypeScript
  - [ ] Setup Tailwind/Material UI
  - [ ] Estrutura de componentes

- [ ] **Telas de Interface** → `design`, `superpowers`
  - [ ] Tela 1: Dashboard
  - [ ] Tela 2: Planejamento Anual
  - [ ] Tela 3: Calendário
  - [ ] Tela 4: Detalhe da Aula
  - [ ] Tela 5: Confirmação
  - [ ] Tela 6: Reagendamento
  - [ ] Tela 7: Relatórios

- [ ] **Animações e Efeitos** → `design`
  - [ ] Transições de telas
  - [ ] Animações de carregamento
  - [ ] Efeitos de feedback (✅/⚠️/❌)
  - [ ] Gráficos com efeitos 3D

- [ ] **Integração com APIs** → `superpowers`
  - [ ] Chamadas aos 10 endpoints
  - [ ] Tratamento de erros
  - [ ] Loading states
  - [ ] Paginação

- [ ] **Responsividade** → `design-system`, `superpowers`
  - [ ] Mobile first
  - [ ] Tablet
  - [ ] Desktop
  - [ ] Acessibilidade (WCAG)

---

### QA e TESTES (10 itens)

- [ ] **Testes Unitários** → `superpowers`
  - [ ] Backend: 80% cobertura
  - [ ] Frontend: 70% cobertura

- [ ] **Testes de Integração** → `superpowers`
  - [ ] Fluxo completo de planejamento
  - [ ] Fluxo de confirmação e reagendamento
  - [ ] Integração com APIs externas

- [ ] **Testes de Segurança** → `skill-injection-auditor`
  - [ ] SQL Injection
  - [ ] XSS (Cross-Site Scripting)
  - [ ] CSRF (Cross-Site Request Forgery)
  - [ ] Autenticação e Autorização
  - [ ] Rate limiting

- [ ] **Testes de Performance** → `superpowers`
  - [ ] Load testing (1000 req/s)
  - [ ] Tempo de resposta API (< 500ms p95)
  - [ ] Tempo de renderização frontend (< 3s First Paint)

- [ ] **Testes de Usabilidade** → `design`
  - [ ] A/B testing de fluxos
  - [ ] Feedback de usuários

---

### DOCUMENTAÇÃO (8 itens)

- [ ] **Documentação Técnica** → `revisor-gramatical`, `superpowers`
  - [ ] API docs (Swagger/OpenAPI)
  - [ ] Architecture docs
  - [ ] Database schema docs
  - [ ] Setup guide (dev, staging, prod)

- [ ] **Documentação do Usuário** → `revisor-gramatical`
  - [ ] User manual
  - [ ] Video tutorials
  - [ ] FAQ

- [ ] **Código Documentado** → `revisor-gramatical`
  - [ ] Comments nas funções complexas
  - [ ] Docstrings em Python/Node

---

## 🎯 MATRIZ DE RESPONSABILIDADE

**Legenda:**
- 🔴 = Responsável Principal
- 🟡 = Responsável Secundário
- 🟢 = Apoio/Validação

| Skill | Especificação | Arquitetura | Frontend | Backend | QA/Testes | Documentação | Deploy |
|-------|---|---|---|---|---|---|---|
| **sdd-spec** | 🔴 | 🟡 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 |
| **software-architecture** | 🟡 | 🔴 | 🟡 | 🔴 | 🟢 | 🟢 | 🟢 |
| **superpowers** | 🟢 | 🟡 | 🔴 | 🔴 | 🔴 | 🟡 | 🔴 |
| **design** | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 |
| **design-system** | 🟢 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 |
| **skill-injection-auditor** | 🟢 | 🟡 | 🟢 | 🟡 | 🔴 | 🟢 | 🟢 |
| **prd-manager** | 🔴 | 🟡 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 |
| **revisor-gramatical** | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 |
| **sandeco-maestro** | 🟡 | 🟡 | 🟢 | 🟡 | 🟢 | 🟢 | 🟢 |
| **caveman** | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |

---

## 🚀 COMO USAR ESTE DOCUMENTO

1. **Para começar**: Abra este arquivo + `PRD_SSD_PLANEJAMENTO_COMPLETO.docx`
2. **Para implementar uma tarefa**: Procure aqui qual skill é responsável
3. **Para verificar progresso**: Veja na seção Checklist qual skill executou cada item
4. **Para resolver dependências**: Consulte a Matriz de Responsabilidade

---

## 📞 CONTATO E APROVAÇÃO

**Documento preparado por:** Claude AI + Kelso Palheta  
**Data:** 20 de maio de 2026  
**Status:** ✅ PRONTO PARA IMPLEMENTAÇÃO

Todas as 10 skills estão configuradas. Aguardando aprovação para iniciar desenvolvimento.

