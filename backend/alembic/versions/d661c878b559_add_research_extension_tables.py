"""add research extension tables

Revision ID: d661c878b559
Revises: manual_remove_fields_from_users
Create Date: 2025-12-29 10:31:24.789334

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "d661c878b559"
down_revision: Union[str, None] = "manual_remove_fields_from_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ext_academic_books",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("publisher", sa.String(length=255), nullable=True),
        sa.Column("isbn", sa.String(length=20), nullable=True),
        sa.Column("publish_date", sa.Date(), nullable=True),
        sa.Column("pages", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["id"], ["research_items.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "ext_academic_papers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("journal_name", sa.String(length=200), nullable=True),
        sa.Column("impact_factor", sa.Float(), nullable=True),
        sa.Column("publish_date", sa.Date(), nullable=True),
        sa.Column("volume_issue", sa.String(length=50), nullable=True),
        sa.Column("is_sci", sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(["id"], ["research_items.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "ext_awards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("awarding_body", sa.String(length=255), nullable=True),
        sa.Column("award_level", sa.String(length=100), nullable=True),
        sa.Column("award_year", sa.Integer(), nullable=True),
        sa.Column("certificate_no", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["id"], ["research_items.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "ext_horizontal_projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("partner_name", sa.String(length=255), nullable=True),
        sa.Column("contract_number", sa.String(length=100), nullable=True),
        sa.Column("total_funding", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(["id"], ["research_items.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "ext_patents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patent_number", sa.String(length=100), nullable=True),
        sa.Column("grant_date", sa.Date(), nullable=True),
        sa.Column("inventor", sa.String(length=255), nullable=True),
        sa.Column("patent_type", sa.String(length=50), nullable=True),
        sa.Column("assignee", sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(["id"], ["research_items.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "ext_vertical_projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("project_source", sa.String(length=100), nullable=True),
        sa.Column("approval_number", sa.String(length=50), nullable=True),
        sa.Column("total_funding", sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column("project_level", sa.String(length=50), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(["id"], ["research_items.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("ext_vertical_projects")
    op.drop_table("ext_patents")
    op.drop_table("ext_horizontal_projects")
    op.drop_table("ext_awards")
    op.drop_table("ext_academic_papers")
    op.drop_table("ext_academic_books")
