# PRD — Portal/Hub Unificado (SimuladoApp.Edu)

> **Status:** Rascunho | Em revisão | Aprovado
> **Versão:** 1.0
> **Última atualização:** 22 de Junho de 2026
> **Responsável:** Time de Engenharia

---

## 1. Visão Geral

### 1.1 Resumo Executivo
O Portal/Hub Unificado é a porta de entrada única para o SimuladoApp.Edu. Ele consolida todos os módulos educacionais (Gestão de Notas, Diário Pedagógico, Gerador de Slides, Horário Escolar, e Agentes ENEM Específicos) em um único dashboard com Single Sign-On (SSO). O acesso é governado por Role-Based Access Control (RBAC), garantindo que professores só acessem os módulos pertinentes à sua disciplina.

### 1.2 Problema
Atualmente, as ferramentas estão fragmentadas em múltiplos subprojetos. Professores precisam acessar links diferentes, o que gera confusão, duplicação de autenticação e falta de visão global das ferramentas disponíveis. Além disso, não há uma forma escalável de vender ou restringir acesso a módulos específicos (ex: Agentes por disciplina).

### 1.3 Solução Proposta
Criar um Dashboard Centralizador (Next.js) integrado ao Firebase Auth. O dashboard carrega as permissões do usuário do Firestore e exibe uma vitrine de módulos. Módulos autorizados ficam interativos, enquanto módulos não autorizados são exibidos com cadeado, servindo como alavanca de upsell.

### 1.4 Objetivos do Produto
- **Objetivo 1:** Unificar o login (100% dos acessos via Hub).
- **Objetivo 2:** Implementar controle de acesso modular por disciplina/perfil (RBAC).
- **Objetivo 3:** Preparar a arquitetura de roteamento para a integração progressiva de todos os submódulos atuais e futuros (ex: Agentes ENEM).

---

## 2. Público-alvo & Personas

### Persona Principal — Professor(a) Especialista
- **Perfil:** Leciona uma ou mais disciplinas específicas (ex: Linguagens).
- **Dores:** Perde tempo gerenciando múltiplas ferramentas e senhas para diferentes turmas.
- **Ganhos esperados:** Um painel único onde encontra o Diário Pedagógico, a Gestão de Notas e um Agente IA especialista na sua disciplina.
- **Cenário de uso:** Acesso diário pelo computador ou tablet para planejar aulas e registrar notas.

---

## 3. Requisitos Funcionais

### 3.1 MVP (Mínimo Produto Viável)
| ID | Funcionalidade | Descrição | Prioridade |
|----|---------------|-----------|-----------|
| RF-01 | Autenticação Unificada | Login via Google e Email/Senha integrados ao Firebase. | Alta |
| RF-02 | Perfil do Usuário | Sincronizar criação de usuário na coleção `professores` com campos `modulos_permitidos` e `disciplinas_permitidas`. | Alta |
| RF-03 | Dashboard Principal | Grid exibindo todos os módulos da plataforma (Notas, Diário, Slides, Horário, Agentes). | Alta |
| RF-04 | Controle de Acesso (UI) | Módulos sem permissão devem exibir um cadeado e ter ação bloqueada. | Alta |
| RF-05 | Roteamento Básico | Ao clicar em um módulo liberado, navegar para a rota correspondente (ex: `/diario`). | Alta |

### 3.2 Pós-MVP (Roadmap Futuro)
| ID | Funcionalidade | Fase |
|----|---------------|------|
| RF-06 | Fluxo de Solicitação de Acesso | Botão "Solicitar Acesso" em módulos bloqueados que notifica o admin/vendas. | v1.1 |
| RF-07 | Painel de Administração | Tela para diretores/admins gerenciarem as permissões dos professores. | v1.2 |

---

## 4. Requisitos Não-Funcionais

| Categoria | Requisito | Critério de Aceitação |
|-----------|-----------|----------------------|
| Arquitetura | Monorepo Next.js | O Hub deve ser a aplicação frontend principal, consumindo os submódulos via rotas. |
| Segurança | Proteção de Rotas | Middleware do Next.js deve validar o token do Firebase antes de renderizar rotas protegidas. |
| Escalabilidade | Adição de Módulos | A adição de um novo módulo no painel deve requerer apenas a inserção de um objeto em uma constante de configuração. |
| Manutenibilidade| Componentes Compartilhados | UI baseada em um Design System comum (Shadcn/Tailwind) armazenado em `/shared`. |

---

## 5. Fora do Escopo (MVP)
- Migração completa de código e regras de negócio de **todos** os módulos antigos de uma vez (será feito um por um).
- Sistema de cobrança e pagamento automatizado para desbloqueio de módulos (Stripe/Pagar.me).

---

## 6. Critérios de Sucesso & KPIs
| Métrica | Meta | Prazo |
|---------|------|-------|
| 100% de Autenticação Unificada | Nenhum módulo operando login isolado | Fim da Fase 1 |
| Engajamento de Descoberta | 20% de cliques em módulos bloqueados (interesse) | 1 mês após lançamento |

---

## 7. Roadmap de Alto Nível
| Fase | Entregável | Prazo Estimado |
|------|-----------|---------------|
| Fase 1 | Hub Central com Login, Dashboard, RBAC e rota `/diario` (Gestão de Notas) | Imediato |
| Fase 2 | Migração dos Módulos Gerador de Slides e Organizador de Horário | Semana 2 |
| Fase 3 | Desenvolvimento dos Agentes ENEM Especialistas (roteamento no Hub) | Semana 3 |

---

## 8. Riscos e Dependências
| Risco/Dependência | Probabilidade | Impacto | Mitigação |
|-------------------|--------------|---------|-----------|
| Incompatibilidade de pacotes entre Vite/React e Next.js ao migrar módulos. | Alta | Alto | Utilizar a abordagem "micro-frontend" via iframes ou refatorar progressivamente os componentes React puros. |
| Regras de segurança do Firestore frouxas permitindo acesso direto aos dados de módulos bloqueados. | Média | Alto | Atualizar `firestore.rules` validando `modulos_permitidos` do usuário antes do read/write. |
