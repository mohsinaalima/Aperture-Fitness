from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import Optional


class SystemPreferencesSchema(BaseModel):
    unitSystem: str = Field(..., example="Metric (KG)")
    unitDescription: str = Field(..., example="Kilograms (kg) with 2.5kg steppers")
    restIntervalSeconds: int = Field(..., example=90)


class SubscriptionBillingSchema(BaseModel):
    planName: str = Field(..., example="Aperture Pro Tier")
    renewalDateFormatted: str = Field(..., example="Sep 15, 2026")
    monthlyPriceFormatted: str = Field(..., example="$12.00 / mo")


class ProfileResponse(BaseModel):
    id: str
    fullName: str
    email: str
    initials: str
    membershipTier: str
    preferences: SystemPreferencesSchema
    billing: SubscriptionBillingSchema

    class Config:
        from_attributes = True


class UpdatePreferencesRequest(BaseModel):
    unitSystem: Optional[str] = Field(None, example="Metric (KG)")
    restIntervalSeconds: Optional[int] = Field(None, ge=10, le=600, example=90)