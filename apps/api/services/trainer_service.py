import enum
import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

from schemas.trainer import ClientCreate, ClientUpdate, StatusEnum


class ClientModel(Base):
    __tablename__ = "trainer_clients"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: f"cl-{uuid.uuid4().hex[:6]}"
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    assigned_plan: Mapped[str] = mapped_column(String(150), nullable=False)
    last_active: Mapped[str] = mapped_column(String(100), nullable=False)
    compliance: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    status: Mapped[StatusEnum] = mapped_column(
        SQLEnum(StatusEnum, native_enum=False), default=StatusEnum.ON_TRACK
    )
    recent_pr: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class TrainerService:
    @staticmethod
    async def get_clients(db: AsyncSession) -> List[ClientModel]:
        result = await db.execute(
            select(ClientModel).order_by(ClientModel.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_client_by_id(db: AsyncSession, client_id: str) -> Optional[ClientModel]:
        result = await db.execute(
            select(ClientModel).where(ClientModel.id == client_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_client(db: AsyncSession, client_in: ClientCreate) -> ClientModel:
        db_client = ClientModel(
            name=client_in.name,
            assigned_plan=client_in.assigned_plan,
            last_active=client_in.last_active,
            compliance=client_in.compliance,
            status=client_in.status,
            recent_pr=client_in.recent_pr,
        )
        db.add(db_client)
        await db.commit()
        await db.refresh(db_client)
        return db_client
    @staticmethod
    async def update_client(
        db: AsyncSession, db_client: ClientModel, client_in: ClientUpdate
    ) -> ClientModel:
        update_data = client_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_client, field, value)
        await db.commit()
        await db.refresh(db_client)
        return db_client
