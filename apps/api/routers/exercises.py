from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user  # Import your auth dependency if required
from repositories.exercise_repository import ExerciseRepository
from services.exercise_service import ExerciseService
from schemas.exercise import ExerciseListResponse

router = APIRouter(prefix="/exercises", tags=["Exercise Library"])

@router.get("", response_model=ExerciseListResponse)
async def get_exercise_library(
    category: str = Query("All", description="Filter by category"),
    search: str = Query("", description="Search term for exercise name or primary muscle"),
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user) # Uncomment to enforce authentication
):
    repo = ExerciseRepository(db)
    service = ExerciseService(repo)
    return await service.get_exercise_library(category=category, search=search)