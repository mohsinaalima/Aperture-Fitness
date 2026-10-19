import hmac
import secrets
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from core.rate_limit import enforce_auth_rate_limit
from dependencies.auth import get_current_active_user
from models.user import User
from repositories.session_repository import SessionRepository
from repositories.user_repository import UserRepository
from schemas.auth import AuthUserResponse, LoginRequest, LogoutResponse, RegisterRequest, RegistrationResponse
from services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
OAUTH_STATE_COOKIE = "aperture_oauth_state"


def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db), SessionRepository(db))


def _set_session_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=settings.AUTH_SESSION_COOKIE,
        value=raw_token,
        max_age=settings.AUTH_SESSION_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=settings.ENVIRONMENT.lower() != "development",
        samesite="lax",
        path="/",
    )


def _google_configured() -> bool:
    return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET and settings.GOOGLE_REDIRECT_URI)


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    await enforce_auth_rate_limit(request, db, scope="register", identifier=str(data.email), limit=5)
    await enforce_auth_rate_limit(request, db, scope="register_ip", identifier="all", limit=20)
    user, session_token = await auth_service.register_user(data)
    _set_session_cookie(response, session_token)
    return RegistrationResponse(user=await auth_service.user_response(user))


@router.post("/login", response_model=RegistrationResponse)
async def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    await enforce_auth_rate_limit(request, db, scope="login", identifier=str(data.email), limit=10)
    await enforce_auth_rate_limit(request, db, scope="login_ip", identifier="all", limit=30)
    user, session_token = await auth_service.authenticate_user(data)
    _set_session_cookie(response, session_token)
    return RegistrationResponse(message="Signed in successfully", user=await auth_service.user_response(user))


@router.post("/logout", response_model=LogoutResponse)
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    raw_token = request.cookies.get(settings.AUTH_SESSION_COOKIE)
    if raw_token:
        await SessionRepository(db).revoke(raw_token, datetime.now(timezone.utc))
    response.delete_cookie(
        key=settings.AUTH_SESSION_COOKIE,
        path="/",
        httponly=True,
        secure=settings.ENVIRONMENT.lower() != "development",
        samesite="lax",
    )
    return LogoutResponse()


@router.get("/me", response_model=AuthUserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.user_response(current_user)


@router.get("/google")
async def google_login(request: Request, db: AsyncSession = Depends(get_db)):
    if not _google_configured():
        return RedirectResponse(
            f"{settings.FRONTEND_URL.rstrip('/')}/login?error=google_not_configured",
            status_code=303,
        )
    state = secrets.token_urlsafe(32)
    await SessionRepository(db).add_oauth_state(
        state, datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    query = urlencode({
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "prompt": "select_account",
    })
    response = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}", status_code=302)
    response.set_cookie(
        OAUTH_STATE_COOKIE,
        state,
        max_age=600,
        httponly=True,
        secure=settings.ENVIRONMENT.lower() != "development",
        samesite="lax",
        path="/api/auth/google",
    )
    return response


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
    auth_service: AuthService = Depends(get_auth_service),
):
    def fail(reason: str) -> RedirectResponse:
        response = RedirectResponse(f"{settings.FRONTEND_URL.rstrip('/')}/login?error={reason}", status_code=303)
        response.delete_cookie(OAUTH_STATE_COOKIE, path="/api/auth/google", samesite="lax")
        return response

    cookie_state = request.cookies.get(OAUTH_STATE_COOKIE)
    if error or not code or not state or not cookie_state or not hmac.compare_digest(state, cookie_state):
        return fail("google_signin_failed")
    if not _google_configured():
        return fail("google_not_configured")
    state_valid = await SessionRepository(db).consume_oauth_state(state, datetime.now(timezone.utc))
    if not state_valid:
        return fail("google_signin_failed")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code",
                },
            )
            token_response.raise_for_status()
            access_token = token_response.json().get("access_token")
            if not access_token:
                return fail("google_signin_failed")
            profile_response = await client.get(
                "https://openidconnect.googleapis.com/v1/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            profile_response.raise_for_status()
            profile = profile_response.json()
        if not profile.get("sub") or not profile.get("email") or not profile.get("email_verified"):
            return fail("google_signin_failed")
        user, session_token = await auth_service.authenticate_google_user(
            subject=str(profile["sub"]),
            email=str(profile["email"]).strip().lower(),
            name=str(profile.get("name") or profile["email"])[:100],
            avatar_url=profile.get("picture"),
        )
    except HTTPException as auth_error:
        reason = "account_exists" if auth_error.status_code == 409 else "google_signin_failed"
        return fail(reason)
    except (httpx.HTTPError, ValueError, KeyError):
        return fail("google_signin_failed")

    auth_user = await auth_service.user_response(user)
    destination = "/onboarding" if not auth_user.onboardingComplete else (
        "/owner" if auth_user.role.value == "owner" else "/trainer" if auth_user.role.value == "trainer" else "/dashboard"
    )
    response = RedirectResponse(f"{settings.FRONTEND_URL.rstrip('/')}{destination}", status_code=303)
    response.delete_cookie(OAUTH_STATE_COOKIE, path="/api/auth/google", samesite="lax")
    _set_session_cookie(response, session_token)
    return response
