import enum
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TrainingContext(str, enum.Enum):
    MEMBER = "member"
    MEMBER_WITH_TRAINER = "member_with_trainer"
    TRAINER = "trainer"
    GYM_OWNER = "gym_owner"


class TrainerClientStatus(str, enum.Enum):
    INVITED = "invited"
    ACTIVE = "active"
    ENDED = "ended"


class GymRole(str, enum.Enum):
    OWNER = "owner"
    MEMBER = "member"
    TRAINER = "trainer"
    STAFF = "staff"


class GymMembershipStatus(str, enum.Enum):
    INVITED = "invited"
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)


class AuthIdentity(Base):
    __tablename__ = "auth_identities"
    __table_args__ = (UniqueConstraint("provider", "subject", name="uq_auth_identity_provider_subject"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)


class OAuthState(Base):
    __tablename__ = "oauth_states"

    state_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)


class AuthRateLimitBucket(Base):
    __tablename__ = "auth_rate_limit_buckets"

    key_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    attempt_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    window_started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)


class AccountOnboarding(Base):
    __tablename__ = "account_onboarding"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_account_onboarding_user"),
        CheckConstraint("training_context IN ('member', 'member_with_trainer', 'trainer', 'gym_owner')", name="ck_onboarding_context"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    training_context: Mapped[str] = mapped_column(String(16), nullable=False)
    experience_level: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    primary_goal: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    preferred_split: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    trainer_bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    trainer_business_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    gym_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    gym_address: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)


class TrainerProfile(Base):
    __tablename__ = "trainer_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    business_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)


class TrainerClient(Base):
    __tablename__ = "trainer_client_relationships"
    __table_args__ = (UniqueConstraint("trainer_profile_id", "client_user_id", name="uq_trainer_client_pair"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    trainer_profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("trainer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    client_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[TrainerClientStatus] = mapped_column(Enum(TrainerClientStatus, name="trainer_client_status"), nullable=False, default=TrainerClientStatus.INVITED)
    assigned_plan: Mapped[str] = mapped_column(String(150), nullable=False, default="No plan assigned")
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)


class Gym(Base):
    __tablename__ = "gyms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, unique=True, index=True)
    address: Mapped[str] = mapped_column(String(300), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)


class GymMembership(Base):
    __tablename__ = "gym_memberships"
    __table_args__ = (UniqueConstraint("gym_id", "user_id", name="uq_gym_membership_pair"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gym_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("gyms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[GymRole] = mapped_column(Enum(GymRole, name="gym_role"), nullable=False)
    status: Mapped[GymMembershipStatus] = mapped_column(Enum(GymMembershipStatus, name="gym_membership_status"), nullable=False, default=GymMembershipStatus.INVITED)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    invited_by_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)
