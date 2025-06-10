from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.orm import declarative_base
Base = declarative_base()
import datetime

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    is_active = Column(Integer, default=1)
    is_premium = Column(Integer, default=0)  # 0 - бесплатный, 1 - платный
    avatar = Column(String, nullable=True)  # путь к аватару или base64
    workouts = relationship('Workout', back_populates='user')
    nutrition_plans = relationship('NutritionPlan', back_populates='user')

class Workout(Base):
    __tablename__ = 'workouts'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String, nullable=False)
    description = Column(Text)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship('User', back_populates='workouts')

class NutritionPlan(Base):
    __tablename__ = 'nutrition_plans'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    name = Column(String, nullable=False)
    description = Column(Text)
    user = relationship('User', back_populates='nutrition_plans')

class Report(Base):
    __tablename__ = 'reports'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    report_text = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship('User')
