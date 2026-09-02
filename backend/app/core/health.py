"""LC-11 HealthProvider — shallow health + cached Bedrock reachability (RP-6)."""
from __future__ import annotations

import time

from app.clients.ai_client import AIClient
from app.core.config import get_settings
from app.data.models import HealthStatus


class HealthProvider:
    def __init__(self, ai: AIClient):
        self._ai = ai
        self._cached_flag = "unknown"
        self._checked_at = 0.0

    def status(self) -> HealthStatus:
        settings = get_settings()
        now = time.monotonic()
        if now - self._checked_at >= settings.health_cache_ttl_s:
            # Cheap, non-paid reachability signal: client constructed successfully.
            self._cached_flag = "reachable" if self._ai.is_available() else "unavailable"
            self._checked_at = now
        return HealthStatus(status="ok", bedrock=self._cached_flag, version=settings.version)
