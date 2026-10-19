import re
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator
from models.user import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=72)
    name: str = Field(..., min_length=1, max_length=100)

    model_config = {"extra": "forbid"}

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required.")
        return value

    @field_validator("username")
    @classmethod
    def normalize_username(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise ValueError("Username must contain at least 3 characters.")
        return value

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes.")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Matches AuthUser in Next.js
class AuthUserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    gymName: Optional[str] = None
    roles: List[UserRole] = [UserRole.MEMBER]
    onboardingComplete: bool = False

    model_config = {"from_attributes": True}


class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"


class RegistrationResponse(BaseModel):
    message: str = "User registered successfully"
    user: AuthUserResponse
