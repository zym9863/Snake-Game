from __future__ import annotations

from app.core.config import (
    BOARD_HEIGHT,
    BOARD_WIDTH,
    DEFAULT_DIFFICULTY,
    DEFAULT_SCORE_LIMIT,
    DIFFICULTY_SPEEDS,
    MAX_PLAYER_NAME_LENGTH,
)


class GameConfigService:
    def get_config(self) -> dict[str, object]:
        return {
            "boardWidth": BOARD_WIDTH,
            "boardHeight": BOARD_HEIGHT,
            "defaultDifficulty": DEFAULT_DIFFICULTY,
            "difficultySpeeds": DIFFICULTY_SPEEDS,
            "maxPlayerNameLength": MAX_PLAYER_NAME_LENGTH,
            "leaderboardLimit": DEFAULT_SCORE_LIMIT,
        }
