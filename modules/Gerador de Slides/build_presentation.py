import os
import re

TEMPLATES_DIR = '/Users/kelsopalheta/.gemini/config/plugins/custom-skills/skills/apresentacao-cards/templates'
OUTPUT_DIR = '/Users/kelsopalheta/Developer/SimuladoApp.Edu/modules/Gerador de Slides/presents/som_digital'
MEDIA_DIR = '/Users/kelsopalheta/Developer/SimuladoApp.Edu/modules/Gerador de Slides/extract_docx/word/media'

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.join(OUTPUT_DIR, 'media'), exist_ok=True)

# Copy media
os.system(f'cp -r "{MEDIA_DIR}"/* "{OUTPUT_DIR}/media/"')

def read_template(name):
    with open(os.path.join(TEMPLATES_DIR, name), 'r') as f:
        return f.read()

layout_base = read_template('layout_base.html')
header = read_template('header.html')
footer = read_template('footer.html')
card_imagem = read_template('card_imagem.html')
card_lista = read_template('card_lista.html')
card_tabela = read_template('card_tabela.html')
card_cta = read_template('card_cta.html')

body_match = re.search(r'(<body[^>]*>)', layout_base)
if body_match:
    body_tag = body_match.group(1)
    parts = layout_base.split(body_tag)
    layout_start = parts[0].replace('[TITULO_DA_PAGINA]', 'Representação da Informação no Computador: Som') + body_tag + '\\n'
    after_body = parts[1]
else:
    layout_start = '<html><body>\\n'
    after_body = '</body></html>'

if '</body>' in after_body:
    layout_end = '</body>\\n' + after_body.split('</body>')[1]
else:
    layout_end = '</body></html>'

html_content = []
html_content.append(layout_start)

# HEADER
header = header.replace('[TIPO_CONTEUDO]', 'AULA INTERATIVA')
header = header.replace('[TITULO_PRINCIPAL]', 'O Som no Computador')
header = header.replace('[SUBTITULO]', 'Da onda sonora ao sinal digital: Entendendo a digitalização na Educação Básica')
header = header.replace('[DESTAQUE_NUMERICO]', '100')
html_content.append(header)

html_content.append('<main class="container mx-auto px-4 py-8 max-w-5xl z-10 relative">')

delay = 100

def add_card(html):
    global delay
    html = html.replace('[DELAY]', str(delay))
    html_content.append(html)
    delay += 100

# Intro
c1 = card_lista.replace('[TITULO_CARD]', '1. Introdução').replace('[ICONE]', 'music')
c1 = c1.replace('[VALOR]', '3').replace('[DESCRICAO]', 'Objetivos principais da BNCC')
items = "<li>A presença da tecnologia digital na vida de estudantes.</li><li>Transição entre o som físico e arquivos binários.</li><li>Objetivo: Compreender a digitalização sonora através de práticas plugadas e desplugadas.</li>"
c1 = c1.replace('<li>[ITEM_1]</li>\\n          <li>[ITEM_2]</li>\\n          <li>[ITEM_3]</li>', items)
add_card(c1)

# Imagem 1
c2 = card_imagem.replace('[TITULO_CARD]', 'Da Onda Sonora ao Sinal Digital').replace('[ICONE]', 'waves')
c2 = c2.replace('[URL_IMAGEM]', 'media/image1.jpeg').replace('[ALT_TEXT]', 'Fluxo de transformação do som')
c2 = c2.replace('[LEGENDA_DA_IMAGEM]', 'A transformação de uma onda mecânica contínua em sinal digital discreto.')
c2 = c2.replace('[VALOR]', '2').replace('[DESCRICAO]', 'Etapas fundamentais')
add_card(c2)

# Amostragem e Quantização
c3 = card_lista.replace('[TITULO_CARD]', 'Conversão Analógico-Digital').replace('[ICONE]', 'cpu')
c3 = c3.replace('[VALOR]', '2').replace('[DESCRICAO]', 'Processos essenciais')
items2 = "<li><b>Amostragem (Sampling Rate):</b> Fatias isoladas capturadas no tempo (ex: CD usa 44.1 kHz).</li><li><b>Quantização (Bit Depth):</b> Arredondamento da amplitude.</li><li><b>Bits por Amostra:</b> 16 bits = 65.536 níveis.</li>"
c3 = c3.replace('<li>[ITEM_1]</li>\\n          <li>[ITEM_2]</li>\\n          <li>[ITEM_3]</li>', items2)
add_card(c3)

# CTA
c_cta = card_cta.replace('[TITULO_PRINCIPAL]', 'Pronto para ver isso na prática?').replace('[TITULO_DESTAQUE]', 'Vamos lá!')
c_cta = c_cta.replace('[IMAGEM_URL]', 'media/image2.png').replace('[IMAGEM_ALT]', 'Ilustração CTA')
c_cta = c_cta.replace('[TAG_SUPERIOR]', 'PRÓXIMO PASSO')
c_cta = c_cta.replace('[SUBTITULO]', 'Vamos entender as fases da digitalização, os canais e formatos de áudio utilizados todos os dias.')
c_cta = c_cta.replace('[BENEFICIO_1_TITULO]', 'Amostragem').replace('[BENEFICIO_1_DESC]', 'Discretização no eixo do tempo.')
c_cta = c_cta.replace('[BENEFICIO_2_TITULO]', 'Quantização').replace('[BENEFICIO_2_DESC]', 'Discretização no eixo da amplitude.')
c_cta = c_cta.replace('[BENEFICIO_3_TITULO]', 'Canais').replace('[BENEFICIO_3_DESC]', 'A diferença entre Mono e Estéreo.')
c_cta = c_cta.replace('[TEXTO_BOTAO]', 'Avançar <i data-lucide="arrow-right" class="w-5 h-5 ml-2"></i>')
c_cta = c_cta.replace('[LINK_CTA]', '#next-card').replace('[TEXTO_GARANTIA]', 'Conceitos fundamentais da Computação')
add_card(c_cta)

# Imagem 2
c4 = card_imagem.replace('[TITULO_CARD]', 'Amostragem de um Sinal Analógico').replace('[ICONE]', 'bar-chart')
c4 = c4.replace('[URL_IMAGEM]', 'media/image2.png').replace('[ALT_TEXT]', 'Amostragem')
c4 = c4.replace('[LEGENDA_DA_IMAGEM]', 'Onda contínua fatiada no tempo (Sampling).')
c4 = c4.replace('[VALOR]', 'T').replace('[DESCRICAO]', 'Foco na dimensão do tempo')
add_card(c4)

# Imagem 3
c5 = card_imagem.replace('[TITULO_CARD]', 'Quantização').replace('[ICONE]', 'layers')
c5 = c5.replace('[URL_IMAGEM]', 'media/image3.png').replace('[ALT_TEXT]', 'Quantização')
c5 = c5.replace('[LEGENDA_DA_IMAGEM]', 'Níveis de amplitude mapeados para valores binários discretos.')
c5 = c5.replace('[VALOR]', 'A').replace('[DESCRICAO]', 'Foco na dimensão da amplitude')
add_card(c5)

# Canais de Áudio
c6 = card_imagem.replace('[TITULO_CARD]', 'Canais de Áudio: Mono vs Estéreo').replace('[ICONE]', 'headphones')
c6 = c6.replace('[URL_IMAGEM]', 'media/image4.png').replace('[ALT_TEXT]', 'Mono e Estéreo')
c6 = c6.replace('[LEGENDA_DA_IMAGEM]', 'Um arquivo estéreo armazena o dobro de dados em comparação ao mono.')
c6 = c6.replace('[VALOR]', '2x').replace('[DESCRICAO]', 'O dobro de dados')
add_card(c6)

# Formatos de Áudio (Tabela)
c7 = card_tabela.replace('[TITULO_TABELA]', 'Comparativo de Formatos de Áudio').replace('[ICONE]', 'file-audio-2')
c7 = c7.replace('[COLUNA_1]', 'Formato').replace('[COLUNA_2]', 'Tamanho').replace('[COLUNA_3]', 'Compressão')
c7 = c7.replace('[DADO_1A]', 'WAV').replace('[DADO_1B]', 'Grande (~5 MB)').replace('[DADO_1C]', 'Sem Compressão')
c7 = c7.replace('[DADO_2A]', 'FLAC').replace('[DADO_2B]', 'Médio (~2.5 MB)').replace('[DADO_2C]', 'Sem Perdas')
c7 = c7.replace('[ITEM_3_COL_1]', 'MP3').replace('[ITEM_3_COL_2]', 'Pequeno (~500 KB)').replace('[ITEM_3_COL_3]', 'Com Perdas')
c7 = c7.replace('[DATA]', '2026')
add_card(c7)

# O processo simplificado
c8 = card_imagem.replace('[TITULO_CARD]', 'O Processo Simplificado').replace('[ICONE]', 'refresh-cw')
c8 = c8.replace('[URL_IMAGEM]', 'media/image5.png').replace('[ALT_TEXT]', 'Etapas de digitalização do som')
c8 = c8.replace('[LEGENDA_DA_IMAGEM]', 'Captação -> Condicionamento -> Conversão ADC -> Armazenamento.')
c8 = c8.replace('[VALOR]', '4').replace('[DESCRICAO]', 'Estágios da digitalização')
add_card(c8)

# Proposta Desplugada
c9 = card_lista.replace('[TITULO_CARD]', 'Proposta 1: Experiência Desplugada').replace('[ICONE]', 'puzzle')
c9 = c9.replace('[VALOR]', '1').replace('[DESCRICAO]', '1º ao 3º ano')
items3 = "<li><b>O Papagaio de Brinquedo e os Blocos Coloridos</b></li><li>Representar sons graves, médios e agudos com blocos (Verde, Amarelo, Vermelho).</li><li>\\'Tirar a foto\\' do som com palmas (amostragem) e ler a fita (reprodução).</li>"
c9 = c9.replace('<li>[ITEM_1]</li>\\n          <li>[ITEM_2]</li>\\n          <li>[ITEM_3]</li>', items3)
add_card(c9)

# Proposta Plugada
c10 = card_lista.replace('[TITULO_CARD]', 'Proposta 2: Experiência Plugada').replace('[ICONE]', 'laptop')
c10 = c10.replace('[VALOR]', '9').replace('[DESCRICAO]', '9º ano')
items4 = "<li><b>Investigadores de Áudio (Audacity)</b></li><li>Manipular taxas de amostragem (44.1kHz vs 8kHz).</li><li>Exportar em WAV, FLAC e MP3 e comparar tamanhos.</li>"
c10 = c10.replace('<li>[ITEM_1]</li>\\n          <li>[ITEM_2]</li>\\n          <li>[ITEM_3]</li>', items4)
add_card(c10)


html_content.append('</main>')
html_content.append(footer.replace('[NOME_DA_FONTE]', 'Trabalho Final - Sons'))
# also append scripts from layout_base
script_match = re.search(r'(<script>.*?</script>)', after_body, re.DOTALL)
if script_match:
    html_content.append(script_match.group(1))

html_content.append(layout_end)

with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w') as f:
    f.write('\\n'.join(html_content))

print('Presentation built successfully with proper placeholders replaced!')
