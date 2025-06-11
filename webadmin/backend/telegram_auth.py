import hashlib
import hmac
import time
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from webadmin.backend import models, schemas, crud
from webadmin.backend.schemas import TelegramAuthRequest
from webadmin.backend.deps import get_db
from webadmin.backend.auth import create_access_token
from webadmin.backend.schemas import UserOut
import os

router = APIRouter()

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "your-telegram-bot-token")


def check_telegram_auth(data: dict, bot_token: str) -> bool:
    auth_data = data.copy()
    hash_ = auth_data.pop('hash')
    data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted(auth_data.items())])
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    hmac_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    return hmac_hash == hash_

from fastapi import Body, Request
from webadmin.backend.schemas import TelegramAuthRequest

import datetime

@router.post("/telegram_auth")
def telegram_auth(payload: TelegramAuthRequest = Body(...), db: Session = Depends(get_db), request: Request = None):
    data = payload.dict()
    # Логирование для диагностики проблем с Telegram WebApp
    try:
        with open("telegram_auth_debug.log", "a", encoding="utf-8") as log:
            log.write(f"\n--- {datetime.datetime.now()} ---\n")
            if request:
                log.write(f"User-Agent: {request.headers.get('user-agent', '')}\n")
            log.write(f"Payload: {data}\n")
    except Exception as e:
        pass
    if not check_telegram_auth(data, TELEGRAM_BOT_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid Telegram auth")
    user = db.query(User).filter(User.username == str(data['id'])).first()
    if not user:
        user = User(username=str(data['id']), full_name=data.get('first_name', ''), is_active=1)
        db.add(user)
        db.commit()
        db.refresh(user)
    access_token = create_access_token({"sub": user.username})
    from webadmin.backend.schemas import UserOut
    return {"access_token": access_token, "user": UserOut.from_orm(user)}
