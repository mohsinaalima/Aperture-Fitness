from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user  # Import your auth handler
from repositories.dashboard_repository import DashboardRepository
from services.dashboard_service import DashboardService
from schemas.dashboard import DashboardDataResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardDataResponse, status_code=status.HTTP_200_OK)
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    repo = DashboardRepository(db)
    service = DashboardService(repo)
    return await service.get_dashboard_summary(user_id=current_user.id)