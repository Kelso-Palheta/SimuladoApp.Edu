# Modos de Input — 4 caminhos

Como processar cada tipo de entrada do usuário antes de invocar `construir_aula()`.

## Modo 1 — Briefing direto (texto colado)

**Sinais:** usuário cola lista de tópicos, parágrafos sobre o tema, ou descreve oralmente o que quer.

**Fluxo:**
1. Extraia: tema central, subtemas, materiais já citados, séries/público mencionado
2. Se faltar matéria/série/duração → faça 1 pergunta rápida (não mais)
3. Expanda cada subtema em slide de conteúdo (200-400 palavras)
4. Gere atividades inferidas do nível dos subtemas
5. Sugira mídia pertinente (filme/livro/podcast brasileiros quando possível)

**Exemplo prompt:** *"Quero uma aula sobre Revolução Francesa com foco no Terror, queda da Bastilha e Napoleão. 3º ano."*

## Modo 2 — Fonte de referência (PDF / DOCX / texto / capítulo de livro)

**Sinais:** usuário anexou ou forneceu caminho para arquivo. Frases: "baseie-se nesse material", "extraia do PDF", "essa é a apostila", "use esse livro", "minha referência é essa", "o conteúdo está nesse arquivo".

**Tipos aceitos:**
- PDF (livro, apostila, artigo, capítulo escaneado)
- DOCX / DOC (apostila em Word, plano de aula)
- Texto colado diretamente do livro/apostila na conversa
- Imagem de página escaneada (use OCR via `anthropic-skills:pdf`)

**Fluxo completo de extração:**

1. **Extraia o texto limpo:**
   - PDF simples (digital nativo) → `Read` diretamente
   - PDF complexo (>15 páginas, colunas, tabelas, escaneado) → delegue a `anthropic-skills:pdf` solicitando extração completa de texto
   - DOCX → delegue a `anthropic-skills:docx` para extrair conteúdo estruturado
   - Texto colado → use diretamente

2. **Analise a estrutura do material:**
   - Identifique: títulos/capítulos, subtítulos, definições em destaque, exemplos numerados, exercícios, referências bibliográficas, glossário, figuras com legenda
   - Mapeie mentalmente: "este material tem X seções → viram X blocos de slides"

3. **Extraia os 4 tipos de conteúdo obrigatórios:**
   - **Conceitos centrais** → slides de conteúdo (200-400 palavras cada, reescritos em linguagem EM acessível)
   - **Citações verbatim importantes** → callouts com aspas e autor
   - **Definições técnicas** → glossário
   - **Exercícios existentes no material** → slide de atividade (use os originais; complemente com 1-2 novos se precisar)

4. **Reescrever para Ensino Médio (padrão ativo):**
   - Simplifique sem distorcer: vocabulário técnico permanece (vai pro glossário), mas a prosa explicativa deve ser acessível a aluno de 15-18 anos
   - Adicione analogias com o cotidiano quando o material for abstrato
   - Pergunte ao professor SOMENTE se o material original já for didático (apostila de EM) — nesse caso confirme se quer manter o tom ou adaptar

5. **Complemente com o que o material NÃO tem:**
   - Mídia: sugira filmes/documentários/podcasts sobre o tema (o professor raramente coloca isso na apostila)
   - Quiz interativo: gere questões baseadas nos conceitos extraídos
   - Conexões contemporâneas: callout "CONEXÃO HOJE" relacionando o conteúdo ao mundo atual do aluno

6. **Referências:** inclua sempre a fonte original (autor, título, editora, ano) na slide de referências

**Aviso de volume:** se o material tiver mais de 40 páginas, pergunte ao professor qual parte cobrir nesta aula (capítulo, páginas X-Y, tópico específico). Uma aula de 50 min cobre 4-8 slides de conteúdo = equivale a ≈ 8-15 páginas de livro denso.

**Exemplo prompt:** *"Aqui está o capítulo 3 do livro de biologia. Quero slides sobre divisão celular para o 2º ano."*

## Modo 3 — Plano BNCC estruturado

**Sinais:** usuário forneceu códigos BNCC (EM13...), competências, habilidades específicas, objetivos pedagógicos formais.

**Fluxo:**
1. Mapeie cada habilidade BNCC a um capítulo de slides
2. Os objetivos no slide 2 são extraídos diretamente do plano
3. Atividades devem cobrir as habilidades listadas (exercício para cada uma)
4. Quiz mede atingimento dos objetivos (1 pergunta por habilidade)
5. Inclua códigos BNCC visualmente nos slides relevantes (tag tech-font)

**Referência códigos BNCC EM:**
- `EM13LP` — Linguagens e códigos (Língua Portuguesa)
- `EM13LGG` — Linguagens (geral)
- `EM13MAT` — Matemática
- `EM13CNT` — Ciências da Natureza (Bio/Fis/Qui)
- `EM13CHS` — Ciências Humanas e Sociais Aplicadas

## Modo 4 — Tema livre (skill pesquisa)

**Sinais:** usuário só deu o tema, sem detalhes. "Quero uma aula sobre buracos negros pro 2º ano".

**Fluxo:**
1. Use `WebSearch` com queries específicas:
   - `"<tema> ensino médio plano de aula BNCC"`
   - `"<tema> documentário 2024"` (mídia atual)
   - `"<tema> aplicação cotidiano jovens"`
2. Sintetize 4-6 ângulos do tema a partir dos resultados
3. Cada ângulo vira slide de conteúdo
4. Mídia recomendada = top resultados curados (verifique se links são válidos)
5. Quiz testa cobertura dos 4-6 ângulos
6. **Sempre cite fontes nas referências bibliográficas** quando vier de pesquisa web

## Defaults sensatos (quando usuário omitir)

- Série: 2º ano EM
- Duração: 50 min (1 tempo escolar)
- Tom: acessível mas não infantilizado
- 6 slides de conteúdo
- 3 atividades + 4 perguntas quiz + 6 mídias + 8 termos glossário
- Idioma: pt-BR
- Quando STEM e tiver fórmulas → incluir MathJax já está no template
- Quando STEM com animação complexa → ofereça gerar Manim adicional

## Perguntas que valem fazer (só se ambíguo)

Limite-se a 1-2 destas no início, nunca todas:
1. "Qual série/ano do Ensino Médio?" (1º/2º/3º muda profundidade)
2. "Quanto tempo de aula?" (30/50/100 min)
3. "Foco em algum recorte específico?" (se o tema for amplo)

NÃO pergunte: cor, fonte, formato visual — a skill decide. NÃO pergunte: quantos slides — calcule do tempo de aula (≈ 5 min/slide de conteúdo).
