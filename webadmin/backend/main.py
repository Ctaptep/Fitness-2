from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.docs import get_swagger_ui_html
from db import engine, SessionLocal, Base

from routes import router as crud_router
from auth_routes import router as auth_router
from telegram import router as telegram_router
from db import Base
from telegram_auth import router as telegram_auth_router

app = FastAPI(title="Fitness Webadmin Backend")

# CORS (можно настроить по необходимости)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite DB


# JWT OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# Подключение роутеров
app.include_router(crud_router)
app.include_router(auth_router)
app.include_router(telegram_router)
app.include_router(telegram_auth_router)

# Swagger UI (без авторизации)
@app.get("/docs", include_in_schema=False)
def custom_swagger_ui():
    return get_swagger_ui_html(openapi_url=app.openapi_url, title=app.title + " - Swagger UI")

@app.get("/")
def root():
    return {"msg": "Fitness Webadmin Backend"}
