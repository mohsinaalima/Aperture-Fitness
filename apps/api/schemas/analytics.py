from pydantic import BaseModel
from typing import List, Optional

class VolumeDataPoint(BaseModel):
    week: str
    volume: float

class StrengthDataPoint(BaseModel):
    month: str
    e1rm: float
    isPR: bool

class PRHistoryItem(BaseModel):
    exercise: str
    metric: str
    date: str
    delta: str

class AnalyticsDashboardResponse(BaseModel):
    exercise_name: str
    current_e1rm: float
    consistency_score: int
    volume_data: List[VolumeDataPoint]
    strength_data: List[StrengthDataPoint]
    pr_history: List[PRHistoryItem]

class LogSetInput(BaseModel):
    exercise_name: str
    weight: float
    reps: int