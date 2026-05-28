# Banco de Mídia — URLs de Background Video curadas

URLs de vídeos curtos em loop (Mixkit, Pexels, Coverr) já filtrados para uso educacional. Todos são licença livre/CC0. Selecione por tema da aula.

## Como usar

Passe a URL no parâmetro `video_capa` do `construir_aula()` ou no campo `video_bg` de cada slide de conteúdo. O template já cuida do loop+muted+overlay escuro.

## Por tema

### Tecnologia / Programação / IA / Algoritmos
- `https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-city-11748-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-binary-code-on-a-computer-screen-2519-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-programmer-coding-software-on-his-computer-9737-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-set-of-plexus-networks-1183-large.mp4`

### Ciência / Laboratório / Pesquisa
- `https://assets.mixkit.co/videos/preview/mixkit-scientist-using-a-microscope-in-a-laboratory-9748-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-dna-rotating-on-a-blue-background-31482-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-blue-virus-cells-on-a-dark-background-31480-large.mp4`

### Biologia / Células / Natureza
- `https://assets.mixkit.co/videos/preview/mixkit-cells-under-microscope-4929-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-forest-1737-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-coral-reef-1542-large.mp4`

### Física / Espaço / Astronomia
- `https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-planet-earth-from-space-29351-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-light-trails-loop-around-a-curve-32808-large.mp4`

### Química / Reações / Moléculas
- `https://assets.mixkit.co/videos/preview/mixkit-colored-ink-falling-in-water-2474-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-smoke-forming-organic-shapes-on-a-dark-background-22719-large.mp4`

### Matemática / Geometria / Dados
- `https://assets.mixkit.co/videos/preview/mixkit-abstract-digital-rain-30531-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-blue-grid-tunnel-30634-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-geometric-shapes-floating-2476-large.mp4`

### História / Arquivo / Antiguidade
- `https://assets.mixkit.co/videos/preview/mixkit-old-film-projector-1209-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-old-paper-with-handwriting-and-coffee-stains-22719-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-burning-paper-with-text-on-it-2475-large.mp4`

### Literatura / Livros / Leitura
- `https://assets.mixkit.co/videos/preview/mixkit-pages-of-a-book-turning-fast-2913-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-old-typewriter-typing-on-paper-2547-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-stack-of-old-books-on-wood-2473-large.mp4`

### Sociologia / Sociedade / Cidades
- `https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-in-a-train-station-4368-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-pedestrians-crossing-a-street-4357-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-city-at-night-32807-large.mp4`

### Filosofia / Abstração / Reflexão
- `https://assets.mixkit.co/videos/preview/mixkit-fog-rolling-over-a-mountain-1175-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-clouds-flowing-through-mountains-2474-large.mp4`

### Arte / Cultura / Música
- `https://assets.mixkit.co/videos/preview/mixkit-colored-smoke-2475-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-paint-mixing-on-a-palette-2476-large.mp4`

### Geografia / Mapas / Clima
- `https://assets.mixkit.co/videos/preview/mixkit-earth-rotating-3D-globe-29351-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-fast-moving-clouds-time-lapse-32807-large.mp4`

### Default / Genérico tecnológico-cinematográfico
- `https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-man-with-his-face-lit-by-blue-light-32807-large.mp4`
- `https://assets.mixkit.co/videos/preview/mixkit-digital-particles-loop-31403-large.mp4`

## Imagens de capa alternativas (Pexels)

Quando vídeo for muito pesado para o ambiente do usuário (rede escolar lenta), use imagem estática como `data-background-image`:

- Tech: `https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg`
- Ciência: `https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg`
- História: `https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg`
- Literatura: `https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg`
- Espaço: `https://images.pexels.com/photos/87009/earth-soil-creep-moon-lunar-surface-87009.jpeg`

## Aviso

URLs podem mudar com o tempo. Caso uma falhe, sempre há fallback automático para `data-background-color="#000000"`. Sugira ao usuário substituir manualmente por outra URL do mesmo banco.
