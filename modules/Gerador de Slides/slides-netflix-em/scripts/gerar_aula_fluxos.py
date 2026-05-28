"""
gerar_aula_fluxos.py — Compilador da Apresentação "Fluxos Culturais: Direitos Humanos, Resistência e Diásporas"
Usando o motor Impress.js 3D.
"""
import sys
import os
from pathlib import Path

# Ajusta o caminho para importar o gerador_impress localmente
sys.path.append(str(Path(__file__).parent))
from gerador_impress import construir_aula_impress, slug

def main():
    # Caminhos das imagens relativas à pasta da apresentação final
    # Como o arquivo será salvo em "3_ano_arte/2_bimestre/Fluxos Culturais/Fluxos Culturais.html",
    # as imagens em "3_ano_arte/2_bimestre/Fluxos Culturais/assets/" são acessadas de forma relativa.
    img_capa = "assets/capa.png"
    img_caricu = "assets/caricu.png"
    img_brecht = "assets/brecht.png"
    img_flamenco = "assets/flamenco.png"

    # Links do Unsplash de alta qualidade para servir de fundo em slides que não têm imagem própria
    img_rights = "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000"
    img_anne = "https://images.unsplash.com/photo-1505664194779-8bebcb95c557?q=80&w=2000"
    img_diaspora = "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=2000"
    img_brazil = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2000"

    html, avisos = construir_aula_impress(
        titulo="Fluxos Culturais",
        subtitulo="Direitos Humanos, Resistência e Diásporas: Como os deslocamentos forçados e a perseguição de povos redesenharam a arte, a dança e a música ao redor do mundo.",
        autor="Prof. Kelso Palheta",
        materia="Arte",
        serie="3º Ano do Ensino Médio",
        image_capa=img_capa,
        conteudo=[
            {
                "titulo": "1. O Direito de Existir",
                "texto": (
                    "O conceito de refúgio está profundamente atrelado à Declaração Universal dos Direitos Humanos. Segundo a Agência da ONU para Refugiados (Acnur), refugiados são pessoas que se encontram fora de seus países devido a fundados temores de perseguição por raça, religião, nacionalidade, pertencimento a grupo social ou opiniões políticas, ou ainda em razão de graves e generalizadas violações de direitos humanos.\n\n"
                    "A Declaração Universal de 1948 estabelece marcos cruciais em seus artigos. O Artigo 2 defende a igualdade incondicional de direitos de todos os seres humanos, independentemente de origem ou soberania do país. O Artigo 6 garante que todos têm o direito de ser reconhecidos como pessoas perante a lei, combatendo a invisibilidade jurídica. Já o Artigo 14 assegura o direito de procurar e gozar asilo em outros países quando vítima de perseguição.\n\n"
                    "A migração forçada arranca o indivíduo de sua estabilidade cotidiana, colocando-o em uma jornada repleta de perigos. Longe de ser uma escolha, o refúgio é um ato extremo de sobrevivência humana. Compreender a dimensão desses deslocamentos ajuda-nos a encarar as fronteiras geopolíticas não apenas como barreiras físicas, mas como divisores de direitos humanos fundamentais."
                ),
                "image_bg": img_rights,
                "callouts": [
                    {"label": "CONTEXTO GLOBAL", "texto": "Hoje existem mais de 100 milhões de pessoas deslocadas à força no mundo."},
                    {"label": "ARTIGO 14", "texto": "Garante o direito humano inalienável de buscar asilo e refúgio em solo estrangeiro."}
                ]
            },
            {
                "titulo": "2. Abou: A Criança na Mala",
                "texto": (
                    "O espetáculo teatral 'Quando eu morrer, vou contar tudo a Deus', do coletivo O Bonde (São Paulo), baseia-se em um fato real ocorrido em 2015: um menino africano de oito anos chamado Abou foi encontrado pela polícia de fronteira da Espanha escondido dentro de uma mala de viagem.\n\n"
                    "A peça reconstrói poeticamente essa terrível travessia. Dentro do espaço claustrofóbico e escuro da mala, a imaginação e a curiosidade de Abou tornam-se mecanismos de defesa para amenizar a dor e a solidão do deslocamento. A narrativa aborda de frente a crise de refugiados africanos que tentam ingressar na Europa através dos enclaves espanhóis de Ceuta e Melilla, no norte da África.\n\n"
                    "Ao humanizar a figura do migrante na infância, o grupo O Bonde provoca uma reflexão profunda sobre o Artigo 6 da Declaração dos Direitos Humanos. Abou, ao ser tratado como contrabando em uma mala, tem sua humanidade e direitos básicos negados pelas autoridades de fronteira, demonstrando como a arte atua como ferramenta de denúncia e sensibilização."
                ),
                "image_bg": img_brecht,
                "callouts": [
                    {"label": "FATO REAL", "texto": "Em 2015, o menino Abou, da Costa do Marfim, foi radiografado dentro de uma mala na fronteira espanhola."},
                    {"label": "COLETIVO O BONDE", "texto": "Companhia paulista que usa o teatro documentário para dar voz a questões periféricas."}
                ]
            },
            {
                "titulo": "3. Suspender o Céu",
                "texto": (
                    "A perda de um território tradicional para os povos indígenas é uma violência que vai além da perda geográfica de habitação. Para os povos originários, o território é o espaço sagrado que abriga sua ancestralidade, sua espiritualidade e a própria natureza da qual fazem parte e que molda sua identidade cultural.\n\n"
                    "Segundo o pensador, líder indígena e imortal da Academia Brasileira de Letras Ailton Krenak, práticas como cantar, dançar e viver a experiência sensível do encontro e do movimento constituem a mágica de 'suspender o céu'. Isso significa expandir o horizonte existencial e situar-se no próprio corpo e vida, contrapondo-se à lógica eurocêntrica e produtivista do consumo.\n\n"
                    "A Declaração da ONU sobre os Direitos dos Povos Indígenas (Artigo 25) assegura o direito de manter e fortalecer a relação espiritual com suas terras tradicionais. A resistência indígena manifesta-se vigorosamente na preservação dessas práticas ancestrais, como a dança, que resistem ao longo de séculos contra deslocamentos forçados e violência territorial."
                ),
                "image_bg": img_caricu,
                "callouts": [
                    {"label": "AILTON KRENAK", "texto": "Filósofo, ambientalista e ativista, primeiro indígena eleito para a Academia Brasileira de Letras."},
                    {"label": "RESISTÊNCIA", "texto": "Cantar e dançar são tecnologias de sobrevivência e conexão com a Terra."}
                ]
            },
            {
                "titulo": "4. O Ritmo do Cariçu",
                "texto": (
                    "O cariçu (ou kariçu) é uma dança tradicional de celebração praticada por diversos povos indígenas, com destaque para a etnia Tukano do Alto Rio Negro, no Amazonas. Essa manifestação cultua a vida, a fartura e a união comunitária, sendo tradicionalmente ligada a rituais de casamento e trocas sociais.\n\n"
                    "A dança é executada em duplas ao som do próprio cariçu, um instrumento de sopro feito de tubos de taquara amarrados com fibras, semelhante à flauta de pã. O andamento da dança inicia suave e vai se intensificando com batidas marcadas dos pés no chão, adornados com tornozeleiras de sementes (chocalhos). As vestimentas incluem cocares, saias de palha, colares e pinturas corporais.\n\n"
                    "Mesmo sofrendo com a expropriação de suas terras e a necessidade de se deslocarem para centros urbanos, os Tukano mantêm o cariçu vivo. A apresentação dessa dança em ambientes como universidades públicas (por exemplo, na UFSCar) demonstra como esses saberes tradicionais ganham novas formas de circulação, afirmando o espaço do conhecimento indígena na sociedade."
                ),
                "image_bg": img_caricu,
                "callouts": [
                    {"label": "TUKANO", "texto": "Família linguística e étnica de 17 povos que habitam a bacia do Rio Negro e do Uaupés."},
                    {"label": "O INSTRUMENTO", "texto": "O cariçu é uma flauta de pã de taquara com afinação variável tocada de forma coletiva."}
                ]
            },
            {
                "titulo": "5. Diários de Guerra: Peça N",
                "texto": (
                    "O espetáculo 'N', criado em 2016 pela Cia Arte-Móvel (Americana, SP), é uma adaptação cênica do célebre livro 'O diário de Anne Frank', publicado originalmente em 1947. A montagem explora o processo de remidiação, transportando a literatura íntima de Anne para a linguagem teatral através de animação de objetos, bonecos e projeções digitais.\n\n"
                    "A peça reconstrói a trajetória de três pessoas tentando fugir de conflitos armados durante a Segunda Guerra Mundial, traçando um paralelo direto com os milhões de refugiados contemporâneos. A jovem Anne Frank permaneceu oculta dos nazistas em um anexo secreto em Amsterdã por dois anos antes de ser descoberta e morrer no campo de concentração de Bergen-Belsen em 1945.\n\n"
                    "Ao integrar elementos estéticos, registros históricos e novas tecnologias no palco, a remidiação permite perpetuar e ressignificar a memória da intolerância. O espetáculo convida a plateia a refletir sobre a repetição da história de perseguição de civis inocentes e a importância do acolhimento humanitário."
                ),
                "image_bg": img_anne,
                "callouts": [
                    {"label": "REMIDIAÇÃO", "texto": "A transposição de uma obra de seu suporte original (livro) para outro meio (teatro multimídia)."},
                    {"label": "ANNE FRANK", "texto": "Jovem judia alemã cujo diário tornou-se o maior testemunho pessoal do Holocausto."}
                ]
            },
            {
                "titulo": "6. O Estranhamento Brechtiano",
                "texto": (
                    "Bertolt Brecht desenvolveu o teatro épico na década de 1920 em oposição direta ao teatro clássico dramático. Enquanto o teatro tradicional buscava a identificação imediata e a ilusão emocional do espectador (catarse), o teatro épico visava criar um distanciamento crítico para estimular a reflexão racional sobre problemas sociais.\n\n"
                    "Para atingir esse distanciamento, Brecht elaborou o conceito de 'efeito de estranhamento' (Verfremdungseffekt). Ele consistia em tornar o familiar desconhecido, quebrando a ilusão cênica. Recursos como expor a maquinaria técnica (luzes, cenários), interrupções de cenas, uso de narradores comentando os atos, e atores falando diretamente ao público eram empregados.\n\n"
                    "O musical brasileiro 'Malala, a menina que queria ir para a escola' utiliza essas técnicas de forma brilhante. Durante a representação da luta da jovem paquistanesa contra a opressão extremista, os atores interrompem a ação para dialogar com a plateia sobre os direitos das crianças à educação, transformando o teatro em ferramenta pedagógica direta."
                ),
                "image_bg": img_brecht,
                "callouts": [
                    {"label": "BERTOLT BRECHT", "texto": "Dramaturgo alemão que precisou se refugiar nos EUA fugindo do nazismo na 2ª Guerra."},
                    {"label": "ESTRANHAMENTO", "texto": "Recursos cênicos que quebram a ilusão da peça, convidando o público a pensar e agir politicamente."}
                ]
            },
            {
                "titulo": "7. Latcho Drom: A Boa Viagem",
                "texto": (
                    "Os povos romani, historicamente referidos pela designação genérica e muitas vezes estereotipada de 'ciganos', iniciaram sua diáspora entre os séculos XIV e XV, partindo do noroeste da Índia (região do Rajastão). Ao migrarem pela Europa e Oriente Médio, fundaram ricos subgrupos culturais, como os Rom, os Sinti e os Calón.\n\n"
                    "O nomadismo, comumente idealizado de forma romântica como sinônimo de total liberdade e desapego, foi, na verdade, uma tática de sobrevivência em resposta a sucessivas ondas de discriminação, perseguição e políticas de expulsão de vários governos. Estima-se que mais de 500 mil romani foram brutalmente assassinados nos campos de concentração nazistas durante a Segunda Guerra.\n\n"
                    "O cineasta romani Tony Gatlif retratou essa jornada no documentário 'Latcho Drom' (1993) ('Boa Viagem' na língua romani). Sem diálogos ou narradores, o filme acompanha a trajetória geográfica da diáspora romani guiado exclusivamente pela música, provando a riqueza identitária e a diversidade das diferentes etnias que a compõem."
                ),
                "image_bg": img_diaspora,
                "callouts": [
                    {"label": "CONGRESSO DE 1971", "texto": "Estabeleceu a denominação unificada 'Roma', a bandeira oficial e o hino do povo romani."},
                    {"label": "GENOCÍDIO", "texto": "Conhecido como Porajmos, o extermínio de ciganos pelo regime nazista ainda é pouco discutido."}
                ]
            },
            {
                "titulo": "8. Alma Flamenca e Calón",
                "texto": (
                    "O flamenco é uma expressão artística secular que une música, dança e canto no sul da Espanha, principalmente na região da Andaluzia. A manifestação resulta de um caldeirão cultural com influências judaicas, árabes e ciganas. A contribuição decisiva para a sua consolidação veio dos romani da etnia Calón, que estruturaram seus principais ritmos.\n\n"
                    "Originalmente confinado aos bairros marginalizados de Sacromonte (Granada) e Triana (Sevilha), o flamenco desenvolveu seus diversos ritmos dramáticos e festivos (os 'palos'). A sonoridade se apoia no som marcante do sapateado dos dançarinos, da guitarra flamenca (violão flamenco), palmas percussivas ritmadas (palmeado) e castanholas.\n\n"
                    "O canto, chamado 'cante jondo' (canto profundo), é caracterizado pela sua alta dramaticidade, potência vocal e uso de melismas (várias notas rápidas cantadas em uma única sílaba), o que revela a influência árabe direta. A cantaora Estrella Morente, de ascendência Calón, destaca-se internacionalmente ao manter viva essa tradição expressiva."
                ),
                "image_bg": img_flamenco,
                "callouts": [
                    {"label": "CANTE JONDO", "texto": "O canto tradicional andaluz que expressa sentimentos trágicos de dor e perseguição histórica."},
                    {"label": "ESTRELLA MORENTE", "texto": "Artista de linhagem Calón que gravou 'Peregrinitos' e participou do filme 'Volver' de Almodóvar."}
                ]
            },
            {
                "titulo": "9. O Legado Romani no Brasil",
                "texto": (
                    "A presença romani no Brasil remonta ao início da colonização no século XVI, impulsionada pelo degredo imposto pelas coroas ibéricas que baniram ciganos Calón de suas terras. Esses grupos adaptaram sua cultura ao longo das gerações no país, desenvolvendo uma variante da língua original (o chibi-caló). Outras levas das etnias Rom e Sinti migraram no século XX.\n\n"
                    "Os romani exerceram um papel crucial no entretenimento popular brasileiro, chegando ao país associados a companhias de circo itinerantes, como a notável família Sbano. Artistas ciganos ou descendentes também conquistaram as telas nacionais, a exemplo de Dedé Santana (Os Trapalhões) e da atriz Ana Rosa. Na música, muitos Calón se identificaram com o sertanejo, como a jovem dupla de irmãos Miguel e Nycolas.\n\n"
                    "Hoje, com uma população estimada em 2 milhões de pessoas, os ciganos no Brasil enfrentam sérias dificuldades de segregação, preconceito e falta de acesso a direitos básicos como saúde e educação itinerante. Jovens influencers como Jade Kalín e Jussiara Vieira usam as redes sociais como trincheiras digitais para combater visões caricatas e místicas sobre o seu povo."
                ),
                "image_bg": img_brazil,
                "callouts": [
                    {"label": "DEGREDO COLONIAL", "texto": "Ciganos Calón foram deportados como degredados no século XVI por leis de banimento de Portugal."},
                    {"label": "TRINCHEIRA DIGITAL", "texto": "Influenciadores romani usam redes para desmitificar estereótipos propagados por novelas de TV."}
                ]
            }
        ],
        frase_final="A arte de um povo é o seu território espiritual. Nenhuma fronteira pode confiscá-la."
    )

    # Garante que a pasta destino existe
    output_dir = Path("/Users/kelsopalheta/Developer/Gerador de Slides Animados/slides-netflix-em/3_ano_arte/2_bimestre/Fluxos Culturais")
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / "Fluxos Culturais.html"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✓ Apresentação em HTML (Impress.js) gerada com sucesso em: {output_file}")

if __name__ == "__main__":
    main()
