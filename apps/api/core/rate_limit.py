from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request, status
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import case, delete

from models.account_flows import AuthRateLimitBucket
from core.security import hash_opaque_token


def _bucket_key(request: Request, scope: str, identifier: str) -> str:
    client_ip = request.client.host if request.client else "unknown"
    return hash_opaque_token(f"{scope}:{client_ip}:{identifier.strip().lower()}")


async def enforce_auth_rate_limit(
    request: Request,
    db: AsyncSession,
    *,
    scope: str,
    identifier: str,
    limit: int,
    window_minutes: int = 15,
) -> None:
    """Atomically count authentication attempts in PostgreSQL across app workers."""
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(minutes=window_minutes)
    table = AuthRateLimitBucket.__table__
    await db.execute(
        delete(AuthRateLimitBucket).where(
            AuthRateLimitBucket.window_started_at < now - timedelta(days=1)
        )
    )
    expired_window = table.c.window_started_at < window_start
    statement = insert(AuthRateLimitBucket).values(
        key_hash=_bucket_key(request, scope, identifier),
        attempt_count=1,
        window_started_at=now,
    )
    statement = statement.on_conflict_do_update(
        index_elements=[table.c.key_hash],
        set_={
            "attempt_count": case(
                (expired_window, 1), else_=table.c.attempt_count + 1
            ),
            "window_started_at": case(
                (expired_window, now), else_=table.c.window_started_at
            ),
        },
    ).returning(table.c.attempt_count)
    result = await db.execute(statement)
    attempt_count = result.scalar_one()
    await db.commit()
    if attempt_count > limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Please wait and try again.",
            headers={"Retry-After": str(window_minutes * 60)},
        )
