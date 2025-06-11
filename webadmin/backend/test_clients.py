import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from webadmin.backend.main import app
from webadmin.backend.models import Base
from webadmin.backend.schemas import UserBase
from webadmin.backend.deps import get_db
from webadmin.backend.auth import get_current_user
from webadmin.backend.schemas import UserOut
import os

# Тестовая база данных
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Переопределяем зависимость get_db для тестов
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
def test_user():
    return UserOut(id=1, username="testuser", full_name="Test User", email="test@example.com", is_active=1, is_premium=0, avatar=None)

@pytest.fixture(scope="module")
def client(test_db, test_user):
    def override_get_db():
        yield test_db
    def override_get_current_user():
        return test_user
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    with TestClient(app) as c:
        yield c

# Тестовые данные
USER_DATA = {"username": "testuser", "full_name": "Test User", "email": "test@example.com", "is_premium": 0, "is_active": 1, "password": "testpass"}

# --- Тесты CRUD для клиентов ---
def test_create_and_read_user(client):
    resp = client.post("/users/", json=USER_DATA)
    assert resp.status_code == 200
    user = resp.json()
    assert user["username"] == USER_DATA["username"]
    user_id = user["id"]
    # Получение пользователя
    resp = client.get(f"/users/{user_id}/")
    assert resp.status_code == 200
    assert resp.json()["username"] == USER_DATA["username"]

def test_update_user(client):
    # Получаем id первого пользователя
    resp = client.get("/users/")
    user_id = resp.json()[0]["id"]
    resp = client.put(f"/users/{user_id}/", json={"full_name": "Updated Name"})
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Updated Name"

def test_delete_user(client):
    # Получаем id первого пользователя
    resp = client.get("/users/")
    user_id = resp.json()[0]["id"]
    resp = client.delete(f"/users/{user_id}")
    assert resp.status_code == 200
    # Проверяем, что пользователя больше нет
    resp = client.get(f"/users/{user_id}/")
    assert resp.status_code == 404

def test_bulk_create_and_bulk_update_delete(client):
    # Bulk create
    for i in range(3):
        client.post("/users", json={**USER_DATA, "username": f"bulk{i}", "email": f"bulk{i}@ex.com"})
    resp = client.get("/users/")
    users = resp.json()
    ids = [u["id"] for u in users if u["username"].startswith("bulk")]
    # Bulk update (is_premium)
    for uid in ids:
        resp = client.put(f"/users/{uid}", json={"is_premium": 1})
        assert resp.status_code == 200
        assert resp.json()["is_premium"] == 1
    # Bulk delete
    for uid in ids:
        resp = client.delete(f"/users/{uid}")
        assert resp.status_code == 200
    # Проверяем, что пользователей больше нет
    resp = client.get("/users/")
    assert all(not u["username"].startswith("bulk") for u in resp.json())
