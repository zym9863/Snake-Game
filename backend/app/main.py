from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import Settings
from app.repositories.score_repository import ScoreRepository
from app.services.score_service import ScoreService


def create_app(db_path: str | None = None, seed: bool = True) -> FastAPI:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    settings = Settings(db_path=db_path or Settings().db_path)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        repository = ScoreRepository(settings.db_path)
        repository.initialize(seed=seed)
        app.state.score_service = ScoreService(repository)
        yield

    app = FastAPI(title="Snake Game API", version="1.0.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.allowed_origin] if settings.allowed_origin != "*" else ["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        first_error = exc.errors()[0] if exc.errors() else {}
        location = ".".join(str(part) for part in first_error.get("loc", []))
        message = first_error.get("msg", "Invalid request")
        detail = f"{location}: {message}" if location else message
        return JSONResponse(status_code=422, content={"code": 422, "msg": detail, "data": None})

    @app.exception_handler(HTTPException)
    async def http_error_handler(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"code": exc.status_code, "msg": str(exc.detail), "data": None},
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"code": 400, "msg": str(exc), "data": None})

    @app.exception_handler(Exception)
    async def unexpected_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logging.exception("Unhandled API error", exc_info=exc)
        return JSONResponse(
            status_code=500,
            content={"code": 500, "msg": "Internal server error", "data": None},
        )

    app.include_router(router)
    return app


app = create_app()
