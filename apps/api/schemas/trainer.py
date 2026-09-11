from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class StatusEnum(str, Enum):
    ON_TRACK = "On Track"
    NEEDS_REVIEW = "Needs Review"


class ClientBase(BaseModel):
    name: str
    assigned_plan: str = Field(..., alias="assignedPlan")
    last_active: str = Field(..., alias="lastActive")
    compliance: int = Field(ge=0, le=100)
    status: StatusEnum
    recent_pr: Optional[str] = Field(None, alias="recentPR")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    assigned_plan: Optional[str] = Field(None, alias="assignedPlan")
    last_active: Optional[str] = Field(None, alias="lastActive")
    compliance: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[StatusEnum] = None
    recent_pr: Optional[str] = Field(None, alias="recentPR")

    model_config = ConfigDict(populate_by_name=True)


class ClientResponse(ClientBase):
    id: str