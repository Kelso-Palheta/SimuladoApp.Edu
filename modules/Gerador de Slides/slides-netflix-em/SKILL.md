---
name: slides-netflix-em
description: Gerador ultraespecialista de apresentações de aula para Ensino Médio (15-18 anos) em estilo documentário Netflix/Cinema — slides HTML5 standalone via Reveal.js 5.x com paleta cinematográfica (preto absoluto, vermelho Netflix #E50914, ciano neon #00F0FF), background videos Mixkit/Pexels em loop, transições Auto-Animate, Chart.js interativo, quizzes, atividades práticas, indicações de filmes/documentários/livros/podcasts, glossário, speaker notes e referências bibliográficas. Cada slide é DENSO em conteúdo para autoestudo (200-400 palavras por slide de conteúdo) — o aluno consegue estudar sozinho em casa e o professor tem material expositivo robusto. Use SEMPRE que o usuário pedir slides, apresentação, aula, PowerPoint, deck, "slides para minha aula", "apresentação de história/biologia/física/etc", "aula disruptiva", "slides Netflix", "apresentação BNCC", "slide com bastante conteúdo", "/slides-em", ou mencionar qualquer geração de material didático visual para Ensino Médio — mesmo quando não usar a palavra "slides" explicitamente. Aceita 4 modos de entrada: (1) briefing/texto colado, (2) PDF/DOCX como referência, (3) plano de aula BNCC estruturado, (4) tema livre com pesquisa via WebSearch. Output principal: arquivo .html autocontido pronto pra abrir no navegador. Output secundário: .pptx editável via delegação à skill anthropic-skills:pptx quando solicitado. Para temas STEM, opcionalmente gera snippet Manim para animações matemáticas.
---

# slides-netflix-em — Apresentações Documentário Netflix para Ensino Médio

Esta skill gera apresentações de aula em HTML5 (Reveal.js) com visual cinematográfico estilo documentário Netflix e **densidade máxima de conteúdo** para que o aluno consiga estudar sozinho em casa lendo apenas os slides, enquanto o professor mantém material expositivo robusto.

## Quando acionar

Aciona em qualquer pedido de:
- "Slides para aula de [matéria]"
- "Apresentação sobre [tema] para Ensino Médio"
- "Quero uma aula sobre X com slides"
- "Gerar apresentação BNCC"
- "Slides disruptivos / Netflix / cinematográficos"
- "/slides-em"
- Pedidos de material didático visual mesmo sem mencionar "slides" explicitamente (ex: "preciso ensinar Revolução Francesa pros meus alunos", "como apresento mitose pra terceirão")

## Filosofia de design (não negociável)

Existe um paradoxo central que esta skill resolve: alunos de Ensino Médio têm padrão de atenção moldado por TikTok/Netflix (visual, fragmentado, ritmo agressivo), mas a aprendizagem real exige **conteúdo profundo**. A resposta NÃO é escolher entre os dois — é entregar os dois simultaneamente:

- **Visual cinematográfico** prende a atenção (fundo preto, neon, vídeo em background, transições fade rápidas)
- **Texto denso e bem estruturado** ensina de verdade (parágrafos explicativos, callouts, listas, glossário)

Slides "estilo TikTok puro" (só frases de impacto) falham em sala porque o aluno que perdeu a aula não consegue recuperar o conteúdo. Slides "estilo PowerPoint corporativo" (bullets secos) falham porque o aluno desliga em 30 segundos. **Esta skill entrega o meio termo cinematográfico-denso.**

## Modo de operação

### Passo 1: Capturar input

Identifique qual dos 4 modos de entrada o usuário forneceu:

1. **Briefing direto** — usuário colou texto/tópicos. Use como base.
2. **Fonte de referência (PDF/DOCX/livro/apostila)** — usuário anexou ou mencionou arquivo. Frases típicas: "baseie-se nesse material", "extraia do PDF", "essa é minha apostila", "use esse capítulo de livro". **Extraia todo o conteúdo desse material como base dos slides.** Consulte o fluxo detalhado em `references/modos_input.md` — Modo 2.
3. **Plano BNCC estruturado** — usuário forneceu competências/habilidades. Mapeie cada habilidade pra um bloco de slides.
4. **Tema livre** — usuário deu só o tema. Use `WebSearch` para pesquisar conteúdo atual, então expanda.

Se o input for vago, faça 1-2 perguntas curtas: matéria, série (1º/2º/3º ano), duração da aula, foco específico. Não pergunte mais que isso — assuma defaults sensatos pro resto.

> **Fonte de referência:** quando o professor disser "use esse PDF/apostila/livro como base", todo o conteúdo dos slides DEVE ser extraído daquele material — não invente nem substitua por conteúdo genérico. Complemente apenas com mídia, quiz e conexões contemporâneas que o material não provê.

### Passo 2: Planejar estrutura

Toda aula gerada DEVE ter estes blocos (na ordem):

1. **Capa-trailer** — título caixa alta com glow, subtítulo de gancho, background video. Estilo "trailer Netflix".
2. **Objetivos da aula + habilidades BNCC** — slide com 3-5 objetivos e códigos BNCC quando aplicável (ex: EM13CHS101).
3. **Slides de conteúdo (4-8 slides)** — cada um com:
   - Título de impacto
   - Bloco explicativo denso (200-400 palavras) em parágrafos organizados — NÃO bullets secos, NÃO frases soltas
   - Callouts/destaques laterais com termos-chave em ciano
   - Pelo menos 1 elemento visual (imagem, gráfico Chart.js, citação, dado numérico em destaque)
   - Speaker notes (atributo `data-notes` do Reveal.js) com aprofundamento pro professor
4. **Atividade prática** — 2-4 exercícios/perguntas reflexivas/tarefas curtas pro aluno resolver. Inclua respostas comentadas em speaker notes.
5. **Mídia recomendada** — slide com 4-8 indicações categorizadas:
   - Filmes/documentários (Netflix, YouTube, Prime, gratuito)
   - Livros (com ISBN ou link quando possível)
   - Podcasts e episódios específicos
   - Músicas/clipes que dialoguem com o tema
   - Fotos/obras de arte/sites interativos
6. **Glossário** — 5-10 termos técnicos definidos
7. **Quiz interativo** — 3-5 perguntas múltipla escolha em JS puro (feedback imediato visual: verde acerto, vermelho erro com explicação)
8. **Referências bibliográficas** — ABNT simplificado, livros, artigos, sites

### Passo 3: Gerar HTML

Use o template em `assets/template_base.html` como esqueleto. Use os helpers em `scripts/gerador.py` para montar cada bloco programaticamente (importe e chame as funções: `gerar_capa`, `gerar_objetivos`, `gerar_slide_conteudo`, `gerar_atividade`, `gerar_midia`, `gerar_glossario`, `gerar_quiz`, `gerar_referencias`).

Selecione o background video apropriado consultando `references/banco_midia.md` — banco curado de URLs Mixkit/Pexels por tema (tecnologia, ciência, história, literatura, biologia, física, química, matemática, sociologia, filosofia, arte).

Aplique as regras visuais de `references/visual_spec.md` rigorosamente — paleta, tipografia, transições.

### Passo 4: Salvar e entregar

Salve o arquivo `.html` no diretório de trabalho com nome descritivo: `aula_<materia>_<tema-slug>.html`. Use slug em minúsculas com hífens.

Mostre ao usuário:
- Caminho do arquivo
- Como abrir (`open arquivo.html` no Mac ou duplo clique)
- Resumo de quantos slides foram gerados e quais blocos contém
- Se algum recurso externo (CDN, vídeo) pode ser bloqueado por firewall escolar

### Passo 5 (opcional): .pptx editável

Se o usuário pedir versão PowerPoint editável, delegue para `anthropic-skills:pptx` passando o conteúdo estruturado. Avise que transições Morph nativas do PowerPoint substituem o Auto-Animate, mas alguns efeitos cinematográficos web (video background, glow CSS, Chart.js interativo) **não têm equivalente direto no .pptx** e serão substituídos por aproximações (imagem de fundo, sombra, gráfico estático).

### Passo 6 (opcional, STEM): Manim

Para temas de matemática/física com animações complexas (derivadas, vetores, ondas, transformações geométricas), gere snippet Manim Python separado em arquivo `.py` ao lado do HTML. O snippet renderiza um vídeo que pode ser embedado via `<video>` em um slide específico. Inclua comando de renderização no comentário do código: `manim -pql arquivo.py NomeDaCena`.

## Regras de conteúdo (densidade)

- **Cada slide de conteúdo: 200-400 palavras** de texto expositivo. Menos que isso é fragmento (aluno não estuda sozinho). Mais que isso é parede de texto (perde atenção). Organize em 2-3 parágrafos curtos OU 1 parágrafo + lista enumerada.
- **Nunca slide só com bullets soltos.** Sempre conecte com prosa.
- **Sempre incluir 1 dado numérico/citação/exemplo concreto por slide** em callout destacado.
- **Speaker notes obrigatórias** com aprofundamento, anedotas, conexões com outras disciplinas — material que o professor expande oralmente.

## Regras visuais (não negociáveis)

Detalhadas em `references/visual_spec.md`. Resumo:
- Fundo: `#000000` ou `#0B0C10`
- Destaque primário: `#E50914` (Netflix red)
- Destaque secundário: `#00F0FF` (cyan neon)
- Títulos: Montserrat Black ou Bebas Neue, CAIXA ALTA, com `text-shadow` glow
- Mono/tech: Fira Code
- Transição padrão: `fade` 0.4s
- Slides relacionados: `data-auto-animate`
- Capa: sempre `data-background-video` em loop muted

## Anti-padrões (evite)

- Bullets soltos sem contexto explicativo
- Slides com menos de 150 palavras (vira fragmento estilo TikTok puro)
- Slides com mais de 500 palavras sem estrutura (parede de texto)
- Cores fora da paleta (verdes/azuis claros corporativos quebram o estilo)
- Fundos claros (rompe o efeito documentário)
- Esquecer speaker notes
- Esquecer atividade/quiz (vira aula passiva)
- Indicações de mídia genéricas ("veja filmes sobre o tema") — sempre nome específico + onde encontrar

## Referências internas

- `assets/template_base.html` — esqueleto HTML completo com Reveal.js, Chart.js, CSS base
- `scripts/gerador.py` — funções Python para montar cada bloco
- `references/banco_midia.md` — URLs Mixkit/Pexels por tema
- `references/visual_spec.md` — especificação visual detalhada
- `references/modos_input.md` — guia dos 4 modos de entrada
- `examples/exemplo_aula.html` — aula completa de exemplo (Revolução Industrial)
