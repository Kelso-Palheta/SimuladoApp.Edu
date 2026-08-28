"""
WSGI Config (src/apresentacao/wsgi.py)
Ponto de entrada para servidores WSGI (Gunicorn).
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.apresentacao.settings")

application = get_wsgi_application()
