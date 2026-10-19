from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException

from models.account_flows import (
    GymMembership,
    GymMembershipStatus,
    TrainerClient,
    TrainerClientStatus,
)


def accept_trainer_invitation(
    relationship: TrainerClient,
    actor_user_id: UUID,
    now: datetime,
) -> bool:
    if relationship.client_user_id != actor_user_id:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    if relationship.status == TrainerClientStatus.ENDED:
        raise HTTPException(status_code=409, detail="This invitation has ended.")
    if relationship.status == TrainerClientStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="This invitation has already been accepted.")
    if relationship.status == TrainerClientStatus.INVITED and invitation_expired(relationship.expires_at, now):
        relationship.status = TrainerClientStatus.ENDED
        relationship.updated_at = now
        return False
    relationship.status = TrainerClientStatus.ACTIVE
    relationship.updated_at = now
    return True


def end_trainer_relationship(
    relationship: TrainerClient,
    actor_user_id: UUID,
    trainer_user_id: UUID,
    now: datetime,
) -> None:
    if actor_user_id not in (relationship.client_user_id, trainer_user_id):
        raise HTTPException(status_code=403, detail="You cannot end this relationship.")
    relationship.status = TrainerClientStatus.ENDED
    relationship.updated_at = now


def accept_gym_invitation(
    membership: GymMembership,
    actor_user_id: UUID,
    now: datetime,
) -> bool:
    if membership.user_id != actor_user_id:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    if membership.status == GymMembershipStatus.CANCELLED:
        raise HTTPException(status_code=409, detail="This invitation is no longer active.")
    if membership.status == GymMembershipStatus.EXPIRED:
        raise HTTPException(status_code=410, detail="This invitation has expired.")
    if membership.status == GymMembershipStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="This invitation has already been accepted.")
    if membership.status == GymMembershipStatus.INVITED and invitation_expired(membership.expires_at, now):
        membership.status = GymMembershipStatus.EXPIRED
        membership.updated_at = now
        return False
    membership.status = GymMembershipStatus.ACTIVE
    membership.updated_at = now
    return True


def _as_utc(value: datetime) -> datetime:
    # SQLite test databases return naive datetimes even for timezone-aware columns.
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


def invitation_expired(expires_at: datetime | None, now: datetime) -> bool:
    return expires_at is not None and _as_utc(expires_at) <= now
