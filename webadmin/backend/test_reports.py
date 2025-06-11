import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from webadmin.backend.main import app
from webadmin.backend.models import Base
from webadmin.backend.deps import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_reports.db"
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

REPORT = {"report_text": "Test report", "user_id": 1}

# --- Тесты CRUD для отчетов ---
def test_create_and_read_report(client):
    resp = client.post("/reports", json=REPORT)
    assert resp.status_code == 200
    report = resp.json()
    assert report["report_text"] == REPORT["report_text"]
    rid = report["id"]
    resp = client.get(f"/reports/{rid}")
    assert resp.status_code == 200
    assert resp.json()["report_text"] == REPORT["report_text"]

def test_update_report(client):
    resp = client.get("/reports")
    rid = resp.json()[0]["id"]
    resp = client.put(f"/reports/{rid}", json={"report_text": "Updated report"})
    assert resp.status_code == 200
    assert resp.json()["report_text"] == "Updated report"

def test_delete_report(client):
    resp = client.get("/reports")
    rid = resp.json()[0]["id"]
    resp = client.delete(f"/reports/{rid}")
    assert resp.status_code == 200
    resp = client.get(f"/reports/{rid}")
    assert resp.status_code == 404

def test_bulk_create_and_bulk_update_delete(client):
    # Bulk create
    for i in range(3):
        client.post("/reports", json={"report_text": f"bulk{i}", "user_id": 1})
    resp = client.get("/reports")
    reports = resp.json()
    ids = [r["id"] for r in reports if r["report_text"].startswith("bulk")]
    # Bulk update
    for rid in ids:
        resp = client.put(f"/reports/{rid}", json={"report_text": "BulkUpdated"})
        assert resp.status_code == 200
        assert resp.json()["report_text"] == "BulkUpdated"
    # Bulk delete
    for rid in ids:
        resp = client.delete(f"/reports/{rid}")
        assert resp.status_code == 200
    resp = client.get("/reports")
    assert all(not r["report_text"] == "BulkUpdated" for r in resp.json())
