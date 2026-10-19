from repositories.dashboard_repository import DashboardRepository
from schemas.dashboard import DashboardDataResponse, PlanResponse, DaySpec, ExerciseSpec, CompletedSessionResponse

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
            parsed_days = [
                DaySpec(
                    name=day.name,
                    exercises=[
                        ExerciseSpec(
                            name=exercise.name,
                            target_sets=len(exercise.sets or []),
                            target_reps=str((exercise.sets or [{}])[0].get("targetReps", 0)),
                        )
                        for exercise in day.exercises
                    ],
                )
                for day in active_plan_model.days
            ]
            active_plan = PlanResponse(
                id=active_plan_model.id,
                name=active_plan_model.name,
                isActive=active_plan_model.is_active,
                days=parsed_days
            )
            if parsed_days:
                today_day_spec = parsed_days[0]

        # Parse Session Data
        formatted_sessions = []
        for session in sessions:
            volume = sum(
                set_row.weight_kg * set_row.completed_reps
                for exercise in session.exercises
                for set_row in exercise.sets
                if set_row.is_completed
            )
            duration = max(1, round(((session.completed_at or session.started_at) - session.started_at).total_seconds() / 60))
            formatted_sessions.append(CompletedSessionResponse(
                id=session.id,
                sessionName=session.day_name,
                totalVolumeKg=volume,
                durationMinutes=duration,
                completedAt=session.completed_at or session.started_at,
            ))

        last_logged = formatted_sessions[0].completedAt if formatted_sessions else None

        return DashboardDataResponse(
            activePlan=active_plan,
            todayDaySpec=today_day_spec,
            totalMonthlyVolume=monthly_volume,
            completedSessionsCount=len(formatted_sessions),
            lastLoggedAt=last_logged,
            completedSessions=formatted_sessions
        )
