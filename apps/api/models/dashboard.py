import uuid
from datetime import datetime
from sqlalchemy import String, Float, Boolean, ForeignKey, DateTime, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base

class ProgramPlan(Base):
    __tablename__ = "program_plans"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    days: Mapped[list] = mapped_column(JSON, default=list)  # Stores day specifications & exercise list
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    plan_id: Mapped[str] = mapped_column(String, ForeignKey("program_plans.id", ondelete="SET NULL"), nullable=True)
    session_name: Mapped[str] = mapped_column(String, nullable=False)
    total_volume_kg: Mapped[float] = mapped_column(Float, default=0.0)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)