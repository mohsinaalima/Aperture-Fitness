from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from core.database import get_db
from schemas.plan import PlanCreate, PlanResponse, UpdateSetPayload
from services.plan_service import PlanService
from dependencies.auth import get_current_user

router = APIRouter(prefix="/plans", tags=["Workout Plans"])


@router.get("", response_model=List[PlanResponse])
async def get_plans(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    service = PlanService(db)
    return await service.get_formatted_plans(current_user.id)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_plan(payload: PlanCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    service = PlanService(db)
    plan_id = await service.create_plan(payload, current_user.id)
    return {"id": plan_id, "message": "Plan created successfully"}


@router.put("/{plan_id}/activate")
async def activate_plan(plan_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    service = PlanService(db)
    return await service.set_active(plan_id, current_user.id)


@router.delete("/{plan_id}")
async def delete_plan(plan_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    return await PlanService(db).delete_plan(plan_id, current_user.id)


@router.post("/{plan_id}/days")
async def add_day(plan_id: str, name: str, target_day: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    service = PlanService(db)
    return await service.add_day(plan_id, name, target_day, current_user.id)


@router.post("/days/{day_id}/exercises")
async def add_exercise(day_id: str, name: str, category: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    service = PlanService(db)
    return await service.add_exercise(day_id, name, category, current_user.id)


@router.patch("/exercises/{exercise_id}/sets")
async def update_set(exercise_id: str, payload: UpdateSetPayload, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    service = PlanService(db)
    return await service.update_set(exercise_id, payload, current_user.id)
