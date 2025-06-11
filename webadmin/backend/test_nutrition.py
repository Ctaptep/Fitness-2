import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from webadmin.backend.main import app
from webadmin.backend.models import Base
from webadmin.backend.deps import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_nutrition.db"
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

PLAN = {"name": "Test Plan", "description": "desc", "user_id": 1}

# --- Тесты CRUD для планов питания ---
def test_create_and_read_plan(client):
    resp = client.post("/nutrition_plans", json=PLAN)
    assert resp.status_code == 200
    plan = resp.json()
    assert plan["name"] == PLAN["name"]
    pid = plan["id"]
    resp = client.get(f"/nutrition_plans/{pid}")
    assert resp.status_code == 200
    assert resp.json()["name"] == PLAN["name"]

def test_update_plan(client):
    resp = client.get("/nutrition_plans")
    pid = resp.json()[0]["id"]
    resp = client.put(f"/nutrition_plans/{pid}", json={"description": "Updated desc"})
    assert resp.status_code == 200
    assert resp.json()["description"] == "Updated desc"

def test_delete_plan(client):
    resp = client.get("/nutrition_plans")
    pid = resp.json()[0]["id"]
    resp = client.delete(f"/nutrition_plans/{pid}")
    assert resp.status_code == 200
    resp = client.get(f"/nutrition_plans/{pid}")
    assert resp.status_code == 404

def test_bulk_create_and_bulk_update_delete(client):
    # Bulk create
    for i in range(3):
        client.post("/nutrition_plans", json={"name": f"bulk{i}", "description": "desc", "user_id": 1})
    resp = client.get("/nutrition_plans")
    plans = resp.json()
    ids = [p["id"] for p in plans if p["name"].startswith("bulk")]
    # Bulk update
    for pid in ids:
        resp = client.put(f"/nutrition_plans/{pid}", json={"description": "BulkUpdated"})
        assert resp.status_code == 200
        assert resp.json()["description"] == "BulkUpdated"
    # Bulk delete
    for pid in ids:
        resp = client.delete(f"/nutrition_plans/{pid}")
        assert resp.status_code == 200
    resp = client.get("/nutrition_plans")
    assert all(not p["description"] == "BulkUpdated" for p in resp.json())
