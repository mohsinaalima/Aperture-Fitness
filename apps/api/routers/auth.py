from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_active_user
from models.user import User
from repositories.user_repository import UserRepository
from repositories.token_repository import TokenRepository
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    LogoutResponse,
    RegistrationResponse,
    AuthUserResponse,
)
from services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db), TokenRepository(db))


@router.post(
    "/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: RegisterRequest, auth_service: AuthService = Depends(get_auth_service)
):
    user = await auth_service.register_user(data)
    return RegistrationResponse(
        message="User registered successfully",
        user=AuthUserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            gymName=user.gym_name,
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest, auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.authenticate_user(data)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    data: RefreshTokenRequest,
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.refresh_access_token_by_user(
        user_id=current_user.id, raw_refresh_token=data.refresh_token
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    await auth_service.logout(current_user.id)
    return LogoutResponse(message="Logged out successfully")


@router.get("/me", response_model=AuthUserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return AuthUserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        gymName=current_user.gym_name,
    )