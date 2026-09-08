import uuid
from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base

class Trainer(Base):
    __tablename__ = "trainers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    specialization: Mapped[str] = mapped_column(String, nullable=False)
    assigned_clients: Mapped[int] = mapped_column(Integer, default=0)
    monthly_revenue: Mapped[float] = mapped_column(Float, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    attendance_logs: Mapped[List["AttendanceLog"]] = relationship(
        "AttendanceLog", back_populates="trainer", cascade="all, delete-orphan"
    )
    invoices: Mapped[List["FeeInvoice"]] = relationship(
        "FeeInvoice", back_populates="trainer", cascade="all, delete-orphan"
    )

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id: Mapped[str] = mapped_column(String, ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    log_date: Mapped[date] = mapped_column(Date, default=date.today, index=True)
    check_in_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_present: Mapped[bool] = mapped_column(Boolean, default=False)

    trainer: Mapped["Trainer"] = relationship("Trainer", back_populates="attendance_logs")

class FeeInvoice(Base):
    __tablename__ = "fee_invoices"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id: Mapped[str] = mapped_column(String, ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    billing_period: Mapped[str] = mapped_column(String, nullable=False) # e.g., "2026-09"
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String, default="Pending") # "Paid", "Pending", "Overdue"
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    trainer: Mapped["Trainer"] = relationship("Trainer", back_populates="invoices")