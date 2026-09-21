import uuid
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from core.config import settings
from core import security
from models.user import User, UserRole
from repositories.user_repository import UserRepository
from repositories.token_repository import TokenRepository
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    AuthUserResponse,
)


class AuthService:
    def __init__(self, user_repo: UserRepository, token_repo: TokenRepository):
        self.user_repo = user_repo
        self.token_repo = token_repo

    async def register_user(self, data: RegisterRequest) -> User:
        if await self.user_repo.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email address is already registered",
            )

        hashed_pwd = security.hash_password(data.password)
        return await self.user_repo.create(
            email=data.email,
            username=data.username,
            hashed_password=hashed_pwd,
            name=data.name,
            gym_name=data.gym_name or "Aperture Iron Vault • Central",
            role=UserRole.MEMBER,
        )

    async def authenticate_user(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)

        if not user or not security.verify_password(
            data.password, user.hashed_password
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is inactive"
            )

        await self.user_repo.update_last_login(user.id)

        access_token = security.create_access_token(
            subject=str(user.id), role=user.role.value
        )

        raw_refresh_token = security.generate_random_token()
        hashed_refresh_token = security.hash_token(raw_refresh_token)
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

        await self.token_repo.create_refresh_token(
            user_id=user.id,
            token_hash=hashed_refresh_token,
            expires_at=expires_at,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh_token,
            token_type="bearer",
            user=AuthUserResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                role=user.role,
                gymName=user.gym_name,
            ),
        )

    async def refresh_access_token_by_user(
        self, user_id: uuid.UUID, raw_refresh_token: str
    ) -> TokenResponse:
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User inactive or missing",
            )

        active_tokens = await self.token_repo.get_active_user_tokens(user.id)
        valid_db_token = None

        for token in active_tokens:
            if security.verify_token_hash(raw_refresh_token, token.token_hash):
                valid_db_token = token
                break

        if not valid_db_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked refresh token",
            )

        await self.token_repo.revoke_token(valid_db_token.id)

        new_access_token = security.create_access_token(
            subject=str(user.id), role=user.role.value
        )
        new_raw_refresh_token = security.generate_random_token()
        new_hashed_refresh_token = security.hash_token(new_raw_refresh_token)
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

        await self.token_repo.create_refresh_token(
            user_id=user.id,
            token_hash=new_hashed_refresh_token,
            expires_at=expires_at,
        )

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_raw_refresh_token,
            token_type="bearer",
            user=AuthUserResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                role=user.role,
                gymName=user.gym_name,
            ),
        )

    async def logout(self, user_id: uuid.UUID) -> None:
        await self.token_repo.revoke_all_user_tokens(user_id)