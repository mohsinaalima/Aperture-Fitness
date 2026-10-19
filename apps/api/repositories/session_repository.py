import uuid
from datetime import datetime

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from models.account_flows import AuthSession, AuthIdentity, OAuthState
from core.security import hash_opaque_token


class SessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def is_active(entry: AuthSession | None, now: datetime) -> bool:
        if not entry or entry.revoked_at is not None:
            return False
        expires_at = entry.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=now.tzinfo)
        return expires_at > now

    async def create(self, user_id: uuid.UUID, raw_token: str, expires_at: datetime) -> AuthSession:
        entry = AuthSession(
            user_id=user_id,
            token_hash=hash_opaque_token(raw_token),
            expires_at=expires_at,
        )
        self.session.add(entry)
        await self.session.flush()
        return entry

    async def get_valid(self, raw_token: str, now: datetime) -> AuthSession | None:
        result = await self.session.execute(
            select(AuthSession).where(
                AuthSession.token_hash == hash_opaque_token(raw_token),
            )
        )
        entry = result.scalar_one_or_none()
        return entry if self.is_active(entry, now) else None

    async def revoke(self, raw_token: str, now: datetime) -> None:
        await self.session.execute(
            update(AuthSession)
            .where(
                AuthSession.token_hash == hash_opaque_token(raw_token),
                AuthSession.revoked_at.is_(None),
            )
            .values(revoked_at=now)
        )
        await self.session.commit()

    async def add_oauth_state(self, raw_state: str, expires_at: datetime) -> None:
        self.session.add(OAuthState(state_hash=hash_opaque_token(raw_state), expires_at=expires_at))
        await self.session.commit()

    async def consume_oauth_state(self, raw_state: str, now: datetime) -> bool:
        state_hash = hash_opaque_token(raw_state)
        result = await self.session.execute(
            delete(OAuthState).where(
                OAuthState.state_hash == state_hash,
                OAuthState.expires_at > now,
            )
        )
        await self.session.commit()
        return result.rowcount == 1

    async def get_identity(self, provider: str, subject: str) -> AuthIdentity | None:
        result = await self.session.execute(
            select(AuthIdentity).where(
                AuthIdentity.provider == provider,
                AuthIdentity.subject == subject,
            )
        )
        return result.scalar_one_or_none()
