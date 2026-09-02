"""Dependency wiring (DI) — selects concrete AIClient / MCP impls by config (Q9)."""
from __future__ import annotations

from functools import lru_cache

from app.clients.ai_client import AIClient, BedrockAIClient
from app.clients.mcp_tools import MCPToolInterface, MockMCPTools
from app.core.config import Settings, get_settings
from app.core.rate_limit import RateLimiter
from app.data.case_repository import CaseRepository, get_repository


@lru_cache
def get_ai_client() -> AIClient:
    s: Settings = get_settings()
    return BedrockAIClient(
        model_id=s.bedrock_model_id,
        region=s.aws_region,
        timeout_s=s.ai_timeout_s,
        max_tokens=s.ai_max_tokens,
    )


@lru_cache
def get_mcp_tools() -> MCPToolInterface:
    return MockMCPTools()


@lru_cache
def get_rate_limiter() -> RateLimiter:
    return RateLimiter(per_minute=get_settings().ai_rate_limit_per_min)


def get_repo() -> CaseRepository:
    return get_repository()
