"""
gerar_aula_samba.py — Versão Expositiva e Detalhada.
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))
from gerador_impress import construir_aula_impress, slug

def main():
    img_capa = "file:///Users/kelsopalheta/.gemini/antigravity/brain/49903eff-05fc-4fce-abd3-a95a392649ca/tia_ciata_cinematic_1778696432841.png"
    img_chiquinha = "file:///Users/kelsopalheta/.gemini/antigravity/brain/49903eff-05fc-4fce-abd3-a95a392649ca/chiquinha_gonzaga_cinematic_1778696419110.png"
    img_fusao = "file:///Users/kelsopalheta/.gemini/antigravity/brain/49903eff-05fc-4fce-abd3-a95a392649ca/samba_funk_fusion_1778696450652.png"

    html, avisos = construir_aula_impress(
        titulo="As Raízes do Ritmo",
        subtitulo="Do lundu do século XIX ao funk carioca moderno: a linha do tempo definitiva de como a população marginalizada desenhou a identidade sonora do Brasil.",
        autor="Prof. Kelso Palheta",
        materia="Arte",
        serie="1º Ano do Ensino Médio",
        image_capa=img_capa,
        conteudo=[
            {
                "titulo": "1. O Fim do Século XIX",
                "texto": (
                    "O Rio de Janeiro no final do século XIX era uma cidade dividida não apenas pela geografia, mas também pela trilha sonora. Nos salões da elite, a música predominante era importada: valsas, polcas e schottisches tocadas ao piano ditaram o compasso da alta sociedade.\n\n"
                    "No entanto, nas ruas de terra, cortiços e quintais das casas mais humildes, o som era marcado pelos tambores, palmas e cantos sincopados herdados das populações escravizadas e libertas. O batuque e o lundu africano eram as expressões de um povo que encontrava na música sua forma primária de resistência e pertencimento social.\n\n"
                    "Com o fim da escravidão em 1888 e a Proclamação da República no ano seguinte, a tensão entre essas duas 'cidades' atingiu seu ápice. O Brasil precisava de uma identidade moderna, mas a elite branca repudiava qualquer manifestação cultural que tivesse raízes negras. Foi nesse caldeirão de tensões que a polca europeia começou a ser tocada de uma forma mais ritmada pelos músicos de rua."
                ),
                "image_bg": img_chiquinha,
                "callouts": [
                    {"label": "CONTEXTO HISTÓRICO", "texto": "A abolição (1888) deixou milhares de ex-escravizados à margem da economia formal no Rio."},
                    {"label": "CONCEITO-CHAVE", "texto": "Síncope: o deslocamento da batida forte do compasso, marca registrada da música africana."}
                ]
            },
            {
                "titulo": "2. O Nascimento do Maxixe",
                "texto": (
                    "Quando os músicos populares, conhecidos como 'chorões' (por causa do estilo lamentoso como tocavam flautas e violões), começaram a interpretar a polca usando o ritmo do lundu, algo inteiramente novo surgiu. Essa mistura de melodia europeia com síncope africana deu origem ao primeiro gênero urbano puramente brasileiro: o Maxixe.\n\n"
                    "O Maxixe era vibrante, acelerado e possuía uma dança considerada escandalosa para os padrões da época. Em vez do distanciamento respeitoso da valsa, o maxixe exigia que os corpos se entrelaçassem, os quadris balançassem e as pernas se cruzassem. \n\n"
                    "Imediatamente, o gênero foi classificado pelas autoridades e pela imprensa da época como uma 'dança excomungada', imoral e perigosa. A polícia perseguia as rodas de maxixe e os músicos que o tocavam eram constantemente presos sob acusações de vadiagem e perturbação da ordem pública."
                ),
                "image_bg": "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2000",
                "callouts": [
                    {"label": "O PRIMEIRO", "texto": "O Maxixe foi a primeira fusão real que pode ser chamada de 'Música Urbana Brasileira'."},
                    {"label": "REPRESSÃO", "tipo": "danger", "texto": "A polícia do RJ tinha ordem expressa para prender qualquer agrupamento tocando instrumentos de percussão."}
                ]
            },
            {
                "titulo": "3. O Artifício do 'Tanguinho'",
                "texto": (
                    "Para sobreviver economicamente e ter suas músicas tocadas nos teatros de revista (a principal forma de entretenimento de massa da época), os compositores precisaram ser muito estratégicos. A palavra 'maxixe' nas partituras era um passaporte direto para a censura.\n\n"
                    "Foi então que compositoras como a genial Chiquinha Gonzaga encontraram uma brecha: elas compunham maxixes puros, cheios de síncope e ginga, mas escreviam na capa da partitura que a música era um 'Tango Brasileiro' ou um 'Tanguinho'. O tango, por vir da Argentina e ser exportado para Paris, já carregava uma aura de 'aceitabilidade' internacional.\n\n"
                    "A obra mais famosa a usar esse artifício foi 'O Corta-jaca' (1897) de Chiquinha Gonzaga. Quando a Primeira-Dama Nair de Tefé executou essa música ao violão dentro do Palácio do Catete em 1914, o escândalo foi nacional. Rui Barbosa escreveu artigos furiosos nos jornais dizendo que a mais alta corte do país havia sido 'contaminada por essa dança de cortiços'."
                ),
                "image_bg": img_chiquinha,
                "callouts": [
                    {"label": "ESTRATÉGIA", "texto": "O 'branqueamento' do nome da música era necessário para a sobrevivência do artista."},
                    {"label": "O CORTA-JACA", "texto": "A primeira música popular a entrar no salão presidencial (1914)."}
                ]
            },
            {
                "titulo": "4. A Pequena África",
                "texto": (
                    "No início do século XX, o Rio de Janeiro passou por reformas urbanas brutais que derrubaram os cortiços do centro para criar avenidas parisienses. A população pobre e negra foi empurrada para as encostas dos morros (nascendo as favelas) e para a região portuária.\n\n"
                    "Essa área que englobava a Pedra do Sal, a Praça Onze e o bairro da Saúde ficou conhecida como 'Pequena África'. Era o grande reduto da comunidade baiana que havia migrado para o Rio em busca de emprego após a abolição, trazendo na bagagem o Samba de Roda do Recôncavo Baiano, a culinária do candomblé e a religiosidade.\n\n"
                    "O ponto focal de segurança e resistência social nesse território hostil eram as casas das chamadas 'Tias Baianas'. Elas eram matriarcas, quituteiras e líderes religiosas que mantinham a cultura viva através de festas imensas que duravam dias. A mais famosa delas foi Tia Ciata (Hilária Batista de Almeida)."
                ),
                "image_bg": img_capa,
                "callouts": [
                    {"label": "GEOGRAFIA", "texto": "As reformas urbanas de Pereira Passos forçaram a segregação geográfica que existe até hoje."},
                    {"label": "MATRIARCADO", "texto": "As mulheres negras baianas foram o pilar de proteção da cultura do samba no RJ."}
                ]
            },
            {
                "titulo": "5. O Telefone que Tocou a Nação",
                "texto": (
                    "Foi justamente nas festas da casa de Tia Ciata, após os rituais sagrados e o farto jantar, que as rodas de pagode aconteciam. Nessas rodas noturnas, os músicos fundiram o ritmo do maxixe com o Samba de Roda baiano, criando uma nova cadência, mais fluida e própria para cantar versos improvisados.\n\n"
                    "A consagração desse novo som ocorreu em 1917, quando Ernesto dos Santos, o Donga (frequentador assíduo da casa de Tia Ciata), registrou na Biblioteca Nacional e gravou a música 'Pelo Telefone'. Considerada a primeira gravação fonográfica oficial de um samba.\n\n"
                    "O sucesso foi explosivo no Carnaval daquele ano. A letra trazia uma crônica urbana (uma ironia sobre o chefe de polícia que mandava avisar que a roleta estava liberada) e consolidou o samba urbano carioca como o grande porta-voz das narrativas populares."
                ),
                "image_bg": img_capa,
                "callouts": [
                    {"label": "MARCO ZERO", "texto": "'Pelo Telefone' (1917) popularizou a palavra Samba no mercado de discos nacional."},
                    {"label": "CRÔNICA URBANA", "texto": "Desde o início, as letras documentavam a realidade, a corrupção e o dia a dia do povo."}
                ]
            },
            {
                "titulo": "6. A Bossa Nova: O Samba 'Refinado'",
                "texto": (
                    "Nas décadas seguintes (Anos 30, 40 e 50), o samba se popularizou com as rádios e foi cooptado pelo Estado durante o governo Vargas, que o transformou em 'Símbolo da Identidade Nacional' oficial. Porém, a periferia que o criou continuava marginalizada.\n\n"
                    "No final da década de 1950, jovens músicos de classe média alta da Zona Sul do Rio (Copacabana e Ipanema), liderados por João Gilberto, Tom Jobim e Vinícius de Moraes, criaram a Bossa Nova.\n\n"
                    "Eles pegaram o ritmo sincopado do samba de morro, diminuíram o volume dos instrumentos percussivos, sofisticaram as harmonias com acordes do Jazz norte-americano (Bebop e Cool Jazz) e adotaram um estilo de cantar baixinho, quase falado. O Brasil e o mundo inteiro aplaudiram de pé."
                ),
                "image_bg": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000",
                "callouts": [
                    {"label": "APROPRIAÇÃO?", "texto": "A Bossa Nova globalizou o samba, mas afastou o gênero das suas raízes dos morros."},
                    {"label": "JOÃO GILBERTO", "texto": "A famosa 'batida' no violão tentava imitar o tamborim do samba original."}
                ]
            },
            {
                "titulo": "7. O Funk e a Repetição da História",
                "texto": (
                    "O preconceito, contudo, é cíclico. O que a sociedade elitista dizia sobre o maxixe no século XIX, ela disse sobre o samba de morro na década de 1920, sobre o pagode nos anos 90, e diz atualmente sobre o Funk Brasileiro.\n\n"
                    "Nos anos 80, os bailes da periferia tocavam funk americano. Mas nos anos 90, os DJs brasileiros começaram a usar os potentes subgraves (o famoso bumbo 'Tamborzão') com ritmos que remetiam indiretamente aos terreiros de candomblé e aos sambas-enredo. O Funk carioca tornou-se a nova voz da favela.\n\n"
                    "Assim como ocorreu no passado com os chorões, o Estado respondeu com tentativas de criminalização. Projetos de lei no Congresso já tentaram proibir bailes e enquadrar o funk como crime de apologia, ignorando que o ritmo é a documentação crua da realidade vivida pelos jovens da periferia."
                ),
                "image_bg": img_fusao,
                "callouts": [
                    {"label": "CÍCLICO", "tipo": "danger", "texto": "A polícia reprimia a roda de maxixe; hoje, reprime o baile funk com a mesma justificativa."},
                    {"label": "TAMBORZÃO", "texto": "A batida eletrônica do funk tem a mesma estrutura de síncope que o batuque africano."}
                ]
            },
            {
                "titulo": "8. A Herança Rítmica na Atualidade",
                "texto": (
                    "O Funk Brasileiro é hoje não apenas o som nacional mais exportado no mundo, mas também uma plataforma de experimentação estética e musical.\n\n"
                    "Artistas contemporâneos têm traçado o caminho inverso da Bossa Nova: em vez de levar a periferia para o jazz, eles trazem os sons clássicos e a religiosidade para dentro da batida eletrônica moderna. A cantora paulista MC Tha, por exemplo, faz um brilhante trabalho cruzando as batidas agressivas do funk 150 BPM com cantos de Umbanda, Candomblé e toques de percussão analógica.\n\n"
                    "Ao analisarmos essa linha do tempo (Maxixe → Samba → Funk), percebemos que o formato mudou da flauta de madeira para o computador do DJ, mas a essência não. A música do Brasil é o documento vivo da resistência, da criatividade e da sobrevivência de um povo que sempre exigiu o direito de dançar."
                ),
                "image_bg": img_fusao,
                "callouts": [
                    {"label": "MC THA", "texto": "Álbum 'Rito de Passá' prova que não há separação real entre a macumba e a batida eletrônica."},
                    {"label": "CONCLUSÃO", "texto": "A tecnologia mudou, mas a síncope e a alma marginalizada continuam as mesmas."}
                ]
            }
        ],
        frase_final="A história do Brasil não está escrita nos livros. Está codificada no grave dos nossos tambores."
    )

    import os
    os.makedirs("Origens do Samba", exist_ok=True)
    nome_html = "Origens do Samba/Origens do Samba.html"
    with open(nome_html, "w", encoding="utf-8") as f:
        f.write(html)
    
    print(f"✓ Aula Impress.js 3D gerada com sucesso: {nome_html}")

if __name__ == "__main__":
    main()
