from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from repositories.owner_dashboard_repository import OwnerDashboardRepository
from services.owner_dashboard_service import OwnerDashboardService
from schemas.owner_dashboard import (
    DashboardDataResponse,
    InviteTrainerRequest,
    TrainerRosterItem,
)

router = APIRouter(prefix="/api/owner/dashboard", tags=["Owner Dashboard"])

def get_service(db: AsyncSession = Depends(get_db)) -> OwnerDashboardService:
    repo = OwnerDashboardRepository(db)
    return OwnerDashboardService(repo)

@router.get("", response_model=DashboardDataResponse, status_code=status.HTTP_200_OK)
async def get_owner_dashboard(
    service: OwnerDashboardService = Depends(get_service),
):
    """
    Fetch facility management KPIs and trainer roster with real-time attendance and fee compliance.
    """
    return await service.get_dashboard_overview()

@router.post("/invite", response_model=TrainerRosterItem, status_code=status.HTTP_201_CREATED)
async def invite_trainer(
    body: InviteTrainerRequest,
    service: OwnerDashboardService = Depends(get_service),
):
    """
    Invite a new trainer to the gym facility roster.
    """
    try:
        return await service.invite_trainer(body)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Failed to invite trainer: {str(e)}"
        )