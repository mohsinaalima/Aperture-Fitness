from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from repositories.pricing_repository import PricingRepository
from services.pricing_service import PricingService
from schemas.pricing import PricingTableResponse

router = APIRouter(prefix="/api/pricing", tags=["Pricing Plans"])

def get_service(db: AsyncSession = Depends(get_db)) -> PricingService:
    repo = PricingRepository(db)
    return PricingService(repo)

@router.get("", response_model=PricingTableResponse, status_code=status.HTTP_200_OK)
async def get_pricing_matrix(
    service: PricingService = Depends(get_service)
):
    """
    Returns full structured pricing matrix for the pricing page.
    """
    return await service.get_pricing_table()