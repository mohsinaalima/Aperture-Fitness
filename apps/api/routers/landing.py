from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from repositories.landing_repository import LandingRepository
from services.landing_service import LandingService
from schemas.landing import LandingPageDataResponse

router = APIRouter(prefix="/landing", tags=["Landing Page"])

@router.get("", response_model=LandingPageDataResponse, status_code=status.HTTP_200_OK)
async def get_landing_data(db: AsyncSession = Depends(get_db)):
    repo = LandingRepository(db)
    service = LandingService(repo)
    return await service.get_landing_page_data()