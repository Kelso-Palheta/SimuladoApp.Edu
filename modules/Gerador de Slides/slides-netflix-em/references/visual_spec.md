# Especificação Visual — Documentário Netflix EM

Regras visuais que TODA aula gerada deve respeitar. Desvios quebram a identidade da skill.

## Paleta cromática

| Token | Hex | Uso |
|---|---|---|
| `--bg-primary` | `#000000` | Fundo absoluto (capa, encerramento) |
| `--bg-secondary` | `#0B0C10` | Fundo principal dos slides de conteúdo |
| `--bg-card` | `#111418` | Cards, callouts, glossário |
| `--netflix-red` | `#E50914` | Destaque dramático, atividades, encerramento |
| `--neon-cyan` | `#00F0FF` | Tech/dados/destaques técnicos, glow padrão |
| `--text-primary` | `#FFFFFF` | Texto corrido sobre fundo escuro |
| `--text-muted` | `#B0B0B0` | Metadados, subtítulos, créditos |

**Regra:** nunca usar verde puro, azul corporativo, amarelo. Cores fora da paleta quebram identidade.

## Tipografia

| Família | Quando |
|---|---|
| **Bebas Neue** | Títulos H1/H2/H3 — sempre CAIXA ALTA, letter-spacing 2px |
| **Montserrat** (400/700/900) | Texto corrido, parágrafos, listas |
| **Fira Code** | Labels técnicos, tags BNCC, "tech-font" cyan, prompts de terminal |
| **Impact** (fallback) | Se Bebas Neue não carregar |

Tamanhos (sistema Reveal.js):
- H1 capa: `3.2em` com glow
- H2 conteúdo: `2.2em` com glow
- Parágrafo: `0.65em` line-height 1.55
- Tech-font (labels): `0.55em`

## Efeitos visuais

- **Glow text-shadow obrigatório** em títulos: `0 0 18px rgba(229,9,20,0.65)` (vermelho) ou `0 0 18px rgba(0,240,255,0.55)` (cyan)
- **Overlay escuro automático** em todo `data-background-video` — gradient 0.55 → 0.75 alpha
- **Border-left colorido** em callouts (4px) — cyan para info, vermelho para alerta
- **Bordas arredondadas mínimas** (2-6px) — visual angular/tech, não corporate

## Transições

- **Padrão:** `fade` 0.4s (corte cinematográfico)
- **Slides relacionados:** `data-auto-animate` com `auto-animate-id` igual — elementos morfam organicamente entre slides
- **Capa:** transição implícita do background video
- **Background:** `backgroundTransition: 'fade'`

## Layout

- **Slides centralizados verticalmente** (`center: true` no Reveal)
- **Alinhamento de texto:** esquerda (não centralizado — quebra leitura densa)
- **Grid 2 colunas** padrão para slides de conteúdo (texto à esquerda, callouts/visual à direita)
- **Margem horizontal:** 2% mínimo

## Background video

Toda capa **obrigatoriamente** tem `data-background-video` em loop muted. Vídeos do `references/banco_midia.md` por tema.

Para slides de conteúdo, video background é opcional (use com moderação — máximo 30% dos slides, senão distrai da leitura).

## Acessibilidade

- Contraste mínimo: branco sobre `#0B0C10` = 19.5:1 (AAA)
- Foco visível: outline cyan 3px em botões/links
- `alt` em todas as imagens
- `aria-label` em botões de quiz
- Speaker notes nunca substituem texto visual (visão única ainda funciona)

## Mobile/responsivo

Breakpoint em 768px:
- Grids viram 1 coluna
- H1 reduz para 2.2em, H2 para 1.6em
- Parágrafos sobem para 0.75em (legibilidade)
- Quizz mantém layout vertical natural

## Print (handout/PDF)

Stylesheet `@media print` força:
- Fundo branco, texto preto
- Cada section em página separada
- Callouts viram cinza com borda
- Background videos ocultados

Aluno consegue imprimir e ter material de estudo offline.

## Anti-padrões visuais

❌ Bullets soltos sem prosa explicativa
❌ Cores corporate (azul claro, verde-água, amarelo-pastel)
❌ Fontes serifadas em títulos (Times/Georgia — quebra estilo)
❌ Sombras suaves "material design" — usar glow neon ou nada
❌ Ícones emoji excessivos (1-2 por slide max, só em mídia/quiz)
❌ Centralização de texto corrido (só títulos centralizam visualmente)
❌ Backgrounds claros (a skill é noturna/cinematográfica)
