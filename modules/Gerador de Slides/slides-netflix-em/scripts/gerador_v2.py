"""
gerador_v2.py — Versão V3.0 "THE DISRUPTOR".
Foco em Impacto Monumental e Narrativa Visual.
"""
from pathlib import Path
from html import escape
import re

TEMPLATE_PATH = Path(__file__).resolve().parent.parent / "assets" / "template_base.html"

def gerar_capa_v3(titulo, subtitulo, image_bg, materia, serie):
    return f"""
    <section data-background-image="{escape(image_bg)}" data-background-size="cover">
      <div style="text-align: left; padding-left: 100px;">
        <p class="reveal-impact" style="color: var(--accent); font-family: 'Space Grotesk'; letter-spacing: 10px; font-weight: 700;">[ {escape(materia.upper())} // {escape(serie.upper())} ]</p>
        <h1 class="glitch reveal-impact" data-text="{escape(titulo)}">{escape(titulo)}</h1>
        <div style="width: 200px; height: 10px; background: var(--primary); margin: 40px 0;" class="reveal-impact"></div>
        <p class="reveal-type" style="font-size: 2em; max-width: 1000px; line-height: 1.2;">{escape(subtitulo)}</p>
      </div>
    </section>
    """

def gerar_cena_v3(titulo, texto, callouts=None, image_bg=None, video_bg=None, index=1):
    callouts = callouts or []
    bg_attr = f'data-background-video="{escape(video_bg)}"' if video_bg else f'data-background-image="{escape(image_bg)}"'
    
    callouts_html = ""
    for c in callouts:
        callouts_html += f"""
        <div class="disruptor-card" style="margin-bottom: 30px;">
          <span style="color: var(--accent); font-family: 'Space Grotesk'; font-size: 0.8em;"># {escape(c.get('label', 'DATA'))}</span>
          <p style="margin-top: 15px; font-size: 1.1em; color: #fff;">{escape(c.get('texto', ''))}</p>
        </div>
        """

    paragraphs = "".join([f"<p class='reveal-impact' style='margin-bottom: 30px; font-size: 1.4em;'>{escape(p.strip())}</p>" for p in texto.split('\n\n') if p.strip()])

    return f"""
    <section {bg_attr} data-background-size="cover">
      <div class="grid-container">
        <div class="content-text">
          <h2 class="reveal-impact">{escape(titulo)}</h2>
          {paragraphs}
        </div>
        <div style="padding-left: 20px;">
          {callouts_html}
        </div>
      </div>
    </section>
    """

def construir_aula_v2(titulo, subtitulo, autor, materia, serie, objetivos, habilidades_bncc, conteudo, atividades, midias, glossario, quiz, referencias, video_capa, image_capa=None, duracao_min=50, frase_final=""):
    slides = []
    slides.append(gerar_capa_v3(titulo, subtitulo, image_capa, materia, serie))
    
    for i, c in enumerate(conteudo, 1):
        slides.append(gerar_cena_v3(
            titulo=c["titulo"],
            texto=c["texto"],
            callouts=c.get("callouts", []),
            image_bg=c.get("image_bg"),
            video_bg=c.get("video_bg"),
            index=i
        ))

    # Slide de Encerramento Brutalista
    slides.append(f"""
    <section data-background-color="#000">
      <h1 class="reveal-impact" style="font-size: 15em !important; opacity: 0.05; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; text-align: center;">FIM</h1>
      <div style="position: relative; z-index: 2; text-align: center;">
        <h2 class="reveal-impact">{escape(titulo)}</h2>
        <p class="reveal-type" style="font-size: 2em; color: var(--accent);">{escape(frase_final)}</p>
        <p class="reveal-impact" style="margin-top: 100px; opacity: 0.5;">{escape(autor)} // {escape(materia)}</p>
      </div>
    </section>
    """)

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    html = (template
            .replace("{{TITULO}}", escape(titulo))
            .replace("{{META_DESCRIPTION}}", escape(subtitulo))
            .replace("{{AUTOR}}", escape(autor))
            .replace("{{SLIDES}}", "\n".join(slides)))

    return html, []

def slug(s):
    import unicodedata
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^\w\s-]", "", s).strip().lower()
    return re.sub(r"[-\s]+", "-", s)
