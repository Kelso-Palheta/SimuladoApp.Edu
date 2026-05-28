"""
exportar_pdf.py — Converte a apresentação HTML do Reveal.js em PDF para impressão.
Requer: pip install playwright && playwright install
"""
import sys
import os
from urllib.parse import urljoin
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("ERRO: Biblioteca 'playwright' não está instalada. Execute: pip install playwright && playwright install chromium")
    sys.exit(1)

def exportar_html_para_pdf(caminho_html):
    path_obj = Path(caminho_html).resolve()
    if not path_obj.exists():
        print(f"ERRO: Arquivo {caminho_html} não encontrado.")
        return

    # O Reveal.js tem um recurso nativo de impressão via sufixo ?print-pdf
    file_url = f"file://{path_obj}?print-pdf"
    output_pdf = path_obj.with_suffix('.pdf')

    print(f"Gerando PDF a partir de {path_obj.name}...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = browser.new_page()
        
        # Acessa a URL
        page.goto(file_url, wait_until="networkidle")
        
        # Gera o PDF
        page.pdf(
            path=str(output_pdf),
            width="1920px",
            height="1080px",
            print_background=True,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"}
        )
        browser.close()

    print(f"✓ PDF gerado com sucesso: {output_pdf.name}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python exportar_pdf.py caminho/para/arquivo.html")
        sys.exit(1)
    
    exportar_html_para_pdf(sys.argv[1])
