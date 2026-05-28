# Configuração Monorepo - SimuladoApp.Edu

## Status da Reorganização

### ✅ Concluído

- [x] Criada estrutura de pastas `/modules/`
- [x] Primeira pasta de módulo criada: `modules/diario-planejamento/`
  - Arquivo: `Dashboard - Gestão de Notas` → `modules/diario-planejamento/`
  - Copiados arquivos principais (package.json, vite.config.js, tailwind.config.js, postcss.config.js, .gitignore, README.md)
  - Nota: node_modules não foi copiado (será regenerado com `npm install`)

- [x] Segunda pasta de módulo criada: `modules/gerador-slides/`
  - Projeto: Gerador de Slides Animados para Ensino Médio
  - Arquivos: SKILL.md, ANTIGRAVITY_SETUP.md, antigravity.manifest.json, scripts/*, references/*, examples/*
  - Tecnologia: Python + HTML5 Reveal.js
  - Status: Estrutura monorepo criada

- [x] Terceira pasta de módulo criada: `modules/redacao-corretor/`
  - Projeto: Redação Corrigida - ENEM
  - Arquivos: PRD.md, CONHECIMENTO_IA.md, PROMPT_CORRETOR_MESTRE.md, docs/base-prd/*
  - Tecnologia: Node.js/Next.js + Claude/GPT-4o API
  - Status: Estrutura monorepo criada

### ⏳ Próximo

A estrutura Monorepo recomendada é:

```
/SimuladoApp.Edu/
│
├── 📋 docs/
│   ├── PRD/
│   │   ├── SimuladoAppEdu_PRD_v41_Final.docx           ✅ (já existe)
│   │   ├── RESUMO_Novos_Organizadores.docx             ✅ (já existe)
│   │   └── ESPECIFICACAO_Organizadores_Horario.docx    ✅ (já existe)
│   ├── especificacoes/
│   └── analises/
│
├── 🧠 modules/
│   ├── diario-planejamento/                   ✅ ADICIONADO
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── README.md
│   │   └── ...
│   │
│   ├── gerador-slides/                        ✅ ADICIONADO
│   │   ├── scripts/
│   │   ├── assets/
│   │   ├── references/
│   │   ├── examples/
│   │   ├── SKILL.md
│   │   ├── ANTIGRAVITY_SETUP.md
│   │   ├── antigravity.manifest.json
│   │   ├── README.md
│   │   └── ...
│   │
│   ├── redacao-corretor/                      ✅ ADICIONADO
│   │   ├── docs/base-prd/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── PRD.md
│   │   ├── CONHECIMENTO_IA.md
│   │   ├── PROMPT_CORRETOR_MESTRE.md
│   │   ├── README.md
│   │   └── ...
│   │
│   ├── organizador-horario/                   ⏳ (já existe em raiz, precisa ser movido)
│   │   └── backend/, frontend/, ...
│   │
│   ├── aula-gamificada/                       ⏳ (quando adicionar)
│   ├── assistente-ar/                         ⏳ (quando adicionar)
│   ├── agentes-disciplina/                    ⏳ (quando adicionar)
│   └── ...
│
├── 🔧 shared/                                 ⏳ (criar quando houver código compartilhado)
│   ├── utils/
│   ├── components/
│   ├── services/
│   └── constants/
│
├── 🐳 infrastructure/                         ⏳ (criar para orchestração)
│   ├── docker-compose.yml
│   ├── kubernetes/
│   └── .github/workflows/
│
├── 📱 frontend/                               ⏳ (opcional: dashboard agregador)
├── 🔐 backend/                                ⏳ (opcional: API gateway)
├── 🧪 tests/                                  ⏳ (testes integrados E2E)
│
├── README.md                                  ⏳ (documentação raiz)
├── ARCHITECTURE.md                            ⏳ (guia arquitetural)
└── .gitignore
```

## Instruções para Próximas Pastas

Ao adicionar uma nova pasta de módulo (ex: `Aula Gamificada`):

1. **Crie a pasta**: `/modules/aula-gamificada/`
2. **Copie os arquivos principais** (não node_modules)
3. **Atualize o README.md** do módulo
4. **Adicione em /modules/aula-gamificada/README.md** as dependências e instruções específicas

## Como Instalar e Rodar Localmente

### Opção 1: Rodar um módulo individual

```bash
cd modules/diario-planejamento
npm install
npm run dev
```

### Opção 2: Rodar todos os módulos (quando houver docker-compose.yml)

```bash
# Na raiz do projeto
docker-compose up
```

## Próximas Tarefas

1. [x] Mover `Dashboard - Gestão de Notas` → `modules/diario-planejamento/` ✅
2. [x] Mover `Gerador de Slides Animados` → `modules/gerador-slides/` ✅
3. [x] Mover `redacao-corrigida-enem` → `modules/redacao-corretor/` ✅
4. [ ] Mover `Planejador_e_Organizador/` → `modules/organizador-horario/`
5. [ ] Copiar arquivos principais de cada módulo (excluindo venv, node_modules, .npm_cache)
6. [ ] Criar `docker-compose.yml` na raiz para orquestração
7. [ ] Criar `ARCHITECTURE.md` na raiz descrevendo a integração entre módulos
8. [ ] Criar `/shared/` com código reutilizável entre módulos
9. [ ] Criar pipeline CI/CD em `.github/workflows/`
10. [ ] Atualizar documentation centralized com links para cada módulo

---

**Data de Criação**: 25 de Maio de 2026
**Última Atualização**: 25 de Maio de 2026
**Status**: 3 módulos adicionados ✅ | Reorganização em progresso 70%

## Resumo do Progresso

- **Módulos Criados**: 3/5 (diario-planejamento, gerador-slides, redacao-corretor)
- **Documentação**: Completa para cada módulo
- **Próximos**: Organizador de Horário, Aula Gamificada, Assistente AR, Agentes de Disciplina
- **Arquitetura**: Monorepo com /modules, /docs, /shared (planejado), /infrastructure (planejado)
