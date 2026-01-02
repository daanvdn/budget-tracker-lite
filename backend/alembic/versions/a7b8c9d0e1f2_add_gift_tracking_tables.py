"""add_gift_tracking_tables

Revision ID: a7b8c9d0e1f2
Revises: 934a1ebfd1a6
Create Date: 2026-01-02 12:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a7b8c9d0e1f2"
down_revision: Union[str, Sequence[str], None] = "934a1ebfd1a6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create gift tracking tables."""
    # Create gift_occasions table
    op.create_table(
        "gift_occasions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column(
            "occasion_type",
            sa.Enum("birthday", "holiday", "celebration", "other", name="occasiontype"),
            nullable=False,
        ),
        sa.Column("occasion_date", sa.Date(), nullable=True),
        sa.Column("person_id", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_pool_account", sa.Boolean(), nullable=False, default=False),
        sa.Column("created_by_user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["person_id"], ["beneficiaries.id"]),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_gift_occasions_id"), "gift_occasions", ["id"], unique=False)

    # Create gift_entries table
    op.create_table(
        "gift_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("occasion_id", sa.Integer(), nullable=False),
        sa.Column(
            "direction",
            sa.Enum("given", "received", name="giftdirection"),
            nullable=False,
        ),
        sa.Column("person_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("gift_date", sa.Date(), nullable=False),
        sa.Column("description", sa.String(length=200), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("transaction_id", sa.Integer(), nullable=True),
        sa.Column("created_by_user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["occasion_id"], ["gift_occasions.id"]),
        sa.ForeignKeyConstraint(["person_id"], ["beneficiaries.id"]),
        sa.ForeignKeyConstraint(["transaction_id"], ["transactions.id"]),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_gift_entries_id"), "gift_entries", ["id"], unique=False)

    # Create gift_purchases table
    op.create_table(
        "gift_purchases",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("occasion_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("purchase_date", sa.Date(), nullable=False),
        sa.Column("description", sa.String(length=200), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("transaction_id", sa.Integer(), nullable=True),
        sa.Column("created_by_user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["occasion_id"], ["gift_occasions.id"]),
        sa.ForeignKeyConstraint(["transaction_id"], ["transactions.id"]),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_gift_purchases_id"), "gift_purchases", ["id"], unique=False)


def downgrade() -> None:
    """Drop gift tracking tables."""
    op.drop_index(op.f("ix_gift_purchases_id"), table_name="gift_purchases")
    op.drop_table("gift_purchases")
    op.drop_index(op.f("ix_gift_entries_id"), table_name="gift_entries")
    op.drop_table("gift_entries")
    op.drop_index(op.f("ix_gift_occasions_id"), table_name="gift_occasions")
    op.drop_table("gift_occasions")

    # Drop enums (for PostgreSQL compatibility)
    op.execute("DROP TYPE IF EXISTS giftdirection")
    op.execute("DROP TYPE IF EXISTS occasiontype")
