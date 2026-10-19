from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_trainer_profile
from models.account_flows import TrainerClient, TrainerClientStatus, TrainerProfile
from models.user import User
from schemas.trainer import ClientPlanUpdate, ClientResponse, StatusEnum

router = APIRouter(prefix="/trainer", tags=["Trainer Workspace"])


def _client_payload(relationship: TrainerClient, client: User) -> dict:
    return {
        "id": str(relationship.id),
        "name": client.name,
        "assignedPlan": relationship.assigned_plan,
        "lastActive": "Not active yet",
        "compliance": 0,
        "status": StatusEnum.ON_TRACK.value,
        "recentPR": None,
    }


@router.get("/clients", response_model=list[ClientResponse])
async def get_roster(
    profile: TrainerProfile = Depends(get_current_trainer_profile),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainerClient, User)
        .join(User, User.id == TrainerClient.client_user_id)
        .where(
            TrainerClient.trainer_profile_id == profile.id,
            TrainerClient.status == TrainerClientStatus.ACTIVE,
        )
    )
    return [_client_payload(link, client) for link, client in result.all()]


@router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client_details(
    client_id: UUID,
    profile: TrainerProfile = Depends(get_current_trainer_profile),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainerClient, User)
        .join(User, User.id == TrainerClient.client_user_id)
        .where(
            TrainerClient.id == client_id,
            TrainerClient.trainer_profile_id == profile.id,
            TrainerClient.status == TrainerClientStatus.ACTIVE,
        )
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Active client relationship not found.")
    return _client_payload(*row)


@router.post("/clients", status_code=status.HTTP_410_GONE)
async def add_client_without_invitation(
    profile: TrainerProfile = Depends(get_current_trainer_profile),
):
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Use /api/onboarding/trainer/invitations with the client's registered email.",
    )


@router.patch("/clients/{client_id}", response_model=ClientResponse)
async def update_client_plan(
    client_id: UUID,
    body: ClientPlanUpdate,
    profile: TrainerProfile = Depends(get_current_trainer_profile),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainerClient, User)
        .join(User, User.id == TrainerClient.client_user_id)
        .where(
            TrainerClient.id == client_id,
            TrainerClient.trainer_profile_id == profile.id,
            TrainerClient.status == TrainerClientStatus.ACTIVE,
        )
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Active client relationship not found.")
    relationship, client = row
    relationship.assigned_plan = body.assigned_plan.strip()
    await db.commit()
    return _client_payload(relationship, client)
