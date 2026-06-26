from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class ScoreRepository:
    def __init__(self, db_path: str) -> None:
        self.db_path = db_path
        self._memory_connection: sqlite3.Connection | None = None

    def initialize(self, seed: bool = True) -> None:
        if self.db_path != ":memory:":
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS scores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_name TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    difficulty TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_scores_rank ON scores(score DESC, created_at ASC)"
            )
            row = connection.execute("SELECT COUNT(*) AS total FROM scores").fetchone()
            if seed and int(row["total"]) == 0:
                self._seed_defaults(connection)

    def add_score(self, player_name: str, score: int, difficulty: str) -> dict[str, Any]:
        created_at = datetime.now(timezone.utc).isoformat()
        with self._connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO scores (player_name, score, difficulty, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (player_name, score, difficulty, created_at),
            )
            return self.get_score(cursor.lastrowid)

    def get_score(self, score_id: int) -> dict[str, Any]:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT id, player_name, score, difficulty, created_at
                FROM scores
                WHERE id = ?
                """,
                (score_id,),
            ).fetchone()
        if row is None:
            raise LookupError(f"Score {score_id} was not found")
        return self._to_record(row)

    def list_scores(self, limit: int) -> list[dict[str, Any]]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT id, player_name, score, difficulty, created_at
                FROM scores
                ORDER BY score DESC, created_at ASC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [self._to_record(row) for row in rows]

    def count(self) -> int:
        with self._connect() as connection:
            row = connection.execute("SELECT COUNT(*) AS total FROM scores").fetchone()
        return int(row["total"])

    def _connect(self) -> sqlite3.Connection:
        if self.db_path == ":memory:":
            if self._memory_connection is None:
                self._memory_connection = sqlite3.connect(":memory:", check_same_thread=False)
                self._memory_connection.row_factory = sqlite3.Row
            return self._memory_connection
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _seed_defaults(self, connection: sqlite3.Connection) -> None:
        now = datetime.now(timezone.utc).isoformat()
        connection.executemany(
            """
            INSERT INTO scores (player_name, score, difficulty, created_at)
            VALUES (?, ?, ?, ?)
            """,
            [
                ("NEON ACE", 240, "normal", now),
                ("GRID RUNNER", 180, "easy", now),
                ("BYTE VIPER", 320, "hard", now),
            ],
        )

    def _to_record(self, row: sqlite3.Row) -> dict[str, Any]:
        return {
            "id": row["id"],
            "playerName": row["player_name"],
            "score": row["score"],
            "difficulty": row["difficulty"],
            "createdAt": row["created_at"],
        }
