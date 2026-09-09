from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.pricing import PricingTier, Feature, TierFeatureMapping

class PricingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_tiers(self) -> List[PricingTier]:
        stmt = select(PricingTier).order_by(PricingTier.price_monthly.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_all_features(self) -> List[Feature]:
        stmt = select(Feature).order_by(Feature.display_order.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_all_mappings(self) -> List[TierFeatureMapping]:
        stmt = select(TierFeatureMapping)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_tier(self, tier: PricingTier) -> PricingTier:
        self.db.add(tier)
        await self.db.commit()
        await self.db.refresh(tier)
        return tier