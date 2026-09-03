from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from apps.api.dependencies.database import get_db
from apps.api.schemas.about import AboutPageResponse

router = APIRouter(prefix="/about", tags=["About"])

@router.get("", response_model=AboutPageResponse)
def get_about_page_info(db: Session = Depends(get_db)):
    """
    Returns brand philosophy, platform metadata, and core design pillars
    for the About page.
    """
    return {
        "brand_name": "APERTURE",
        "tagline": "Optics Meets Heavy Iron",
        "philosophy": (
            "An aperture is a mechanical iris—a ring of overlapping blades that opens "
            "and closes to control how much light passes through a lens. That’s a genuinely "
            "fitting metaphor for strength training: controlled, incremental, precise adjustment "
            "toward a measurable outcome."
        ),
        "pillars": [
            {
                "id": 1,
                "title": "1. Instrument Readouts",
                "description": "Numbers behave like instrument readouts in tabular monospace, guaranteed never to jitter as values update mid-workout."
            },
            {
                "id": 2,
                "title": "2. Single Accent Rule",
                "description": "Iris green is used only at 3–5% of visible pixels, acting like a light meter needle—rare, precise, and purposeful."
            }
        ]
    }