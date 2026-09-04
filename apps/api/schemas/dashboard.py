from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ExerciseSpec(BaseModel):
    name: str
    target_sets: int
    target_reps: str

class DaySpec(BaseModel):
    name: str
    exercises: List[ExerciseSpec] = []

class PlanResponse(BaseModel):
    id: str
    name: str
    isActive: bool
    days: List[DaySpec] = []

    class Config:
        from_attributes = True

class CompletedSessionResponse(BaseModel):
    id: str
    sessionName: str
    totalVolumeKg: float
    durationMinutes: int
    completedAt: datetime

    class Config:
        from_attributes = True

class DashboardDataResponse(BaseModel):
    activePlan: Optional[PlanResponse] = None
    todayDaySpec: Optional[DaySpec] = None
    totalMonthlyVolume: float
    completedSessionsCount: int
    lastLoggedAt: Optional[datetime] = None
    completedSessions: List[CompletedSessionResponse] = []