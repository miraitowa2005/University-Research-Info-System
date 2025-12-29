"""Remove department_code, department, role_id from users (manual)

Revision ID: manual_remove_fields_from_users
Revises: remove_department_from_users
Create Date: 2025-12-28 23:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'manual_remove_fields_from_users'
down_revision: Union[str, None] = 'remove_department_from_users'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 只删除我们需要的三个字段
    op.drop_column('users', 'department_code')
    op.drop_column('users', 'department')
    op.drop_column('users', 'role_id')


def downgrade() -> None:
    # 恢复删除的字段
    op.add_column('users', sa.Column('department_code', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('department', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('role_id', sa.Integer(), nullable=True))