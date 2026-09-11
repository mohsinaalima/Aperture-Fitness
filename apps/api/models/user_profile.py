import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    initials: Mapped[str] = mapped_column(String(4), nullable=False, default="AF")
    membership_tier: Mapped[str] = mapped_column(String, nullable=False, default="PRO MEMBER")
    
    unit_system: Mapped[str] = mapped_column(String, default="Metric (KG)")
    unit_description: Mapped[str] = mapped_column(String, default="Kilograms (kg) with 2.5kg steppers")
    rest_interval_seconds: Mapped[int] = mapped_column(Integer, default=90)
    
    plan_name: Mapped[str] = mapped_column(String, default="Aperture Pro Tier")
    renewal_date: Mapped[date] = mapped_column(Date, default=lambda: date(2026, 9, 15))
    monthly_price: Mapped[float] = mapped_column(Float, default=12.00)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)