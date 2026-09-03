from sqlalchemy.orm import Session
from models.analytics import ExerciseAnalytics, WeeklyVolume, PersonalRecord

class AnalyticsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_strength_history(self, user_id: str, exercise: str, limit: int = 6):
        return (
            self.db.query(ExerciseAnalytics)
            .filter(
                ExerciseAnalytics.user_id == user_id,
                ExerciseAnalytics.exercise_name == exercise
            )
            .order_by(ExerciseAnalytics.logged_date.asc())
            .limit(limit)
            .all()
        )

    def get_weekly_volume(self, user_id: str, limit: int = 8):
        return (
            self.db.query(WeeklyVolume)
            .filter(WeeklyVolume.user_id == user_id)
            .order_by(WeeklyVolume.created_at.asc())
            .limit(limit)
            .all()
        )

    def get_recent_prs(self, user_id: str, limit: int = 3):
        return (
            self.db.query(PersonalRecord)
            .filter(PersonalRecord.user_id == user_id)
            .order_by(PersonalRecord.created_at.desc())
            .limit(limit)
            .all()
        )