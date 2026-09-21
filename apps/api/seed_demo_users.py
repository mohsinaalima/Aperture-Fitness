import asyncio
from core.database import AsyncSessionLocal
from core.security import hash_password
from models.user import User, UserRole
from sqlalchemy import select

DEMO_ACCOUNTS = [
    {
        "email": "owner@aperture.fit",
        "username": "owner",
        "name": "Marcus Aurelius",
        "gym_name": "Aperture Iron Vault • Central",
        "password": "Password123!",
        "role": UserRole.OWNER,
    },
    {
        "email": "trainer@aperture.fit",
        "username": "trainer",
        "name": "Elena Rostova",
        "gym_name": "Aperture Iron Vault • Central",
        "password": "Password123!",
        "role": UserRole.TRAINER,
    },
    {
        "email": "athlete@aperture.fit",
        "username": "athlete",
        "name": "Alex Foster",
        "gym_name": "Aperture Iron Vault • Central",
        "password": "Password123!",
        "role": UserRole.MEMBER,
    },
]


async def seed():
    async with AsyncSessionLocal() as session:
        for acc in DEMO_ACCOUNTS:
            stmt = select(User).where(User.email == acc["email"])
            res = await session.execute(stmt)
            existing = res.scalars().first()

            if not existing:
                user = User(
                    email=acc["email"],
                    username=acc["username"],
                    name=acc["name"],
                    gym_name=acc["gym_name"],
                    hashed_password=hash_password(acc["password"]),
                    role=acc["role"],
                    is_active=True,
                    is_verified=True,
                )
                session.add(user)
        await session.commit()
        print("Demo users successfully created in PostgreSQL database.")


if __name__ == "__main__":
    asyncio.run(seed())