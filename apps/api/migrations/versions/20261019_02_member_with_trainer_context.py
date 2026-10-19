"""Persist the member-with-trainer onboarding context.

Revision ID: 20261019_02
Revises: 20261019_01
"""

from alembic import op

revision = "20261019_02"
down_revision = "20261019_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("ck_onboarding_context", "account_onboarding", type_="check")
    op.create_check_constraint(
        "ck_onboarding_context",
        "account_onboarding",
        "training_context IN ('member', 'member_with_trainer', 'trainer', 'gym_owner')",
    )


def downgrade() -> None:
    raise RuntimeError("This onboarding-context migration is forward-only.")
