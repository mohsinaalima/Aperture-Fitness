import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    plan_id: Mapped[str] = mapped_column(String, nullable=False)
    day_id: Mapped[str] = mapped_column(String, nullable=False)
    day_name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="IN_PROGRESS")  # IN_PROGRESS, COMPLETED
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    exercises: Mapped[list["LoggedExercise"]] = relationship("LoggedExercise", back_populates="session", cascade="all, delete-orphan")

class LoggedExercise(Base):
    __tablename__ = "logged_exercises"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String, ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False)
    exercise_name: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, default="Strength")
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    session: Mapped["WorkoutSession"] = relationship("WorkoutSession", back_populates="exercises")
    sets: Mapped[list["LoggedSet"]] = relationship("LoggedSet", back_populates="exercise", cascade="all, delete-orphan")

class LoggedSet(Base):
    __tablename__ = "logged_sets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    exercise_id: Mapped[str] = mapped_column(String, ForeignKey("logged_exercises.id", ondelete="CASCADE"), nullable=False)
    set_number: Mapped[int] = mapped_column(Integer, nullable=False)
    weight_kg: Mapped[float] = mapped_column(Float, default=0.0)
    target_reps: Mapped[int] = mapped_column(Integer, default=0)
    completed_reps: Mapped[int] = mapped_column(Integer, default=0)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    exercise: Mapped["LoggedExercise"] = relationship("LoggedExercise", back_populates="sets")