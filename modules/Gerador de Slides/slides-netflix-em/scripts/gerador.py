"""
gerador.py — helpers para montar slides estilo documentário Netflix.

Uso:
    from gerador import construir_aula

    aula_html = construir_aula(
        titulo="A Rede da Apatia",
        autor="Prof. Fulano",
        materia="Sociologia",
        serie="3º ano",
        objetivos=["Compreender economia da atenção", "..."],
        habilidades_bncc=["EM13CHS101", "EM13CHS503"],
        conteudo=[
            {"titulo": "...", "texto": "...", "callouts": [...], "video_bg": "..."},
            ...
        ],
        atividades=[{"enunciado": "...", "tipo": "reflexao"}, ...],
        midias=[{"tipo": "documentario", "titulo": "...", "onde": "Netflix", "url": "..."}, ...],
        glossario=[{"termo": "...", "definicao": "..."}, ...],
        quiz=[{"pergunta": "...", "opcoes": ["a","b","c","d"], "correta": 1, "explicacao": "..."}, ...],
        referencias=["..."],
        video_capa="https://...",
    )

    with open("aula.html", "w", encoding="utf-8") as f:
        f.write(aula_html)
"""

from pathlib import Path
from html import escape
import re


# ---------- extração de fonte de referência ----------

def extrair_estrutura_fonte(texto_bruto: str) -> dict:
    """
    Recebe texto extraído de PDF/DOCX e retorna estrutura pré-processada
    pronta para alimentar construir_aula().

    Retorna:
    {
        "secoes": [{"titulo": str, "paragrafos": [str], "citacoes": [str], "definicoes": [str], "exercicios": [str]}],
        "referencias_encontradas": [str],
        "glossario_encontrado": [{"termo": str, "definicao": str}],
    }
    """
    linhas = texto_bruto.splitlines()
    secoes = []
    secao_atual = {"titulo": "Introdução", "paragrafos": [], "citacoes": [], "definicoes": [], "exercicios": []}

    for linha in linhas:
        linha = linha.strip()
        if not linha:
            continue

        # Detecta títulos (linha curta, toda em maiúsculas ou numerada, sem ser frase longa)
        eh_maiusculo = linha.upper() == linha and len(linha) > 5 and len(linha) < 100
        eh_numerado = bool(re.match(r"^\d+[\.\d]*\s+\S", linha)) and len(linha) < 80
        if (eh_maiusculo or eh_numerado) and len(linha.split()) <= 12:
            if secao_atual["paragrafos"] or secao_atual["citacoes"]:
                secoes.append(secao_atual)
            secao_atual = {"titulo": linha.title(), "paragrafos": [], "citacoes": [], "definicoes": [], "exercicios": []}
            continue

        # Detecta citações (linha entre aspas ou começando com "Segundo", "Para X,")
        if (linha.startswith('"') and linha.endswith('"')) or re.match(r"^(Segundo|Para|De acordo com|Conforme)\s", linha):
            secao_atual["citacoes"].append(linha)
            continue

        # Detecta definições (padrão "Termo: definição" ou "Termo — definição")
        match_def = re.match(r"^([A-Za-záéíóúãõ\s]{3,40})\s*[:\—–]\s*(.{20,})", linha)
        if match_def and len(match_def.group(1).split()) <= 4:
            secao_atual["definicoes"].append({"termo": match_def.group(1).strip(), "definicao": match_def.group(2).strip()})
            continue

        # Detecta exercícios (padrão "1.", "a)", "Questão X", "Exercício X")
        if re.match(r"^(\d+\.|[a-e]\)|Questão|Exercício|Atividade)\s", linha):
            secao_atual["exercicios"].append(linha)
            continue

        # Parágrafo normal
        if len(linha) > 60:
            secao_atual["paragrafos"].append(linha)

    if secao_atual["paragrafos"] or secao_atual["citacoes"]:
        secoes.append(secao_atual)

    # Extrai referências (ABNT típico: SOBRENOME, Nome. Título... Ano.)
    refs = [l.strip() for l in linhas if re.match(r"^[A-ZÁÉÍÓÚ]{2,}", l.strip()) and re.search(r"\d{4}", l)]

    return {
        "secoes": secoes,
        "referencias_encontradas": refs[-20:] if refs else [],
        "glossario_encontrado": [d for s in secoes for d in s["definicoes"]],
    }


def secoes_para_conteudo_slides(secoes: list[dict], banco_videos: dict | None = None) -> list[dict]:
    """
    Converte lista de seções extraídas em lista de dicts prontos para
    gerar_slide_conteudo(). Agrupa parágrafos em blocos de ~200-350 palavras.
    """
    slides_conteudo = []
    banco_videos = banco_videos or {}

    for secao in secoes:
        if not secao["paragrafos"]:
            continue

        # Une parágrafos em texto corrido
        texto_full = "\n\n".join(secao["paragrafos"])
        palavras = texto_full.split()

        # Divide se muito longo (>450 palavras → múltiplos slides)
        if len(palavras) > 450:
            chunks = []
            atual = []
            for p in secao["paragrafos"]:
                atual.append(p)
                if len(" ".join(atual).split()) >= 300:
                    chunks.append("\n\n".join(atual))
                    atual = []
            if atual:
                chunks.append("\n\n".join(atual))
        else:
            chunks = [texto_full]

        for i, chunk in enumerate(chunks):
            callouts = []
            # Primeira citação da seção vira callout
            if secao["citacoes"] and i == 0:
                callouts.append({"label": "CITAÇÃO DA FONTE", "texto": secao["citacoes"][0]})
            # Se seção tem definição importante, destaque como callout
            if secao["definicoes"] and i == 0:
                d = secao["definicoes"][0]
                callouts.append({"label": d["termo"].upper(), "texto": d["definicao"]})

            titulo = secao["titulo"] if i == 0 else f"{secao['titulo']} (cont.)"

            slides_conteudo.append({
                "titulo": titulo,
                "texto": chunk,
                "callouts": callouts,
                "video_bg": banco_videos.get(titulo.lower(), None),
                "speaker_notes": f"Fonte: material de referência fornecido pelo professor. Seção '{secao['titulo']}'.",
            })

    return slides_conteudo

TEMPLATE_PATH = Path(__file__).resolve().parent.parent / "assets" / "template_base.html"


# ---------- helpers de slide ----------

def gerar_capa(titulo: str, subtitulo: str, video_bg: str, materia: str, serie: str) -> str:
    return f"""
    <section data-background-video="{escape(video_bg)}" data-background-video-loop="true" data-background-video-muted="true" data-background-color="#000000">
      <p class="tech-font">[ TRANSMISSÃO ATIVA / {escape(materia.upper())} · {escape(serie.upper())} ]</p>
      <h1 class="glow-cyan">{escape(titulo)}</h1>
      <p style="font-size: 0.8em; color: #B0B0B0; margin-top: 18px;">{escape(subtitulo)}</p>
      <p class="tech-font" style="margin-top: 30px;">→ Pressione [ESPAÇO] para iniciar</p>
      <aside class="notes">
        Slide de abertura. Use 30-60 segundos para criar atmosfera. Pergunte à turma uma provocação inicial relacionada ao subtítulo antes de avançar.
      </aside>
    </section>
    """


def gerar_objetivos(objetivos: list[str], habilidades_bncc: list[str], duracao_min: int = 50) -> str:
    objs_html = "".join(f"<li>{escape(o)}</li>" for o in objetivos)
    bncc_html = " · ".join(f'<span class="tech-font" style="display:inline-block; padding:4px 10px; border:1px solid #00F0FF; border-radius:3px; margin:2px;">{escape(h)}</span>' for h in habilidades_bncc)
    return f"""
    <section data-transition="fade">
      <p class="tech-font">CAPÍTULO 00 · BRIEFING</p>
      <h2 class="netflix-red glow-red">Missão da Aula</h2>
      <hr style="border-color: #E50914; max-width: 80px; margin-left: 0;">
      <div class="cols cols-2" style="margin-top: 24px;">
        <div>
          <p class="tech-font">OBJETIVOS</p>
          <ul style="line-height: 1.7;">{objs_html}</ul>
        </div>
        <div>
          <p class="tech-font">HABILIDADES BNCC</p>
          <div>{bncc_html}</div>
          <p class="tech-font" style="margin-top: 20px;">DURAÇÃO ESTIMADA</p>
          <div class="stat-big" style="font-size: 3em;">{duracao_min}<span style="font-size: 0.4em; color: #B0B0B0;"> min</span></div>
        </div>
      </div>
      <aside class="notes">
        Apresente os objetivos em voz alta. Explique cada habilidade BNCC em linguagem do aluno (sem ler o código). Pergunte qual deles parece mais difícil — isso gera engajamento inicial.
      </aside>
    </section>
    """


def gerar_slide_conteudo(
    titulo: str,
    texto: str,
    callouts: list[dict] | None = None,
    video_bg: str | None = None,
    auto_animate_id: str | None = None,
    speaker_notes: str = "",
    numero_capitulo: int = 1,
) -> str:
    """
    texto: 200-400 palavras de conteúdo expositivo denso (use \\n\\n entre parágrafos)
    callouts: lista de dicts {"label": "...", "texto": "...", "tipo": "info"|"danger"}
    """
    callouts = callouts or []
    paragrafos = "".join(f"<p>{escape(p.strip())}</p>" for p in texto.strip().split("\n\n") if p.strip())
    callouts_html = ""
    for c in callouts:
        cls = "callout danger" if c.get("tipo") == "danger" else "callout"
        callouts_html += f"""<div class="{cls}"><span class="label">{escape(c.get('label',''))}</span><p>{escape(c.get('texto',''))}</p></div>"""

    bg_attr = f'data-background-video="{escape(video_bg)}" data-background-video-loop="true" data-background-video-muted="true"' if video_bg else 'data-background-color="#0B0C10"'
    auto_attr = f'data-auto-animate data-auto-animate-id="{escape(auto_animate_id)}"' if auto_animate_id else ""

    return f"""
    <section {bg_attr} {auto_attr}>
      <p class="tech-font">CAPÍTULO {numero_capitulo:02d}</p>
      <h2 class="glow-cyan">{escape(titulo)}</h2>
      <div class="cols cols-2" style="margin-top: 18px;">
        <div>{paragrafos}</div>
        <div>{callouts_html}</div>
      </div>
      <aside class="notes">{escape(speaker_notes)}</aside>
    </section>
    """


def gerar_slide_grafico(titulo: str, chart_id: str, chart_config_js: str, texto_apoio: str, speaker_notes: str = "") -> str:
    """
    chart_config_js: string JS válida para new Chart(ctx, {...})
    """
    return f"""
    <section data-background-color="#0B0C10">
      <h2 class="glow-cyan">{escape(titulo)}</h2>
      <div class="cols cols-2">
        <div><p>{escape(texto_apoio)}</p></div>
        <div style="background:#111418; padding:16px; border-radius:6px;">
          <canvas id="{escape(chart_id)}" width="400" height="300"></canvas>
        </div>
      </div>
      <script>
        (function() {{
          const init = () => {{
            const el = document.getElementById('{chart_id}');
            if (!el || el.dataset.rendered) return;
            el.dataset.rendered = '1';
            new Chart(el.getContext('2d'), {chart_config_js});
          }};
          if (window.Reveal) Reveal.on('slidechanged', init);
          document.addEventListener('DOMContentLoaded', init);
        }})();
      </script>
      <aside class="notes">{escape(speaker_notes)}</aside>
    </section>
    """


def gerar_atividade(atividades: list[dict], titulo_secao: str = "Atividade Prática") -> str:
    """
    atividades: [{"enunciado": str, "tipo": "reflexao"|"exercicio"|"pesquisa"|"debate", "tempo_min": int, "resposta_modelo": str}]
    """
    cards = ""
    for i, a in enumerate(atividades, 1):
        tipo = a.get("tipo", "exercicio").upper()
        tempo = a.get("tempo_min", 5)
        cards += f"""
        <div class="callout">
          <span class="label">ATIVIDADE {i:02d} · {escape(tipo)} · {tempo} MIN</span>
          <p>{escape(a.get('enunciado',''))}</p>
        </div>
        """
    notas_modelo = "\n\n".join(
        f"Atividade {i}: {a.get('resposta_modelo','(sem modelo)')}"
        for i, a in enumerate(atividades, 1)
    )
    return f"""
    <section data-background-color="#0B0C10" data-transition="fade">
      <p class="tech-font">[ INTERAÇÃO REQUERIDA ]</p>
      <h2 class="netflix-red glow-red">{escape(titulo_secao)}</h2>
      <hr style="border-color: #E50914; max-width: 80px; margin-left: 0;">
      {cards}
      <aside class="notes">Respostas modelo / orientações:\n\n{escape(notas_modelo)}</aside>
    </section>
    """


def gerar_midia(midias: list[dict], titulo_secao: str = "Continue a Imersão") -> str:
    """
    midias: [{"tipo": "filme"|"documentario"|"livro"|"podcast"|"musica"|"foto"|"site", "titulo": str, "onde": str, "url": str?, "porque": str}]
    """
    icones = {
        "filme": "🎬", "documentario": "📽️", "livro": "📖", "podcast": "🎙️",
        "musica": "🎵", "foto": "📷", "site": "🌐", "video": "▶️", "serie": "📺"
    }
    cards = ""
    for m in midias:
        ic = icones.get(m.get("tipo","").lower(), "★")
        qr = ""
        if m.get("url"):
            qr = f'<div class="qr-wrap" data-url="{escape(m["url"])}" style="float:right; margin-left:12px;"></div>'
        cards += f"""
        <div class="midia-card">
          {qr}
          <span class="tipo">{ic} {escape(m.get('tipo','').upper())}</span>
          <div class="titulo">{escape(m.get('titulo',''))}</div>
          <div class="meta">📍 {escape(m.get('onde','—'))}</div>
          <p style="font-size:0.55em; margin-top:6px; color:#B0B0B0;">{escape(m.get('porque',''))}</p>
        </div>
        """
    return f"""
    <section data-background-color="#0B0C10">
      <p class="tech-font">[ EXTRAS RECOMENDADOS ]</p>
      <h2 class="glow-cyan">{escape(titulo_secao)}</h2>
      <div class="cols cols-2">{cards}</div>
      <aside class="notes">Mídia recomendada para aprofundamento fora da sala. QR codes permitem acesso direto via celular do aluno.</aside>
    </section>
    """


def gerar_glossario(termos: list[dict]) -> str:
    """termos: [{"termo": str, "definicao": str}]"""
    cards = "".join(
        f'<div class="termo"><span class="palavra">{escape(t["termo"])}</span><p class="def">{escape(t["definicao"])}</p></div>'
        for t in termos
    )
    return f"""
    <section data-background-color="#0B0C10">
      <p class="tech-font">[ DICIONÁRIO TÉCNICO ]</p>
      <h2 class="glow-cyan">Glossário</h2>
      <div class="cols cols-2">{cards}</div>
      <aside class="notes">Revise cada termo antes da prova. Peça que os alunos criem frases usando cada um deles.</aside>
    </section>
    """


def gerar_quiz(perguntas: list[dict]) -> str:
    """
    perguntas: [{"pergunta": str, "opcoes": [str, str, ...], "correta": int (0-based), "explicacao": str}]
    """
    cards = ""
    for i, q in enumerate(perguntas):
        opts_html = ""
        for j, opt in enumerate(q["opcoes"]):
            opts_html += f'<button class="quiz-opt" data-idx="{j}" onclick="responder(this, \'{q["correta"]}\')">{escape(chr(65+j))}) {escape(opt)}</button>'
        cards += f"""
        <div class="quiz-q">
          <div class="pergunta">{i+1}. {escape(q['pergunta'])}</div>
          {opts_html}
          <div class="quiz-feedback ok">✓ Correto. {escape(q.get('explicacao',''))}</div>
          <div class="quiz-feedback no">✗ Reveja o conceito. {escape(q.get('explicacao',''))}</div>
        </div>
        """
    return f"""
    <section data-background-color="#000000">
      <p class="tech-font">[ TESTE DE COMPREENSÃO ]</p>
      <h2 class="netflix-red glow-red">Quiz Final</h2>
      <div style="max-height: 65vh; overflow-y: auto;">{cards}</div>
      <aside class="notes">Quiz auto-corretivo. Use como avaliação formativa. Pode ser refeito quantas vezes o aluno quiser.</aside>
    </section>
    """


def gerar_referencias(refs: list[str]) -> str:
    items = "".join(f"<li style='font-size:0.55em; line-height:1.5; margin-bottom:8px;'>{escape(r)}</li>" for r in refs)
    return f"""
    <section data-background-color="#0B0C10">
      <p class="tech-font">[ FONTES / ABNT ]</p>
      <h2 class="glow-cyan">Referências</h2>
      <ol>{items}</ol>
      <aside class="notes">Bibliografia obrigatória para aprofundamento. Encoraje os alunos a consultar pelo menos 1 fonte primária.</aside>
    </section>
    """


def gerar_encerramento(titulo: str, frase_impacto: str, creditos: str = "") -> str:
    return f"""
    <section data-background-color="#000000" data-transition="fade">
      <p class="tech-font">[ FIM DA TRANSMISSÃO ]</p>
      <h1 class="glow-red netflix-red">{escape(titulo)}</h1>
      <p style="font-size: 1.1em; font-style: italic; margin-top: 24px; color:#FFFFFF;">"{escape(frase_impacto)}"</p>
      <p class="tech-font" style="margin-top: 60px;">{escape(creditos)}</p>
      <aside class="notes">Slide de encerramento. Deixe a frase de impacto ressoar — silêncio de 5 segundos antes de encerrar a aula.</aside>
    </section>
    """


# ---------- validador de densidade ----------

def validar_densidade(conteudo: list[dict], min_palavras: int = 150, max_palavras: int = 450) -> list[str]:
    avisos = []
    for i, slide in enumerate(conteudo, 1):
        n = len(slide.get("texto", "").split())
        if n < min_palavras:
            avisos.append(f"⚠ Slide conteúdo #{i} ('{slide.get('titulo','?')}'): {n} palavras (mín {min_palavras}). Aluno não conseguirá autoestudo.")
        elif n > max_palavras:
            avisos.append(f"⚠ Slide conteúdo #{i} ('{slide.get('titulo','?')}'): {n} palavras (máx {max_palavras}). Vira parede de texto.")
    return avisos


# ---------- montador final ----------

def construir_aula(
    titulo: str,
    subtitulo: str,
    autor: str,
    materia: str,
    serie: str,
    objetivos: list[str],
    habilidades_bncc: list[str],
    conteudo: list[dict],
    atividades: list[dict],
    midias: list[dict],
    glossario: list[dict],
    quiz: list[dict],
    referencias: list[str],
    video_capa: str,
    duracao_min: int = 50,
    frase_final: str = "",
    graficos: list[dict] | None = None,
) -> tuple[str, list[str]]:
    """
    Retorna (html_completo, avisos_densidade)
    graficos: opcional, [{"titulo":..., "chart_id":..., "chart_config_js":..., "texto_apoio":..., "speaker_notes":..., "apos_slide": int}]
    """
    avisos = validar_densidade(conteudo)

    slides = [
        gerar_capa(titulo, subtitulo, video_capa, materia, serie),
        gerar_objetivos(objetivos, habilidades_bncc, duracao_min),
    ]

    # Inserir slides de conteúdo, com gráficos intercalados se houver
    graficos = graficos or []
    graficos_por_pos = {g["apos_slide"]: g for g in graficos}

    for i, c in enumerate(conteudo, 1):
        slides.append(gerar_slide_conteudo(
            titulo=c["titulo"],
            texto=c["texto"],
            callouts=c.get("callouts", []),
            video_bg=c.get("video_bg"),
            auto_animate_id=c.get("auto_animate_id"),
            speaker_notes=c.get("speaker_notes", ""),
            numero_capitulo=i,
        ))
        if i in graficos_por_pos:
            g = graficos_por_pos[i]
            slides.append(gerar_slide_grafico(
                titulo=g["titulo"],
                chart_id=g["chart_id"],
                chart_config_js=g["chart_config_js"],
                texto_apoio=g["texto_apoio"],
                speaker_notes=g.get("speaker_notes", ""),
            ))

    slides += [
        gerar_atividade(atividades),
        gerar_midia(midias),
        gerar_glossario(glossario),
        gerar_quiz(quiz),
        gerar_referencias(referencias),
        gerar_encerramento(titulo, frase_final or "Conhecimento muda a forma como você vê o mundo.", f"{autor} · {materia} · {serie}"),
    ]

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    html = (template
            .replace("{{TITULO}}", escape(titulo))
            .replace("{{META_DESCRIPTION}}", escape(subtitulo))
            .replace("{{AUTOR}}", escape(autor))
            .replace("{{SLIDES}}", "\n".join(slides)))

    return html, avisos


def slug(s: str) -> str:
    import re, unicodedata
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^\w\s-]", "", s).strip().lower()
    return re.sub(r"[-\s]+", "-", s)
