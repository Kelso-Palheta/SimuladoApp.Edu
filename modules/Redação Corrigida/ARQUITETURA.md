# Documentação de Arquitetura - Redação Corrigida ENEM

Este documento serve como guia técnico para desenvolvedores que assumirem a manutenção ou expansão da plataforma.

## 🚀 Visão Geral
A plataforma é um SaaS de correção pedagógica de redações no modelo ENEM, utilizando IA para fornecer feedback detalhado e notas baseadas nas competências do INEP.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Motivo |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | SSR/ISR para performance e SEO. |
| **Linguagem** | TypeScript | Segurança de tipos e escalabilidade. |
| **Estilização** | Tailwind CSS | Agilidade no design e consistência. |
| **Componentes** | Lucide React / Framer Motion | Ícones modernos e animações fluidas. |
| **Banco de Dados** | Supabase (PostgreSQL) | Persistência na nuvem para ambiente Serverless. |
| **IA (Cérebro)** | Maritaca / OpenAI / Anthropic | Flexibilidade de modelos para OCR e Correção. |
| **Processamento** | jsPDF / heic2any | Conversão de imagens HEIC e geração de relatórios. |

---

## 📂 Estrutura de Pastas (Principais)

- `/src/app`: Rotas e Páginas (Professor, Aluno, Login, API).
- `/src/components`: UI Reutilizável (Sidebar, Gráficos).
- `/src/lib`: Lógica de negócio (Conexão com IA, Banco, Auth, PDF).
- `/src/lib/data`: (Legado) Local para fallback JSON em ambiente local.

---

## 🔐 Sistema de Autenticação e Persistência

### Autenticação
- Implementada manualmente via hashes SHA-256 no arquivo `src/lib/auth.ts`.
- Atualmente utiliza uma estratégia de **"Auth Híbrido"**:
  - Salva no Supabase (tabela `users`) se as chaves estiverem presentes.
  - Salva em JSON local se estiver rodando offline no Mac.
- **Sessão**: Gerenciada via `localStorage` nos navegadores para simplicidade inicial.

### Persistência de Dados
- Tabela `corrections`: Armazena o ID único, dados do aluno, resultado da IA e pontuação.
- O ID de acesso do aluno é gerado aleatoriamente (Ex: `ABCD-1234`) e serve como chave de busca pública.

---

## 🤖 Engenharia de Prompt e IA

A inteligência reside no arquivo `src/lib/constants.ts` através do `MASTER_ENEM_PROMPT`.
- **Modos de Correção**: O prompt aceita o parâmetro `{depth}` que modifica o formato da saída sem alterar o rigor da nota.
- **OCR**: Realizado em `src/lib/ai-provider.ts`. Atualmente prioriza Anthropic (Claude) ou Maritaca para leitura de manuscritos.

---

## 🚧 Regras para Manutenção e Expansão

### O que FAZER:
- **Novas Funcionalidades**: Devem ser criadas como Client Components sempre que envolverem gráficos (recharts) ou geração de PDF (jsPDF), devido a limitações de bibliotecas no servidor.
- **Estilos**: Utilize apenas classes do Tailwind. Evite CSS puro.
- **API**: Mantenha as rotas em `src/app/api`. Todas as chamadas para IA devem passar pelo backend para proteger as chaves.

### O que NÃO FAZER:
- **NÃO envie o arquivo `.env` para o Git**. Ele contém as chaves de API. Use o `.env.example`.
- **NÃO use `export const config`** nas rotas de API (Next 14 usa Route Segment Config).
- **NÃO altere o rigor da IA** sem testar o impacto nas 5 competências do ENEM.

### Pendências (Backlog):
- [ ] Implementar fila de processamento (Upstash ou BullMQ) se o volume de redações crescer.
- [ ] Adicionar suporte para upload de PDF de múltiplas páginas.
- [ ] Integrar com NextAuth.js para segurança de nível bancário.

---

**Autor Original:** Antigravity AI
**Status:** Produção Estável (Vercel + Supabase)
