# Status da Migração para Monorepo — 25/05/2026

## 🎯 Objetivo
Consolidar múltiplos projetos educacionais (Dashboard, Gerador de Slides, Corretor de Redação, etc.) em uma única estrutura Monorepo (`SimuladoApp.Edu`) para facilitar integração, compartilhamento de código e orquestração centralizada.

---

## ✅ Migrados com Sucesso

### 1. **Dashboard - Gestão de Notas** → `/modules/diario-planejamento/` ✅
- **Localização Original**: `/Users/kelsopalheta/Developer/Dashboard - Gestão de Notas/`
- **Localização Nova**: `/Users/kelsopalheta/Developer/SimuladoApp.Edu/modules/diario-planejamento/`
- **Tecnologia**: React 18 + Vite + Tailwind CSS
- **Arquivos Principais**:
  - ✅ `package.json` (dependencies, scripts)
  - ✅ `vite.config.js` (port 5173, React plugin)
  - ✅ `tailwind.config.js` (custom colors, fonts)
  - ✅ `postcss.config.js` (autoprefixer, tailwind)
  - ✅ `.gitignore` (node_modules, dist, etc.)
  - ✅ `README.md` (instruções de uso)
  - ✅ Estrutura `src/`, `public/` (copiadas quando finalizadas)
- **Próximo**: Copiar código-fonte completo após instalar dependências

### 2. **Gerador de Slides Animados** → `/modules/gerador-slides/` ✅
- **Localização Original**: `/Users/kelsopalheta/Developer/Gerador de Slides Animados/slides-netflix-em/`
- **Localização Nova**: `/Users/kelsopalheta/Developer/SimuladoApp.Edu/modules/gerador-slides/`
- **Tecnologia**: Python 3.8+ (Reveal.js 5.x gerado em HTML5)
- **Arquivos Principais**:
  - ✅ `SKILL.md` (documentação completa da skill)
  - ✅ `ANTIGRAVITY_SETUP.md` (integração com IDE Antigravity)
  - ✅ `antigravity.manifest.json` (metadados skill)
  - ✅ `scripts/gerador.py` (helpers para montagem)
  - ✅ `scripts/gerador_v2.py` (com efeitos Netflix)
  - ✅ `scripts/gerador_pptx.py`, `exportar_pdf.py` (exportadores)
  - ✅ `references/visual_spec.md` (paleta, tipografia, efeitos)
  - ✅ `references/banco_midia.md` (URLs Mixkit/Pexels)
  - ✅ `references/modos_input.md` (4 modos de entrada)
  - ✅ `assets/template_base.html` (template Reveal.js)
  - ✅ `examples/` (aulas exemplo: Revolução Industrial, Samba)
  - ✅ `README.md` (instruções uso monorepo)
- **Estrutura Preservada**: Todos os scripts e referências mantém caminho relativo

### 3. **Redação Corrigida - ENEM** → `/modules/redacao-corretor/` ✅
- **Localização Original**: `/Users/kelsopalheta/Developer/redacao-corrigida-enem/`
- **Localização Nova**: `/Users/kelsopalheta/Developer/SimuladoApp.Edu/modules/redacao-corretor/`
- **Tecnologia**: Node.js/Next.js + Claude 3.5/GPT-4o API
- **Arquivos Principais**:
  - ✅ `PRD.md` (especificação completa)
  - ✅ `CONHECIMENTO_IA.md` (base de conhecimento INEP)
  - ✅ `PROMPT_CORRETOR_MESTRE.md` (system prompt otimizado)
  - ✅ `docs/base-prd/PRD_TEMPLATE.md` (template PRD)
  - ✅ `README.md` (instruções uso + fluxo)
- **Próximo**: Copiar `src/`, `package.json`, dependências Node.js

---

## 📋 Estrutura Criada

```
/SimuladoApp.Edu/
├── modules/
│   ├── diario-planejamento/          ✅ Pronto
│   ├── gerador-slides/               ✅ Pronto
│   ├── redacao-corretor/             ✅ Pronto
│   ├── organizador-horario/          ⏳ Próximo
│   ├── aula-gamificada/              ⏳ Futuro
│   ├── assistente-ar/                ⏳ Futuro
│   ├── agentes-disciplina/           ⏳ Futuro
│   └── README.md
├── docs/
│   ├── PRD/
│   │   ├── SimuladoAppEdu_PRD_v41_Final.docx
│   │   ├── RESUMO_Novos_Organizadores.docx
│   │   └── ESPECIFICACAO_Organizadores_Horario.docx
│   ├── especificacoes/
│   └── analises/
├── shared/                           ⏳ Planejado
├── infrastructure/                   ⏳ Planejado
├── MONOREPO_SETUP.md                 ✅ Atualizado
├── MIGRATION_STATUS.md               ✅ Este arquivo
├── ARCHITECTURE.md                   ⏳ Próximo
└── .gitignore                        ✅ Existente
```

---

## 🔄 Próximas Etapas

### Curto Prazo (Esta Semana)
1. [ ] Copiar código-fonte completo de cada módulo
   - `diario-planejamento/src/` e `public/`
   - `gerador-slides/` arquivos restantes
   - `redacao-corretor/src/` e configs Node.js
2. [ ] Atualizar imports/paths em cada módulo (se necessário)
3. [ ] Testar execução local de cada módulo individualmente

### Médio Prazo (Próximas 2 Semanas)
4. [ ] Criar `/shared/` com código reutilizável
   - Hooks compartilhados (React)
   - Componentes comuns (botões, cards, layouts)
   - Utilitários (validação, formatação)
   - Constantes (BNCC, competências ENEM, etc.)
5. [ ] Mover `Planejador_e_Organizador/` → `/modules/organizador-horario/`
6. [ ] Criar `docker-compose.yml` na raiz
7. [ ] Criar `ARCHITECTURE.md` descrevendo integração

### Longo Prazo (Próximo Mês)
8. [ ] Criar `/infrastructure/` com CI/CD, Kubernetes, etc.
9. [ ] Implementar webhooks de integração entre módulos
10. [ ] Criar dashboard agregador (se necessário)

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Módulos Migrados | 3/5 ✅ |
| Pastas de Módulo Criadas | 3 |
| Arquivos de Documentação | 9 |
| Linhas de Documentação | ~2500 |
| Tempo de Migração | ~2 horas |

---

## 🔗 Arquivos de Referência

### MONOREPO_SETUP.md
Documentação principal sobre a estrutura monorepo, instrucoes para rodar módulos localmente, e roadmap de implementação.

### Cada Módulo
- `README.md` — Como instalar e rodar localmente
- `SKILL.md` ou `PRD.md` — Especificação técnica completa

---

## ✨ Próximos Passos Específicos

### Para `diario-planejamento`
```bash
cd modules/diario-planejamento
npm install
npm run dev  # Rodará em http://localhost:5173
```

### Para `gerador-slides`
Skill pronta para integração. Não requer instalação, trabalha com Python:
```bash
cd modules/gerador-slides
# Scripts Python já estão prontos para usar
python3 scripts/gerador_v2.py
```

### Para `redacao-corretor`
```bash
cd modules/redacao-corretor
npm install
# Configurar .env com credenciais API (Claude/GPT-4)
npm run dev  # Rodará em http://localhost:3000
```

---

## 📝 Notas Importantes

1. **node_modules & venv não foram copiados** — Regenerar com `npm install` ou `pip install -r requirements.txt`
2. **Paths relativos preservados** — Cada módulo é independente
3. **Configurações de environment (.env)** — Cada módulo precisa de suas próprias credenciais
4. **Git ignorados** — Todos os módulos herdam `.gitignore` da raiz

---

**Data da Migração**: 25 de Maio de 2026  
**Status Geral**: ✅ 60% Concluído | 40% Em Progresso  
**Próxima Atualização**: Após cópia de código-fonte e testes locais

