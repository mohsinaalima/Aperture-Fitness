from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from core.database import get_db
from dependencies.auth import get_current_user
from repositories.workout_logger_repository import WorkoutLoggerRepository
from services.workout_logger_service import WorkoutLoggerService
from schemas.workout_logger import (
    ActiveWorkoutResponse,
    StartSessionRequest,
    ToggleSetRequest,
    PlateBreakdownResponse,
    WarmupSetResponse,
)

router = APIRouter(prefix="/workout-logger", tags=["Workout Logger"])

@router.get("/active", response_model=Optional[ActiveWorkoutResponse])
async def get_active_workout(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    repo = WorkoutLoggerRepository(db)
    service = WorkoutLoggerService(repo)
    session = await service.get_current_workout(current_user.id)
    return session

@router.post("/start", response_model=ActiveWorkoutResponse, status_code=status.HTTP_201_CREATED)
async def start_workout(
    body: StartSessionRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    repo = WorkoutLoggerRepository(db)
    service = WorkoutLoggerService(repo)
    return await service.start_session(current_user.id, body)

@router.post("/toggle-set", response_model=ActiveWorkoutResponse)
async def toggle_set(
    body: ToggleSetRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    repo = WorkoutLoggerRepository(db)
    service = WorkoutLoggerService(repo)
    try:
        return await service.toggle_set(current_user.id, body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/finish", status_code=status.HTTP_200_OK)
async def finish_workout(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user),
):
    repo = WorkoutLoggerRepository(db)
    service = WorkoutLoggerService(repo)
    completed = await service.finish_session(current_user.id)
    if not completed:
        raise HTTPException(status_code=404, detail="No active workout to finish")
    return {"message": "Workout session completed successfully."}

@router.get("/calculate-plates", response_model=PlateBreakdownResponse)
def calculate_plates(
    weight: float = Query(..., gt=0),
    bar_weight: float = Query(20.0, ge=0),
):
    return WorkoutLoggerService.calculate_plates(weight, bar_weight)

@router.get("/calculate-warmup", response_model=List[WarmupSetResponse])
def calculate_warmup(
    working_weight: float = Query(..., gt=0),
):
    return WorkoutLoggerService.calculate_warmup(working_weight)