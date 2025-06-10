from .models import SessionLocal, User, Workout, NutritionPlan, UserHistory
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

def get_or_create_user(telegram_id: str, username: str = None):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        user = User(telegram_id=telegram_id, username=username)
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()
    return user

def save_workout(telegram_id: str, name: str, desc: str):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        db.close()
        return None
    workout = Workout(user_id=user.id, name=name, desc=desc)
    db.add(workout)
    db.commit()
    db.refresh(workout)
    db.close()
    return workout

def get_workouts(telegram_id: str):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        db.close()
        return []
    workouts = db.query(Workout).filter(Workout.user_id == user.id).all()
    db.close()
    return workouts

def save_nutrition_plan(telegram_id: str, calories: str, meals: str, plan: str):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        db.close()
        return None
    nutrition_plan = NutritionPlan(user_id=user.id, calories=calories, meals=meals, plan=plan)
    db.add(nutrition_plan)
    db.commit()
    db.refresh(nutrition_plan)
    db.close()
    return nutrition_plan

def get_nutrition_plans(telegram_id: str):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        db.close()
        return []
    plans = db.query(NutritionPlan).filter(NutritionPlan.user_id == user.id).all()
    db.close()
    return plans

def save_user_history(telegram_id: str, action: str, details: str):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        db.close()
        return None
    history = UserHistory(user_id=user.id, action=action, details=details)
    db.add(history)
    db.commit()
    db.refresh(history)
    db.close()
    return history

def get_user_history(telegram_id: str):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        db.close()
        return []
    history = db.query(UserHistory).filter(UserHistory.user_id == user.id).all()
    db.close()
    return history
