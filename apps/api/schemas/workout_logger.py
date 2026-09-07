from pydantic import BaseModel, Field
from typing import List, Optional

class StartSessionRequest(BaseModel):
    plan_id: str
    day_id: str

class ToggleSetRequest(BaseModel):
    exercise_index: int
    set_index: int
    weight_kg: float
    completed_reps: int

class SetSchema(BaseModel):
    id: str
    set_number: int
    weight: float = Field(..., alias="weight_kg")
    target_reps: int
    completed: bool = Field(..., alias="is_completed")

    class Config:
        from_attributes = True
        populate_by_name = True

class ExerciseSchema(BaseModel):
    id: str
    name: str = Field(..., alias="exercise_name")
    category: str
    sets: List[SetSchema]

    class Config:
        from_attributes = True
        populate_by_name = True

class ActiveWorkoutResponse(BaseModel):
    id: str
    dayName: str = Field(..., alias="day_name")
    status: str
    exercises: List[ExerciseSchema]

    class Config:
        from_attributes = True
        populate_by_name = True

class PlateBreakdownResponse(BaseModel):
    target_weight_kg: float
    barbell_weight_kg: float
    weight_per_side_kg: float
    plates_per_side: List[float]

class WarmupSetResponse(BaseModel):
    percentage: int
    weight_kg: float
    reps: int
    label: str