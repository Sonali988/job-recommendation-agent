"""FastAPI application entry point for YuvaMitra backend (U2).

Wires CORS (LC-10), correlation/logging middleware (LC-1/2), global error
handlers (LC-8), and the API router. Loads seed data at startup.
"""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings
from app.core.di import get_repo
from app.core.errors import register_error_handlers
from app.core.logging import CorrelationMiddleware, configure_logging, get_logger, log_event


def create_app() -> FastAPI:
    configure_logging()
    settings = get_settings()
    app = FastAPI(title="YuvaMitra Backend", version=settings.version)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.allowed_origin],
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    app.add_middleware(CorrelationMiddleware)

    register_error_handlers(app)
    app.include_router(router)

    @app.on_event("startup")
    def _startup() -> None:  # pragma: no cover - trivial
        get_repo()  # load + index seed data once
        log_event(get_logger(), "startup_complete", version=settings.version)

    return app


app = create_app()
