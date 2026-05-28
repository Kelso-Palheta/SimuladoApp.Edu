#!/usr/bin/env python3
"""
Servidor de desenvolvimento local para Horário Escolar.

Faz 2 coisas:
1. Serve arquivos estáticos (substitui `python -m http.server`)
2. Proxy para /api/maritaca-assistant → API Maritaca AI (resolve CORS)

Uso:
    python3 dev-server.py [porta]

Padrão: porta 8000
"""

import http.server
import json
import os
import ssl
import sys
import urllib.request
import urllib.error
from pathlib import Path

# Fix SSL cert verification on macOS (uses system certs via certifi if available)
try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    # Fallback: unverified context for dev (NOT for production)
    SSL_CONTEXT = ssl.create_default_context()
    SSL_CONTEXT.check_hostname = False
    SSL_CONTEXT.verify_mode = ssl.CERT_NONE

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# Carregar variáveis do .env.local
ENV = {}
env_file = Path(__file__).parent / '.env.local'
if env_file.exists():
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            ENV[k.strip()] = v.strip()

MARITACA_KEY = ENV.get('MARITACA_API_KEY') or ENV.get('VITE_MARITACA_API_KEY', '')
MARITACA_URL = 'https://chat.maritaca.ai/api/chat/completions'


SYSTEM_PROMPT = """Você é um(a) coordenador(a) pedagógico(a) especialista em horários escolares de Ensino Médio Integral com salas temáticas por área de conhecimento (BNCC).

CONTEXTO:
- Modelo: Tempo Integral com salas-ambiente temáticas
- Alunos se deslocam entre salas a cada aula
- Cada professor leciona em salas da SUA área

ÁREAS (BNCC):
- Linguagens: Português, Inglês, Arte, Ed. Física, Literatura
- Matemática: Matemática
- Natureza: Biologia, Química, Física
- Humanas: História, Geografia, Filosofia, Sociologia
- Itinerários: Eletivas, Aprofundamentos, PPA, Clubes

REGRAS:
1. Um professor NÃO pode estar em duas turmas no mesmo horário
2. Uma turma NÃO pode ter duas aulas no mesmo horário
3. Disciplinas pesadas (Mat, Port) preferencialmente nas primeiras aulas
4. Cada professor leciona em sua sala temática

Seja conciso. Se retornar dados estruturados, use JSON em bloco ```json. Use português do Brasil."""


def build_user_prompt(action, payload):
    user_msg = payload.get('userMessage', '')
    school = payload.get('schoolData', {})
    pdf_text = payload.get('pdfText', '')

    if action == 'parse_pdf':
        prof_list = ', '.join(school.get('profs', []))
        sala_list = ', '.join(school.get('salas', []))
        prof_sala = {}
        for s in school.get('slots', []):
            if s.get('prof') and s.get('sala') and s['prof'] not in prof_sala:
                prof_sala[s['prof']] = s['sala']
        prof_sala_str = ', '.join(f"{p}={s}" for p, s in prof_sala.items())

        return f"""Analise o texto do PDF e retorne JSON com TODOS os slots de aula identificados.

TEXTO DO PDF (truncado):
\"\"\"
{pdf_text[:8000]}
\"\"\"

PROFESSORES CADASTRADOS: {prof_list}
SALAS DISPONÍVEIS: {sala_list}
MAPEAMENTO ATUAL PROFESSOR→SALA: {prof_sala_str}

INSTRUÇÕES:
1. Identifique cada aula (turma, dia, número da aula, professor, disciplina)
2. Aloque a sala temática de cada professor baseado no mapeamento acima
3. Se prof do PDF NÃO está cadastrado, use o nome dele e deixe sala como ""
4. NÃO INVENTE dados

RETORNE JSON em bloco ```json:
{{
  "slots": [
    {{"dia": "Segunda", "aula": 1, "turma": "1º ANO - 101", "prof": "NOME", "disc": "Disciplina", "sala": "Sala X"}}
  ],
  "professores_nao_cadastrados": ["nome1"],
  "observacoes": "Observações"
}}"""

    if action == 'apply_change':
        slots_preview = json.dumps(school.get('slots', [])[:30], ensure_ascii=False, indent=2)
        return f"""O usuário quer fazer a mudança:

PEDIDO: "{user_msg}"

ESTADO ATUAL:
- Total slots: {len(school.get('slots', []))}
- Turmas: {', '.join(school.get('turmas', []))}
- Professores: {', '.join(school.get('profs', []))}
- Slots (primeiros 30):
{slots_preview}

INSTRUÇÕES:
1. Entenda o pedido
2. Identifique quais slots modificar
3. Aplique respeitando regras

RETORNE JSON em bloco ```json:
{{
  "slots_alterados": [...],
  "slots_removidos": [{{"dia": "...", "aula": N, "turma": "..."}}],
  "explicacao": "O que foi feito",
  "alertas": ["Aviso 1"]
}}"""

    if action == 'resolve_conflicts':
        return f"""Analise o horário e identifique/resolva conflitos.

DADOS:
{json.dumps(school, ensure_ascii=False, indent=2)[:6000]}

RETORNE JSON em bloco ```json:
{{
  "conflitos_encontrados": [{{"tipo": "...", "descricao": "..."}}],
  "resolucoes_sugeridas": [{{"acao": "...", "justificativa": "..."}}]
}}"""

    # Default: chat
    return f"""Usuário pergunta: "{user_msg}"

CONTEXTO:
- Escola: {school.get('meta', {}).get('nome_escola', 'Escola')}
- Total slots: {len(school.get('slots', []))}
- Turmas: {', '.join(school.get('turmas', []))}
- Professores: {', '.join(school.get('profs', []))}

Responda de forma conversacional, prática e curta."""


def try_extract_json(text):
    if not text:
        return None
    import re
    # Try code block
    m = re.search(r'```json\s*([\s\S]*?)\s*```', text)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    # Try raw JSON object
    m = re.search(r'\{[\s\S]*\}', text)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            pass
    return None


class Handler(http.server.SimpleHTTPRequestHandler):

    def end_headers(self):
        # CORS headers para todos os responses
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/maritaca-assistant':
            self.handle_maritaca()
        else:
            self.send_error(404, 'Endpoint not found')

    def handle_maritaca(self):
        try:
            if not MARITACA_KEY:
                return self.send_json(500, {'error': 'MARITACA_API_KEY não configurada em .env.local'})

            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            payload = json.loads(body)

            action = payload.get('action', 'chat')
            model = payload.get('model', 'sabia-3')

            messages = [
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': build_user_prompt(action, payload)}
            ]

            req_body = json.dumps({
                'model': model,
                'messages': messages,
                'temperature': 0.3,
                'max_tokens': 4000
            }).encode('utf-8')

            req = urllib.request.Request(
                MARITACA_URL,
                data=req_body,
                headers={
                    'Authorization': f'Key {MARITACA_KEY}',
                    'Content-Type': 'application/json'
                },
                method='POST'
            )

            print(f'[Maritaca] Action: {action} | Model: {model}')

            with urllib.request.urlopen(req, timeout=120, context=SSL_CONTEXT) as resp:
                resp_data = json.loads(resp.read())

            ai_message = ''
            try:
                ai_message = resp_data['choices'][0]['message']['content']
            except (KeyError, IndexError):
                pass

            extracted = try_extract_json(ai_message)

            usage = resp_data.get('usage', {})
            print(f'[Maritaca] Response: {usage.get("total_tokens", "?")} tokens')

            self.send_json(200, {
                'ok': True,
                'message': ai_message,
                'data': extracted,
                'usage': usage,
                'model': resp_data.get('model', model)
            })

        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            print(f'[Maritaca] HTTP Error {e.code}: {err_body}')
            self.send_json(e.code, {'error': f'Maritaca API error {e.code}', 'details': err_body})
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.send_json(500, {'error': str(e)})

    def send_json(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    os.chdir(Path(__file__).parent)

    if not MARITACA_KEY:
        print('⚠️  AVISO: MARITACA_API_KEY não encontrada em .env.local')
        print('   Assistente IA não vai funcionar.')
    else:
        print(f'✅ Maritaca API Key carregada ({MARITACA_KEY[:20]}...)')

    print(f'\n🚀 Servidor rodando em http://localhost:{PORT}')
    print(f'   Endpoint IA: http://localhost:{PORT}/api/maritaca-assistant')
    print(f'   Ctrl+C para parar\n')

    server = http.server.HTTPServer(('', PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n👋 Parando servidor...')
        server.shutdown()


if __name__ == '__main__':
    main()
