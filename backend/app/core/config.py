from __future__ import annotations

import os
from dataclasses import dataclass


DIFFICULTY_SPEEDS = {
    "easy": 180,
    "normal": 130,
    "hard": 90,
}

BOARD_WIDTH = 20
BOARD_HEIGHT = 20
DEFAULT_DIFFICULTY = "normal"
MAX_PLAYER_NAME_LENGTH = 16
MAX_SCORE = 999_999
DEFAULT_SCORE_LIMIT = 10
MAX_SCORE_LIMIT = 50


@dataclass(frozen=True)
class Settings:
    db_path: str = os.getenv("SNAKE_DB_PATH", "backend/data/snake_scores.db")
    allowed_origin: str = os.getenv("ALLOWED_ORIGIN", "*")
