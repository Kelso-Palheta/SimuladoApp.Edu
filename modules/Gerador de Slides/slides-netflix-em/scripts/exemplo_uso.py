"""
exemplo_uso.py — demo do gerador.py.

Roda:
    cd /Users/kelsopalheta/.claude/skills/slides-netflix-em/scripts
    python exemplo_uso.py

Gera 'aula_revolucao_industrial.html' no diretório atual.
"""
from gerador import construir_aula, slug

html, avisos = construir_aula(
    titulo="A Máquina que Mudou Tudo",
    subtitulo="Como 80 anos na Inglaterra reescreveram o destino de 8 bilhões de pessoas.",
    autor="Prof. Exemplo",
    materia="História",
    serie="2º ano EM",
    duracao_min=50,
    video_capa="https://assets.mixkit.co/videos/preview/mixkit-old-film-projector-1209-large.mp4",
    objetivos=[
        "Identificar causas e condições que fizeram a Inglaterra ser o ponto de partida",
        "Explicar como a máquina a vapor reorganizou trabalho, cidades e tempo",
        "Conectar a 1ª Revolução Industrial à crise climática atual",
        "Analisar continuidades entre operário do séc. XIX e trabalhador de aplicativo hoje",
    ],
    habilidades_bncc=["EM13CHS101", "EM13CHS103", "EM13CHS503"],
    conteudo=[
        {
            "titulo": "Por que a Inglaterra?",
            "texto": (
                "Quando a Revolução Industrial começou, por volta de 1760, a Inglaterra não era a maior nem a mais rica das nações europeias. França tinha mais terras, Holanda mais comércio, Espanha ainda controlava ouro colonial. Mesmo assim, foi naquele país que máquinas a vapor saíram do papel e entraram nas fábricas. Por quê?\n\n"
                "Três condições se cruzaram ao mesmo tempo. Primeiro, o capital acumulado pela burguesia mercantil — fortunas feitas no tráfico transatlântico de pessoas escravizadas e na pirataria autorizada contra navios espanhóis — precisava de novos lugares para render. Segundo, os cercamentos (enclosures) expulsaram camponeses das terras comunais e jogaram milhões nas cidades, criando um exército de mão de obra disponível e desesperada. Terceiro, o carvão mineral abundante das minas inglesas, somado a invenções acumuladas (tear de Kay 1733, fiandeira de Hargreaves 1764, motor de Watt 1769), permitiu substituir músculo humano por força mecânica em escala.\n\n"
                "Sem qualquer dessas três condições, a revolução teria atrasado décadas. Não foi gênio britânico — foi colisão histórica de capital + trabalhadores expropriados + energia barata."
            ),
            "callouts": [
                {"label": "DADO CRÍTICO", "texto": "Em 1750, Inglaterra produzia 5 mil toneladas de carvão/ano. Em 1850, 50 milhões. Multiplicação por 10.000 em um século."},
                {"label": "PONTO CEGO", "tipo": "danger", "texto": "A riqueza inglesa foi construída sobre 3,1 milhões de africanos escravizados transportados em navios britânicos entre 1640-1807."},
            ],
            "speaker_notes": "Aprofunde: relação entre escravidão atlântica e industrialização é consenso (Eric Williams 1944, Beckert, Baptist). Conecte com debate atual de reparação histórica.",
        },
        {
            "titulo": "A Máquina Devora o Tempo",
            "texto": (
                "Antes da fábrica, o tempo era circular e natural. O camponês trabalhava do nascer ao pôr do sol, mais intenso na colheita, mais lento no inverno. A vida tinha pausas — festas religiosas, feiras, descansos sazonais. O sino da igreja marcava as horas, e ninguém contava minutos.\n\n"
                "A máquina a vapor inverteu tudo. Ela não cansa, não dorme, não respeita estação do ano. Para ser lucrativa, precisa rodar 24 horas. E quem opera a máquina precisa se sincronizar com ela. Surge o turno fixo de 14, 16 horas. O relógio mecânico vira ditador. Atrasar 5 minutos vira motivo para multa equivalente a meio dia de salário. O tempo deixa de ser experimentado e passa a ser medido, vendido, descontado.\n\n"
                "O historiador E. P. Thompson chamou isso de 'disciplina do relógio'. É o nascimento de algo que parece óbvio hoje, mas que era inédito: a ideia de que o tempo do trabalhador pertence ao patrão durante o expediente. Você ainda vive sob essa lógica quando seu chefe ou aplicativo conta seus minutos."
            ),
            "callouts": [
                {"label": "CITAÇÃO", "texto": "O tempo agora é moeda — não passa, gasta-se. — E. P. Thompson, 1967"},
                {"label": "CONEXÃO HOJE", "texto": "Apps de entrega rastreiam motoboys em tempo real. O tempo livre entre corridas é tempo improdutivo. Mesma lógica fabril, 250 anos depois."},
            ],
            "speaker_notes": "Texto-chave: 'Tempo, disciplina e capitalismo industrial' (Thompson, 1967). Mostre cena de Tempos Modernos de Chaplin se houver projeção.",
        },
    ],
    graficos=[{
        "apos_slide": 2,
        "titulo": "Quando o Carvão Comeu o Planeta",
        "chart_id": "grafCO2",
        "texto_apoio": "O CO₂ atmosférico ficou estável em ~280 ppm por 10.000 anos. A partir de 1850, dispara. A linha à direita não é natural — é o gráfico da máquina a vapor virando crise climática.",
        "chart_config_js": """{
            type: 'line',
            data: { labels: ['1750','1800','1850','1900','1950','2000','2024'],
              datasets: [{ label: 'CO₂ atmosférico (ppm)', data: [277,283,285,296,311,369,425],
                borderColor: '#E50914', backgroundColor: 'rgba(229,9,20,0.2)', tension: 0.3 }] },
            options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } },
              scales: { x: { ticks: { color: '#B0B0B0' } }, y: { ticks: { color: '#B0B0B0' } } } }
          }""",
        "speaker_notes": "Fonte: NOAA Mauna Loa + Ice Core. Conecte: se o problema começou em 1850, por que só agora discutimos?",
    }],
    atividades=[
        {"tipo": "reflexao", "tempo_min": 8, "enunciado": "Liste 3 objetos que você usou nas últimas 24h. Para cada: matéria-prima, origem, energia usada, condições de trabalho. Compartilhe com a dupla.", "resposta_modelo": "Estimular reflexão sobre cadeia produtiva global."},
        {"tipo": "debate", "tempo_min": 12, "enunciado": "'Trabalhador de aplicativo é o operário de fábrica do séc XXI.' Defenda ou refute em 1 parágrafo com argumento histórico desta aula.", "resposta_modelo": "PRÓ: jornadas longas, controle algorítmico, sem regulação. CONTRA: mobilidade, sem concentração espacial. Estimular nuance."},
        {"tipo": "pesquisa", "tempo_min": 0, "enunciado": "Pesquise uma marca de roupa que você usa: onde é fabricada, condições, salário médio. Traga para próxima aula.", "resposta_modelo": "Conecta com filme The True Cost."},
    ],
    midias=[
        {"tipo": "filme", "titulo": "Tempos Modernos (1936)", "onde": "YouTube — 87 min — Chaplin", "url": "https://www.youtube.com/watch?v=qVnQqkZ8Z9I", "porque": "Crítica visual da fábrica fordista. Primeiros 20 min essenciais."},
        {"tipo": "documentario", "titulo": "The True Cost (2015)", "onde": "Netflix — 92 min", "url": "https://truecostmovie.com", "porque": "Indústria têxtil hoje — herança direta da Revolução Industrial."},
        {"tipo": "livro", "titulo": "A Formação da Classe Operária Inglesa", "onde": "E. P. Thompson · 1963 · Paz e Terra", "url": "", "porque": "Clássico fundador. Cap. 6 sobre tempo e disciplina é mais acessível."},
        {"tipo": "podcast", "titulo": "História FM · ep. 42 — Revolução Industrial", "onde": "Spotify · 58 min", "url": "https://open.spotify.com/show/2elPyN3VeWmrAhMOQpkUkn", "porque": "Linguagem acessível, hosts brasileiros."},
        {"tipo": "site", "titulo": "Our World in Data — CO₂", "onde": "ourworldindata.org/co2", "url": "https://ourworldindata.org/co2", "porque": "Gráficos interativos da emissão histórica."},
        {"tipo": "musica", "titulo": "Construção — Chico Buarque (1971)", "onde": "Spotify/YouTube · 6 min", "url": "https://www.youtube.com/watch?v=zjmZ8jZHnzc", "porque": "Operário brasileiro como herdeiro da revolução. Leia a letra inteira."},
    ],
    glossario=[
        {"termo": "enclosures", "definicao": "Cercamentos das terras comunais inglesas (séc. XV-XVIII) que privatizaram pastos coletivos e expulsaram camponeses."},
        {"termo": "mais-valia", "definicao": "Diferença entre valor produzido pelo trabalhador e salário recebido — apropriada pelo dono dos meios de produção."},
        {"termo": "ludismo", "definicao": "Movimento operário (1811-1816) que quebrava máquinas como protesto contra desemprego e baixos salários."},
        {"termo": "cartismo", "definicao": "Primeiro movimento operário organizado (1838-1857), exigia voto universal masculino e direitos trabalhistas."},
        {"termo": "proletariado", "definicao": "Classe que vive da venda da força de trabalho por não possuir meios de produção."},
        {"termo": "burguesia industrial", "definicao": "Classe proprietária das fábricas e máquinas, surgida da burguesia mercantil enriquecida no séc. XVIII."},
        {"termo": "fordismo", "definicao": "Modelo de produção em linha de montagem (Henry Ford, 1913), aprofundamento da lógica industrial original."},
        {"termo": "uberização", "definicao": "Modelo contemporâneo de trabalho sob demanda mediado por aplicativo, sem vínculo formal."},
    ],
    quiz=[
        {"pergunta": "O fator que NÃO foi determinante para a Inglaterra liderar a Revolução Industrial:", "opcoes": ["Capital acumulado no comércio atlântico e tráfico", "Mão de obra criada pelos cercamentos", "Apoio militar do Império Otomano", "Carvão mineral abundante nas minas"], "correta": 2, "explicacao": "Otomanos não tiveram envolvimento. As 3 condições reais foram capital, mão de obra expropriada e energia barata."},
        {"pergunta": "E. P. Thompson chamou de 'disciplina do relógio' o fenômeno em que:", "opcoes": ["Trabalhadores ficaram pontuais por escolha", "Tempo do trabalhador passou a pertencer ao patrão durante a jornada", "Inventou-se o relógio mecânico moderno", "A jornada diminuiu naturalmente"], "correta": 1, "explicacao": "A novidade histórica foi o tempo ser vendido — não a invenção do relógio."},
        {"pergunta": "A conexão entre Revolução Industrial e crise climática atual é:", "opcoes": ["Não há conexão direta", "A queima sistemática de carvão a partir de 1850 iniciou o acúmulo de CO₂ atmosférico", "A crise climática começou apenas em 1990", "Carvão não emite gases de efeito estufa"], "correta": 1, "explicacao": "Ice core records mostram CO₂ estável em ~280 ppm por 10.000 anos, dispara em 1850."},
    ],
    referencias=[
        "HOBSBAWM, E. A Era das Revoluções: 1789-1848. Rio de Janeiro: Paz e Terra, 1977.",
        "THOMPSON, E. P. A Formação da Classe Operária Inglesa. 3 vols. Rio de Janeiro: Paz e Terra, 1987.",
        "THOMPSON, E. P. 'Tempo, disciplina de trabalho e capitalismo industrial'. In: Costumes em Comum. SP: Companhia das Letras, 1998.",
        "BECKERT, S. O Império do Algodão: uma história global do capitalismo. SP: Companhia das Letras, 2017.",
        "WILLIAMS, E. Capitalismo e Escravidão. SP: Companhia das Letras, 2012 [1944].",
        "NOAA. Global Monitoring Laboratory — Mauna Loa CO₂ data. 2024.",
    ],
    frase_final="O passado não morreu — nem é passado. (William Faulkner)",
)

nome = f"aula_{slug('Revolucao Industrial')}.html"
with open(nome, "w", encoding="utf-8") as f:
    f.write(html)

print(f"✓ Aula gerada: {nome}")
if avisos:
    print("\nAvisos de densidade:")
    for a in avisos:
        print(f"  {a}")
else:
    print("✓ Densidade OK em todos os slides.")
