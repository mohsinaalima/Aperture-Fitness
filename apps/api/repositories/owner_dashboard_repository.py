from typing import List, Optional
from datetime import date, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload
from models.owner_dashboard import Trainer, AttendanceLog, FeeInvoice
from models.account_flows import GymMembership, GymMembershipStatus, GymRole, TrainerProfile, TrainerClient, TrainerClientStatus
from models.user import User

class OwnerDashboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_active_trainers(self) -> List[Trainer]:
        stmt = select(Trainer).where(Trainer.is_active == True)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_today_attendance(self, today_date: date) -> List[AttendanceLog]:
        stmt = select(AttendanceLog).where(AttendanceLog.log_date == today_date)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_current_month_invoices(self, billing_period: str) -> List[FeeInvoice]:
        stmt = select(FeeInvoice).where(FeeInvoice.billing_period == billing_period)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_trainer(self, trainer: Trainer) -> Trainer:
        self.db.add(trainer)
        await self.db.commit()
        await self.db.refresh(trainer)
        return trainer

    async def record_attendance(self, log: AttendanceLog) -> AttendanceLog:
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def create_invoice(self, invoice: FeeInvoice) -> FeeInvoice:
        self.db.add(invoice)
        await self.db.commit()
        return invoice

    async def get_gym_people(self, gym_id: str):
        stmt = (
            select(GymMembership, User, TrainerProfile)
            .join(User, User.id == GymMembership.user_id)
            .outerjoin(TrainerProfile, TrainerProfile.user_id == User.id)
            .where(
                GymMembership.gym_id == gym_id,
                GymMembership.role.in_((GymRole.TRAINER, GymRole.STAFF)),
                or_(
                    GymMembership.status == GymMembershipStatus.ACTIVE,
                    and_(
                        GymMembership.status == GymMembershipStatus.INVITED,
                        or_(GymMembership.expires_at.is_(None), GymMembership.expires_at > datetime.now(timezone.utc)),
                    ),
                ),
            )
        )
        result = await self.db.execute(stmt)
        return list(result.all())

    async def count_active_trainer_clients(self, profile_id) -> int:
        stmt = select(func.count(TrainerClient.id)).where(
            TrainerClient.trainer_profile_id == profile_id,
            TrainerClient.status == TrainerClientStatus.ACTIVE,
        )
        result = await self.db.execute(stmt)
        return int(result.scalar_one())

    async def count_active_members(self, gym_id: str) -> int:
        stmt = select(func.count(GymMembership.id)).where(
            GymMembership.gym_id == gym_id,
            GymMembership.role == GymRole.MEMBER,
            GymMembership.status == GymMembershipStatus.ACTIVE,
        )
        result = await self.db.execute(stmt)
        return int(result.scalar_one())
