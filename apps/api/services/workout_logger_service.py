import math
from typing import List, Optional
from datetime import datetime
from repositories.workout_logger_repository import WorkoutLoggerRepository
from models.workout_logger import WorkoutSession, LoggedExercise, LoggedSet
from schemas.workout_logger import (
    StartSessionRequest,
    ToggleSetRequest,
    PlateBreakdownResponse,
    WarmupSetResponse,
)

class WorkoutLoggerService:
    def __init__(self, repository: WorkoutLoggerRepository):
        self.repository = repository

    async def get_current_workout(self, user_id: str) -> Optional[WorkoutSession]:
        return await self.repository.get_active_session(user_id)

    async def start_session(self, user_id: str, request: StartSessionRequest) -> WorkoutSession:
        existing = await self.repository.get_active_session(user_id)
        if existing:
            return existing

        session = WorkoutSession(
            user_id=user_id,
            plan_id=request.plan_id,
            day_id=request.day_id,
            day_name="Push Day Alpha",
            status="IN_PROGRESS",
        )

        sample_exercises = [
            ("Barbell Bench Press", "Chest", 4, 80.0, 8),
            ("Incline Dumbbell Press", "Chest", 3, 30.0, 10),
            ("Tricep Rope Pushdowns", "Triceps", 3, 25.0, 12),
        ]

        for idx, (name, cat, set_count, default_w, default_reps) in enumerate(sample_exercises):
            ex = LoggedExercise(exercise_name=name, category=cat, order_index=idx)
            for s_idx in range(1, set_count + 1):
                ex.sets.append(
                    LoggedSet(
                        set_number=s_idx,
                        weight_kg=default_w,
                        target_reps=default_reps,
                        completed_reps=0,
                        is_completed=False,
                    )
                )
            session.exercises.append(ex)

        return await self.repository.create_session(session)

    async def toggle_set(self, user_id: str, request: ToggleSetRequest) -> WorkoutSession:
        session = await self.repository.get_active_session(user_id)
        if not session:
            raise ValueError("No active workout session found.")

        target_exercise = session.exercises[request.exercise_index]
        target_set = target_exercise.sets[request.set_index]

        target_set.weight_kg = request.weight_kg
        target_set.completed_reps = request.completed_reps
        target_set.is_completed = True

        await self.repository.save()
        return session

    async def finish_session(self, user_id: str) -> Optional[WorkoutSession]:
        session = await self.repository.get_active_session(user_id)
        if not session:
            return None

        session.status = "COMPLETED"
        session.completed_at = datetime.utcnow()
        await self.repository.save()
        return session

    @staticmethod
    def calculate_plates(target_weight: float, bar_weight: float = 20.0) -> PlateBreakdownResponse:
        if target_weight < bar_weight:
            return PlateBreakdownResponse(
                target_weight_kg=target_weight,
                barbell_weight_kg=bar_weight,
                weight_per_side_kg=0,
                plates_per_side=[],
            )

        side_weight = (target_weight - bar_weight) / 2.0
        available_plates = [25.0, 20.0, 15.0, 10.0, 5.0, 2.5, 1.25]
        result_plates = []

        remaining = side_weight
        for plate in available_plates:
            while remaining >= plate:
                result_plates.append(plate)
                remaining = round(remaining - plate, 2)

        return PlateBreakdownResponse(
            target_weight_kg=target_weight,
            barbell_weight_kg=bar_weight,
            weight_per_side_kg=side_weight,
            plates_per_side=result_plates,
        )

    @staticmethod
    def calculate_warmup(working_weight: float) -> List[WarmupSetResponse]:
        protocols = [
            (0.40, 10, "40% Working Weight"),
            (0.60, 5, "60% Working Weight"),
            (0.80, 3, "80% Working Weight"),
            (0.90, 1, "90% Working Weight (Feeler)"),
        ]

        warmup_sets = []
        for pct, reps, label in protocols:
            calc_w = math.ceil((working_weight * pct) / 2.5) * 2.5
            warmup_sets.append(
                WarmupSetResponse(
                    percentage=int(pct * 100),
                    weight_kg=calc_w,
                    reps=reps,
                    label=label,
                )
            )

        return warmup_sets