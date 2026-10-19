"""Add cookie sessions, identities, and account onboarding relationships.

Revision ID: 20261019_01
Revises:
Create Date: 2026-10-19
"""

from alembic import op
from sqlalchemy import Column, String, inspect

from core.database import Base
import models.account_flows  # noqa: F401
import models.user  # noqa: F401

revision = "20261019_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    had_users = inspect(bind).has_table("users")

    # The repository had no migration history. Create missing active tables without
    # dropping or replacing any existing table or user data.
    if had_users:
        flow_tables = [
            "auth_sessions",
            "auth_identities",
            "oauth_states",
            "auth_rate_limit_buckets",
            "account_onboarding",
            "trainer_profiles",
            "trainer_client_relationships",
            "gyms",
            "gym_memberships",
        ]
        Base.metadata.create_all(bind=bind, tables=[Base.metadata.tables[name] for name in flow_tables])
        columns = {column["name"]: column for column in inspect(bind).get_columns("users")}
        with op.batch_alter_table("users") as batch:
            if "hashed_password" in columns and not columns["hashed_password"]["nullable"]:
                batch.alter_column("hashed_password", existing_type=columns["hashed_password"]["type"], nullable=True)
            if "gym_name" in columns and not columns["gym_name"]["nullable"]:
                batch.alter_column("gym_name", existing_type=columns["gym_name"]["type"], nullable=True)
            if "avatar_url" not in columns:
                batch.add_column(Column("avatar_url", String(2048), nullable=True))
            if "unit_preference" not in columns:
                batch.add_column(Column("unit_preference", String(2), nullable=False, server_default="kg"))
            constraints = {item["name"] for item in inspect(bind).get_check_constraints("users")}
            if "ck_users_unit_preference" not in constraints:
                batch.create_check_constraint("ck_users_unit_preference", "unit_preference IN ('kg', 'lb')")
    else:
        Base.metadata.create_all(bind=bind)


def downgrade() -> None:
    raise RuntimeError("This identity migration is forward-only to prevent accidental loss of account and invitation data.")
