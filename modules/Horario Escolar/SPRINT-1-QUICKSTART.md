# Sprint 1 — Quick Start Guide
**PDF Import Reorganizer — P1 (Upload + Extract + Parse)**

---

## 🚀 Início Rápido (15 min setup)

### 1️⃣ Setup Inicial

```bash
cd /Users/kelsopalheta/Developer/Horario\ Escolar/webapp

# Instalar dependências
npm install pdfjs-dist fuse.js

# Copiar .env
cp .env.example .env.local

# Editar .env.local
nano .env.local
# Adicionar:
# VITE_MARITACA_API_KEY=sk_test_xxxxx
```

### 2️⃣ Criar Estrutura de Pastas

```bash
# Já existe webapp/, criar subpastas se não existirem
mkdir -p js/modules
mkdir -p css

# Criar arquivos vazios (você vai preencher)
touch js/modules/pdf-upload.js
touch js/modules/pdf-parser.js
touch js/modules/data-mapper.js
touch js/modules/decision-form.js
touch js/modules/fuzzy-match.js
touch js/modules/storage-utils.js
touch css/import-pdf.css
touch api/extract-pdf.js
```

### 3️⃣ Rodar Local

```bash
# Terminal 1: Server
python -m http.server 8000

# Terminal 2: Abrir browser
open http://localhost:8000
```

---

## 📝 Tasks Sprint 1

### ✅ Task #3: Setup Inicial (1-2 horas)

**O quê:** npm install + estrutura + .env

**Checklist:**
- [ ] npm install pdfjs-dist fuse.js
- [ ] .env.local configurado com VITE_MARITACA_API_KEY
- [ ] Pastas criadas (js/modules, css)
- [ ] Server rodando em localhost:8000

**Quando terminar:** Commit com mensagem
```bash
git add -A
git commit -m "feat: setup Sprint 1 — npm deps + folder structure"
```

---

### ✅ Task #4: RF-01 (File Picker) — 3-4 horas

**O quê:** Componente de upload com validação

**Arquivo:** `js/modules/pdf-upload.js`

**Boilerplate:**
```javascript
// js/modules/pdf-upload.js

class PDFUpload {
  constructor(config = {}) {
    this.maxSize = config.maxSize || 10 * 1024 * 1024; // 10MB
    this.pdfMagic = [0x25, 0x50, 0x44, 0x46]; // "%PDF"
  }

  // RF-01: Create file input + validate
  createUploadUI() {
    const html = `
      <div id="import-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-8 w-full max-w-md">
          <h2 class="text-2xl font-bold mb-4">Importar Horário (PDF)</h2>
          <input 
            type="file" 
            id="pdf-file" 
            accept=".pdf" 
            class="block w-full mb-4 p-2 border border-gray-300 rounded"
          />
          <button 
            id="upload-btn" 
            class="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
          >
            Carregar PDF
          </button>
          <div id="upload-status" class="mt-4 text-sm text-gray-600"></div>
        </div>
      </div>
    `;
    return html;
  }

  // Validar magic bytes
  async validatePDF(file) {
    const buffer = await file.slice(0, 4).arrayBuffer();
    const view = new Uint8Array(buffer);
    
    // Check "%PDF" signature
    const isPDF = view[0] === 0x25 && 
                  view[1] === 0x50 && 
                  view[2] === 0x44 && 
                  view[3] === 0x46;
    
    if (!isPDF) {
      throw new Error("Arquivo não é um PDF válido");
    }
    
    if (file.size > this.maxSize) {
      throw new Error(`PDF maior que 10MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    return true;
  }

  // Handle upload
  async handleUpload(file) {
    try {
      await this.validatePDF(file);
      console.log("✅ PDF válido:", file.name);
      return file;
    } catch (error) {
      console.error("❌ Erro de validação:", error.message);
      throw error;
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFUpload;
}
```

**Critério de Aceite:**
- [ ] Upload 5MB PDF sem erro
- [ ] Rejeita arquivo não-PDF com mensagem clara
- [ ] Spinner visível durante processamento
- [ ] Erro exibido no modal

---

### ✅ Task #2: RF-02 (PDF Parser) — 3-4 horas

**O quê:** Extração de tabela via pdf.js

**Arquivo:** `js/modules/pdf-parser.js`

**Boilerplate:**
```javascript
// js/modules/pdf-parser.js

class PDFParser {
  constructor(config = {}) {
    this.pdfjs = window.pdfjsLib; // pdf.js loaded from CDN
  }

  // Extract text from all pages
  async extractText(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await this.pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }
    
    return fullText;
  }

  // Detect table structure and extract aulas
  parseTable(text) {
    const aulas = [];
    
    // Simple regex pattern for table rows
    // Format esperado: "Turma | Disciplina | Professor | Sala | Dia | Tempo"
    const rowPattern = /(\d[A-Z])\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*(\w+)\s*\|\s*(\d)/gm;
    
    let match;
    while ((match = rowPattern.exec(text)) !== null) {
      aulas.push({
        turma: match[1].trim(),
        disciplina: match[2].trim(),
        professor: match[3].trim(),
        sala: match[4].trim(),
        dia: match[5].trim(),
        tempo: match[6].trim(),
        carga_semanal: null, // Will be calculated
        eh_aula_dupla: false
      });
    }
    
    return aulas;
  }

  // Main entry point
  async parse(file) {
    try {
      const text = await this.extractText(file);
      const aulas = this.parseTable(text);
      
      if (aulas.length === 0) {
        throw new Error("Nenhuma tabela detectada no PDF");
      }
      
      console.log(`✅ Extraído: ${aulas.length} aulas`);
      return aulas;
    } catch (error) {
      console.error("❌ Erro ao parsear PDF:", error.message);
      throw error;
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFParser;
}
```

**Critério de Aceite:**
- [ ] Extrai texto em < 5 seg (PDF 10MB)
- [ ] Identifica 90%+ das aulas
- [ ] Retorna JSON estruturado válido

---

### ✅ Task #1: RF-03/04/05 (Data Mapper) — 3-4 horas

**O quê:** Fuzzy match + validação + calendário

**Arquivo:** `js/modules/data-mapper.js`

**Boilerplate:**
```javascript
// js/modules/data-mapper.js

class DataMapper {
  constructor(schoolData = {}) {
    this.professors = schoolData.professors || [];
    this.disciplines = schoolData.disciplines || [];
    this.areas = schoolData.areas || [];
    this.blockedSlots = schoolData.blockedSlots || [];
  }

  // RF-03: Fuzzy match professores (será feito com fuse.js)
  matchProfessor(name, threshold = 0.85) {
    // TODO: Usar fuse.js para fuzzy matching
    // Por enquanto, exact match
    const match = this.professors.find(p => p.name.toLowerCase() === name.toLowerCase());
    return match ? { ...match, status: "match_found" } : { status: "not_found", suggested: [] };
  }

  // RF-04: Validar disciplina
  validateDiscipline(name) {
    const match = this.disciplines.find(d => d.name.toLowerCase() === name.toLowerCase());
    if (match) {
      return { ...match, status: "valid", area: match.area };
    }
    return { status: "not_found", suggested_areas: this.areas };
  }

  // RF-05: Check calendário bloqueado
  isSlotBlocked(dia, tempo) {
    return this.blockedSlots.some(slot => slot.dia === dia && slot.tempo === tempo);
  }

  // Process all aulas
  mapAulas(aulas) {
    return aulas.map(aula => {
      const profMatch = this.matchProfessor(aula.professor);
      const discValid = this.validateDiscipline(aula.disciplina);
      const isBlocked = this.isSlotBlocked(aula.dia, aula.tempo);

      return {
        ...aula,
        professor_status: profMatch.status,
        professor_id: profMatch.id || null,
        disciplina_status: discValid.status,
        disciplina_area: discValid.area || null,
        calendario_bloqueado: isBlocked,
        requer_decisao: profMatch.status !== "match_found" || discValid.status !== "valid" || isBlocked
      };
    });
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataMapper;
}
```

**Critério de Aceite:**
- [ ] Fuzzy match com fuse.js (threshold 85%)
- [ ] Disciplinas validadas vs BNCC
- [ ] Slots bloqueados detectados

---

### ✅ Task #5: Integration Test — 2-3 horas

**O quê:** Teste E2E Upload → Extract → Parse

**Como testar:**
```bash
# 1. Criar PDF de teste (ou usar horario_exemplo.pdf da escola)
# 2. Abrir http://localhost:8000
# 3. Clicar "Importar Horário"
# 4. Selecionar PDF
# 5. Abrir DevTools (F12)
# 6. Verificar console
```

**Teste manual no console:**
```javascript
// Abrir DevTools > Console

const upload = new PDFUpload();
const parser = new PDFParser();
const mapper = new DataMapper({
  professors: [
    { id: "prof_001", name: "Ana Silva", area: "Linguagens" },
    { id: "prof_002", name: "João da Silva", area: "Matemática" }
  ],
  disciplines: [
    { id: "disc_001", name: "Português", area: "Linguagens" },
    { id: "disc_002", name: "Matemática", area: "Matemática" }
  ],
  blockedSlots: [
    { dia: "quarta", tempo: "8" },
    { dia: "quarta", tempo: "9" }
  ]
});

// Get file from input
const file = document.getElementById("pdf-file").files[0];

// Test pipeline
(async () => {
  try {
    // 1. Validate
    await upload.validatePDF(file);
    console.log("✅ PDF válido");
    
    // 2. Parse
    const aulas = await parser.parse(file);
    console.log("✅ Extraído:", aulas.length, "aulas");
    
    // 3. Map
    const mapped = mapper.mapAulas(aulas);
    console.log("✅ Mapeado com sucesso");
    console.table(mapped);
    
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
})();
```

---

## 📊 Timeline Sprint 1

| Task | Horas | Status |
|------|-------|--------|
| #3 Setup | 1-2h | 📝 To do |
| #4 RF-01 | 3-4h | 📝 To do |
| #2 RF-02 | 3-4h | 📝 To do |
| #1 RF-03/04/05 | 3-4h | 📝 To do |
| #5 Integration Test | 2-3h | 📝 To do |
| **Total** | **~15-18h** | - |

---

## 📌 Commits Sprint 1

```bash
# Commit 1
git add -A
git commit -m "feat(p1): setup — npm deps + folder structure"

# Commit 2
git add js/modules/pdf-upload.js css/import-pdf.css
git commit -m "feat(rf-01): file picker + PDF validation"

# Commit 3
git add js/modules/pdf-parser.js
git commit -m "feat(rf-02): PDF extraction via pdf.js"

# Commit 4
git add js/modules/data-mapper.js js/modules/fuzzy-match.js
git commit -m "feat(rf-03-05): professor matching + discipline validation + calendar blocking"

# Commit 5
git add -A
git commit -m "test(p1): integration test — upload → extract → parse"
```

---

## 🎯 Próximos Passos Após Sprint 1

1. ✅ Sprint 1 integrado e testado
2. ⏭️ Sprint 2: Implementar Decision Form (RF-06)
3. ⏭️ Sprint 3: Maritaca + fallback + E2E

---

## 📚 Referências

- **Architecture:** `specs/architecture-p1.md`
- **Full Spec:** `specs/pdf-import-reorganizer-spec.md`
- **pdf.js:** https://mozilla.github.io/pdf.js/
- **fuse.js:** https://fusejs.io/

---

**Bom início! 🚀**
