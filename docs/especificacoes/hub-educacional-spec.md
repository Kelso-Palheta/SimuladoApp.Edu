# Spec: Hub Educacional Unificado

## 1. O Problema
**Qual problema isso resolve?**
A atual fragmentação dos módulos do SimuladoApp.Edu (Gestão de Notas, Gerador de Slides, Correção de Redação) exige que o professor acesse URLs separadas, faça múltiplos logins e perca o contexto global das ferramentas. Não há controle de acesso centralizado que permita restringir módulos por área de atuação do professor (RBAC).

**Quem sente esse problema?**
Professores e Coordenadores que usam múltiplas ferramentas da plataforma e precisam de fluidez, além dos administradores do sistema que não conseguem empacotar e vender módulos separadamente.

---

## 2. O Sucesso (Goals)
**Como saberemos que a feature funcionou?**
O professor faz um único login em `app.simuladoapp.edu` (ou localhost/frontend) e é redirecionado para um Dashboard central. Ele visualiza todos os módulos como "Cards", podendo acessar apenas os que tem permissão no Firestore.

**Goals:**
- Autenticação global via Firebase Auth.
- Recuperação de `modulos_permitidos` do usuário logado.
- Redirecionamento correto entre `/` (Hub) e `/modules/X`.
- Proteção de rotas (se o usuário digitar `/diario` mas não tiver acesso, volta para `/`).

## 3. O Escopo (Non-goals)
**O que está explicitamente FORA do escopo nessa primeira versão?**
- Migração técnica do código interno de cada módulo (o Hub apenas criará a infraestrutura de rotas e o painel visual).
- Sistema de checkout/pagamento automatizado.
- Painel de administração de usuários (nesta versão, as permissões serão editadas via console do Firebase Firestore).

---

## 4. Requisitos Funcionais e Comportamentos

**RF-01: Autenticação Base**
- O usuário não autenticado que acessa a raiz `/` deve ver o formulário de Login (`<LoginScreen />`).
- Suporte para Login Google e Email/Senha.
- Após o login, o sistema deve verificar se existe um documento em `professores/{uid}`. Se não, deve criar um com array padrão: `modulos_permitidos: ["diario-planejamento"]`.

**RF-02: Renderização do Dashboard**
- Renderizar uma grade (CSS Grid) contendo os Cards dos módulos catalogados na plataforma.
- Cada Card tem metadados: Título, Ícone, Descrição, ID do Módulo.
- Se o `ID do Módulo` não estiver contido em `usuario.modulos_permitidos`, o Card deve exibir um estado opaco/desativado com ícone de cadeado.

**RF-03: Interação e Proteção**
- Clicar num Card permitido: Redireciona via Next Router ou `window.location` (se for microsserviço) para a rota correspondente.
- Clicar num Card bloqueado: Abre um modal ou toast informativo ("Você não tem acesso a este módulo. Entre em contato com a coordenação").

---

## 5. Arquitetura e Implementação Técnica (Como vamos fazer?)

**Stack:**
- Frontend: Next.js (App Router ou Pages Router, a definir, preferencialmente App Router) em `/SimuladoApp.Edu/frontend/`.
- Auth e DB: Firebase (Auth + Firestore).
- Estilo: TailwindCSS + Componentes base (shadcn/ui).

**Estrutura de Dados (Firestore):**
```json
// Collection: professores
// Document: {uid}
{
  "nome": "João Professor",
  "email": "joao@escola.com",
  "modulos_permitidos": ["diario-planejamento", "gerador-slides"],
  "disciplinas_permitidas": ["linguagens"]
}
```

**Módulo de Configuração (Catálogo):**
```javascript
// src/config/modules.js
export const PLATFORM_MODULES = [
  { id: "diario-planejamento", nome: "Diário Pedagógico", icon: "BookOpen", path: "/diario" },
  { id: "redacao-corretor", nome: "Redação Corrigida", icon: "PenTool", path: "/redacao" },
  { id: "agente-linguagens", nome: "Agente ENEM: Linguagens", icon: "MessageSquare", path: "/agentes/linguagens" }
];
```

---

## 6. Edge Cases Conhecidos

- **Atraso no Sync do Firestore:** O Auth token pode ser válido, mas o documento do Firestore ainda não ter sido propagado (criação de conta). O sistema deve tolerar falhas graciosamente e usar um estado de permissão padrão temporário.
- **Permissões Revogadas em Tempo Real:** Se o admin remover a permissão do professor enquanto ele estiver usando o módulo, o listener do Firestore (se ativado) deve redirecioná-lo para a Home, ou o bloqueio ocorrerá no próximo reload (proteção de Rota Server-Side).
- **Rota Inexistente vs Rota Bloqueada:** Acessar rota bloqueada = 403 (Redirecionamento para Dashboard). Acessar rota inexistente = 404 (Página Não Encontrada padrão).

---
⚠️ ABERTO: Decidir se a migração dos projetos React puros (ex: Gestão de Notas atual) para dentro do Next.js será via reescrita total (Server Components) ou apenas agrupando como iframes / Client Components isolados na primeira etapa para ganhar tempo.
