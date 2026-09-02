"""LC-3 Settings — env-driven configuration (pydantic-settings)."""
from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Amazon Bedrock
    bedrock_model_id: str = "anthropic.claude-3-5-sonnet-20240620-v1:0"
    aws_region: str = "us-east-1"

    # CORS
    allowed_origin: str = "http://localhost:5173"

    # AI guardrails / resiliency
    ai_timeout_s: float = 20.0
    ai_max_tokens: int = 1024
    ai_rate_limit_per_min: int = 30

    # Health cache
    health_cache_ttl_s: int = 60

    # Agent cycle thresholds
    deadline_window_days: int = 14
    inactivity_window_days: int = 7
    progress_delta_threshold: float = 5.0

    version: str = "0.1.0"


@lru_cache
def get_settings() -> Settings:
    return Settings()
