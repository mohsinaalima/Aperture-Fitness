import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.token import RefreshToken

class TokenRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_refresh_token(
        self, user_id: uuid.UUID, token_hash: str, expires_at: datetime
    ) -> RefreshToken:
        token_entry = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        self.session.add(token_entry)
        await self.session.commit()
        return token_entry

    async def get_active_user_tokens(self, user_id: uuid.UUID) -> List[RefreshToken]:
        now = datetime.now(timezone.utc)
        result = await self.session.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked == False,
                RefreshToken.expires_at > now
            )
        )
        return list(result.scalars().all())

    async def revoke_token(self, token_id: uuid.UUID) -> None:
        await self.session.execute(
            update(RefreshToken)
            .where(RefreshToken.id == token_id)
            .values(revoked=True)
        )
        await self.session.commit()

    async def revoke_all_user_tokens(self, user_id: uuid.UUID) -> None:
        await self.session.execute(
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id)
            .values(revoked=True)
        )
        await self.session.commit()