from pydantic import BaseModel
from typing import Optional, List

class HeroContentResponse(BaseModel):
    badgeText: str
    headline: str
    subheadline: str
    calibrationPercentage: int

    class Config:
        from_attributes = True

class ShowcaseCardResponse(BaseModel):
    exerciseName: str
    setSummary: str
    loadWeightKg: float
    reps: int

class LandingPageDataResponse(BaseModel):
    hero: HeroContentResponse
    showcase: ShowcaseCardResponse
    totalActiveAthletes: int
    totalWorkoutsLogged: int

    class Config:
        from_attributes = True