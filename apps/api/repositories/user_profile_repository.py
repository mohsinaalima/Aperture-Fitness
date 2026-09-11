from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user_profile import UserProfile


class UserProfileRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: str) -> Optional[UserProfile]:
        stmt = select(UserProfile).where(UserProfile.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_first_user(self) -> Optional[UserProfile]:
        """Utility method to get default user for single-user dev context"""
        stmt = select(UserProfile).limit(1)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(self, user: UserProfile) -> UserProfile:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def update_user(self, user: UserProfile) -> UserProfile:
        await self.db.commit()
        await self.db.refresh(user)
        return user