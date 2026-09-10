from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.workout_logger import WorkoutSession, LoggedExercise, LoggedSet

class WorkoutLoggerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_session(self, user_id: str) -> Optional[WorkoutSession]:
        stmt = (
            select(WorkoutSession)
            .where(WorkoutSession.user_id == user_id, WorkoutSession.status == "IN_PROGRESS")
            .options(selectinload(WorkoutSession.exercises).selectinload(LoggedExercise.sets))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_session(self, session: WorkoutSession) -> WorkoutSession:
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def save(self):
        await self.db.commit()