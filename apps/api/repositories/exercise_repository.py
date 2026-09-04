from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from models.exercise import Exercise

class ExerciseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_categories(self) -> List[str]:
        stmt = select(Exercise.category).distinct().order_by(Exercise.category.asc())
        result = await self.db.execute(stmt)
        categories = result.scalars().all()
        return ["All"] + list(categories)

    async def get_filtered_exercises(
        self, category: Optional[str] = None, search: Optional[str] = None
    ) -> List[Exercise]:
        stmt = select(Exercise)

        # Category Filter
        if category and category.lower() != "all":
            stmt = stmt.where(Exercise.category.ilike(f"%{category}%"))

        # Search Filter across name and primary_muscle
        if search:
            search_term = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    Exercise.name.ilike(search_term),
                    Exercise.primary_muscle.ilike(search_term)
                )
            )

        stmt = stmt.order_by(Exercise.name.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def seed_initial_data_if_empty(self, exercises_data: List[dict]):
        stmt = select(func.count(Exercise.id))
        result = await self.db.execute(stmt)
        count = result.scalar_one()

        if count == 0:
            for item in exercises_data:
                exercise = Exercise(
                    name=item["name"],
                    category=item["category"],
                    primary_muscle=item["primaryMuscle"],
                    equipment=item["equipment"]
                )
                self.db.add(exercise)
            await self.db.commit()