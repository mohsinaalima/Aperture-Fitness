from pydantic import BaseModel, Field
from typing import List, Optional

class ExerciseBase(BaseModel):
    name: str
    category: str
    primaryMuscle: str = Field(..., alias="primary_muscle")
    equipment: str

    class Config:
        from_attributes = True
        populate_by_name = True

class ExerciseResponse(ExerciseBase):
    id: str

class ExerciseListResponse(BaseModel):
    total: int
    categories: List[str]
    exercises: List[ExerciseResponse]

class ExerciseCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=80)
    primary_muscle: str = Field(..., min_length=2, max_length=150)
    equipment: str = Field("Custom", min_length=2, max_length=80)
