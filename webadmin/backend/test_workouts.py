import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from webadmin.backend.main import app
from webadmin.backend.models import Base
from webadmin.backend.deps import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_workouts.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client(test_db):
    def override_get_db():
        yield test_db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

WORKOUT = {"name": "Test Workout", "date": "2025-01-01", "user_id": 1}

# --- Тесты CRUD для тренировок ---
def test_create_and_read_workout(client):
    resp = client.post("/workouts", json=WORKOUT)
    assert resp.status_code == 200
    workout = resp.json()
    assert workout["name"] == WORKOUT["name"]
    wid = workout["id"]
    resp = client.get(f"/workouts/{wid}")
    assert resp.status_code == 200
    assert resp.json()["name"] == WORKOUT["name"]

def test_update_workout(client):
    resp = client.get("/workouts")
    wid = resp.json()[0]["id"]
    resp = client.put(f"/workouts/{wid}", json={"name": "Updated Workout"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Workout"

def test_delete_workout(client):
    resp = client.get("/workouts")
    wid = resp.json()[0]["id"]
    resp = client.delete(f"/workouts/{wid}")
    assert resp.status_code == 200
    resp = client.get(f"/workouts/{wid}")
    assert resp.status_code == 404

def test_bulk_create_and_bulk_update_delete(client):
    # Bulk create
    for i in range(3):
        client.post("/workouts", json={"name": f"bulk{i}", "date": "2025-01-0{i+2}", "user_id": 1})
    resp = client.get("/workouts")
    workouts = resp.json()
    ids = [w["id"] for w in workouts if w["name"].startswith("bulk")]
    # Bulk update
    for wid in ids:
        resp = client.put(f"/workouts/{wid}", json={"name": "BulkUpdated"})
        assert resp.status_code == 200
        assert resp.json()["name"] == "BulkUpdated"
    # Bulk delete
    for wid in ids:
        resp = client.delete(f"/workouts/{wid}")
        assert resp.status_code == 200
    resp = client.get("/workouts")
    assert all(not w["name"].startswith("BulkUpdated") for w in resp.json())
