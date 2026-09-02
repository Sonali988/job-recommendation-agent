"""LC-1 CorrelationMiddleware + LC-2 StructuredLogger.

Structured JSON logs to stdout with a per-request correlation id. No PII/secrets.
"""
from __future__ import annotations

import json
import logging
import sys
import time
import uuid
from contextvars import ContextVar

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

_correlation_id: ContextVar[str] = ContextVar("correlation_id", default="-")


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(record.created)),
            "level": record.levelname,
            "correlation_id": _correlation_id.get(),
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["error"] = self.formatException(record.exc_info)
        extra = getattr(record, "extra_fields", None)
        if extra:
            payload.update(extra)
        return json.dumps(payload, ensure_ascii=False)


_configured = False


def configure_logging() -> None:
    global _configured
    if _configured:
        return
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_JsonFormatter())
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(logging.INFO)
    _configured = True


def get_logger(name: str = "yuvamitra") -> logging.Logger:
    configure_logging()
    return logging.getLogger(name)


def log_event(logger: logging.Logger, message: str, **fields) -> None:
    """Log a structured event. Callers must not pass PII/secret values."""
    logger.info(message, extra={"extra_fields": fields})


class CorrelationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        cid = request.headers.get("x-correlation-id") or uuid.uuid4().hex[:12]
        token = _correlation_id.set(cid)
        logger = get_logger()
        start = time.perf_counter()
        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start) * 1000, 1)
            log_event(
                logger,
                "request",
                method=request.method,
                path=request.url.path,
                status=response.status_code,
                duration_ms=duration_ms,
            )
            response.headers["x-correlation-id"] = cid
            return response
        finally:
            _correlation_id.reset(token)
