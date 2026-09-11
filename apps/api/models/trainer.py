import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class TrainerStatusEnum(str, enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    ON_LEAVE = "On Leave"

class Trainer(Base):
    __tablename__ = "trainers"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: f"tr-{uuid.uuid4().hex[:6]}"
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    specialty: Mapped[str] = mapped_column(String(150), nullable=False) 
    active_clients_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[TrainerStatusEnum] = mapped_column(
        Enum(TrainerStatusEnum, native_enum=False), default=TrainerStatusEnum.ACTIVE
    )
    last_active: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)