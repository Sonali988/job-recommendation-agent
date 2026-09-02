"""LC-8 GlobalErrorHandler — fail closed, generic messages (SECURITY-15)."""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.logging import get_logger


class NotFoundError(Exception):
    def __init__(self, message: str = "Resource not found"):
        self.message = message


def register_error_handlers(app: FastAPI) -> None:
    logger = get_logger()

    @app.exception_handler(NotFoundError)
    async def _not_found(_: Request, exc: NotFoundError):
        return JSONResponse(status_code=404, content={"error": "not_found", "detail": exc.message})

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception):
        # Log internal detail; never leak it to the client (fail closed).
        logger.exception("unhandled_error")
        return JSONResponse(
            status_code=500,
            content={"error": "internal_error", "detail": "An unexpected error occurred."},
        )
