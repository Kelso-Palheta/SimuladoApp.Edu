.PHONY: dev backend-dev frontend-dev db-migrate db-upgrade db-downgrade test build clean

dev:
	docker-compose up -d

backend-dev:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend-dev:
	cd frontend && npm run dev

db-migrate:
	cd backend && alembic revision --autogenerate -m "auto"

db-upgrade:
	cd backend && alembic upgrade head

db-downgrade:
	cd backend && alembic downgrade -1

test:
	cd backend && pytest -v

build:
	docker-compose build

clean:
	docker-compose down -v
