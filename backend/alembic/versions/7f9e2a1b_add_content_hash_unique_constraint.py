"""add content_hash column and unique constraint

Revision ID: 7f9e2a1b
Revises: 1a2b3c4d
Create Date: 2025-12-29 12:54:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "7f9e2a1b"
down_revision: Union[str, None] = "1a2b3c4d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    with op.batch_alter_table("research_items") as batch_op:
        try:
            batch_op.add_column(sa.Column("content_hash", sa.String(length=64), nullable=True))
        except Exception:
            pass
    try:
        op.create_index("ix_research_items_content_hash", "research_items", ["content_hash"])
    except Exception:
        pass
    try:
        op.create_unique_constraint(
            "uq_user_subtype_contenthash",
            "research_items",
            ["user_id", "subtype_id", "content_hash"]
        )
    except Exception:
        pass

def downgrade() -> None:
    try:
        op.drop_constraint("uq_user_subtype_contenthash", "research_items", type_="unique")
    except Exception:
        pass
    try:
        op.drop_index("ix_research_items_content_hash", table_name="research_items")
    except Exception:
        pass
    with op.batch_alter_table("research_items") as batch_op:
        try:
            batch_op.drop_column("content_hash")
        except Exception:
            pass
