# Horário Escolar — Sistema de Gestão de Grade

App web para visualização, edição e gestão de horários de escolas de Ensino Médio Integral com salas temáticas por área de conhecimento (BNCC).

## Recursos

- 📊 **Dashboard** com KPIs, distribuição por área, top cargas, planejamento pedagógico, histórico de mudanças
- 🎓 **Visualização por Turma** — grade matrix dia × aula
- 👨‍🏫 **Visualização por Professor** — agenda individual com dias de planejamento destacados
- 🏛️ **Visualização por Sala** — taxa de ocupação por espaço
- 📋 **Quadro Completo** — todas as turmas lado a lado por dia
- ⚙️ **Edição de Regras** — planejamento pedagógico, áreas de conhecimento, salas, turmas, professores
- 🛡️ **Auditoria** — detecção em tempo real de conflitos de professor e violações de planejamento
- 🏫 **Multi-escola** — gerencie várias escolas no mesmo app (localStorage)
- 🎨 **Tema claro/escuro**
- ✏️ **Edição inline** com validação de conflitos em tempo real

## Exportação

- 📄 **PDF** (A3 landscape) via html2pdf
- 📊 **Excel** multi-aba (uma por turma) via SheetJS
- 💾 **JSON** (backup completo)
- 📂 **Importar JSON** (novo ou legado)

## Regras Implementadas

- **Áreas BNCC:** Linguagens, Matemática, Ciências da Natureza, Ciências Humanas, Itinerários
- **Salas temáticas por área de conhecimento** (não por turma)
- **Itinerários ocupam sala da área do professor**
- **Planejamento pedagógico** (dias fora da escola por professor)
- **Clubes/Tutoria** na quarta-feira (aulas 8-9)
- **Preferência por aulas em duplas** (2 seguidas)
- **Português e Matemática** podem ter até 3 aulas seguidas
- **Detecção de conflitos:** professor em 2 turmas no mesmo slot, professor com aula em dia de planejamento

## Como usar

### Online (GitHub Pages)

Acesse: `https://[seu-usuario].github.io/horario-escolar/`

### Local

```bash
# Clone
git clone https://github.com/[seu-usuario]/horario-escolar.git
cd horario-escolar

# Rode servidor local (Python)
python3 -m http.server 8000

# Abra no browser
open http://localhost:8000
```

Também funciona abrindo `index.html` diretamente (file://) — dados embutidos via `data_embed.js`.

## Estrutura

```
horario-escolar/
├── index.html          # App single-page
├── data_embed.js       # Dados padrão (template inicial)
├── data.json           # Dados em formato JSON (referência)
├── README.md
├── LICENSE
└── .gitignore
```

## Personalização para outra escola

1. Abra o app
2. Clique **+ Nova** no sidebar
3. Defina nome da escola
4. Vá em **Regras** e configure:
   - Turmas
   - Professores
   - Salas
   - Áreas de conhecimento
   - Planejamento pedagógico (dias de folga por professor)
5. Use **Modo edição** para preencher slots
6. Conflitos detectados automaticamente

Ou importe um arquivo JSON existente via **Importar JSON**.

## Tecnologias

- HTML5 + Tailwind CSS (via CDN)
- JavaScript vanilla (zero dependências de build)
- Lucide icons
- SheetJS (XLSX export)
- html2pdf.js (PDF export)
- localStorage (persistência client-side)

## Licença

MIT — veja [LICENSE](LICENSE)
