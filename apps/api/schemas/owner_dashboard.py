from pydantic import BaseModel, Field
from typing import List, Optional

class InviteTrainerRequest(BaseModel):
    name: str = Field(..., min_length=2)
    specialization: str
    monthly_revenue: float = Field(0.0, ge=0.0)

class TrainerRosterItem(BaseModel):
    id: str
    name: str
    specialization: str
    presentToday: bool
    checkInTime: str
    assignedClients: int
    feeStatus: str
    monthlyRevenue: str

    class Config:
        from_attributes = True

class DashboardMetricsResponse(BaseModel):
    totalTrainers: int
    presentToday: int
    attendancePercentage: float
    paidCount: int
    pendingInvoicesCount: int
    totalManagedMembers: int

class DashboardDataResponse(BaseModel):
    metrics: DashboardMetricsResponse
    roster: List[TrainerRosterItem]
