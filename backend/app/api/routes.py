from __future__ import annotations

from fastapi import APIRouter, Query, Request

from app.core.config import DEFAULT_SCORE_LIMIT, MAX_SCORE_LIMIT
from app.models.schemas import ScoreCreate
from app.services.game_config_service import GameConfigService
from app.services.score_service import ScoreService

router = APIRouter(prefix="/api")


def ok(data: object, msg: str = "ok") -> dict[str, object]:
    return {"code": 200, "msg": msg, "data": data}


def get_score_service(request: Request) -> ScoreService:
    return request.app.state.score_service


@router.get("/health")
def health() -> dict[str, object]:
    return ok({"status": "healthy"})


@router.get("/game/config")
def game_config() -> dict[str, object]:
    return ok(GameConfigService().get_config())


@router.get("/scores")
def list_scores(
    request: Request,
    limit: int = Query(DEFAULT_SCORE_LIMIT, ge=1, le=MAX_SCORE_LIMIT),
) -> dict[str, object]:
    service = get_score_service(request)
    return ok(service.list_scores(limit=limit))


@router.post("/scores", status_code=201)
def submit_score(request: Request, payload: ScoreCreate) -> dict[str, object]:
    service = get_score_service(request)
    return {"code": 201, "msg": "score created", "data": service.submit_score(payload)}
