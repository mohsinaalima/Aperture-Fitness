from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base

class ExerciseAnalytics(Base):
    __tablename__ = "exercise_analytics"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_name = Column(String, nullable=False, index=True)
    e1rm = Column(Float, nullable=False)
    is_pr = Column(Boolean, default=False)
    logged_date = Column(DateTime, default=datetime.utcnow)

class WeeklyVolume(Base):
    __tablename__ = "weekly_volume"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    week_label = Column(String, nullable=False) 
    volume_kg = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class PersonalRecord(Base):
    __tablename__ = "personal_records"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise = Column(String, nullable=False)
    metric = Column(String, nullable=False)  
    delta = Column(String, nullable=False)   
    achieved_date = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)