"""
Application configuration module
Database URL, JWT secret, OpenRouter API configuration, CORS settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database configuration
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/aigc_geo_overseas"

    # JWT configuration
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS configuration
    CORS_ORIGINS: list[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]

    # OpenRouter API configuration (unified AIGC gateway)
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_API_BASE: str = "https://openrouter.ai/api/v1"
    OPENROUTER_REFERER: str = "https://www.TopcentralGEO.com"
    OPENROUTER_MODELS: list = [
        "openai/gpt-4o",
        "anthropic/claude-sonnet-4",
        "x-ai/grok-3",
        "google/gemini-2.0-flash",
        "perplexity/sonar",
        "deepseek/deepseek-chat",
    ]

    # Redis configuration
    REDIS_URL: str = "redis://localhost:6379/0"

    # Application configuration
    APP_NAME: str = "AIGC GEO Overseas Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
