#!/bin/bash
set -e

echo "🚀 Iniciando Backend Django REST — RotinaDocente..."

# Aguarda o banco MySQL estar acessível se configurado
if [ "$DB_ENGINE" = "mysql" ]; then
    echo "⏳ Aguardando banco de dados MySQL ($DB_HOST:$DB_PORT)..."
    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 1
    done
    echo "✅ Banco de dados MySQL conectado!"
fi

echo "📦 Executando migrações do banco de dados..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "🎨 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput --clear || true

echo "🔥 Iniciando servidor Gunicorn na porta 8000..."
exec gunicorn core.wsgi:application \
    --name rotinadocente_api \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --threads 2 \
    --timeout 120 \
    --log-level info \
    --access-logfile - \
    --error-logfile -
