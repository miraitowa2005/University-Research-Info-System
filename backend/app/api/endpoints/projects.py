from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.api import deps

router = APIRouter()

# Ensure required tables exist (MySQL)
CREATE_TABLES_SQL = [
    """
    CREATE TABLE IF NOT EXISTS project_notices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      publish_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS project_phases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      notice_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      deadline DATE NOT NULL,
      description TEXT,
      CONSTRAINT fk_phase_notice FOREIGN KEY (notice_id) REFERENCES project_notices(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS phase_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phase_id INT NOT NULL,
      applicant_id INT NOT NULL,
      dept_id BIGINT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'not_started',
      submitted_at TIMESTAMP NULL,
      file_url VARCHAR(500) NULL,
      remarks TEXT NULL,
      return_reason TEXT NULL,
      content_json LONGTEXT NULL,
      is_draft TINYINT(1) NOT NULL DEFAULT 0,
      CONSTRAINT fk_submission_phase FOREIGN KEY (phase_id) REFERENCES project_phases(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS submission_attachments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      submission_id INT NOT NULL,
      filename VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      size_bytes BIGINT NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_attach_submission FOREIGN KEY (submission_id) REFERENCES phase_submissions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      status INT NOT NULL DEFAULT 1, -- 0:草稿,1:待审核,2:通过,3:驳回
      applicant_id INT NOT NULL,
      content_json LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # Departments (sys_departments) for data isolation
    """
    CREATE TABLE IF NOT EXISTS sys_departments (
      dept_id BIGINT PRIMARY KEY AUTO_INCREMENT,
      dept_name VARCHAR(100) NOT NULL,
      dept_code VARCHAR(50),
      category VARCHAR(50),
      parent_id BIGINT DEFAULT 0,
      status TINYINT DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    # Batches for project applications with department isolation
    """
    CREATE TABLE IF NOT EXISTS project_batches (
      batch_id BIGINT PRIMARY KEY AUTO_INCREMENT,
      batch_name VARCHAR(200) NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      publisher_id BIGINT NOT NULL,
      publisher_dept_id BIGINT NOT NULL,
      visibility_scope TINYINT DEFAULT 0,
      requirements TEXT,
      status TINYINT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
]

async def ensure_tables(db: AsyncSession) -> None:
    for sql in CREATE_TABLES_SQL:
        await db.execute(text(sql))
    await db.commit()
    # Seed common department mapping
    await db.execute(text("""
      INSERT IGNORE INTO sys_departments (dept_name, dept_code, category, parent_id, status)
      VALUES ('计算机科学与技术学院','CS','计算机与人工智能方向',0,1)
    """))
    await db.commit()

async def resolve_user_dept_id(db: AsyncSession, user) -> Optional[int]:
    # 1) If user has dept_id, use it
    did = getattr(user, "dept_id", None)
    if did:
        return int(did)
    # Helper: ensure sys_departments contains code -> dept_id
    async def ensure_sys_dept(code: str, name: Optional[str]) -> Optional[int]:
        if not code:
            return None
        res = await db.execute(text("SELECT dept_id FROM sys_departments WHERE dept_code=:c"), {"c": code})
        row = res.first()
        if row:
            return int(row.dept_id)
        # try insert
        await db.execute(text("""
            INSERT INTO sys_departments (dept_name, dept_code, category, parent_id, status)
            VALUES (:n, :c, NULL, 0, 1)
        """), {"n": (name or "未知学院"), "c": code})
        await db.commit()
        res2 = await db.execute(text("SELECT dept_id FROM sys_departments WHERE dept_code=:c"), {"c": code})
        row2 = res2.first()
        return int(row2.dept_id) if row2 else None
    # 2) If department_code present, map to sys_departments
    code = getattr(user, "department_code", None)
    if code:
        return await ensure_sys_dept(str(code), getattr(user, "department", None))
    # 3) Try to normalize by department name via departments/aliases -> code
    name = getattr(user, "department", None)
    if name:
        # exact match in departments
        r1 = await db.execute(text("SELECT code FROM departments WHERE name=:n"), {"n": name})
        row1 = r1.first()
        code2 = None
        if row1:
            code2 = row1.code
        else:
            r2 = await db.execute(text("SELECT code FROM department_aliases WHERE alias=:n"), {"n": name})
            row2 = r2.first()
            if row2:
                code2 = row2.code
        if code2:
            return await ensure_sys_dept(str(code2), name)
    # 4) Fallback none
    return None


# ----- Notices -----
@router.get("/notices")
async def list_notices(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    await ensure_tables(db)
    res = await db.execute(text("SELECT id, title, content, publish_by, created_at FROM project_notices ORDER BY id DESC"))
    rows = [dict(r) for r in res.mappings().all()]
    return rows

@router.post("/notices")
async def create_notice(
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    await ensure_tables(db)
    title = (body.get("title") or "").strip()
    content = body.get("content") or ""
    if not title:
        raise HTTPException(status_code=400, detail="title required")
    await db.execute(text("INSERT INTO project_notices (title, content, publish_by) VALUES (:t, :c, :u)"),
                     {"t": title, "c": content, "u": getattr(current_user, "id", None)})
    await db.commit()
    return {"status": "ok"}


# ----- Phases -----
@router.get("/notices/{notice_id}/phases")
async def list_phases(
    notice_id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    await ensure_tables(db)
    res = await db.execute(text("SELECT id, notice_id, name, deadline, description FROM project_phases WHERE notice_id=:nid ORDER BY deadline ASC"),
                           {"nid": notice_id})
    return [dict(r) for r in res.mappings().all()]

@router.post("/notices/{notice_id}/phases")
async def create_phase(
    notice_id: int,
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    await ensure_tables(db)
    name = (body.get("name") or "").strip()
    deadline = body.get("deadline")
    description = body.get("description") or ""
    if not name or not deadline:
        raise HTTPException(status_code=400, detail="name and deadline required")
    await db.execute(text("INSERT INTO project_phases (notice_id, name, deadline, description) VALUES (:nid, :n, :d, :desc)"),
                     {"nid": notice_id, "n": name, "d": deadline, "desc": description})
    await db.commit()
    return {"status": "ok"}


# ----- Submissions -----
@router.get("/phases/{phase_id}/submissions")
async def list_phase_submissions(
    phase_id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    await ensure_tables(db)
    res = await db.execute(text("""
        SELECT s.id, s.phase_id, s.applicant_id, s.status, s.submitted_at, s.file_url, s.remarks
        FROM phase_submissions s
        WHERE s.phase_id = :pid
        ORDER BY s.submitted_at DESC NULLS LAST, s.id DESC
    """), {"pid": phase_id})
    subs = [dict(r) for r in res.mappings().all()]
    # Attach applicant info (limited fields)
    if subs:
        ids = tuple(set([s["applicant_id"] for s in subs]))
        if len(ids) == 1:
            ids_sql = f"({ids[0]})"
        else:
            ids_sql = str(ids)
        ures = await db.execute(text(f"SELECT id, full_name as name, email FROM users WHERE id IN {ids_sql}"))
        users = {u.id: {"id": u.id, "name": u.name, "email": u.email} for u in ures}
        for s in subs:
            s["applicant"] = users.get(s["applicant_id"])
            # attachments
            ares = await db.execute(text("SELECT id, filename, url, size_bytes, uploaded_at FROM submission_attachments WHERE submission_id=:sid ORDER BY id DESC"), {"sid": s["id"]})
            s["attachments"] = [dict(r) for r in ares.mappings().all()]
    return subs

@router.get("/my-submissions")
async def list_my_submissions(
    user_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    await ensure_tables(db)
    uid = user_id or getattr(current_user, "id", None)
    if not uid:
        raise HTTPException(status_code=400, detail="user_id required")
    res = await db.execute(text("""
        SELECT s.id, s.phase_id, s.applicant_id, s.status, s.submitted_at, s.file_url, s.remarks, s.return_reason, s.content_json, s.is_draft,
               p.name as phase_name, p.deadline as phase_deadline, p.notice_id,
               n.title as notice_title
        FROM phase_submissions s
        JOIN project_phases p ON p.id = s.phase_id
        JOIN project_notices n ON n.id = p.notice_id
        WHERE s.applicant_id = :uid
        ORDER BY s.submitted_at DESC NULLS LAST, s.id DESC
    """), {"uid": uid})
    return [dict(r) for r in res.mappings().all()]

@router.get("/submissions/latest")
async def latest_submissions(
    limit: int = 10,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    await ensure_tables(db)
    res = await db.execute(text("""
        SELECT id, phase_id, applicant_id, status, submitted_at, file_url, remarks
        FROM phase_submissions
        ORDER BY submitted_at DESC NULLS LAST, id DESC
        LIMIT :lim
    """), {"lim": limit})
    return [dict(r) for r in res.mappings().all()]

@router.post("/phases/{phase_id}/submissions")
async def create_submission(
    phase_id: int,
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    await ensure_tables(db)
    status_val = (body.get("status") or "submitted").lower()
    file_url = body.get("file_url") or None
    remarks = body.get("remarks") or None
    content_json = body.get("content_json")
    if status_val not in ("not_started", "submitted", "returned"):
        raise HTTPException(status_code=400, detail="invalid status")
    await db.execute(text("""
        INSERT INTO phase_submissions (phase_id, applicant_id, dept_id, status, submitted_at, file_url, remarks, content_json, is_draft)
        VALUES (:pid, :uid, :did, :st, CASE WHEN :st = 'submitted' THEN CURRENT_TIMESTAMP ELSE NULL END, :fu, :rm, :cj, CASE WHEN :st='not_started' THEN 1 ELSE 0 END)
    """), {"pid": phase_id, "uid": getattr(current_user, "id", None), "did": getattr(current_user, "dept_id", None), "st": status_val, "fu": file_url, "rm": remarks, "cj": content_json})
    await db.commit()
    return {"status": "ok"}

@router.put("/submissions/{submission_id}")
async def update_submission_status(
    submission_id: int,
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    await ensure_tables(db)
    status_val = (body.get("status") or "").lower()
    remarks = body.get("remarks") or None
    return_reason = body.get("return_reason") or None
    if status_val not in ("not_started", "submitted", "returned"):
        raise HTTPException(status_code=400, detail="invalid status")
    await db.execute(text("""
        UPDATE phase_submissions 
        SET status=:st, remarks=:rm, return_reason=CASE WHEN :st='returned' THEN :rr ELSE return_reason END, submitted_at=CASE WHEN :st='submitted' THEN CURRENT_TIMESTAMP ELSE submitted_at END, is_draft=CASE WHEN :st='not_started' THEN 1 ELSE 0 END
        WHERE id=:sid
    """), {"sid": submission_id, "st": status_val, "rm": remarks, "rr": return_reason})
    await db.commit()
    return {"status": "ok"}

# ----- Draft save (upsert) -----
@router.post("/phases/{phase_id}/draft")
async def save_draft(
    phase_id: int,
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    await ensure_tables(db)
    content_json = body.get("content_json") or "{}"
    # find existing draft
    res = await db.execute(text("SELECT id FROM phase_submissions WHERE phase_id=:pid AND applicant_id=:uid"), {"pid": phase_id, "uid": getattr(current_user, "id", None)})
    row = res.first()
    if row:
        await db.execute(text("UPDATE phase_submissions SET content_json=:cj, is_draft=1, status='not_started' WHERE id=:sid"), {"cj": content_json, "sid": row.id})
    else:
        await db.execute(text("INSERT INTO phase_submissions (phase_id, applicant_id, status, is_draft, content_json) VALUES (:pid, :uid, 'not_started', 1, :cj)"),
                         {"pid": phase_id, "uid": getattr(current_user, "id", None), "cj": content_json})
    await db.commit()
    return {"status": "ok"}

# ----- File upload & serving -----
import os
from fastapi import UploadFile, File
from fastapi.responses import FileResponse

STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", "..", "storage", "uploads")
STORAGE_DIR = os.path.abspath(STORAGE_DIR)
os.makedirs(STORAGE_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(
    submission_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    await ensure_tables(db)
    # save file to storage
    fname = f"{submission_id}_{file.filename}"
    fpath = os.path.join(STORAGE_DIR, fname)
    with open(fpath, "wb") as f:
        f.write(await file.read())
    rel_url = f"/api/v1/projects/files/{fname}"
    # record attachment
    size_bytes = os.path.getsize(fpath)
    await db.execute(text("INSERT INTO submission_attachments (submission_id, filename, url, size_bytes) VALUES (:sid, :fn, :url, :sz)"),
                     {"sid": submission_id, "fn": file.filename, "url": rel_url, "sz": size_bytes})
    await db.commit()
    return {"url": rel_url, "filename": file.filename, "size_bytes": size_bytes}

@router.get("/files/{filename}")
async def get_file(
    filename: str,
) -> Any:
    fpath = os.path.join(STORAGE_DIR, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="file not found")
    return FileResponse(fpath)

# ----- Core Project Create/List per spec -----
@router.post("/create")
async def create_project(
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create project record:
    - title: 项目/成果名称
    - type: 类别：纵向科研项目/横向科研项目/科研论文/专著/专利/获奖
    - status: 0 草稿 / 1 待审核 / 2 通过 / 3 驳回
    - content_json: 变结构数据（类别特定信息、预算、成员等）
    """
    await ensure_tables(db)
    title = (body.get("title") or "").strip()
    type_ = (body.get("type") or "").strip()
    status = int(body.get("status") or 1)
    content_json = body.get("content_json")
    if not title or not type_:
        raise HTTPException(status_code=400, detail="title and type required")
    await db.execute(text("""
        INSERT INTO projects (title, type, status, applicant_id, content_json)
        VALUES (:t, :ty, :st, :uid, :cj)
    """), {"t": title, "ty": type_, "st": status, "uid": getattr(current_user, "id", None), "cj": content_json})
    res = await db.execute(text("SELECT LAST_INSERT_ID() AS id"))
    new_id = res.scalar()
    await db.commit()
    return {"id": new_id, "status": "ok"}

@router.get("/list")
async def list_projects(
    applicant_id: Optional[int] = None,
    keyword: Optional[str] = None,
    status: Optional[int] = None,
    page: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    List projects for a user:
    - applicant_id defaults to current user
    - supports keyword search on title
    - supports status filter
    - pagination via page & limit
    """
    await ensure_tables(db)
    uid = applicant_id or getattr(current_user, "id", None)
    if not uid:
        raise HTTPException(status_code=400, detail="applicant_id required")
    where = ["applicant_id = :uid"]
    params: dict[str, Any] = {"uid": uid}
    if keyword:
        where.append("title LIKE :kw")
        params["kw"] = f"%{keyword}%"
    if status is not None:
        where.append("status = :st")
        params["st"] = int(status)
    where_sql = " AND ".join(where)
    offset = max(page - 1, 0) * limit
    q = text(f"SELECT id, title, type, status, applicant_id, content_json, created_at FROM projects WHERE {where_sql} ORDER BY id DESC LIMIT :lim OFFSET :off")
    params.update({"lim": limit, "off": offset})
    res = await db.execute(q, params)
    items = [dict(r) for r in res.mappings().all()]
    return {"list": items, "page": page, "limit": limit}

# ----- Department & Batch APIs per design -----
from typing import Optional

@router.post("/batches")
async def publish_batch(
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Publish a project application batch restricted to current user's department.
    Fields:
    - batch_name, start_time, end_time, visibility_scope, requirements
    """
    await ensure_tables(db)
    batch_name = (body.get("batch_name") or "").strip()
    start_time = body.get("start_time")
    end_time = body.get("end_time")
    visibility_scope = int(body.get("visibility_scope") or 0)
    requirements = body.get("requirements") or None
    if not batch_name or not start_time or not end_time:
        raise HTTPException(status_code=400, detail="batch_name, start_time, end_time required")
    # enforce department isolation: publisher_dept_id = current_user.dept_id or department_code mapping
    pub_dept_id = await resolve_user_dept_id(db, current_user) or 0
    await db.execute(text("""
        INSERT INTO project_batches (batch_name, start_time, end_time, publisher_id, publisher_dept_id, visibility_scope, requirements, status)
        VALUES (:bn, :st, :et, :pid, :pdid, :vs, :req, 1)
    """), {"bn": batch_name, "st": start_time, "et": end_time, "pid": getattr(current_user, "id", None), "pdid": pub_dept_id, "vs": visibility_scope, "req": requirements})
    await db.commit()
    return {"status": "ok"}

@router.get("/batches/available")
async def get_available_batches(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    """
    Teachers can only see batches from their own department and open status.
    """
    await ensure_tables(db)
    dept_id = await resolve_user_dept_id(db, current_user)
    res = await db.execute(text("""
        SELECT batch_id, batch_name, start_time, end_time, requirements, visibility_scope
        FROM project_batches 
        WHERE status=1 AND publisher_dept_id = :did
        ORDER BY end_time ASC
    """), {"did": (dept_id or 0)})
    return [dict(r) for r in res.mappings().all()]
