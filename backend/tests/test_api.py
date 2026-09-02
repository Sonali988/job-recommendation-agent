"""Endpoint smoke tests via FastAPI TestClient (runs without live AWS)."""
from fastapi.testclient import TestClient

from app.data.case_repository import get_repository
from app.main import app

client = TestClient(app)


def _first_profile_id() -> str:
    repo = get_repository()
    profiles = repo.list_profiles()
    assert profiles, "seed data should contain profiles"
    return profiles[0].profileId


def test_health():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_profiles_and_case():
    resp = client.get("/api/profiles")
    assert resp.status_code == 200
    pid = _first_profile_id()
    case = client.get(f"/api/case/{pid}")
    assert case.status_code == 200
    assert case.json()["profileId"] == pid


def test_unknown_case_404():
    resp = client.get("/api/case/DOES-NOT-EXIST")
    assert resp.status_code == 404


def test_gap_analysis_degraded_without_aws():
    pid = _first_profile_id()
    resp = client.post("/api/gap-analysis", json={"case_id": pid, "goal_text": "Data Analyst"})
    assert resp.status_code == 200
    body = resp.json()
    assert "gaps" in body and "requiredSkills" in body


def test_opportunities():
    pid = _first_profile_id()
    resp = client.get(f"/api/opportunities?case_id={pid}")
    assert resp.status_code == 200
    for o in resp.json()["opportunities"]:
        assert 0.0 <= o["matchScore"] <= 1.0
