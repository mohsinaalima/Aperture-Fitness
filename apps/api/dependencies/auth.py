from datetime import datetime, timezone
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from models.account_flows import Gym, GymMembership, GymRole, GymMembershipStatus, TrainerProfile
from models.user import User
from repositories.session_repository import SessionRepository
from repositories.user_repository import UserRepository


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    raw_session = request.cookies.get(settings.AUTH_SESSION_COOKIE)
    if not raw_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sign in to continue.",
            headers={"WWW-Authenticate": "Session"},
        )

    session = await SessionRepository(db).get_valid(raw_session, datetime.now(timezone.utc))
    if not session:
        raise HTTPException(status_code=401, detail="Your session has expired. Sign in again.")
    user = await UserRepository(db).get_by_id(session.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Your session is no longer valid.")
    request.state.auth_session_token = raw_session
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user


async def get_current_trainer_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TrainerProfile:
    result = await db.execute(select(TrainerProfile).where(TrainerProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=403, detail="Complete trainer setup to access this area.")
    return profile


async def get_current_owned_gym(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Gym:
    result = await db.execute(select(Gym).where(Gym.owner_user_id == current_user.id))
    gym = result.scalar_one_or_none()
    if not gym:
        raise HTTPException(status_code=403, detail="Complete gym setup to access this area.")
    return gym


async def require_active_gym_membership(
    gym_id: UUID,
    current_user: User,
    db: AsyncSession,
    roles: set[GymRole] | None = None,
) -> GymMembership:
    result = await db.execute(
        select(GymMembership).where(
            GymMembership.gym_id == gym_id,
            GymMembership.user_id == current_user.id,
            GymMembership.status == GymMembershipStatus.ACTIVE,
        )
    )
    membership = result.scalar_one_or_none()
    if not membership or (roles and membership.role not in roles):
        raise HTTPException(status_code=403, detail="You do not have access to this gym.")
    return membership
