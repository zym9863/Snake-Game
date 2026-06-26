from fastapi.testclient import TestClient

from app.main import create_app


def make_client():
    app = create_app(db_path=":memory:", seed=False)
    return TestClient(app)


def test_health_endpoint():
    with make_client() as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"code": 200, "msg": "ok", "data": {"status": "healthy"}}


def test_game_config_endpoint():
    with make_client() as client:
        response = client.get("/api/game/config")

    payload = response.json()
    assert response.status_code == 200
    assert payload["data"]["boardWidth"] == 20
    assert payload["data"]["defaultDifficulty"] == "normal"
    assert payload["data"]["leaderboardLimit"] == 10


def test_scores_endpoint_returns_records():
    with make_client() as client:
        client.post(
            "/api/scores",
            json={"playerName": "Runner", "score": 80, "difficulty": "hard"},
        )
        response = client.get("/api/scores?limit=10")

    assert response.status_code == 200
    assert response.json()["data"][0]["playerName"] == "Runner"


def test_submit_score_endpoint_creates_record():
    with make_client() as client:
        response = client.post(
            "/api/scores",
            json={"playerName": "Grid Pilot", "score": 140, "difficulty": "normal"},
        )

    payload = response.json()
    assert response.status_code == 201
    assert payload["code"] == 201
    assert payload["data"]["score"] == 140


def test_submit_score_rejects_missing_field():
    with make_client() as client:
        response = client.post("/api/scores", json={"playerName": "Grid Pilot", "score": 140})

    assert response.status_code == 422
    assert response.json()["data"] is None


def test_submit_score_rejects_invalid_format():
    with make_client() as client:
        response = client.post(
            "/api/scores",
            json={"playerName": "Grid Pilot", "score": "fast", "difficulty": "normal"},
        )

    assert response.status_code == 422
    assert response.json()["data"] is None


def test_submit_score_rejects_invalid_parameters():
    with make_client() as client:
        response = client.post(
            "/api/scores",
            json={"playerName": "", "score": -4, "difficulty": "nightmare"},
        )

    assert response.status_code == 422
    assert response.json()["data"] is None


def test_scores_endpoint_rejects_invalid_limit():
    with make_client() as client:
        response = client.get("/api/scores?limit=99")

    assert response.status_code == 422
    assert response.json()["data"] is None
