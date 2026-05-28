"""
gerador_impress.py — Motor de Apresentação 3D (Impress.js)
Foco em voos de câmera e espaço infinito.
"""
from pathlib import Path
from html import escape
import re
import math

TEMPLATE_PATH = Path(__file__).resolve().parent.parent / "assets" / "template_impress.html"

def gerar_fundo(image_bg=None, video_bg=None):
    if video_bg:
        return f'''
        <div class="bg-layer">
            <video autoplay loop muted playsinline>
                <source src="{escape(video_bg)}" type="video/mp4">
            </video>
        </div>
        <div class="bg-overlay"></div>
        '''
    elif image_bg:
        return f'''
        <div class="bg-layer">
            <img src="{escape(image_bg)}" alt="Background">
        </div>
        <div class="bg-overlay"></div>
        '''
    return ''

def gerar_capa(titulo, subtitulo, image_bg, materia, serie):
    # Capa centralizada no 0,0
    fundo = gerar_fundo(image_bg=image_bg)
    return f"""
    <div id="capa" class="step glass-container capa-container" data-x="0" data-y="0" data-z="0" data-scale="2">
        {fundo}
        <div class="content-layer" style="text-align: center;">
            <p style="color: var(--accent); font-family: 'Space Grotesk'; letter-spacing: 5px; font-weight: 700; margin-bottom: 30px;">[ {escape(materia.upper())} // {escape(serie.upper())} ]</p>
            <h1 class="glitch" data-text="{escape(titulo)}" style="font-size: 6em;">{escape(titulo)}</h1>
            <div style="width: 150px; height: 5px; background: var(--primary); margin: 40px auto;"></div>
            <p style="font-size: 1.5em; max-width: 800px; margin: 0 auto;">{escape(subtitulo)}</p>
            <p style="margin-top: 50px; font-size: 0.8em; color: #888;">[ Use as Setas ou Espaço para Viajar ]</p>
        </div>
    </div>
    """

def gerar_cena(titulo, texto, callouts=None, image_bg=None, video_bg=None, step_id="step-1", x=0, y=0, z=0, rot_x=0, rot_y=0, rot_z=0, scale=1):
    callouts = callouts or []
    fundo = gerar_fundo(image_bg=image_bg, video_bg=video_bg)
    
    callouts_html = ""
    for c in callouts:
        callouts_html += f"""
        <div class="callout-card fragment">
          <span style="color: var(--accent); font-family: 'Space Grotesk'; font-size: 0.8em;"># {escape(c.get('label', 'DATA'))}</span>
          <p style="margin-top: 10px; font-size: 1em; color: #fff;">{escape(c.get('texto', ''))}</p>
        </div>
        """

    paragraphs = "".join([f"<p class='fragment'>{escape(p.strip())}</p>" for p in texto.split('\n\n') if p.strip()])

    return f"""
    <div id="{step_id}" class="step glass-container" data-x="{x}" data-y="{y}" data-z="{z}" data-rotate-x="{rot_x}" data-rotate-y="{rot_y}" data-rotate-z="{rot_z}" data-scale="{scale}">
        {fundo}
        <div class="content-layer">
            <h2>{escape(titulo)}</h2>
            <div class="grid-layout">
                <div>{paragraphs}</div>
                <div>{callouts_html}</div>
            </div>
        </div>
    </div>
    """

def construir_aula_impress(titulo, subtitulo, autor, materia, serie, conteudo, image_capa=None, frase_final=""):
    slides = []
    # Capa com escala maior (4) para impacto inicial
    slides.append(gerar_capa(titulo, subtitulo, image_capa, materia, serie))
    
    # Lógica de Passeio 3D Cinemático e Imprevisível
    # Evita tontura mantendo Z progressivo, mas varia X, Y, 3D Rotations e Scale
    presets = [
        # (x, y, rot_x, rot_y, rot_z, scale)
        (2500, 0, 0, 35, 0, 1.0),          # 1. Pan Lateral Direita + Giro Y (Giro de página)
        (0, 2000, 40, 0, 90, 0.8),          # 2. Mergulho vertical + Torção 90 + Zoom In
        (-2500, 0, 0, -35, 180, 1.5),       # 3. Recuo horizontal + Giro Y + Zoom Out (Visão ampla)
        (0, -2000, -30, 30, -90, 1.0),      # 4. Ascensão Diagonal + Inclinação dupla
        (2000, 2000, 20, 20, 45, 0.75),     # 5. Giro inclinado em close-up
        (-2000, -2000, -20, -20, -45, 2.0), # 6. Grande Angular Macro (Afastamento dramático)
    ]
    
    profundidade_z = -1800
    
    for i, c in enumerate(conteudo, 1):
        preset = presets[(i-1) % len(presets)]
        x = preset[0]
        y = preset[1]
        z = i * profundidade_z
        rot_x = preset[2]
        rot_y = preset[3]
        rot_z = preset[4]
        scale = preset[5]
        
        slides.append(gerar_cena(
            titulo=c["titulo"],
            texto=c["texto"],
            callouts=c.get("callouts", []),
            image_bg=c.get("image_bg"),
            video_bg=c.get("video_bg"),
            step_id=f"capitulo-{i}",
            x=x, y=y, z=z, 
            rot_x=rot_x, rot_y=rot_y, rot_z=rot_z,
            scale=scale
        ))

    # Slide Final no fundo do abismo 3D
    z_final = (len(conteudo) + 1) * profundidade_z - 2000
    slides.append(f"""
    <div id="fim" class="step" data-x="0" data-y="0" data-z="{z_final}" data-scale="4" style="text-align: center;">
        <h1 style="font-size: 8em; opacity: 0.1; position: absolute; width: 100%; top: -100px;">FIM</h1>
        <h2 style="font-size: 3em;">{escape(titulo)}</h2>
        <p style="color: var(--accent); font-size: 1.5em; margin: 40px 0;">"{escape(frase_final)}"</p>
        <p style="color: #666; font-size: 1em;">{escape(autor)} // {escape(materia)}</p>
    </div>
    """)

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    html = (template
            .replace("{{TITULO}}", escape(titulo))
            .replace("{{SLIDES}}", "\n".join(slides)))

    return html, []

def slug(s):
    s = re.sub(r"[^\w\s-]", "", s).strip().lower()
    return re.sub(r"[-\s]+", "-", s)
