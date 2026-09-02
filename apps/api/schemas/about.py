from pydantic import BaseModel
from typing import List

class PillarItem(BaseModel):
    id: int
    title: str
    description: str

class AboutPageResponse(BaseModel):
    brand_name: str
    tagline: str
    philosophy: str
    pillars: List[PillarItem]