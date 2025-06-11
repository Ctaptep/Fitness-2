from sqlalchemy.orm import Session
from webadmin.backend import models, schemas

from webadmin.backend.auth import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        full_name=user.full_name,
        email=user.email,
        is_active=user.is_active,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, update: schemas.UserBase):
    user = get_user(db, user_id)
    if not user:
        return None
    for field, value in update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = get_user(db, user_id)
    if not user:
        return None
    db.delete(user)
    db.commit()
    return True

def get_workout(db: Session, workout_id: int):
    return db.query(models.Workout).filter(models.Workout.id == workout_id).first()

def get_workouts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Workout).offset(skip).limit(limit).all()

def create_workout(db: Session, workout: schemas.WorkoutCreate):
    db_workout = models.Workout(**workout.dict())
    db.add(db_workout)
    db.commit()
    db.refresh(db_workout)
    return db_workout

def update_workout(db: Session, workout_id: int, update: schemas.WorkoutCreate):
    workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if not workout:
        return None
    for field, value in update.dict(exclude_unset=True).items():
        setattr(workout, field, value)
    db.commit()
    db.refresh(workout)
    return workout

def delete_workout(db: Session, workout_id: int):
    workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if not workout:
        return None
    db.delete(workout)
    db.commit()
    return True

def get_nutrition_plan(db: Session, plan_id: int):
    return db.query(models.NutritionPlan).filter(models.NutritionPlan.id == plan_id).first()

def get_nutrition_plans(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.NutritionPlan).offset(skip).limit(limit).all()

def create_nutrition_plan(db: Session, plan: schemas.NutritionPlanCreate):
    db_plan = models.NutritionPlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def update_nutrition_plan(db: Session, plan_id: int, update: schemas.NutritionPlanCreate):
    plan = db.query(models.NutritionPlan).filter(models.NutritionPlan.id == plan_id).first()
    if not plan:
        return None
    for field, value in update.dict(exclude_unset=True).items():
        setattr(plan, field, value)
    db.commit()
    db.refresh(plan)
    return plan

def delete_nutrition_plan(db: Session, plan_id: int):
    plan = db.query(models.NutritionPlan).filter(models.NutritionPlan.id == plan_id).first()
    if not plan:
        return None
    db.delete(plan)
    db.commit()
    return True

def get_report(db: Session, report_id: int):
    return db.query(models.Report).filter(models.Report.id == report_id).first()

def get_reports(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Report).offset(skip).limit(limit).all()

def create_report(db: Session, report: schemas.ReportCreate):
    db_report = models.Report(**report.dict())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def update_report(db: Session, report_id: int, update: schemas.ReportCreate):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        return None
    for field, value in update.dict(exclude_unset=True).items():
        setattr(report, field, value)
    db.commit()
    db.refresh(report)
    return report

def delete_report(db: Session, report_id: int):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        return None
    db.delete(report)
    db.commit()
    return True
