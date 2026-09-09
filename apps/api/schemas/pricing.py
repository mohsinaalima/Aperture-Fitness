from pydantic import BaseModel, Field
from typing import List, Optional

class TierHeaderSchema(BaseModel):
    id: str
    slug: str
    name: str
    priceFormatted: str
    isRecommended: bool
    ctaLabel: str
    ctaLink: str

class FeatureRowSchema(BaseModel):
    featureName: str
    values: dict[str, str]

class PricingTableResponse(BaseModel):
    tiers: List[TierHeaderSchema]
    features: List[FeatureRowSchema]

class CreateTierRequest(BaseModel):
    slug: str = Field(..., example="pro-athlete")
    name: str = Field(..., example="Pro Athlete Tier")
    price_monthly: float = Field(..., ge=0.0, example=12.0)
    is_recommended: bool = Field(False)
    cta_label: str = Field("Start Pro Trial")
    cta_link: str = Field("/dashboard")