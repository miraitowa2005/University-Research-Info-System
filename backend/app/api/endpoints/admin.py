from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text as sa_text
from app.core.config import settings
from sqlalchemy import text
from app.api import deps
from app.core.config import settings
from app.crud import crud_user
from app.models.user import User as UserModel
from sqlalchemy.future import select

router = APIRouter()

@router.get("/health")
async def health(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    # Simple metrics: db ping, mock disk space, api latency
    try:
        await db.execute(text("SELECT 1"))
        db_latency_ms = 2
    except:
        db_latency_ms = -1
    return {
        "db": {"status": "ok" if db_latency_ms >= 0 else "error", "metric": f"{db_latency_ms}ms", "message": "Connection Pool: 5/20"},
        "disk": {"status": "warning", "metric": "85%", "message": "85% used (150GB free)"},
        "api": {"status": "ok", "metric": "120ms", "message": "Average response time"},
        "backup": {"status": "idle", "message": "Last backup successful"},
    }

@router.post("/backup")
async def start_backup(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    await db.execute(text("INSERT INTO backups (status) VALUES ('running')"))
    await db.commit()
    # Simulate complete
    await db.execute(text("UPDATE backups SET status='success', updated_at=CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1"))
    await db.commit()
    return {"status": "success"}

@router.get("/backups")
async def list_backups(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    res = await db.execute(text("SELECT id, status, updated_at FROM backups ORDER BY id DESC LIMIT 20"))
    rows = res.fetchall()
    return [{"id": r[0], "status": r[1], "updated_at": r[2]} for r in rows]

@router.post("/cache/clear")
async def clear_cache(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    return {"status": "cleared"}

@router.get("/db/schema")
async def export_db_schema(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Export tables and schema information for current database.
    Returns: { database, tables: [ { name, create_sql, columns: [...] } ] }
    """
    # list tables
    res = await db.execute(text("SHOW TABLES"))
    rows = res.fetchall()
    # MySQL returns tuple with table name
    table_names = [r[0] for r in rows]
    tables: List[dict] = []
    for t in table_names:
        # SHOW CREATE TABLE
        c = await db.execute(text(f"SHOW CREATE TABLE `{t}`"))
        c_row = c.fetchone()
        create_sql = None
        if c_row and len(c_row) >= 2:
            create_sql = c_row[1]
        # Columns from information_schema
        cols = await db.execute(text("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :tbl
            ORDER BY ORDINAL_POSITION
        """), {"db": settings.DB_NAME, "tbl": t})
        columns = []
        for r2 in cols.fetchall():
            columns.append({
                "name": r2[0],
                "type": r2[1],
                "nullable": r2[2],
                "default": r2[3],
                "key": r2[4],
                "extra": r2[5],
            })
        tables.append({"name": t, "create_sql": create_sql, "columns": columns})
    return {"database": settings.DB_NAME, "tables": tables}

@router.post("/users/set-department")
async def set_user_department(
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Set user's department by email.
    Body: { email: str, department?: str, department_code?: str, dept_id?: int }
    """
    email = (body.get("email") or "").strip()
    dept_name = body.get("department")
    dept_code = body.get("department_code")
    dept_id = body.get("dept_id")
    if not email:
        return {"status": "error", "detail": "email required"}
    res = await db.execute(select(UserModel).where(UserModel.email == email))
    user = res.scalars().first()
    if not user:
        return {"status": "error", "detail": "user not found"}
    update_data: dict[str, Any] = {}
    # prefer dept_id
    if dept_id is not None:
        update_data["dept_id"] = int(dept_id)
    elif dept_code:
        r = await db.execute(select(Department.id).where(Department.code == dept_code))
        row = r.first()
        if row:
            update_data["dept_id"] = int(row[0])
    elif dept_name:
        r = await db.execute(select(Department.id).where(Department.name == dept_name))
        row = r.first()
        if not row:
            r2 = await db.execute(select(DepartmentAlias.code).where(DepartmentAlias.alias == dept_name))
            arow = r2.first()
            if arow:
                r3 = await db.execute(select(Department.id).where(Department.code == arow[0]))
                row = r3.first()
        if row:
            update_data["dept_id"] = int(row[0])
    if not update_data:
        return {"status": "error", "detail": "no department fields provided"}
    updated = await crud_user.user.update(db, db_obj=user, obj_in=update_data)
    return {"status": "ok", "user": {"id": updated.id, "email": updated.email, "dept_id": updated.dept_id}}

@router.post("/db/cleanup")
async def cleanup_db(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Cleanup legacy tables and backfill data.
    - Drop sys_departments if exists
    - Backfill users.dept_id from departments/aliases
    """
    # authorization: allow sys_admin or research_admin
    try:
        role = getattr(current_user, "role", None)
        if role not in ("sys_admin", "research_admin"):
            raise HTTPException(status_code=403, detail="insufficient_privileges")
    except Exception:
        raise HTTPException(status_code=403, detail="insufficient_privileges")
    try:
        await db.execute(text("DROP TABLE IF EXISTS sys_departments"))
        await db.commit()
    except Exception:
        await db.rollback()
    # backfill removed for legacy columns; use explicit admin tools if needed
    return {"status": "ok"}

# role_id legacy helper removed

@router.post("/db/ensure-utf8mb4")
async def ensure_utf8mb4(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Force database and all tables to use utf8mb4 to avoid Chinese garbled text.
    """
    dbname = settings.DB_NAME
    try:
        # alter database charset/collation
        await db.execute(sa_text(f"ALTER DATABASE `{dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
        await db.commit()
    except Exception:
        await db.rollback()
    try:
        # convert all existing tables
        res = await db.execute(sa_text("SHOW TABLES"))
        tables = [row[0] for row in res.fetchall()]
        for t in tables:
            # skip views or system tables if any
            try:
                await db.execute(sa_text(f"ALTER TABLE `{t}` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
                await db.commit()
            except Exception:
                await db.rollback()
        return {"status": "ok", "tables": tables}
    except Exception as e:
        await db.rollback()
        return {"status": "error", "detail": str(e)}

@router.post("/db/optimize")
async def optimize_db(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    # authorization
    role = getattr(current_user, "role", None)
    if role not in ("sys_admin", "research_admin"):
        raise HTTPException(status_code=403, detail="insufficient_privileges")
    # users: add role_id, backfill from roles, drop department_code
    try:
        await db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT NULL"))
        # map role string to role_id by roles.name
        await db.execute(text("""
            UPDATE users u
            JOIN roles r ON (
                (u.role='sys_admin' AND r.name='系统管理员') OR
                (u.role='research_admin' AND r.name='科研管理员') OR
                (u.role='teacher' AND r.name='教师')
            )
            SET u.role_id = r.id
            WHERE u.role_id IS NULL
        """))
        await db.commit()
    except Exception:
        await db.rollback()
    try:
        await db.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS department_code"))
        await db.commit()
    except Exception:
        await db.rollback()
    # notices: drop target_department
    try:
        await db.execute(text("ALTER TABLE notices DROP COLUMN IF EXISTS target_department"))
        await db.commit()
    except Exception:
        await db.rollback()
    # constraints optional: ensure indexes
    try:
        await db.execute(text("ALTER TABLE users ADD INDEX idx_users_dept_id (dept_id)"))
    except Exception:
        pass
    try:
        await db.execute(text("ALTER TABLE users ADD INDEX idx_users_role_id (role_id)"))
    except Exception:
        pass
    return {"status": "ok"}

@router.post("/db/migrate-batches")
async def migrate_project_batches(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    """
    Migrate project_batches to minimal schema:
    - batch_id BIGINT PK AUTO_INCREMENT
    - batch_name VARCHAR(200) NOT NULL
    - publisher_dept_id BIGINT NOT NULL
    - notice_id INT NOT NULL UNIQUE
    """
    try:
        await db.execute(sa_text("""
            CREATE TABLE IF NOT EXISTS project_batches (
              batch_id BIGINT PRIMARY KEY AUTO_INCREMENT,
              batch_name VARCHAR(200) NOT NULL,
              publisher_dept_id BIGINT NOT NULL,
              notice_id INT NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        await db.commit()
    except Exception as e:
        await db.rollback()
        return {"status": "error", "detail": str(e)}
    # Ensure columns
    try:
        cols = await db.execute(sa_text("SHOW COLUMNS FROM project_batches"))
        names = [row[0] for row in cols.fetchall()]
        if "batch_name" not in names:
            await db.execute(sa_text("ALTER TABLE project_batches ADD COLUMN batch_name VARCHAR(200) NOT NULL"))
        if "publisher_dept_id" not in names:
            await db.execute(sa_text("ALTER TABLE project_batches ADD COLUMN publisher_dept_id BIGINT NOT NULL"))
        if "notice_id" not in names:
            await db.execute(sa_text("ALTER TABLE project_batches ADD COLUMN notice_id INT NOT NULL"))
        await db.commit()
        # Drop legacy columns
        legacy_cols = ["start_time","end_time","publisher_id","visibility_scope","requirements","status","created_at","phase_id"]
        for c in legacy_cols:
            if c in names:
                try:
                    await db.execute(sa_text(f"ALTER TABLE project_batches DROP COLUMN {c}"))
                except Exception:
                    pass
        await db.commit()
        # Unique index on notice_id
        try:
            await db.execute(sa_text("ALTER TABLE project_batches ADD UNIQUE KEY uniq_notice_id (notice_id)"))
            await db.commit()
        except Exception:
            await db.rollback()
    except Exception as e:
        await db.rollback()
        return {"status": "error", "detail": str(e)}
    return {"status": "ok"}
