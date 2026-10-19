from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from models.plan import WorkoutPlan, PlanDay
from models.workout_logger import WorkoutSession, LoggedExercise, LoggedSet

class DashboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_plan(self, user_id: str) -> Optional[WorkoutPlan]:
        stmt = (
            select(WorkoutPlan)
            .where(WorkoutPlan.user_id == user_id, WorkoutPlan.is_active.is_(True))
            .limit(1)
            .options(selectinload(WorkoutPlan.days).selectinload(PlanDay.exercises))
        )
        result = await self.db.execute(stmt)
        plan = result.scalar_one_or_none()
        
        # Fallback to the latest plan if no active plan flag is explicitly set
        if not plan:
            stmt = (
                select(WorkoutPlan)
                .where(WorkoutPlan.user_id == user_id)
                .order_by(WorkoutPlan.created_at.desc())
                .limit(1)
                .options(selectinload(WorkoutPlan.days).selectinload(PlanDay.exercises))
            )
            result = await self.db.execute(stmt)
            plan = result.scalar_one_or_none()
            
        return plan

    async def get_completed_sessions(self, user_id: str, limit: int = 10) -> List[WorkoutSession]:
        stmt = (
            select(WorkoutSession)
            .where(WorkoutSession.user_id == user_id, WorkoutSession.status == "COMPLETED")
            .order_by(WorkoutSession.completed_at.desc())
            .limit(limit)
            .options(selectinload(WorkoutSession.exercises).selectinload(LoggedExercise.sets))
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_monthly_volume(self, user_id: str) -> float:

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        stmt = select(func.coalesce(func.sum(LoggedSet.weight_kg * LoggedSet.completed_reps), 0.0)).join(
            LoggedExercise, LoggedSet.exercise_id == LoggedExercise.id
        ).join(WorkoutSession, LoggedExercise.session_id == WorkoutSession.id).where(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == "COMPLETED",
            WorkoutSession.completed_at >= thirty_days_ago,
            LoggedSet.is_completed.is_(True),
        )
        result = await self.db.execute(stmt)
        return float(result.scalar_one())
