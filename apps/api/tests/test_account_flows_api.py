"""Route tests against a real, isolated SQLite database (never the configured DB)."""

import asyncio
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlparse
from uuid import UUID

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import models.analytics  # noqa: F401
import models.dashboard  # noqa: F401
import models.exercise  # noqa: F401
import models.owner_dashboard  # noqa: F401
import models.plan  # noqa: F401
import models.pricing  # noqa: F401
import models.token  # noqa: F401
import models.user_profile  # noqa: F401
import models.workout_logger  # noqa: F401
from core.database import Base, get_db
from core.config import settings
from main import app
from models.account_flows import (
    AccountOnboarding,
    AuthIdentity,
    AuthSession,
    Gym,
    GymMembership,
    GymMembershipStatus,
    GymRole,
    TrainerClient,
    TrainerClientStatus,
    TrainerProfile,
)
from models.user import User, UserRole


class SQLiteAsyncSession:
    """Small async adapter so FastAPI routes use SQLAlchemy's real SQLite ORM."""

    def __init__(self, session):
        self.session = session

    def add(self, value):
        self.session.add(value)

    async def execute(self, statement):
        return self.session.execute(statement)

    async def flush(self):
        self.session.flush()

    async def commit(self):
        self.session.commit()

    async def rollback(self):
        self.session.rollback()

    async def refresh(self, value):
        self.session.refresh(value)


@pytest.fixture
def api(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, expire_on_commit=False)

    def override_db():
        session = TestSession()
        try:
            yield SQLiteAsyncSession(session)
        finally:
            session.close()

    async def allow_auth_rate_limit(*_args, **_kwargs):
        return None

    from routers import auth as auth_router

    monkeypatch.setattr(settings, "ENVIRONMENT", "development")
    monkeypatch.setattr(settings, "FRONTEND_URL", "http://localhost:3000")
    monkeypatch.setattr(auth_router, "enforce_auth_rate_limit", allow_auth_rate_limit)
    app.dependency_overrides[get_db] = override_db
    client = TestClient(app, base_url="http://testserver")
    client.headers.update({"Origin": "http://localhost:3000"})

    yield client, TestSession

    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


def register(client: TestClient, *, username: str, email: str | None = None):
    email = email or f"{username}@example.com"
    response = client.post("/api/auth/register", json={
        "name": username.title(),
        "username": username,
        "email": email,
        "password": "SecurePass123",
    })
    assert response.status_code == 201, response.text
    return response.json()["user"]


def choose_context(client: TestClient, context: str):
    response = client.put("/api/onboarding/context", json={"context": context})
    assert response.status_code == 200, response.text


def test_member_promotes_to_trainer_and_owner_without_losing_identity_or_answers(api):
    client, db_factory = api
    member = register(client, username="member")
    original_id = UUID(member["id"])
    original_email = member["email"]

    choose_context(client, "member")
    completed = client.put("/api/onboarding/member", json={
        "experience_level": "Intermediate",
        "primary_goal": "Build strength",
        "preferred_split": "Full body three days",
        "complete": True,
    })
    assert completed.status_code == 200
    assert completed.json()["next"] == "/onboarding/handoff"

    choose_context(client, "trainer")
    trainer_setup = client.put("/api/onboarding/trainer", json={"bio": "Coach", "business_name": "Lift Lab"})
    assert trainer_setup.status_code == 200
    trainer_id = trainer_setup.json()["id"]
    assert trainer_setup.json()["next"] == "/trainer"

    choose_context(client, "gym_owner")
    gym_response = client.post("/api/onboarding/gym", json={"name": "Aperture Gym", "address": "1 Main Street"})
    assert gym_response.status_code == 201
    assert gym_response.json()["next"] == "/owner"
    gym_id = gym_response.json()["id"]

    # A lost response/retry must return the same gym, while a conflicting second gym fails safely.
    retry = client.post("/api/onboarding/gym", json={"name": "Aperture Gym", "address": "1 Main Street"})
    assert retry.status_code == 201 and retry.json()["id"] == gym_id
    conflict = client.post("/api/onboarding/gym", json={"name": "Different Gym", "address": "2 Main Street"})
    assert conflict.status_code == 409

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert {"member", "trainer", "owner"} == set(me.json()["roles"])
    assert me.json()["id"] == str(original_id)
    assert me.json()["email"] == original_email

    with db_factory() as db:
        user = db.get(User, original_id)
        state = db.scalar(select(AccountOnboarding).where(AccountOnboarding.user_id == user.id))
        profiles = db.scalars(select(TrainerProfile).where(TrainerProfile.user_id == user.id)).all()
        gyms = db.scalars(select(Gym).where(Gym.owner_user_id == user.id)).all()
        assert user.email == original_email
        assert state.experience_level == "Intermediate"
        assert state.primary_goal == "Build strength"
        assert state.preferred_split == "Full body three days"
        assert len(profiles) == 1 and str(profiles[0].id) == trainer_id
        assert len(gyms) == 1 and str(gyms[0].id) == gym_id


def test_trainer_can_later_own_gym_and_trainer_profile_retry_is_idempotent(api):
    client, db_factory = api
    user = register(client, username="coach")
    choose_context(client, "trainer")
    first = client.put("/api/onboarding/trainer", json={"bio": "Coach"})
    repeated = client.put("/api/onboarding/trainer", json={"bio": "Updated coach"})
    assert first.status_code == repeated.status_code == 200
    assert first.json()["id"] == repeated.json()["id"]

    choose_context(client, "gym_owner")
    gym = client.post("/api/onboarding/gym", json={"name": "Coach Gym", "address": "10 Oak Road"})
    assert gym.status_code == 201
    me = client.get("/api/auth/me").json()
    assert me["id"] == user["id"]
    assert me["email"] == user["email"]
    assert set(me["roles"]) == {"member", "trainer", "owner"}
    with db_factory() as db:
        user_id = UUID(user["id"])
        assert len(db.scalars(select(TrainerProfile).where(TrainerProfile.user_id == user_id)).all()) == 1
        assert len(db.scalars(select(Gym).where(Gym.owner_user_id == user_id)).all()) == 1


def test_member_with_trainer_context_persists_and_uses_member_questions(api):
    client, db_factory = api
    member = register(client, username="trainee")
    choose_context(client, "member_with_trainer")
    status = client.get("/api/onboarding/status")
    assert status.status_code == 200
    assert status.json()["context"] == "member_with_trainer"
    complete = client.put("/api/onboarding/member", json={
        "experience_level": "Beginner", "primary_goal": "Mobility", "preferred_split": "Two full-body days", "complete": True,
    })
    assert complete.status_code == 200
    assert complete.json()["next"] == "/onboarding/handoff"
    with db_factory() as db:
        state = db.scalar(select(AccountOnboarding).where(AccountOnboarding.user_id == UUID(member["id"])))
        assert state.training_context == "member_with_trainer"
        assert state.completed is True
        assert db.scalar(select(User).where(User.id == UUID(member["id"]))).role.value == "member"


def test_trainer_invitation_pending_acceptance_expiry_and_scoped_access(api):
    trainer_client, db_factory = api
    trainer = register(trainer_client, username="trainer")
    choose_context(trainer_client, "trainer")
    setup = trainer_client.put("/api/onboarding/trainer", json={"bio": "Coach"})
    assert setup.status_code == 200

    client_user = register(trainer_client, username="trainee")
    unrelated = register(trainer_client, username="unrelated")
    expired_user = register(trainer_client, username="expiredtrainee")
    trainer_client.post("/api/auth/login", json={"email": trainer["email"], "password": "SecurePass123"})
    invite = trainer_client.post("/api/onboarding/trainer/invitations", json={"email": client_user["email"]})
    assert invite.status_code == 201
    invitation_id = invite.json()["id"]
    assert invite.json()["status"] == "invited"
    retry = trainer_client.post("/api/onboarding/trainer/invitations", json={"email": client_user["email"]})
    assert retry.status_code == 201 and retry.json()["id"] == invitation_id

    # Pending links are persisted but absent from active trainer roster.
    assert trainer_client.get("/trainer/clients").json() == []
    with db_factory() as db:
        relationship = db.get(TrainerClient, UUID(invitation_id))
        assert relationship.status == TrainerClientStatus.INVITED

    wrong_user = TestClient(app, base_url="http://testserver")
    wrong_user.headers.update({"Origin": "http://localhost:3000"})
    wrong_user.post("/api/auth/login", json={"email": unrelated["email"], "password": "SecurePass123"})
    wrong = wrong_user.post(f"/api/onboarding/trainer/invitations/{invitation_id}/accept")
    assert wrong.status_code == 404

    # Switch the main browser session to the invited member.
    trainer_client.post("/api/auth/logout")
    login = trainer_client.post("/api/auth/login", json={"email": client_user["email"], "password": "SecurePass123"})
    assert login.status_code == 200
    accepted = trainer_client.post(f"/api/onboarding/trainer/invitations/{invitation_id}/accept")
    assert accepted.status_code == 200 and accepted.json()["status"] == "active"
    consumed = trainer_client.post(f"/api/onboarding/trainer/invitations/{invitation_id}/accept")
    assert consumed.status_code == 409

    trainer_client.post("/api/auth/logout")
    trainer_client.post("/api/auth/login", json={"email": trainer["email"], "password": "SecurePass123"})
    roster = trainer_client.get("/trainer/clients")
    assert roster.status_code == 200 and len(roster.json()) == 1

    # Expired invitations cannot be used, even by the intended recipient.
    with db_factory() as db:
        expired = TrainerClient(
            trainer_profile_id=db.scalar(select(TrainerProfile.id).where(TrainerProfile.user_id == UUID(trainer["id"]))),
            client_user_id=UUID(expired_user["id"]),
            status=TrainerClientStatus.INVITED,
            expires_at=datetime.now(timezone.utc) - timedelta(days=1),
        )
        db.add(expired)
        db.commit()
        expired_id = str(expired.id)
    trainer_client.post("/api/auth/logout")
    trainer_client.post("/api/auth/login", json={"email": expired_user["email"], "password": "SecurePass123"})
    expired_response = trainer_client.post(f"/api/onboarding/trainer/invitations/{expired_id}/accept")
    assert expired_response.status_code == 410

    trainer_client.post("/api/auth/logout")
    trainer_client.post("/api/auth/login", json={"email": unrelated["email"], "password": "SecurePass123"})
    choose_context(trainer_client, "trainer")
    assert trainer_client.put("/api/onboarding/trainer", json={"bio": "Unrelated coach"}).status_code == 200
    assert trainer_client.get(f"/trainer/clients/{invitation_id}").status_code == 404

    trainer_client.post("/api/auth/logout")
    trainer_client.post("/api/auth/login", json={"email": client_user["email"], "password": "SecurePass123"})
    assert trainer_client.get("/trainer/clients").status_code == 403


@pytest.mark.parametrize("gym_role", ["staff", "trainer"])
def test_gym_invitation_is_scoped_pending_and_requires_acceptance(api, gym_role):
    client, db_factory = api
    owner = register(client, username="owner")
    choose_context(client, "gym_owner")
    gym = client.post("/api/onboarding/gym", json={"name": "Local Gym", "address": "22 Pine Road"})
    assert gym.status_code == 201
    invitee = register(client, username=f"invitee_{gym_role}")
    unrelated = register(client, username=f"other_{gym_role}")
    client.post("/api/auth/login", json={"email": owner["email"], "password": "SecurePass123"})

    invite = client.post("/api/onboarding/gym/invitations", json={"email": invitee["email"], "role": gym_role})
    assert invite.status_code == 201
    assert invite.json()["status"] == "invited"
    membership_id = invite.json()["id"]
    retry = client.post("/api/onboarding/gym/invitations", json={"email": invitee["email"], "role": gym_role})
    assert retry.status_code == 201 and retry.json()["id"] == membership_id
    with db_factory() as db:
        membership = db.get(GymMembership, UUID(membership_id))
        assert membership.status == GymMembershipStatus.INVITED
        from dependencies.auth import require_active_gym_membership
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as denied:
            asyncio.run(require_active_gym_membership(membership.gym_id, db.get(User, UUID(invitee["id"])), SQLiteAsyncSession(db)))
        assert denied.value.status_code == 403

    other = TestClient(app, base_url="http://testserver")
    other.headers.update({"Origin": "http://localhost:3000"})
    other.post("/api/auth/login", json={"email": unrelated["email"], "password": "SecurePass123"})
    assert other.post(f"/api/onboarding/gym/invitations/{membership_id}/accept").status_code == 404

    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"email": invitee["email"], "password": "SecurePass123"})
    if gym_role == "trainer":
        assert client.get("/trainer/clients").status_code == 403
    accepted = client.post(f"/api/onboarding/gym/invitations/{membership_id}/accept")
    assert accepted.status_code == 200 and accepted.json()["status"] == "active"
    assert client.post(f"/api/onboarding/gym/invitations/{membership_id}/accept").status_code == 409
    with db_factory() as db:
        membership = db.get(GymMembership, UUID(membership_id))
        assert membership.status == GymMembershipStatus.ACTIVE
        assert membership.user_id == UUID(invitee["id"])
        from dependencies.auth import require_active_gym_membership
        assert asyncio.run(require_active_gym_membership(
            membership.gym_id,
            db.get(User, UUID(invitee["id"])),
            SQLiteAsyncSession(db),
            roles={GymRole(gym_role)},
        ))

    if gym_role == "trainer":
        assert set(client.get("/api/auth/me").json()["roles"]) == {"member", "trainer"}
        assert client.get("/trainer/clients").status_code == 200
    else:
        assert client.get("/trainer/clients").status_code == 403

    expired_user = register(client, username=f"expired_{gym_role}")
    client.post("/api/auth/login", json={"email": owner["email"], "password": "SecurePass123"})
    expired_invite = client.post("/api/onboarding/gym/invitations", json={"email": expired_user["email"], "role": gym_role})
    assert expired_invite.status_code == 201
    expired_id = UUID(expired_invite.json()["id"])
    with db_factory() as db:
        expired_membership = db.get(GymMembership, expired_id)
        expired_membership.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
        db.commit()
    client.post("/api/auth/login", json={"email": expired_user["email"], "password": "SecurePass123"})
    assert client.post(f"/api/onboarding/gym/invitations/{expired_id}/accept").status_code == 410
    with db_factory() as db:
        assert db.get(GymMembership, expired_id).status == GymMembershipStatus.EXPIRED

    # Only the actual owner receives owner-workspace authorization.
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"email": invitee["email"], "password": "SecurePass123"})
    assert client.get("/api/owner/dashboard").status_code == 403
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"email": owner["email"], "password": "SecurePass123"})
    assert client.get("/api/owner/dashboard").status_code == 200


def test_protected_routes_sessions_logout_and_client_supplied_role(api):
    client, db_factory = api
    unauthenticated = TestClient(app, base_url="http://testserver")
    assert unauthenticated.get("/trainer/clients").status_code == 401
    assert unauthenticated.get("/api/owner/dashboard").status_code == 401

    invalid_role = client.post("/api/auth/register", json={
        "name": "Forged", "username": "forged", "email": "forged@example.com",
        "password": "SecurePass123", "role": "owner",
    })
    assert invalid_role.status_code == 422

    user = register(client, username="sessionuser")
    assert client.get("/api/auth/me").status_code == 200
    with db_factory() as db:
        db_user = db.get(User, UUID(user["id"]))
        db_user.role = UserRole.TRAINER
        db.commit()
    assert client.get("/api/auth/me").json()["roles"] == ["member"]
    assert client.get("/trainer/clients").status_code == 403
    with db_factory() as db:
        db_user = db.get(User, UUID(user["id"]))
        db_user.role = UserRole.OWNER
        db.commit()
    assert client.get("/api/owner/dashboard").status_code == 403
    session_cookie = client.cookies.get(settings.AUTH_SESSION_COOKIE)
    assert session_cookie
    cookie_header = f"{settings.AUTH_SESSION_COOKIE}={session_cookie}"
    with db_factory() as db:
        session = db.scalar(select(AuthSession).where(AuthSession.user_id == UUID(user["id"])))
        session.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        db.commit()
    assert client.get("/api/auth/me").status_code == 401

    client.post("/api/auth/logout")
    # A fresh login creates a different valid session; logout then revokes it.
    login = client.post("/api/auth/login", json={"email": user["email"], "password": "SecurePass123"})
    assert login.status_code == 200
    assert client.get("/api/auth/me").status_code == 200
    logout = client.post("/api/auth/logout")
    assert logout.status_code == 200
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Cookie": cookie_header}).status_code == 401


def test_registration_and_login_issue_secure_http_only_session_cookie(api, monkeypatch):
    client, _db_factory = api
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    registration = client.post("/api/auth/register", json={
        "name": "Cookie User", "username": "cookieuser", "email": "cookieuser@example.com",
        "password": "SecurePass123",
    })
    assert registration.status_code == 201
    register_cookie = registration.headers["set-cookie"].lower()
    assert f"{settings.AUTH_SESSION_COOKIE}=" in register_cookie
    assert "httponly" in register_cookie and "secure" in register_cookie and "samesite=lax" in register_cookie

    login = client.post("/api/auth/login", json={"email": "cookieuser@example.com", "password": "SecurePass123"})
    assert login.status_code == 200
    login_cookie = login.headers["set-cookie"].lower()
    assert "httponly" in login_cookie and "secure" in login_cookie and "samesite=lax" in login_cookie


def test_google_callback_mock_creates_session_and_reuses_existing_identity(api, monkeypatch):
    client, db_factory = api
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-secret")
    monkeypatch.setattr(settings, "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

    class MockResponse:
        def __init__(self, payload):
            self.payload = payload

        def raise_for_status(self):
            return None

        def json(self):
            return self.payload

    class MockGoogleClient:
        def __init__(self, **_kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def post(self, *_args, **_kwargs):
            return MockResponse({"access_token": "mock-access-token"})

        async def get(self, *_args, **_kwargs):
            return MockResponse({
                "sub": "google-subject-1",
                "email": "oauth-user@example.com",
                "email_verified": True,
                "name": "OAuth User",
            })

    from routers import auth as auth_router

    monkeypatch.setattr(auth_router.httpx, "AsyncClient", MockGoogleClient)

    def complete_oauth():
        start = client.get("/api/auth/google", follow_redirects=False)
        assert start.status_code == 302
        state = parse_qs(urlparse(start.headers["location"]).query)["state"][0]
        callback = client.get(
            "/api/auth/google/callback",
            params={"code": "mock-code", "state": state},
            follow_redirects=False,
        )
        return callback

    first = complete_oauth()
    assert first.status_code == 303
    assert first.headers["location"] == "http://localhost:3000/onboarding"
    assert "aperture_session=" in first.headers["set-cookie"]
    authenticated = client.get("/api/auth/me")
    assert authenticated.status_code == 200
    user_id = authenticated.json()["id"]
    with db_factory() as db:
        user = db.get(User, UUID(user_id))
        assert user.hashed_password is None
        assert len(db.scalars(select(AuthIdentity).where(AuthIdentity.user_id == user.id)).all()) == 1

    second = complete_oauth()
    assert second.status_code == 303
    assert client.get("/api/auth/me").json()["id"] == user_id
    with db_factory() as db:
        assert db.query(User).count() == 1
        assert db.query(AuthIdentity).count() == 1


def test_google_callback_rejects_unverified_provider_email_without_leaking_tokens(api, monkeypatch):
    client, db_factory = api
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-secret")
    monkeypatch.setattr(settings, "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

    class MockResponse:
        def __init__(self, payload): self.payload = payload
        def raise_for_status(self): return None
        def json(self): return self.payload

    class MockGoogleClient:
        def __init__(self, **_kwargs): pass
        async def __aenter__(self): return self
        async def __aexit__(self, *_args): return None
        async def post(self, *_args, **_kwargs): return MockResponse({"access_token": "must-not-leak"})
        async def get(self, *_args, **_kwargs):
            return MockResponse({"sub": "unverified-subject", "email": "unverified@example.com", "email_verified": False})

    from routers import auth as auth_router
    monkeypatch.setattr(auth_router.httpx, "AsyncClient", MockGoogleClient)
    start = client.get("/api/auth/google", follow_redirects=False)
    state = parse_qs(urlparse(start.headers["location"]).query)["state"][0]
    callback = client.get(
        "/api/auth/google/callback",
        params={"code": "mock-code", "state": state},
        follow_redirects=False,
    )
    assert callback.status_code == 303
    assert callback.headers["location"] == "http://localhost:3000/login?error=google_signin_failed"
    assert "must-not-leak" not in callback.headers["location"]
    assert settings.AUTH_SESSION_COOKIE not in callback.headers.get("set-cookie", "")
    with db_factory() as db:
        assert db.query(User).count() == 0
        assert db.query(AuthIdentity).count() == 0

