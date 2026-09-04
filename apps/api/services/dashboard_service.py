from repositories.dashboard_repository import DashboardRepository
from schemas.dashboard import DashboardDataResponse, PlanResponse, DaySpec, CompletedSessionResponse

class DashboardService:
    def __init__(self, repository: DashboardRepository):
        self.repository = repository

    async def get_dashboard_summary(self, user_id: str) -> DashboardDataResponse:
        active_plan_model = await self.repository.get_active_plan(user_id)
        sessions = await self.repository.get_completed_sessions(user_id)
        monthly_volume = await self.repository.get_monthly_volume(user_id)

        # Parse Plan Data
        active_plan = None
        today_day_spec = None

        if active_plan_model:
            parsed_days = [DaySpec(**day) for day in active_plan_model.days] if active_plan_model.days else []
            active_plan = PlanResponse(
                id=active_plan_model.id,
                name=active_plan_model.name,
                isActive=active_plan_model.is_active,
                days=parsed_days
            )
            if parsed_days:
                today_day_spec = parsed_days[0]

        # Parse Session Data
        formatted_sessions = [
            CompletedSessionResponse(
                id=s.id,
                sessionName=s.session_name,
                totalVolumeKg=s.total_volume_kg,
                durationMinutes=s.duration_minutes,
                completedAt=s.completed_at
            ) for s in sessions
        ]

        last_logged = formatted_sessions[0].completedAt if formatted_sessions else None

        return DashboardDataResponse(
            activePlan=active_plan,
            todayDaySpec=today_day_spec,
            totalMonthlyVolume=monthly_volume,
            completedSessionsCount=len(formatted_sessions),
            lastLoggedAt=last_logged,
            completedSessions=formatted_sessions
        )