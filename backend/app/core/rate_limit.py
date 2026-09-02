"""LC-6 RateLimiter — lightweight in-process fixed-window limiter (SECURITY-11).

Applied to AI endpoints to cap accidental Bedrock cost spikes.
"""
from __future__ import annotations

import threading
import time


class RateLimiter:
    def __init__(self, per_minute: int):
        self.per_minute = max(1, per_minute)
        self._lock = threading.Lock()
        self._window_start = time.monotonic()
        self._count = 0

    def allow(self) -> bool:
        with self._lock:
            now = time.monotonic()
            if now - self._window_start >= 60.0:
                self._window_start = now
                self._count = 0
            if self._count >= self.per_minute:
                return False
            self._count += 1
            return True
