from typing import List, Optional
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from models.owner_dashboard import Trainer, AttendanceLog, FeeInvoice

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