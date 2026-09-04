from typing import List, Optional
from repositories.exercise_repository import ExerciseRepository
from schemas.exercise import ExerciseListResponse, ExerciseResponse

INITIAL_LIBRARY = [
    {"name": "Barbell Bench Press", "category": "Chest", "primaryMuscle": "Pectoralis Major", "equipment": "Barbell"},
    {"name": "Barbell Back Squat", "category": "Quads", "primaryMuscle": "Quadriceps, Glutes", "equipment": "Barbell"},
    {"name": "Romanian Deadlift", "category": "Posterior Chain", "primaryMuscle": "Hamstrings, Glutes", "equipment": "Barbell"},
    {"name": "Overhead Barbell Press", "category": "Shoulders", "primaryMuscle": "Anterior Deltoid", "equipment": "Barbell"},
    {"name": "Incline Dumbbell Press", "category": "Chest", "primaryMuscle": "Clavicular Pectoralis", "equipment": "Dumbbells"},
    {"name": "Lat Pulldown", "category": "Back", "primaryMuscle": "Latissimus Dorsi", "equipment": "Cable"},
]

class ExerciseService:
    def __init__(self, repository: ExerciseRepository):
        self.repository = repository

    async def get_exercise_library(
        self, category: Optional[str] = None, search: Optional[str] = None
    ) -> ExerciseListResponse:
        # Auto-seed database if empty
        await self.repository.seed_initial_data_if_empty(INITIAL_LIBRARY)

        categories = await self.repository.get_all_categories()
        exercises = await self.repository.get_filtered_exercises(category=category, search=search)

        exercise_dtos = [ExerciseResponse.model_validate(ex) for ex in exercises]

        return ExerciseListResponse(
            total=len(exercise_dtos),
            categories=categories,
            exercises=exercise_dtos
        )