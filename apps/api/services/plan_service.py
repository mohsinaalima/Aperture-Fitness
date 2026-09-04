from sqlalchemy.orm import Session
from repositories.plan_repository import PlanRepository
from schemas.plan import PlanCreate, UpdateSetPayload
from fastapi import HTTPException, status


class PlanService:
    def __init__(self, db: Session):
        self.repo = PlanRepository(db)

    def get_formatted_plans(self, user_id: str = None):
        plans = self.repo.get_all(user_id)
        result = []
        for p in plans:
            result.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "focus": p.focus or "Custom Split",
                "isActive": p.is_active,
                "daysCount": len(p.days),
                "lastEdited": p.updated_at.strftime("%b %d, %Y") if p.updated_at else "",
                "days": [
                    {
                        "id": d.id,
                        "name": d.name,
                        "targetDay": d.target_day,
                        "exercises": [
                            {
                                "id": e.id,
                                "name": e.name,
                                "category": e.category,
                                "sets": e.sets or []
                            } for e in d.exercises
                        ]
                    } for d in p.days
                ]
            })
        return result

    def create_plan(self, data: PlanCreate, user_id: str = None):
        plan = self.repo.create_plan(data.name, data.description, data.focus, user_id)
        # Seed Day 1 automatically
        self.repo.add_day(plan.id, "Day 1: Upper Hypertrophy", "Mon")
        return plan.id

    def set_active(self, plan_id: str, user_id: str = None):
        plan = self.repo.set_active(plan_id, user_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        return {"status": "success", "active_plan_id": plan.id}

    def add_day(self, plan_id: str, name: str, target_day: str):
        day = self.repo.add_day(plan_id, name, target_day)
        if not day:
            raise HTTPException(status_code=404, detail="Plan not found")
        return day

    def add_exercise(self, day_id: str, name: str, category: str):
        ex = self.repo.add_exercise(day_id, name, category)
        if not ex:
            raise HTTPException(status_code=404, detail="Day not found")
        return ex

    def update_set(self, exercise_id: str, payload: UpdateSetPayload):
        ex = self.repo.update_set(exercise_id, payload.set_index, payload.field, payload.value)
        if not ex:
            raise HTTPException(status_code=400, detail="Could not update set specifications")
        return ex