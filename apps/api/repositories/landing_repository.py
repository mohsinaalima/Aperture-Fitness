from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models.landing import LandingHeroMetric, PlatformStat

class LandingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_hero_content(self) -> Optional[LandingHeroMetric]:
        stmt = (
            select(LandingHeroMetric)
            .where(LandingHeroMetric.is_active == True)
            .order_by(LandingHeroMetric.id.desc())
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_platform_stats(self) -> Optional[PlatformStat]:
        stmt = select(PlatformStat).limit(1)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def seed_default_landing_data_if_empty(self):
        stmt = select(func.count(LandingHeroMetric.id))
        result = await self.db.execute(stmt)
        count = result.scalar_one()

        if count == 0:
            default_hero = LandingHeroMetric(
                badge_text="Precision Strength Instrument",
                headline="Strength Training Built Like an Instrument.",
                subheadline="Monospace readouts, 1px hairline interfaces, and mechanical iris progress metrics. Engineered for serious athletes, trainers, and gym owners.",
                calibration_percentage=50,
                is_active=True
            )
            default_stats = PlatformStat(
                total_active_athletes=1280,
                total_workouts_logged=45900,
                total_volume_kg=892000.0
            )
            self.db.add(default_hero)
            self.db.add(default_stats)
            await self.db.commit()