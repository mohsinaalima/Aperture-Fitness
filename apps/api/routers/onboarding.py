from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_active_user, get_current_owned_gym, get_current_trainer_profile
from models.account_flows import (
    AccountOnboarding,
    Gym,
    GymMembership,
    GymMembershipStatus,
    GymRole,
    TrainerClient,
    TrainerClientStatus,
    TrainerProfile,
    TrainingContext,
)
from models.user import User, UserRole
from services.relationship_service import (
    accept_gym_invitation as transition_gym_invitation,
    accept_trainer_invitation as transition_trainer_invitation,
    end_trainer_relationship as transition_trainer_relationship,
    invitation_expired,
)
from schemas.onboarding import (
    ContextRequest,
    EmailInviteRequest,
    GymInviteRequest,
    GymDraftRequest,
    GymSetupRequest,
    MemberOnboardingRequest,
    TrainerProfileRequest,
    TrainerDraftRequest,
)

router = APIRouter(prefix="/api/onboarding", tags=["Account onboarding"])


async def _get_onboarding(db: AsyncSession, user_id: UUID) -> AccountOnboarding | None:
    result = await db.execute(select(AccountOnboarding).where(AccountOnboarding.user_id == user_id))
    return result.scalar_one_or_none()


async def _get_or_create_onboarding(
    db: AsyncSession, user_id: UUID, context: TrainingContext
) -> AccountOnboarding:
    state = await _get_onboarding(db, user_id)
    if state is None:
        state = AccountOnboarding(user_id=user_id, training_context=context.value)
        db.add(state)
        await db.flush()
    return state


@router.get("/status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    state = await _get_onboarding(db, current_user.id)
    return {
        "context": state.training_context if state else None,
        "completed": bool(state and state.completed),
        "experience_level": state.experience_level if state else None,
        "primary_goal": state.primary_goal if state else None,
        "preferred_split": state.preferred_split if state else None,
        "trainer_bio": state.trainer_bio if state else None,
        "trainer_business_name": state.trainer_business_name if state else None,
        "gym_name": state.gym_name if state else None,
        "gym_address": state.gym_address if state else None,
    }


@router.put("/context")
async def select_context(
    body: ContextRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    state = await _get_or_create_onboarding(db, current_user.id, body.context)
    if state.training_context != body.context.value:
        state.completed = False
    state.training_context = body.context.value
    state.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"context": state.training_context, "completed": state.completed}


@router.put("/member")
async def complete_member_onboarding(
    body: MemberOnboardingRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    state = await _get_onboarding(db, current_user.id)
    if state is None or state.training_context not in (
        TrainingContext.MEMBER.value,
        TrainingContext.MEMBER_WITH_TRAINER.value,
    ):
        raise HTTPException(status_code=409, detail="Choose the member path before completing member setup.")
    state.experience_level = body.experience_level or state.experience_level
    state.primary_goal = body.primary_goal or state.primary_goal
    state.preferred_split = body.preferred_split or state.preferred_split
    if body.complete and not all((state.experience_level, state.primary_goal, state.preferred_split)):
        raise HTTPException(status_code=422, detail="Answer all three onboarding questions before continuing.")
    state.completed = state.completed or body.complete
    state.updated_at = datetime.now(timezone.utc)
    current_user.role = UserRole.MEMBER
    await db.commit()
    return {"completed": state.completed, "next": "/onboarding/handoff" if state.completed else None}


@router.put("/trainer/draft")
async def save_trainer_draft(
    body: TrainerDraftRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    state = await _get_onboarding(db, current_user.id)
    if state is None or state.training_context != TrainingContext.TRAINER.value:
        raise HTTPException(status_code=409, detail="Choose the trainer path before saving trainer setup.")
    if body.bio is not None:
        state.trainer_bio = body.bio.strip() or None
    if body.business_name is not None:
        state.trainer_business_name = body.business_name.strip() or None
    state.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"saved": True}


@router.put("/trainer")
async def create_trainer_profile(
    body: TrainerProfileRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TrainerProfile).where(TrainerProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    state = await _get_or_create_onboarding(db, current_user.id, TrainingContext.TRAINER)
    if profile is None:
        profile = TrainerProfile(
            user_id=current_user.id,
            bio=(body.bio.strip() if body.bio is not None else state.trainer_bio) or None,
            business_name=(body.business_name.strip() if body.business_name is not None else state.trainer_business_name) or None,
        )
        db.add(profile)
    else:
        profile.bio = (body.bio.strip() if body.bio is not None else profile.bio) or None
        profile.business_name = (body.business_name.strip() if body.business_name is not None else profile.business_name) or None

    state.training_context = TrainingContext.TRAINER.value
    state.completed = True
    state.updated_at = datetime.now(timezone.utc)
    current_user.role = UserRole.TRAINER
    state.trainer_bio = profile.bio
    state.trainer_business_name = profile.business_name
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        result = await db.execute(select(TrainerProfile).where(TrainerProfile.user_id == current_user.id))
        profile = result.scalar_one_or_none()
        if profile is None:
            raise HTTPException(status_code=409, detail="Trainer setup changed at the same time. Reload and try again.")
    await db.refresh(profile)
    return {"id": str(profile.id), "bio": profile.bio, "business_name": profile.business_name, "next": "/trainer"}


@router.put("/gym/draft")
async def save_gym_draft(
    body: GymDraftRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    state = await _get_onboarding(db, current_user.id)
    if state is None or state.training_context != TrainingContext.GYM_OWNER.value:
        raise HTTPException(status_code=409, detail="Choose the gym-owner path before saving gym setup.")
    if body.name is not None:
        state.gym_name = body.name
    if body.address is not None:
        state.gym_address = body.address
    state.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"saved": True}


@router.post("/gym", status_code=status.HTTP_201_CREATED)
async def create_gym(
    body: GymSetupRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Gym).where(Gym.owner_user_id == current_user.id))
    existing = result.scalar_one_or_none()
    if existing:
        if existing.name == body.name and existing.address == body.address:
            return {"id": str(existing.id), "name": existing.name, "address": existing.address, "next": "/owner"}
        raise HTTPException(status_code=409, detail="A gym is already linked to this account.")

    gym = Gym(name=body.name, address=body.address, owner_user_id=current_user.id)
    db.add(gym)
    await db.flush()
    db.add(GymMembership(
        gym_id=gym.id,
        user_id=current_user.id,
        role=GymRole.OWNER,
        status=GymMembershipStatus.ACTIVE,
        invited_by_user_id=current_user.id,
    ))
    state = await _get_or_create_onboarding(db, current_user.id, TrainingContext.GYM_OWNER)
    state.training_context = TrainingContext.GYM_OWNER.value
    state.completed = True
    state.gym_name = body.name
    state.gym_address = body.address
    state.updated_at = datetime.now(timezone.utc)
    current_user.role = UserRole.OWNER
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Gym setup could not be completed. Reload and try again.") from error
    return {"id": str(gym.id), "name": gym.name, "address": gym.address, "next": "/owner"}


@router.post("/trainer/invitations", status_code=status.HTTP_201_CREATED)
async def invite_trainer_client(
    body: EmailInviteRequest,
    profile: TrainerProfile = Depends(get_current_trainer_profile),
    db: AsyncSession = Depends(get_db),
):
    email = str(body.email).strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Create an account with this email before sending an invitation.")
    if client.id == profile.user_id:
        raise HTTPException(status_code=400, detail="You cannot invite your own account as a client.")

    result = await db.execute(select(TrainerClient).where(
        TrainerClient.trainer_profile_id == profile.id,
        TrainerClient.client_user_id == client.id,
    ))
    relationship = result.scalar_one_or_none()
    if relationship is None:
        relationship = TrainerClient(
            trainer_profile_id=profile.id,
            client_user_id=client.id,
            status=TrainerClientStatus.INVITED,
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        )
        db.add(relationship)
    elif relationship.status == TrainerClientStatus.ENDED or (
        relationship.status == TrainerClientStatus.INVITED
        and invitation_expired(relationship.expires_at, datetime.now(timezone.utc))
    ):
        relationship.status = TrainerClientStatus.INVITED
        relationship.updated_at = datetime.now(timezone.utc)
        relationship.expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        result = await db.execute(select(TrainerClient).where(
            TrainerClient.trainer_profile_id == profile.id,
            TrainerClient.client_user_id == client.id,
        ))
        relationship = result.scalar_one_or_none()
        if relationship is None:
            raise HTTPException(status_code=409, detail="Invitation changed at the same time. Reload and try again.")
    return {"id": str(relationship.id), "client_name": client.name, "status": relationship.status.value}


@router.get("/trainer/invitations")
async def list_trainer_invitations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainerClient, TrainerProfile, User)
        .join(TrainerProfile, TrainerProfile.id == TrainerClient.trainer_profile_id)
        .join(User, User.id == TrainerProfile.user_id)
        .where(
            TrainerClient.client_user_id == current_user.id,
            TrainerClient.status == TrainerClientStatus.INVITED,
            (TrainerClient.expires_at.is_(None) | (TrainerClient.expires_at > datetime.now(timezone.utc))),
        )
    )
    return [
        {"id": str(link.id), "trainer_name": trainer_user.name, "status": link.status.value}
        for link, _profile, trainer_user in result.all()
    ]


@router.get("/trainer/invitations/sent")
async def list_sent_trainer_invitations(
    profile: TrainerProfile = Depends(get_current_trainer_profile),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainerClient, User)
        .join(User, User.id == TrainerClient.client_user_id)
        .where(TrainerClient.trainer_profile_id == profile.id)
    )
    return [
        {"id": str(link.id), "client_name": client.name, "status": link.status.value}
        for link, client in result.all()
    ]


@router.post("/trainer/invitations/{invitation_id}/accept")
async def accept_trainer_invitation(
    invitation_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TrainerClient).where(TrainerClient.id == invitation_id))
    relationship = result.scalar_one_or_none()
    if not relationship or relationship.client_user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    accepted = transition_trainer_invitation(relationship, current_user.id, datetime.now(timezone.utc))
    if not accepted:
        await db.commit()
        raise HTTPException(status_code=410, detail="This invitation has expired.")
    await db.commit()
    return {"id": str(relationship.id), "status": relationship.status.value}


@router.post("/trainer/invitations/{invitation_id}/end")
async def end_trainer_relationship(
    invitation_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TrainerClient).where(TrainerClient.id == invitation_id))
    relationship = result.scalar_one_or_none()
    if not relationship:
        raise HTTPException(status_code=404, detail="Relationship not found.")
    trainer = await db.execute(select(TrainerProfile.user_id).where(TrainerProfile.id == relationship.trainer_profile_id))
    trainer_user_id = trainer.scalar_one_or_none()
    transition_trainer_relationship(relationship, current_user.id, trainer_user_id, datetime.now(timezone.utc))
    await db.commit()
    return {"id": str(relationship.id), "status": relationship.status.value}


@router.post("/gym/invitations", status_code=status.HTTP_201_CREATED)
async def invite_gym_member(
    body: GymInviteRequest,
    gym: Gym = Depends(get_current_owned_gym),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    email = str(body.email).strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    invited_user = result.scalar_one_or_none()
    if not invited_user:
        raise HTTPException(status_code=404, detail="Create an account with this email before sending an invitation.")
    if invited_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Your account already owns this gym.")
    result = await db.execute(select(GymMembership).where(
        GymMembership.gym_id == gym.id,
        GymMembership.user_id == invited_user.id,
    ))
    membership = result.scalar_one_or_none()
    if membership is None:
        membership = GymMembership(
            gym_id=gym.id,
            user_id=invited_user.id,
            role=body.role,
            status=GymMembershipStatus.INVITED,
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
            invited_by_user_id=current_user.id,
        )
        db.add(membership)
    elif membership.status in (GymMembershipStatus.EXPIRED, GymMembershipStatus.CANCELLED) or (
        membership.status == GymMembershipStatus.INVITED
        and invitation_expired(membership.expires_at, datetime.now(timezone.utc))
    ):
        membership.status = GymMembershipStatus.INVITED
        membership.role = body.role
        membership.invited_by_user_id = current_user.id
        membership.updated_at = datetime.now(timezone.utc)
        membership.expires_at = datetime.now(timezone.utc) + timedelta(days=30)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        result = await db.execute(select(GymMembership).where(
            GymMembership.gym_id == gym.id,
            GymMembership.user_id == invited_user.id,
        ))
        membership = result.scalar_one_or_none()
        if membership is None:
            raise HTTPException(status_code=409, detail="Invitation changed at the same time. Reload and try again.")
    return {"id": str(membership.id), "gym_name": gym.name, "role": membership.role.value, "status": membership.status.value}


@router.get("/gym/invitations")
async def list_gym_invitations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GymMembership, Gym)
        .join(Gym, Gym.id == GymMembership.gym_id)
        .where(
            GymMembership.user_id == current_user.id,
            GymMembership.status == GymMembershipStatus.INVITED,
            (GymMembership.expires_at.is_(None) | (GymMembership.expires_at > datetime.now(timezone.utc))),
        )
    )
    return [
        {"id": str(membership.id), "gym_name": gym.name, "role": membership.role.value}
        for membership, gym in result.all()
    ]


@router.post("/gym/invitations/{membership_id}/accept")
async def accept_gym_invitation(
    membership_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(GymMembership).where(GymMembership.id == membership_id))
    membership = result.scalar_one_or_none()
    if not membership or membership.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    accepted = transition_gym_invitation(membership, current_user.id, datetime.now(timezone.utc))
    if not accepted:
        await db.commit()
        raise HTTPException(status_code=410, detail="This invitation has expired.")
    if membership.role == GymRole.TRAINER:
        profile_result = await db.execute(select(TrainerProfile).where(TrainerProfile.user_id == current_user.id))
        if not profile_result.scalar_one_or_none():
            db.add(TrainerProfile(user_id=current_user.id))
        current_user.role = UserRole.TRAINER
    await db.commit()
    return {"id": str(membership.id), "gym_id": str(membership.gym_id), "role": membership.role.value, "status": membership.status.value}
