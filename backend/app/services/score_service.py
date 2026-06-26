from __future__ import annotations

import logging

from app.core.config import DEFAULT_SCORE_LIMIT, MAX_SCORE_LIMIT
from app.models.schemas import ScoreCreate
from app.repositories.score_repository import ScoreRepository

logger = logging.getLogger(__name__)


class ScoreService:
    def __init__(self, repository: ScoreRepository) -> None:
        self.repository = repository

    def submit_score(self, payload: ScoreCreate) -> dict[str, object]:
        logger.info(
            "Submitting score",
            extra={
                "player_name": payload.player_name,
                "score": payload.score,
                "difficulty": payload.difficulty,
            },
        )
        return self.repository.add_score(
            player_name=payload.player_name,
            score=payload.score,
            difficulty=payload.difficulty,
        )

    def list_scores(self, limit: int = DEFAULT_SCORE_LIMIT) -> list[dict[str, object]]:
        if limit < 1 or limit > MAX_SCORE_LIMIT:
            raise ValueError(f"limit must be between 1 and {MAX_SCORE_LIMIT}")
        return self.repository.list_scores(limit=limit)
