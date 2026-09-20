import re
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from models.user import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=1, max_length=100)
    gym_name: Optional[str] = "Aperture Iron Vault • Central"

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
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
    gymName: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"


class RegistrationResponse(BaseModel):
    message: str = "User registered successfully"
    user: AuthUserResponse