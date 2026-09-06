import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base

class LandingHeroMetric(Base):
    __tablename__ = "landing_hero_metrics"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    badge_text: Mapped[str] = mapped_column(String, default="Precision Strength Instrument")
    headline: Mapped[str] = mapped_column(String, nullable=False)
    subheadline: Mapped[str] = mapped_column(Text, nullable=False)
    calibration_percentage: Mapped[int] = mapped_column(Integer, default=50)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class PlatformStat(Base):
    __tablename__ = "platform_stats"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    total_active_athletes: Mapped[int] = mapped_column(Integer, default=0)
    total_workouts_logged: Mapped[int] = mapped_column(Integer, default=0)
    total_volume_kg: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)