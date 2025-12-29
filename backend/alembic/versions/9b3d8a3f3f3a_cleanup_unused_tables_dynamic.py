"""cleanup unused legacy tables dynamically

Revision ID: 9b3d8a3f3f3a
Revises: d661c878b559
Create Date: 2025-12-29 11:05:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "9b3d8a3f3f3a"
down_revision: Union[str, None] = "d661c878b559"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    whitelist = {
        # ORM core tables
        "users",
        "research_types",
        "research_subtypes",
        "research_items",
        "research_collaborators",
        "audit_logs",
        "departments",
        "department_aliases",
        "notices",
        "notice_recipients",
        "permissions_catalog",
        "roles",
        "role_permissions",
        "user_experiences",
        # extension tables
        "ext_vertical_projects",
        "ext_horizontal_projects",
        "ext_academic_papers",
        "ext_patents",
        "ext_academic_books",
        "ext_awards",
        # project workflow tables (raw SQL endpoints)
        "project_notices",
        "project_phases",
        "phase_submissions",
        "submission_attachments",
        "projects",
        "project_batches",
        # ops/support
        "backups",
        "alembic_version",
    }
    # fetch tables
    try:
        res = conn.execute(sa.text("SHOW TABLES"))
        tables = [row[0] for row in res.fetchall()]
    except Exception:
        tables = []
    # drop those not in whitelist (skip system tables)
    for t in tables:
        if t in whitelist:
            continue
        if t.startswith("sqlite_"):
            continue
        try:
            conn.execute(sa.text(f"DROP TABLE IF EXISTS `{t}`"))
        except Exception:
            pass


def downgrade() -> None:
    # irreversible cleanup
    pass

