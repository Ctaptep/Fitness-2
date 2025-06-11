import requests
from fastapi import APIRouter, HTTPException
from webadmin.backend import crud, models, schemas
from webadmin.backend.models import User
from webadmin.backend.schemas import TelegramAuthRequest
from webadmin.backend.deps import get_db

router = APIRouter()

TELEGRAM_BOT_TOKEN = "<your-telegram-bot-token>"  # Установите свой токен
TELEGRAM_CHAT_ID = "<your-chat-id>"  # Установите свой chat_id

@router.post("/send_telegram_message")
def send_telegram_message(message: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
    response = requests.post(url, data=payload)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to send message to Telegram")
    return {"status": "ok"}
