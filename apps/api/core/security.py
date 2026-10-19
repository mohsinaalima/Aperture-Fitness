import hashlib
import secrets

from pwdlib import PasswordHash
from pwdlib.exceptions import UnknownHashError
from pwdlib.hashers.bcrypt import BcryptHasher


# bcrypt cost 12; pwdlib and bcrypt are already part of the API environment.
_password_hash = PasswordHash((BcryptHasher(rounds=12),))


def hash_password(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password must be at most 72 UTF-8 bytes.")
    return _password_hash.hash(password)


def verify_password(password: str, encoded_hash: str | None) -> bool:
    if not encoded_hash or len(password.encode("utf-8")) > 72:
        return False
    try:
        return _password_hash.verify(password, encoded_hash)
    except (ValueError, TypeError, UnknownHashError):
        return False


def new_session_token() -> str:
    return secrets.token_urlsafe(48)


def hash_opaque_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
