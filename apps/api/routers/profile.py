from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from repositories.user_profile_repository import UserProfileRepository
from services.user_profile_service import UserProfileService
from schemas.user_profile import ProfileResponse, UpdatePreferencesRequest

router = APIRouter(prefix="/api/profile", tags=["User Profile"])


def get_service(db: AsyncSession = Depends(get_db)) -> UserProfileService:
    repo = UserProfileRepository(db)
    return UserProfileService(repo)


@router.get("", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
async def get_user_profile(
    service: UserProfileService = Depends(get_service),
):
    """
    Fetch current logged in user profile, system preferences, and subscription status.
    """
    return await service.get_profile()


@router.patch("/preferences", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
async def update_user_preferences(
    body: UpdatePreferencesRequest,
    service: UserProfileService = Depends(get_service),
):
    """
    Update system unit preference (Metric vs Imperial) and default rest timer.
    """
    try:
        return await service.update_preferences(body)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update preferences: {str(e)}",
        )