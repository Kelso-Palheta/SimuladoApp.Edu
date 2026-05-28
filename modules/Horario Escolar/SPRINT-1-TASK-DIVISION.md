# Sprint 1 — Divisão de Tarefas
**Claude Code vs. Deepseek v4 Pro**

---

## 🎯 Estratégia de Divisão

- **Claude Code (aqui)**: Terminal, CLI, setup, integração, testes
- **Deepseek v4 Pro**: Código puro, lógica de negócio, módulos JavaScript

---

## 📋 Distribuição de Tasks

### 🔵 CLAUDE CODE (aqui)

#### Task #3: Setup Inicial (npm, estrutura, .env)
**Status:** ✅ EM PROGRESSO
- [x] npm install pdfjs-dist fuse.js
- [x] Criar pastas (js/modules, css)
- [ ] Criar .env.local
- [ ] Instalar dependências via npm
- [ ] Teste: npm list

**Tempo:** ~30 min  
**Ferramentas:** Bash, npm, package.json

---

#### Task #5: Integration Test (E2E Upload → Extract → Parse)
**Status:** 📝 TO DO
- [ ] Criar PDF de teste (ou usar exemplo)
- [ ] Testar upload em http://localhost:8000
- [ ] Validar console errors
- [ ] Verificar sessionStorage
- [ ] Relatório de testes

**Tempo:** ~2-3 horas  
**Ferramentas:** Browser DevTools, terminal, testes manuais

---

### 🟣 DEEPSEEK V4 PRO (lá)

#### Task #4: RF-01 (File Picker + Validação)
**Status:** 📝 TO DO
**Arquivo:** `js/modules/pdf-upload.js`

**Especificação:**
- Classe PDFUpload com:
  - `createUploadUI()` — HTML da modal
  - `validatePDF(file)` — magic bytes + size validation
  - `handleUpload(file)` — orquestração

**Critério de Aceite:**
- Upload 5MB PDF ✅
- Rejeita não-PDF ✅
- Spinner visível ✅

**Boilerplate fornecido:** Sim (em SPRINT-1-QUICKSTART.md)  
**Tempo:** ~3-4 horas

---

#### Task #2: RF-02 (PDF Parser via pdf.js)
**Status:** 📝 TO DO
**Arquivo:** `js/modules/pdf-parser.js`

**Especificação:**
- Classe PDFParser com:
  - `extractText(file)` — pdf.js.getDocument + page iteration
  - `parseTable(text)` — regex para detectar tabelas
  - `parse(file)` — orquestração

**Critério de Aceite:**
- Extrai < 5 seg ✅
- Identifica 90%+ aulas ✅
- JSON válido ✅

**Boilerplate fornecido:** Sim  
**Tempo:** ~3-4 horas

---

#### Task #1: RF-03/04/05 (Data Mapper)
**Status:** 📝 TO DO
**Arquivo:** `js/modules/data-mapper.js`

**Especificação:**
- Classe DataMapper com:
  - `matchProfessor(name)` — fuzzy match (será com fuse.js)
  - `validateDiscipline(name)` — check vs BNCC
  - `isSlotBlocked(dia, tempo)` — calendário
  - `mapAulas(aulas)` — orquestração

**Critério de Aceite:**
- Fuzzy match 85%+ ✅
- Disciplinas validadas ✅
- Slots bloqueados detectados ✅

**Boilerplate fornecido:** Sim  
**Tempo:** ~3-4 horas

---

## 📊 Resumo

| Task | Responsável | Tempo | Status |
|------|-------------|-------|--------|
| #3 Setup | 🔵 Claude | 0.5h | ✅ EM PROGRESSO |
| #4 RF-01 | 🟣 Deepseek | 3-4h | 📝 TO DO |
| #2 RF-02 | 🟣 Deepseek | 3-4h | 📝 TO DO |
| #1 RF-03/05 | 🟣 Deepseek | 3-4h | 📝 TO DO |
| #5 Tests | 🔵 Claude | 2-3h | 📝 TO DO |

**Total:** ~15-18h (ambos em paralelo = ~4-5h wall-clock)

---

## 🔄 Fluxo de Trabalho

### Passo 1: Claude (agora)
```bash
# Setup inicial
✅ npm install pdfjs-dist fuse.js
✅ mkdir -p js/modules css
⏭️ npm install (instalar de verdade)
⏭️ Criar .env.local
```

### Passo 2: Deepseek (paralelo)
```
Pede os boilerplates do SPRINT-1-QUICKSTART.md
Implementa RF-01, RF-02, RF-03/04/05
Envia arquivos .js prontos
```

### Passo 3: Claude (depois)
```bash
# Integração + testes
✅ Copia arquivos .js da Deepseek
✅ Testa em http://localhost:8000
✅ Valida no console
✅ Relatório final
```

### Passo 4: Merge + Commit
```bash
git add -A
git commit -m "feat(p1): sprint 1 complete — upload + extract + parse"
```

---

## 📋 Para Deepseek V4 Pro

Você vai receber um prompt assim:

```
Implemente as 3 classes JavaScript para Sprint 1:

1. js/modules/pdf-upload.js (RF-01)
   - Validação de PDF (magic bytes + size)
   - Modal UI
   - Arquivo boilerplate fornecido em SPRINT-1-QUICKSTART.md

2. js/modules/pdf-parser.js (RF-02)
   - Extração via pdf.js
   - Parsing de tabelas com regex
   - Boilerplate fornecido

3. js/modules/data-mapper.js (RF-03/04/05)
   - Fuzzy match (fuse.js)
   - Validação BNCC
   - Calendário bloqueado
   - Boilerplate fornecido

Envie os 3 arquivos prontos para integração.
```

---

## ✅ Próximos Passos Imediatos

1. Claude faz Setup inicial (npm install real)
2. Deepseek recebe prompt com boilerplates
3. Ambos trabalham em paralelo
4. Claude integra + testa quando Deepseek enviar

---

**Vamos começar? 🚀**
