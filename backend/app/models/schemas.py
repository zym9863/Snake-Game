from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.config import MAX_PLAYER_NAME_LENGTH, MAX_SCORE

Difficulty = Literal["easy", "normal", "hard"]


class ApiResponse(BaseModel):
    code: int
    msg: str
    data: object | None


class HealthData(BaseModel):
    status: str


class GameConfigData(BaseModel):
    boardWidth: int
    boardHeight: int
    defaultDifficulty: Difficulty
    difficultySpeeds: dict[str, int]
    maxPlayerNameLength: int
    leaderboardLimit: int


class ScoreCreate(BaseModel):
    player_name: str = Field(
        alias="playerName",
        min_length=1,
        max_length=MAX_PLAYER_NAME_LENGTH,
    )
    score: int = Field(ge=0, le=MAX_SCORE)
    difficulty: Difficulty

    model_config = ConfigDict(populate_by_name=True)

    @field_validator("player_name")
    @classmethod
    def clean_player_name(cls, value: str) -> str:
        cleaned = " ".join(value.strip().split())
        if not cleaned:
            raise ValueError("Player name is required")
        return cleaned


class ScoreRecord(BaseModel):
    id: int
    playerName: str
    score: int
    difficulty: Difficulty
    createdAt: datetime
