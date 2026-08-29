from sqlalchemy.orm import Session
from models.plan import WorkoutPlan, PlanDay, PlanExercise
from typing import List, Optional
import uuid


class PlanRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, user_id: Optional[str] = None) -> List[WorkoutPlan]:
        query = self.db.query(WorkoutPlan)
        if user_id:
            query = query.filter(WorkoutPlan.user_id == user_id)
        return query.all()

    def get_by_id(self, plan_id: str) -> Optional[WorkoutPlan]:
        return self.db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()

    def create_plan(self, name: str, description: Optional[str], focus: str = "Custom Split", user_id: Optional[str] = None) -> WorkoutPlan:
        plan = WorkoutPlan(name=name, description=description, focus=focus, user_id=user_id)
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def set_active(self, plan_id: str, user_id: Optional[str] = None) -> Optional[WorkoutPlan]:
        # Deactivate all active plans
        query = self.db.query(WorkoutPlan)
        if user_id:
            query = query.filter(WorkoutPlan.user_id == user_id)
        query.update({WorkoutPlan.is_active: False})

        # Set target plan active
        plan = self.get_by_id(plan_id)
        if plan:
            plan.is_active = True
            self.db.commit()
            self.db.refresh(plan)
        return plan

    def add_day(self, plan_id: str, name: str, target_day: str) -> Optional[PlanDay]:
        plan = self.get_by_id(plan_id)
        if not plan:
            return None
        day = PlanDay(
            plan_id=plan_id,
            name=name,
            target_day=target_day,
            order=len(plan.days) + 1
        )
        self.db.add(day)
        self.db.commit()
        self.db.refresh(day)
        return day

    def add_exercise(self, day_id: str, name: str, category: str) -> Optional[PlanExercise]:
        day = self.db.query(PlanDay).filter(PlanDay.id == day_id).first()
        if not day:
            return None
        
        # Default starting sets template (matches front-end expectations)
        default_sets = [
            {"id": str(uuid.uuid4())[:8], "weight": 60.0, "targetReps": 10, "restSeconds": 90},
            {"id": str(uuid.uuid4())[:8], "weight": 60.0, "targetReps": 10, "restSeconds": 90},
            {"id": str(uuid.uuid4())[:8], "weight": 60.0, "targetReps": 10, "restSeconds": 90},
        ]

        exercise = PlanExercise(
            day_id=day_id,
            name=name,
            category=category,
            order=len(day.exercises) + 1,
            sets=default_sets
        )
        self.db.add(exercise)
        self.db.commit()
        self.db.refresh(exercise)
        return exercise

    def update_set(self, exercise_id: str, set_index: int, field: str, value: float | int) -> Optional[PlanExercise]:
        exercise = self.db.query(PlanExercise).filter(PlanExercise.id == exercise_id).first()
        if not exercise:
            return None
        
        sets = list(exercise.sets or [])
        if 0 <= set_index < len(sets):
            sets[set_index][field] = value
            exercise.sets = sets
            self.db.commit()
            self.db.refresh(exercise)
            return exercise
        return None