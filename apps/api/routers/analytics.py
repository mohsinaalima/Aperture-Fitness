from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from dependencies.database import get_db
from dependencies.auth import get_current_user
from repositories.analytics_repository import AnalyticsRepository
from services.analytics_service import AnalyticsService
from schemas.analytics import AnalyticsDashboardResponse, LogSetInput

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsDashboardResponse)
def get_analytics_dashboard(
    exercise: str = Query("Barbell Bench Press"),
    timeframe: str = Query("12 Weeks"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    repo = AnalyticsRepository(db)
    service = AnalyticsService(repo)
    return service.get_dashboard_metrics(current_user.id, exercise, timeframe)

@router.post("/calculate-e1rm")
def calculate_e1rm(data: LogSetInput):
    e1rm = AnalyticsService.calculate_epley_1rm(data.weight, data.reps)
    return {"exercise": data.exercise_name, "e1rm": e1rm}