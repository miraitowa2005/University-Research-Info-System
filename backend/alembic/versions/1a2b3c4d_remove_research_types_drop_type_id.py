"""remove research_types and drop type_id from research_subtypes

Revision ID: 1a2b3c4d
Revises: 9b3d8a3f3f3a
Create Date: 2025-12-29 12:30:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "1a2b3c4d"
down_revision: Union[str, None] = "9b3d8a3f3f3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Drop FK constraint if exists, then drop column
    try:
        op.execute("ALTER TABLE `research_subtypes` DROP FOREIGN KEY `research_subtypes_ibfk_1`")
    except Exception:
        pass
    with op.batch_alter_table("research_subtypes") as batch_op:
        try:
            batch_op.drop_column("type_id")
        except Exception:
            pass
    try:
        op.drop_table("research_types")
    except Exception:
        pass

def downgrade() -> None:
    with op.batch_alter_table("research_subtypes") as batch_op:
        batch_op.add_column(sa.Column("type_id", sa.Integer(), nullable=True))
    op.create_table(
        "research_types",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False, unique=True),
        sa.Column("description", sa.String(length=1000), nullable=True),
    )
