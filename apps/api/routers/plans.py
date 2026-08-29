from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from schemas.plan import PlanCreate, PlanResponse, UpdateSetPayload
from services.plan_service import PlanService

router = APIRouter(prefix="/api/v1/plans", tags=["Workout Plans"])


@router.get("", response_model=List[PlanResponse])
def get_plans(db: Session = Depends(get_db)):
    service = PlanService(db)
    return service.get_formatted_plans()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_plan(payload: PlanCreate, db: Session = Depends(get_db)):
    service = PlanService(db)
    plan_id = service.create_plan(payload)
    return {"id": plan_id, "message": "Plan created successfully"}


@router.put("/{plan_id}/activate")
def activate_plan(plan_id: str, db: Session = Depends(get_db)):
    service = PlanService(db)
    return service.set_active(plan_id)


@router.post("/{plan_id}/days")
def add_day(plan_id: str, name: str, target_day: str, db: Session = Depends(get_db)):
    service = PlanService(db)
    return service.add_day(plan_id, name, target_day)


@router.post("/days/{day_id}/exercises")
def add_exercise(day_id: str, name: str, category: str, db: Session = Depends(get_db)):
    service = PlanService(db)
    return service.add_exercise(day_id, name, category)


@router.patch("/exercises/{exercise_id}/sets")
def update_set(exercise_id: str, payload: UpdateSetPayload, db: Session = Depends(get_db)):
    service = PlanService(db)
    return service.update_set(exercise_id, payload)