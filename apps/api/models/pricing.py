import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base

class PricingTier(Base):
    __tablename__ = "pricing_tiers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True) 
    name: Mapped[str] = mapped_column(String, nullable=False)
    price_monthly: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_recommended: Mapped[bool] = mapped_column(Boolean, default=False)
    cta_label: Mapped[str] = mapped_column(String, nullable=False, default="Get Started")
    cta_link: Mapped[str] = mapped_column(String, nullable=False, default="/dashboard")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    features: Mapped[List["TierFeatureMapping"]] = relationship("TierFeatureMapping", back_populates="tier", cascade="all, delete-orphan")

class Feature(Base):
    __tablename__ = "features"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    display_order: Mapped[int] = mapped_column(nullable=False, default=0)

    tier_mappings: Mapped[List["TierFeatureMapping"]] = relationship("TierFeatureMapping", back_populates="feature", cascade="all, delete-orphan")

class TierFeatureMapping(Base):
    __tablename__ = "tier_feature_mappings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tier_id: Mapped[str] = mapped_column(String, ForeignKey("pricing_tiers.id", ondelete="CASCADE"), nullable=False)
    feature_id: Mapped[str] = mapped_column(String, ForeignKey("features.id", ondelete="CASCADE"), nullable=False)
    value: Mapped[str] = mapped_column(String, nullable=False) 

    tier: Mapped["PricingTier"] = relationship("PricingTier", back_populates="features")
    feature: Mapped["Feature"] = relationship("Feature", back_populates="tier_mappings")