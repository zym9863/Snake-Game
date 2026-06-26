# Neon Snake Arcade

A full-stack Snake game with a React arcade interface, FastAPI score service, and SQLite leaderboard persistence.

## How to Run

Start the complete project with one command:

```bash
docker compose up
```

No local Python, Node, or database setup is required for runtime. Docker Compose builds and starts both services.

## Services List

| Service | Address | Description |
| --- | --- | --- |
| Frontend | http://localhost:5173 | React/Vite Snake game UI |
| Backend API | http://localhost:8000 | FastAPI game config and score API |
| Health Check | http://localhost:8000/api/health | Backend service health endpoint |

## Verification Method

Run all unit and API tests with:

```bash
bash run_tests.sh
```

The script installs test dependencies, runs backend unit tests, runs API interface tests, runs frontend game-engine unit tests, builds the frontend, and prints a pass/fail summary.

API endpoints:

- `GET /api/health`
- `GET /api/game/config`
- `GET /api/scores?limit=10`
- `POST /api/scores`
