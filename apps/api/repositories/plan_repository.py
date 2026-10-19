from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from models.plan import WorkoutPlan, PlanDay, PlanExercise
from typing import List, Optional
import uuid


class PlanRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self, user_id: Optional[str] = None) -> List[WorkoutPlan]:
        query = select(WorkoutPlan).options(selectinload(WorkoutPlan.days).selectinload(PlanDay.exercises))
        if user_id:
            query = query.where(WorkoutPlan.user_id == user_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, plan_id: str) -> Optional[WorkoutPlan]:
        result = await self.db.execute(select(WorkoutPlan).where(WorkoutPlan.id == plan_id).options(selectinload(WorkoutPlan.days)))
        return result.scalar_one_or_none()

    async def create_plan(self, name: str, description: Optional[str], focus: str = "Custom Split", user_id: Optional[str] = None) -> WorkoutPlan:
        plan = WorkoutPlan(name=name, description=description, focus=focus, user_id=user_id)
        self.db.add(plan)
        await self.db.commit()
        await self.db.refresh(plan)
        return plan

    async def set_active(self, plan_id: str, user_id: Optional[str] = None) -> Optional[WorkoutPlan]:
        query = update(WorkoutPlan).values(is_active=False)
        if user_id:
            query = query.where(WorkoutPlan.user_id == user_id)
        plan_query = select(WorkoutPlan).where(WorkoutPlan.id == plan_id)
        if user_id:
            plan_query = plan_query.where(WorkoutPlan.user_id == user_id)
        result = await self.db.execute(plan_query)
        plan = result.scalar_one_or_none()
        if plan:
            await self.db.execute(query)
            plan.is_active = True
            await self.db.commit()
            await self.db.refresh(plan)
        return plan

    async def delete_plan(self, plan_id: str, user_id: str) -> bool:
        plan = await self.db.scalar(select(WorkoutPlan).where(WorkoutPlan.id == plan_id, WorkoutPlan.user_id == user_id))
        if not plan:
            return False
        await self.db.delete(plan)
        await self.db.commit()
        return True

    async def add_day(self, plan_id: str, name: str, target_day: str, user_id: str) -> Optional[PlanDay]:
        result = await self.db.execute(select(WorkoutPlan).where(WorkoutPlan.id == plan_id, WorkoutPlan.user_id == user_id).options(selectinload(WorkoutPlan.days)))
        plan = result.scalar_one_or_none()
        if not plan:
            return None
        day = PlanDay(
            plan_id=plan_id,
            name=name,
            target_day=target_day,
            order=len(plan.days) + 1
        )
        self.db.add(day)
        await self.db.commit()
        await self.db.refresh(day)
        return day

    async def add_exercise(self, day_id: str, name: str, category: str, user_id: str) -> Optional[PlanExercise]:
        result = await self.db.execute(select(PlanDay).join(WorkoutPlan).where(PlanDay.id == day_id, WorkoutPlan.user_id == user_id).options(selectinload(PlanDay.exercises)))
        day = result.scalar_one_or_none()
        if not day:
            return None
        
        # Default starting sets template (matches front-end expectations)
        default_sets = [
            {"id": str(uuid.uuid4())[:8], "weight": 60.0, "targetReps": 10, "restSeconds": 90},
            {"id": str(uuid.uuid4())[:8], "weight": 60.0, "targetReps": 10, "restSeconds": 90},
            {"id": str(uuid.uuid4())[:8], "weight": 60.0, "targetReps": 10, "restSeconds": 90},
        ]

        exercise = PlanExercise(
            day_id=day_id,
            name=name,
            category=category,
            order=len(day.exercises) + 1,
            sets=default_sets
        )
        self.db.add(exercise)
        await self.db.commit()
        await self.db.refresh(exercise)
        return exercise

    async def update_set(self, exercise_id: str, set_index: int, field: str, value: float | int, user_id: str) -> Optional[PlanExercise]:
        result = await self.db.execute(select(PlanExercise).join(PlanDay).join(WorkoutPlan).where(PlanExercise.id == exercise_id, WorkoutPlan.user_id == user_id))
        exercise = result.scalar_one_or_none()
        if not exercise:
            return None
        
        sets = list(exercise.sets or [])
        if 0 <= set_index < len(sets):
            if field not in {"weight", "targetReps", "restSeconds"}:
                return None
            sets[set_index][field] = value
            exercise.sets = sets
            await self.db.commit()
            await self.db.refresh(exercise)
            return exercise
        return None
