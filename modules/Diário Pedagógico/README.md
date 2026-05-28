# Aula Gamificada — Planejamento e Organização de Conteúdos

Módulo de planejamento pedagógico com IA. Gera planejamentos anuais, sincroniza com Google Calendar, confirma execução de aulas, reagenda conteúdos automaticamente.

## Stack

- **Backend:** Python 3.12 + FastAPI + SQLAlchemy 2.0 + Alembic
- **Database:** PostgreSQL 16
- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **IA:** Google Gemini API
- **Infra:** Docker + GitHub Actions

## Quick Start

```bash
# Subir tudo
docker-compose up -d

# Ou dev local
make dev
```

## Docs

Especificação completa em `docs/`. PRD/SSD principal: `PRD_SSD_PLANEJAMENTO_COMPLETO.docx`

## Estrutura

```
backend/     # FastAPI app
frontend/    # Next.js app
docker/      # Dockerfiles
docs/        # PRD/SSD referência
```
