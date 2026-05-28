import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))
from gerador_impress import construir_aula_impress

def main():
    img_doc = "file:///Users/kelsopalheta/.gemini/antigravity/brain/49903eff-05fc-4fce-abd3-a95a392649ca/doc_camera_cinematic_1779279891459.png"
    img_bullying = "file:///Users/kelsopalheta/.gemini/antigravity/brain/49903eff-05fc-4fce-abd3-a95a392649ca/bullying_shadows_1779279904350.png"
    img_youth = "file:///Users/kelsopalheta/.gemini/antigravity/brain/49903eff-05fc-4fce-abd3-a95a392649ca/diverse_youth_1779279919367.png"

    html, avisos = construir_aula_impress(
        titulo="O Audiovisual Contra o Preconceito",
        subtitulo="Como o cinema documentário e as campanhas de conscientização podem ser armas poderosas para combater o bullying, a gordofobia e o capacitismo na escola.",
        autor="Prof. Kelso Palheta",
        materia="Arte",
        serie="2º Ano do Ensino Médio - 2º Bimestre",
        image_capa=img_youth,
        conteudo=[
            {
                "titulo": "1. O Método Coutinho",
                "texto": (
                    "O aclamado cineasta Eduardo Coutinho transformou o documentário brasileiro ao focar nas histórias reais de pessoas comuns. No seu último filme, 'Últimas Conversas', ele entrevistou estudantes do 3º ano do Ensino Médio de escolas públicas do Rio de Janeiro.\n\n"
                    "O diretor entendia a entrevista como um método de escuta profunda. Para ele, a história de cada personagem era a narrativa principal do filme. Coutinho fazia questão de não participar das entrevistas prévias, garantindo que o primeiro contato com o adolescente acontecesse com a câmera já ligada.\n\n"
                    "Nessas conversas, os jovens expunham suas vidas, medos, sonhos e dores. Assuntos como racismo, religião, pressões familiares e bullying emergiam de forma crua, provando que ouvir a juventude é o primeiro passo para compreender os desafios coletivos do nosso futuro."
                ),
                "image_bg": img_doc,
                "callouts": [
                    {"label": "AUTENTICIDADE", "texto": "A emoção genuína surge quando a conversa não é ensaiada."},
                    {"label": "ESCUTA ATIVA", "texto": "Perguntar sobre os 'sonhos' simboliza validação e esperança."}
                ]
            },
            {
                "titulo": "2. Bullying: A Violência Camuflada",
                "texto": (
                    "Um dos temas que mais assombram as escolas e que são trazidos à tona pelos próprios alunos é o Bullying. Muitas vezes tratado como 'brincadeira', o bullying constitui, na verdade, uma violência gravíssima que faz a vítima se sentir humilhada e discriminada.\n\n"
                    "Essa prática agressiva pode ser física, verbal ou psicológica. Ela pode ocorrer de forma explícita ou sutil, e se caracteriza por ser uma agressão sistemática, intencional e repetitiva, enraizada na falta de empatia e no não reconhecimento do outro.\n\n"
                    "Por trás do bullying, sempre existem preconceitos estruturais sendo replicados, como o capacitismo (discriminação contra pessoas com deficiência) e a gordofobia (estigmatização pelo peso). A arte tem o papel crucial de 'descortinar' essa violência."
                ),
                "image_bg": img_bullying,
                "callouts": [
                    {"label": "NÃO É BRINCADEIRA", "tipo": "danger", "texto": "Se apenas um ri e o outro sofre, trata-se de violência sistêmica."},
                    {"label": "IMPACTO", "texto": "Traumas psicológicos profundos e até o abandono escolar são consequências comuns."}
                ]
            },
            {
                "titulo": "3. Dar Voz Para Combater",
                "texto": (
                    "Uma das formas mais eficientes de combater o preconceito e quebrar narrativas discriminatórias é usar o audiovisual para dar voz, espaço e participação social a grupos historicamente silenciados.\n\n"
                    "No cinema nacional, o documentário 'A Última Floresta' (2021) é um exemplo primoroso. Nele, o xamã Davi Kopenawa não é apenas um tema de estudo; ele assina o roteiro e é o protagonista. O filme mostra a resistência dos Yanomami pela sua própria perspectiva, combatendo estereótipos colonialistas.\n\n"
                    "Essa mesma lógica de protagonismo deve ser usada na escola. Produzir curtas-documentários com a turma significa entregar a câmera para quem vivencia os preconceitos na pele, permitindo que eles contem suas próprias histórias de superação ou dor."
                ),
                "image_bg": img_youth,
                "callouts": [
                    {"label": "PROTAGONISMO", "texto": "O oprimido deve segurar o microfone e contar a sua própria história."},
                    {"label": "QUEBRA DE PADRÕES", "texto": "O cinema documental desfaz estereótipos de beleza e comportamento."}
                ]
            },
            {
                "titulo": "4. A Gramática do Cinema",
                "texto": (
                    "Para que vocês produzam seus próprios curtas-documentários contra o bullying, é essencial dominar a linguagem visual da câmera. O enquadramento é o que determina como o público vai sentir a cena.\n\n"
                    "OS PLANOS: O Plano Geral (PG) mostra o ambiente inteiro, focando no contexto. O Plano Médio (PM) foca da cintura para cima, ideal para entrevistas. Já o Close (Primeiro Plano) fecha no rosto, capturando a emoção e as microexpressões do entrevistado.\n\n"
                    "OS ÂNGULOS: O ângulo 'Plongée' (de cima para baixo) faz a pessoa parecer menor ou oprimida. O 'Contra-Plongée' (de baixo para cima) dá poder e grandiosidade a quem está na tela. No documentário, costuma-se usar o Ângulo Normal (na altura dos olhos) para gerar igualdade e conexão direta."
                ),
                "image_bg": img_doc,
                "callouts": [
                    {"label": "ENQUADRAMENTO", "texto": "A escolha de onde cortar a imagem altera a mensagem psicológica."},
                    {"label": "DICA PRÁTICA", "texto": "Para entrevistas, câmera fixa e ângulo normal transmitem mais confiança."}
                ]
            },
            {
                "titulo": "5. Etapas de Produção",
                "texto": (
                    "Fazer um documentário não é apenas apertar 'REC'. A produção é dividida em três fases fundamentais que garantem a qualidade e a coerência da obra.\n\n"
                    "A PRÉ-PRODUÇÃO é o cérebro do projeto. Aqui define-se o tema, escreve-se o pré-roteiro, pesquisa-se o assunto e agenda-se os entrevistados, pedindo as devidas autorizações de imagem.\n\n"
                    "A PRODUÇÃO é a filmagem em si (ação!). É preciso cuidar da iluminação, evitar ruídos no áudio e estabelecer uma relação de confiança com o entrevistado. Finalmente, a PÓS-PRODUÇÃO é onde a mágica acontece: na ilha de edição (ou aplicativo do celular), as cenas são cortadas, ordenadas e o som é mixado para criar o filme final."
                ),
                "image_bg": img_doc,
                "callouts": [
                    {"label": "ÁUDIO É REI", "texto": "Um vídeo ruim com áudio bom é assistível. Um vídeo lindo com áudio ruim é insuportável."},
                    {"label": "TERMO DE IMAGEM", "texto": "É antiético e ilegal expor o rosto de alguém no filme sem consentimento."}
                ]
            },
            {
                "titulo": "6. Campanha de Conscientização",
                "texto": (
                    "O propósito final de um documentário denúncia não é ficar guardado no pen-drive, mas sim gerar transformação social. Por isso, a etapa final do projeto de vocês será uma Campanha de Conscientização escolar.\n\n"
                    "Uma campanha forte precisa de um 'Slogan' marcante (ex: 'Quando não existe plateia, não existe bullying') e materiais de divulgação que chamem a atenção dos outros alunos. O objetivo é criar um evento para compartilhar os curtas-documentários produzidos pelos grupos.\n\n"
                    "Ao expor esses filmes num pátio ou sala aberta, a turma cria um espaço democrático de escuta. É a oportunidade para que colegas se sintam acolhidos, debatam soluções para o capacitismo e a gordofobia, e pensem em atitudes práticas para um ambiente escolar de paz."
                ),
                "image_bg": img_bullying,
                "callouts": [
                    {"label": "SLOGAN", "texto": "Frase curta, chiclete e impactante que resume toda a ideia da campanha."},
                    {"label": "TRANSFORMAÇÃO", "texto": "A arte só atinge seu objetivo máximo quando altera a realidade a sua volta."}
                ]
            }
        ],
        frase_final="O cinema é uma máquina de gerar empatia. Use-a para dar voz a quem o preconceito tenta calar."
    )

    import os
    os.makedirs("2_ano_arte/2_bimestre/Bullying e Documentários", exist_ok=True)
    nome_html = "2_ano_arte/2_bimestre/Bullying e Documentários/Bullying e Documentários.html"
    with open(nome_html, "w", encoding="utf-8") as f:
        f.write(html)
    
    print(f"✓ Aula Impress.js 3D gerada com sucesso: {nome_html}")

if __name__ == "__main__":
    main()
