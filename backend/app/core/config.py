"""LC-3 Settings — env-driven configuration (pydantic-settings).

We also load the .env file into os.environ at import time so that boto3 (which
reads AWS credentials from the process environment / ~/.aws, not from our
Settings object) can pick up AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / etc.
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Load backend/.env into os.environ (does not overwrite already-set vars).
try:
    from dotenv import load_dotenv

    _ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
    load_dotenv(dotenv_path=_ENV_PATH, override=False)
except Exception:  # noqa: BLE001 - dotenv optional; env may be set by the shell
    pass


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parents[2] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

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
