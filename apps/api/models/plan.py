import uuid
from sqlalchemy import Column, String, Boolean, Integer, JSON, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from models.base import Base


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # Set nullable=False if auth required
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    focus = Column(String, default="Custom Split")
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    days = relationship("PlanDay", back_populates="plan", cascade="all, delete-orphan", order_by="PlanDay.order")


class PlanDay(Base):
    __tablename__ = "plan_days"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    plan_id = Column(String, ForeignKey("workout_plans.id"), nullable=False)
    name = Column(String, nullable=False)
    target_day = Column(String, nullable=False)
    order = Column(Integer, default=1)

    plan = relationship("WorkoutPlan", back_populates="days")
    exercises = relationship("PlanExercise", back_populates="day", cascade="all, delete-orphan", order_by="PlanExercise.order")


class PlanExercise(Base):
    __tablename__ = "plan_exercises"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    day_id = Column(String, ForeignKey("plan_days.id"), nullable=False)
    exercise_catalog_id = Column(String, nullable=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    equipment = Column(String, default="Custom")
    target_muscle = Column(String, default="Target Muscle")
    order = Column(Integer, default=1)
    sets = Column(JSON, default=list) 

    day = relationship("PlanDay", back_populates="exercises")