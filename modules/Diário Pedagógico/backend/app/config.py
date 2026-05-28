from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Aula Gamificada API"
    environment: str = "development"
    secret_key: str = "change-me-in-production"

    database_url: str = "postgresql://aula:aula@localhost:5432/aula_gamificada"

    gemini_api_key: str = ""
    openai_api_key: str = ""

    google_client_id: str = ""
    google_client_secret: str = ""

    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = "../.env"
        extra = "ignore"


settings = Settings()
