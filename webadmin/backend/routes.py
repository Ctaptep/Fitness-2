from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud, schemas, auth
from deps import get_db
from auth import get_current_user

router = APIRouter()

# USERS
@router.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@router.get("/users/me", response_model=schemas.UserOut)
def read_current_user(current_user: schemas.UserOut = Depends(get_current_user)):
    return current_user

@router.put("/users/me", response_model=schemas.UserOut)
def update_current_user(update: schemas.UserBase, db: Session = Depends(get_db), current_user: schemas.UserOut = Depends(get_current_user)):
    user = crud.get_user(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

from fastapi import File, UploadFile
import shutil
import os

AVATAR_DIR = "../../avatars/"
os.makedirs(AVATAR_DIR, exist_ok=True)

@router.post("/users/me/avatar")
def upload_avatar(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: schemas.UserOut = Depends(get_current_user)):
    filename = f"{current_user.id}_{file.filename}"
    file_path = os.path.join(AVATAR_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    user = crud.get_user(db, current_user.id)
    user.avatar = file_path
    db.commit()
    return {"avatar": file_path}

@router.get("/users/me/avatar")
def get_avatar(current_user: schemas.UserOut = Depends(get_current_user)):
    if not current_user.avatar:
        raise HTTPException(status_code=404, detail="Avatar not set")
    return {"avatar": current_user.avatar}

# WORKOUTS
@router.get("/workouts/", response_model=list[schemas.WorkoutOut])
def read_workouts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_workouts(db, skip=skip, limit=limit)

@router.post("/workouts/", response_model=schemas.WorkoutOut)
def create_workout(workout: schemas.WorkoutCreate, db: Session = Depends(get_db), current_user: schemas.UserOut = Depends(get_current_user)):
    return crud.create_workout(db=db, workout=workout)

# NUTRITION PLANS
@router.get("/nutrition_plans/", response_model=list[schemas.NutritionPlanOut])
def read_nutrition_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_nutrition_plans(db, skip=skip, limit=limit)

@router.post("/nutrition_plans/", response_model=schemas.NutritionPlanOut)
def create_nutrition_plan(plan: schemas.NutritionPlanCreate, db: Session = Depends(get_db), current_user: schemas.UserOut = Depends(get_current_user)):
    return crud.create_nutrition_plan(db=db, plan=plan)

# REPORTS
@router.get("/reports/", response_model=list[schemas.ReportOut])
def read_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_reports(db, skip=skip, limit=limit)

@router.post("/reports/", response_model=schemas.ReportOut)
def create_report(report: schemas.ReportCreate, db: Session = Depends(get_db), current_user: schemas.UserOut = Depends(get_current_user)):
    return crud.create_report(db=db, report=report)
