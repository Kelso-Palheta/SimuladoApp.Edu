# Redação Corrigida - ENEM (SaaS Edition)

Este é um sistema inteligente de correção de redações seguindo as competências do INEP, utilizando IA para análise detalhada e feedback pedagógico.

## 🚀 Funcionalidades

- **Portal do Professor**: Dashboard completo com gráfico de desempenho da turma.
- **Correção em 3 Etapas**: 1. Upload/Foto -> 2. Extração e Revisão Manual -> 3. Análise IA.
- **Portal do Aluno**: Acesso via ID único para visualização de relatório premium.
- **Exportação**: Geração de comprovante em PDF.
- **Multi-Provedor**: Suporte a Maritaca AI (Sabiá-4), OpenAI e Anthropic.

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), TailwindCSS, Framer Motion.
- **Gráficos**: Recharts.
- **PDF**: jsPDF.
- **IA**: Maritaca API, OpenAI, Anthropic.
- **Banco de Dados**: Supabase (Nuvem) ou JSON local.

## 📦 Como Instalar Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env` (use o `.env.example` como base).
4. Inicie o servidor:
   ```bash
   npm run dev
   ```

## 🌐 Como Hospedar Online (Recomendado: Vercel)

Para que o site funcione de forma persistente na nuvem, recomendamos integrar com o **Supabase**:

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No Editor SQL dele, crie a tabela de correções:
   ```sql
   create table corrections (
     id text primary key,
     "studentName" text,
     "studentClass" text,
     "essayTheme" text,
     result text,
     "scoreData" jsonb,
     "totalScore" int,
     "createdAt" timestamp with time zone default now()
   );
   ```
3. Nas configurações da Vercel, adicione as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY`.

---
Desenvolvido com foco no alto desempenho e experiência do usuário.
