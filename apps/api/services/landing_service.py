from repositories.landing_repository import LandingRepository
from schemas.landing import LandingPageDataResponse, HeroContentResponse, ShowcaseCardResponse

class LandingService:
    def __init__(self, repository: LandingRepository):
        self.repository = repository

    async def get_landing_page_data(self) -> LandingPageDataResponse:
        await self.repository.seed_default_landing_data_if_empty()

        hero = await self.repository.get_active_hero_content()
        stats = await self.repository.get_platform_stats()

        hero_dto = HeroContentResponse(
            badgeText=hero.badge_text if hero else "Precision Strength Instrument",
            headline=hero.headline if hero else "Strength Training Built Like an Instrument.",
            subheadline=hero.subheadline if hero else "Monospace readouts, 1px hairline interfaces, and mechanical iris progress metrics.",
            calibrationPercentage=hero.calibration_percentage if hero else 50
        )

        showcase_dto = ShowcaseCardResponse(
            exerciseName="Barbell Bench Press",
            setSummary="SET 3 OF 4",
            loadWeightKg=85.0,
            reps=6
        )

        return LandingPageDataResponse(
            hero=hero_dto,
            showcase=showcase_dto,
            totalActiveAthletes=stats.total_active_athletes if stats else 1000,
            totalWorkoutsLogged=stats.total_workouts_logged if stats else 25000
        )