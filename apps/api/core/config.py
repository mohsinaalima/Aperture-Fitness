import os
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

API_ENV = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
ROOT_ENV = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")

class Settings(BaseSettings):
    APP_NAME: str = "Aperture Fitness API"
    FRONTEND_URL: str = "http://localhost:3000"
    DATABASE_URL: str
    ENVIRONMENT: Literal["development", "staging", "production"] = "production"
    AUTH_SESSION_COOKIE: str = "aperture_session"
    AUTH_SESSION_EXPIRE_DAYS: int = Field(default=7, ge=1, le=90)
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_REDIRECT_URI: str | None = None

    model_config = SettingsConfigDict(
        env_file=(ROOT_ENV, API_ENV),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
