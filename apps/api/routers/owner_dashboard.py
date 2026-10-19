from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_owned_gym
from models.account_flows import Gym
from repositories.owner_dashboard_repository import OwnerDashboardRepository
from services.owner_dashboard_service import OwnerDashboardService
from schemas.owner_dashboard import (
    DashboardDataResponse,
    TrainerRosterItem,
)

router = APIRouter(prefix="/api/owner/dashboard", tags=["Owner Dashboard"])

def get_service(db: AsyncSession = Depends(get_db)) -> OwnerDashboardService:
    repo = OwnerDashboardRepository(db)
    return OwnerDashboardService(repo)

@router.get("", response_model=DashboardDataResponse, status_code=status.HTTP_200_OK)
async def get_owner_dashboard(
    gym: Gym = Depends(get_current_owned_gym),
    service: OwnerDashboardService = Depends(get_service),
):
    """
    Fetch facility management KPIs and trainer roster with real-time attendance and fee compliance.
    """
    return await service.get_dashboard_overview(gym.id)

@router.post("/invite", response_model=TrainerRosterItem, status_code=status.HTTP_201_CREATED)
async def invite_trainer(
    gym: Gym = Depends(get_current_owned_gym),
):
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Use /api/onboarding/gym/invitations to invite an existing account.",
    )
