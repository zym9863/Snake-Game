import pytest
from pydantic import ValidationError

from app.models.schemas import ScoreCreate
from app.repositories.score_repository import ScoreRepository
from app.services.score_service import ScoreService


@pytest.fixture()
def service():
    repository = ScoreRepository(":memory:")
    repository.initialize(seed=False)
    return ScoreService(repository)


def test_submit_score_creates_record(service):
    record = service.submit_score(
        ScoreCreate(playerName="  Neon   Ace  ", score=120, difficulty="normal")
    )

    assert record["playerName"] == "Neon Ace"
    assert record["score"] == 120
    assert record["difficulty"] == "normal"


def test_score_validation_rejects_blank_name():
    with pytest.raises(ValidationError):
        ScoreCreate(playerName="   ", score=10, difficulty="easy")


def test_score_validation_rejects_negative_score():
    with pytest.raises(ValidationError):
        ScoreCreate(playerName="Runner", score=-1, difficulty="normal")


def test_score_validation_rejects_too_large_score():
    with pytest.raises(ValidationError):
        ScoreCreate(playerName="Runner", score=1_000_000, difficulty="normal")


def test_score_validation_rejects_invalid_difficulty():
    with pytest.raises(ValidationError):
        ScoreCreate(playerName="Runner", score=10, difficulty="extreme")


def test_list_scores_orders_by_score_then_created_time(service):
    service.submit_score(ScoreCreate(playerName="Low", score=30, difficulty="easy"))
    service.submit_score(ScoreCreate(playerName="High", score=90, difficulty="hard"))
    service.submit_score(ScoreCreate(playerName="Middle", score=60, difficulty="normal"))

    scores = service.list_scores(limit=2)

    assert [score["playerName"] for score in scores] == ["High", "Middle"]


def test_list_scores_rejects_out_of_range_limit(service):
    with pytest.raises(ValueError):
        service.list_scores(limit=0)
