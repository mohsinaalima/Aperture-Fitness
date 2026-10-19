import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from core import security
from core.config import settings
from models.account_flows import AccountOnboarding, AuthIdentity, Gym, TrainerProfile
from models.user import User, UserRole
from repositories.session_repository import SessionRepository
from repositories.user_repository import UserRepository
from schemas.auth import AuthUserResponse, LoginRequest, RegisterRequest


class AuthService:
    def __init__(self, user_repo: UserRepository, session_repo: SessionRepository):
        self.user_repo = user_repo
        self.session_repo = session_repo

    async def _create_session(self, user: User) -> str:
        raw_token = security.new_session_token()
        expiry = datetime.now(timezone.utc) + timedelta(days=settings.AUTH_SESSION_EXPIRE_DAYS)
        await self.session_repo.create(user.id, raw_token, expiry)
        return raw_token

    async def register_user(self, data: RegisterRequest) -> tuple[User, str]:
        email = str(data.email).strip().lower()
        if await self.user_repo.get_by_email(email):
            raise HTTPException(status_code=409, detail="This email is already registered. Sign in instead.")

        try:
            user = await self.user_repo.create(
                email=email,
                username=data.username.strip(),
                hashed_password=security.hash_password(data.password),
                name=data.name.strip(),
                role=UserRole.MEMBER,
            )
            session_token = await self._create_session(user)
            await self.user_repo.session.commit()
            return user, session_token
        except IntegrityError as error:
            await self.user_repo.session.rollback()
            if await self.user_repo.get_by_email(email):
                raise HTTPException(status_code=409, detail="This email is already registered. Sign in instead.") from error
            raise HTTPException(status_code=409, detail="That username is already in use.") from error

    async def authenticate_user(self, data: LoginRequest) -> tuple[User, str]:
        user = await self.user_repo.get_by_email(str(data.email).strip().lower())
        if not user or not security.verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Session"},
            )
        if not user.is_active:
            raise HTTPException(status_code=401, detail="This account is inactive.")

        user.last_login = datetime.now(timezone.utc)
        session_token = await self._create_session(user)
        await self.user_repo.session.commit()
        return user, session_token

    async def authenticate_google_user(
        self, *, subject: str, email: str, name: str, avatar_url: str | None
    ) -> tuple[User, str]:
        identity = await self.session_repo.get_identity("google", subject)
        if identity:
            user = await self.user_repo.get_by_id(identity.user_id)
            if not user or not user.is_active:
                raise HTTPException(status_code=401, detail="This account is unavailable.")
        else:
            existing = await self.user_repo.get_by_email(email)
            if existing:
                raise HTTPException(
                    status_code=409,
                    detail="An account already uses this email. Sign in with that account before linking Google.",
                )
            try:
                user = await self.user_repo.create(
                    email=email,
                    username=f"google_{secrets.token_hex(12)}",
                    hashed_password=None,
                    name=name,
                    role=UserRole.MEMBER,
                )
            except IntegrityError as error:
                await self.user_repo.session.rollback()
                existing_identity = await self.session_repo.get_identity("google", subject)
                if existing_identity:
                    identity = existing_identity
                    user = await self.user_repo.get_by_id(existing_identity.user_id)
                    if not user or not user.is_active:
                        raise HTTPException(status_code=401, detail="This account is unavailable.") from error
                else:
                    raise HTTPException(
                        status_code=409,
                        detail="An account already uses this email. Sign in with that account; it was not linked automatically.",
                    ) from error
            if identity:
                session_token = await self._create_session(user)
                await self.user_repo.session.commit()
                return user, session_token
            user.avatar_url = avatar_url
            user.is_verified = True
            self.user_repo.session.add(AuthIdentity(user_id=user.id, provider="google", subject=subject))

        session_token = await self._create_session(user)
        try:
            await self.user_repo.session.commit()
        except IntegrityError:
            await self.user_repo.session.rollback()
            # A concurrent callback may have inserted this provider identity.
            identity = await self.session_repo.get_identity("google", subject)
            if not identity:
                raise HTTPException(status_code=409, detail="Could not complete Google sign-in. Please try again.")
            user = await self.user_repo.get_by_id(identity.user_id)
            if not user or not user.is_active:
                raise HTTPException(status_code=401, detail="This account is unavailable.")
            session_token = await self._create_session(user)
            await self.user_repo.session.commit()
        return user, session_token

    async def user_response(self, user: User) -> AuthUserResponse:
        db = self.user_repo.session
        roles = {UserRole.MEMBER}
        trainer = await db.execute(select(TrainerProfile.id).where(TrainerProfile.user_id == user.id))
        if trainer.scalar_one_or_none():
            roles.add(UserRole.TRAINER)
        gym_owner = await db.execute(select(Gym.id).where(Gym.owner_user_id == user.id))
        if gym_owner.scalar_one_or_none():
            roles.add(UserRole.OWNER)
        if user.role in roles:
            primary_role = user.role
        elif UserRole.OWNER in roles:
            primary_role = UserRole.OWNER
        elif UserRole.TRAINER in roles:
            primary_role = UserRole.TRAINER
        else:
            primary_role = UserRole.MEMBER

        onboarding = await db.execute(
            select(AccountOnboarding.completed).where(AccountOnboarding.user_id == user.id)
        )
        completed = onboarding.scalar_one_or_none() is True
        return AuthUserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=primary_role,
            gymName=user.gym_name,
            roles=sorted(roles, key=lambda item: item.value),
            onboardingComplete=completed,
        )
