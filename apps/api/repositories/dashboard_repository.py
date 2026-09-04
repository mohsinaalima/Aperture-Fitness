from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.dashboard import ProgramPlan, WorkoutSession

class DashboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_plan(self, user_id: str) -> Optional[ProgramPlan]:
        stmt = (
            select(ProgramPlan)
            .where(ProgramPlan.user_id == user_id, ProgramPlan.is_active == True)
            .limit(1)
        )
        result = await self.db.execute(stmt)
        plan = result.scalar_one_or_none()
        
        # Fallback to the latest plan if no active plan flag is explicitly set
        if not plan:
            stmt = (
                select(ProgramPlan)
                .where(ProgramPlan.user_id == user_id)
                .order_by(ProgramPlan.created_at.desc())
                .limit(1)
            )
            result = await self.db.execute(stmt)
            plan = result.scalar_one_or_none()
            
        return plan

    async def get_completed_sessions(self, user_id: str, limit: int = 10) -> List[WorkoutSession]:
        stmt = (
            select(WorkoutSession)
            .where(WorkoutSession.user_id == user_id)
            .order_by(WorkoutSession.completed_at.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_monthly_volume(self, user_id: str) -> float:

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        stmt = (
            select(func.coalesce(func.sum(WorkoutSession.total_volume_kg), 0.0))
            .where(
                WorkoutSession.user_id == user_id,
                WorkoutSession.completed_at >= thirty_days_ago
            )
        )
        result = await self.db.execute(stmt)
        return float(result.scalar_one())