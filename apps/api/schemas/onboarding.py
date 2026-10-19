from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from models.account_flows import GymRole, TrainingContext


class ContextRequest(BaseModel):
    context: TrainingContext


class MemberOnboardingRequest(BaseModel):
    experience_level: Optional[str] = Field(default=None, min_length=2, max_length=40)
    primary_goal: Optional[str] = Field(default=None, min_length=2, max_length=100)
    preferred_split: Optional[str] = Field(default=None, min_length=2, max_length=100)
    complete: bool = False

    @field_validator("experience_level", "primary_goal", "preferred_split", mode="before")
    @classmethod
    def trim_value(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        if not value:
            return None
        return value


class TrainerProfileRequest(BaseModel):
    bio: Optional[str] = Field(default=None, max_length=2000)
    business_name: Optional[str] = Field(default=None, max_length=150)


class TrainerDraftRequest(TrainerProfileRequest):
    pass


class GymSetupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    address: str = Field(min_length=3, max_length=300)

    @field_validator("name", "address", mode="before")
    @classmethod
    def trim_required(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field is required.")
        return value


class GymDraftRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    address: Optional[str] = Field(default=None, min_length=3, max_length=300)

    @field_validator("name", "address", mode="before")
    @classmethod
    def trim_optional(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        value = value.strip()
        return value or None


class EmailInviteRequest(BaseModel):
    email: EmailStr


class GymInviteRequest(EmailInviteRequest):
    role: GymRole

    @field_validator("role")
    @classmethod
    def disallow_owner_invitation(cls, value: GymRole) -> GymRole:
        if value == GymRole.OWNER:
            raise ValueError("A gym owner cannot be assigned through an invitation.")
        return value
