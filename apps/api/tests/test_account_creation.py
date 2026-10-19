import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from starlette.responses import Response
from sqlalchemy.sql.dml import Delete

from core import security
from core.rate_limit import _bucket_key
from models.account_flows import (
    Gym,
    GymMembership,
    GymMembershipStatus,
    TrainerClient,
    TrainerClientStatus,
    TrainerProfile,
)
from models.user import UserRole
from repositories.session_repository import SessionRepository
from schemas.auth import LoginRequest, RegisterRequest
from services.auth_service import AuthService
from services.relationship_service import (
    accept_gym_invitation,
    accept_trainer_invitation,
    end_trainer_relationship,
)


class FakeSession:
    def __init__(self):
        self.commits = 0
        self.rollbacks = 0
        self.added = []

    def add(self, value):
        self.added.append(value)

    async def commit(self):
        self.commits += 1

    async def rollback(self):
        self.rollbacks += 1


class FakeUserRepository:
    def __init__(self):
        self.session = FakeSession()
        self.users = {}

    async def get_by_email(self, email):
        return self.users.get(email.lower())

    async def get_by_id(self, user_id):
        return next((user for user in self.users.values() if user.id == user_id), None)

    async def create(self, **data):
        user = SimpleNamespace(
            id=uuid.uuid4(),
            email=data["email"],
            username=data["username"],
            hashed_password=data["hashed_password"],
            name=data["name"],
            role=data["role"],
            gym_name=None,
            is_active=True,
            is_verified=False,
            avatar_url=None,
            last_login=None,
        )
        self.users[user.email] = user
        return user


class FakeSessionRepository:
    def __init__(self):
        self.created = []
        self.identities = {}

    async def create(self, user_id, raw_token, expires_at):
        self.created.append((user_id, raw_token, expires_at))
        return SimpleNamespace(user_id=user_id)

    async def get_identity(self, provider, subject):
        return self.identities.get((provider, subject))


def test_password_hashing_uses_non_reversible_bcrypt_hash():
    encoded = security.hash_password("SecurePass123")
    assert encoded != "SecurePass123"
    assert encoded.startswith("$2b$12$")
    assert security.verify_password("SecurePass123", encoded)
    assert not security.verify_password("WrongPass123", encoded)
    assert not security.verify_password("SecurePass123", None)


def test_registration_validation_and_role_cannot_be_submitted():
    valid = RegisterRequest(email="Member@example.com", username="member", password="SecurePass123", name="Member Name")
    assert valid.email == "Member@example.com"
    with pytest.raises(ValidationError):
        RegisterRequest(email="not-an-email", username="member", password="SecurePass123", name="Member")
    with pytest.raises(ValidationError):
        RegisterRequest(email="member@example.com", username="member", password="SecurePass123", name="Member", role="owner")
    with pytest.raises(ValidationError):
        RegisterRequest(email="member@example.com", username="member", password="short", name="Member")


def test_registration_persists_hash_and_creates_database_session():
    users = FakeUserRepository()
    sessions = FakeSessionRepository()
    service = AuthService(users, sessions)  # type: ignore[arg-type]
    user, raw_session = asyncio.run(service.register_user(RegisterRequest(
        email="member@example.com", username="member", password="SecurePass123", name="Member Name"
    )))
    assert user.hashed_password != "SecurePass123"
    assert security.verify_password("SecurePass123", user.hashed_password)
    assert sessions.created[0][0] == user.id
    assert sessions.created[0][1] == raw_session
    assert users.session.commits == 1
    assert len(raw_session) > 40


def test_duplicate_registration_and_login_credentials():
    users = FakeUserRepository()
    sessions = FakeSessionRepository()
    service = AuthService(users, sessions)  # type: ignore[arg-type]
    request = RegisterRequest(email="member@example.com", username="member", password="SecurePass123", name="Member")
    user, _ = asyncio.run(service.register_user(request))

    with pytest.raises(HTTPException) as duplicate:
        asyncio.run(service.register_user(request))
    assert duplicate.value.status_code == 409
    assert "Sign in" in duplicate.value.detail

    logged_in, token = asyncio.run(service.authenticate_user(LoginRequest(email="member@example.com", password="SecurePass123")))
    assert logged_in.id == user.id
    assert sessions.created[-1][1] == token

    with pytest.raises(HTTPException) as invalid:
        asyncio.run(service.authenticate_user(LoginRequest(email="member@example.com", password="Incorrect123")))
    assert invalid.value.status_code == 401
    assert invalid.value.detail == "Invalid email or password."


def test_google_oauth_creates_passwordless_identity_and_refuses_implicit_linking():
    users = FakeUserRepository()
    sessions = FakeSessionRepository()
    service = AuthService(users, sessions)  # type: ignore[arg-type]
    user, _ = asyncio.run(service.authenticate_google_user(
        subject="google-subject-1", email="google@example.com", name="Google User", avatar_url=None
    ))
    assert user.hashed_password is None
    assert any(getattr(item, "provider", None) == "google" for item in users.session.added)

    existing = asyncio.run(users.create(
        email="password@example.com", username="password", hashed_password="hash", name="Password User", role=UserRole.MEMBER
    ))
    with pytest.raises(HTTPException) as no_merge:
        asyncio.run(service.authenticate_google_user(
            subject="google-subject-2", email=existing.email, name=existing.name, avatar_url=None
        ))
    assert no_merge.value.status_code == 409
    assert len(users.users) == 2


def test_cookie_is_http_only_secure_in_production_and_same_site_lax(monkeypatch):
    from routers.auth import _set_session_cookie
    from core.config import settings

    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    response = Response()
    _set_session_cookie(response, "opaque-session-value")
    cookie = response.headers["set-cookie"].lower()
    assert "httponly" in cookie
    assert "secure" in cookie
    assert "samesite=lax" in cookie
    assert "opaque-session-value" in cookie


def test_expired_or_revoked_server_session_is_not_active():
    now = datetime.now(timezone.utc)
    active = SimpleNamespace(revoked_at=None, expires_at=now + timedelta(minutes=1))
    expired = SimpleNamespace(revoked_at=None, expires_at=now - timedelta(seconds=1))
    revoked = SimpleNamespace(revoked_at=now, expires_at=now + timedelta(days=1))
    assert SessionRepository.is_active(active, now)
    assert not SessionRepository.is_active(expired, now)
    assert not SessionRepository.is_active(revoked, now)
    assert not SessionRepository.is_active(None, now)


def test_auth_dependency_rejects_missing_or_invalid_session(monkeypatch):
    from dependencies import auth as auth_dependencies
    from starlette.requests import Request

    user_id = uuid.uuid4()
    user = SimpleNamespace(id=user_id, is_active=True)

    class FakeSessions:
        def __init__(self, _db): pass
        async def get_valid(self, _token, _now): return None

    class FakeUsers:
        def __init__(self, _db): pass
        async def get_by_id(self, _user_id): return user

    monkeypatch.setattr(auth_dependencies, "SessionRepository", FakeSessions)
    monkeypatch.setattr(auth_dependencies, "UserRepository", FakeUsers)
    scope = {"type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1", "method": "GET", "scheme": "http", "path": "/api/profile", "raw_path": b"/api/profile", "query_string": b"", "headers": [], "server": ("test", 80), "client": ("127.0.0.1", 1234), "root_path": ""}
    missing_request = Request(scope)
    with pytest.raises(HTTPException) as missing:
        asyncio.run(auth_dependencies.get_current_user(missing_request, object()))
    assert missing.value.status_code == 401

    cookie_scope = {**scope, "headers": [(b"cookie", b"aperture_session=invalid-token")]}
    invalid_request = Request(cookie_scope)
    with pytest.raises(HTTPException) as invalid:
        asyncio.run(auth_dependencies.get_current_user(invalid_request, object()))
    assert invalid.value.status_code == 401


def test_rate_limit_key_hashes_email_and_ip():
    request = SimpleNamespace(client=SimpleNamespace(host="203.0.113.8"))
    key = _bucket_key(request, "login", "member@example.com")
    assert len(key) == 64
    assert "member@example.com" not in key
    assert key != _bucket_key(request, "login", "other@example.com")
    assert key == _bucket_key(request, "login", "  MEMBER@EXAMPLE.COM  ")


def test_actual_rate_limit_uses_persistent_counter_and_retry_after():
    from core.rate_limit import enforce_auth_rate_limit

    class Result:
        def __init__(self, value=None): self.value = value
        def scalar_one(self): return self.value

    class CounterDatabase:
        def __init__(self):
            self.buckets = {}
            self.commits = 0

        async def execute(self, statement):
            if isinstance(statement, Delete):
                return Result()
            params = statement.compile().params
            key = params["key_hash"]
            count = self.buckets.get(key, 0) + 1
            self.buckets[key] = count
            return Result(count)

        async def commit(self):
            self.commits += 1

    request = SimpleNamespace(client=SimpleNamespace(host="198.51.100.23"))
    database = CounterDatabase()

    async def attempt(email):
        await enforce_auth_rate_limit(
            request,
            database,  # type: ignore[arg-type]
            scope="register",
            identifier=email,
            limit=2,
        )

    asyncio.run(attempt(" MEMBER@example.com "))
    asyncio.run(attempt("member@example.com"))
    with pytest.raises(HTTPException) as limited:
        asyncio.run(attempt("Member@Example.com"))
    assert limited.value.status_code == 429
    assert limited.value.headers["Retry-After"] == "900"
    assert database.commits == 3
    assert len(database.buckets) == 1
    stored_key = next(iter(database.buckets))
    assert len(stored_key) == 64 and "member" not in stored_key


def test_relationship_schema_has_database_uniqueness_constraints():
    assert TrainerProfile.__table__.c.user_id.unique is True
    assert any({"trainer_profile_id", "client_user_id"} == {column.name for column in constraint.columns}
               for constraint in TrainerClient.__table__.constraints if hasattr(constraint, "columns"))
    assert Gym.__table__.c.owner_user_id.unique is True
    assert any({"gym_id", "user_id"} == {column.name for column in constraint.columns}
               for constraint in GymMembership.__table__.constraints if hasattr(constraint, "columns"))
    assert "admin" not in {role.value for role in UserRole}


def test_trainer_invitation_acceptance_is_one_time_and_scoped():
    actor = uuid.uuid4()
    trainer = uuid.uuid4()
    link = SimpleNamespace(
        client_user_id=actor,
        status=TrainerClientStatus.INVITED,
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        updated_at=None,
    )
    now = datetime.now(timezone.utc)
    assert accept_trainer_invitation(link, actor, now)
    assert link.status == TrainerClientStatus.ACTIVE
    with pytest.raises(HTTPException) as consumed:
        accept_trainer_invitation(link, actor, now)
    assert consumed.value.status_code == 409
    with pytest.raises(HTTPException) as unauthorized:
        end_trainer_relationship(link, uuid.uuid4(), trainer, now)
    assert unauthorized.value.status_code == 403
    end_trainer_relationship(link, trainer, trainer, now)
    assert link.status == TrainerClientStatus.ENDED


def test_expired_and_wrong_user_invitations_cannot_be_accepted():
    actor = uuid.uuid4()
    now = datetime.now(timezone.utc)
    trainer_link = SimpleNamespace(
        client_user_id=actor,
        status=TrainerClientStatus.INVITED,
        expires_at=now - timedelta(seconds=1),
        updated_at=None,
    )
    assert not accept_trainer_invitation(trainer_link, actor, now)
    assert trainer_link.status == TrainerClientStatus.ENDED
    with pytest.raises(HTTPException) as wrong_client:
        accept_trainer_invitation(trainer_link, uuid.uuid4(), now)
    assert wrong_client.value.status_code == 404

    gym_invite = SimpleNamespace(
        user_id=actor,
        status=GymMembershipStatus.INVITED,
        expires_at=now - timedelta(seconds=1),
        updated_at=None,
    )
    assert not accept_gym_invitation(gym_invite, actor, now)
    assert gym_invite.status == GymMembershipStatus.EXPIRED
