"""FastAPI application entry point for YuvaMitra backend (U2).

Wires CORS (LC-10), correlation/logging middleware (LC-1/2), global error
handlers (LC-8), and the API router. Loads seed data at startup.
"""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.adapter_routes import router as adapter_router
from app.api.routes import router
from app.core.config import get_settings
from app.core.di import get_repo
from app.core.errors import register_error_handlers
from app.core.logging import CorrelationMiddleware, configure_logging, get_logger, log_event


@asynccontextmanager
async def _lifespan(app: FastAPI):
    get_repo()  # load + index seed data once
    log_event(get_logger(), "startup_complete", version=get_settings().version)
    yield


def create_app() -> FastAPI:
    configure_logging()
    settings = get_settings()
    app = FastAPI(title="YuvaMitra Backend", version=settings.version, lifespan=_lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.allowed_origin],
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )
    app.add_middleware(CorrelationMiddleware)

    register_error_handlers(app)
    # Adapter routes first so their shapes take precedence for shared paths
    # (/api/chat, /api/assessment, /api/gap-analysis) that the frontend calls.
    app.include_router(adapter_router)
    app.include_router(router)
    return app


app = create_app()
