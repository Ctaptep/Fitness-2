from pydantic import BaseModel
from typing import Optional
import datetime

class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[int] = 1
    is_premium: Optional[int] = 0
    avatar: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[int] = None
    is_premium: Optional[int] = None
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    class Config:
        orm_mode = True

class WorkoutBase(BaseModel):
    name: str
    description: Optional[str] = None
    date: Optional[datetime.datetime] = None

class WorkoutUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime.datetime] = None

class WorkoutCreate(WorkoutBase):
    user_id: int

class WorkoutOut(WorkoutBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class NutritionPlanBase(BaseModel):
    name: str
    description: Optional[str] = None

class NutritionPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class NutritionPlanCreate(NutritionPlanBase):
    user_id: int

class NutritionPlanOut(NutritionPlanBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class ReportBase(BaseModel):
    report_text: str
    created_at: Optional[datetime.datetime] = None

class ReportCreate(ReportBase):
    user_id: int

class ReportOut(ReportBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

class ReportUpdate(BaseModel):
    report_text: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class TelegramAuthRequest(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str
