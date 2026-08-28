from pydantic import BaseModel, Field
from typing import List, Optional


class ExerciseSetSpec(BaseModel):
    id: str
    weight: float = 0.0
    targetReps: int = 10
    restSeconds: int = 90


class CustomExerciseCreate(BaseModel):
    name: str
    category: str
    equipment: Optional[str] = "Custom"
    targetMuscle: Optional[str] = "Target Muscle"


class PlanExerciseSchema(BaseModel):
    id: str
    name: str
    category: str
    sets: List[ExerciseSetSpec] = []

    class Config:
        from_attributes = True


class PlanDaySchema(BaseModel):
    id: str
    name: str
    targetDay: str
    exercises: List[PlanExerciseSchema] = []

    class Config:
        from_attributes = True


class PlanCreate(BaseModel):
    name: str
    description: Optional[str] = None
    focus: Optional[str] = "Custom Split"


class PlanResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    focus: str
    isActive: bool
    daysCount: int
    lastEdited: Optional[str] = None
    days: List[PlanDaySchema] = []

    class Config:
        from_attributes = True


class UpdateSetPayload(BaseModel):
    set_index: int
    field: str
    value: float | int