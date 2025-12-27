from typing import List, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.notice import Notice as NoticeModel
from app.models.department import Department, DepartmentAlias
from app.models.notice_recipient import NoticeRecipient
from app.models.user import User
from app.schemas.notice import NoticeCreate, Notice as NoticeSchema
from app.crud.base import CRUDBase

router = APIRouter()

crud_notice = CRUDBase[NoticeModel, NoticeCreate, NoticeCreate](NoticeModel)

@router.post("/", response_model=NoticeSchema, status_code=status.HTTP_201_CREATED)
async def create_notice(
    *,
    db: AsyncSession = Depends(deps.get_db),
    notice_in: NoticeCreate,
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    # Normalize department
    code = notice_in.target_department_code
    name = notice_in.target_department
    async def norm(s: str) -> str:
        return (s or "").strip().lower().replace(" ", "")
    if not code and name:
        # Try match by name
        res = await db.execute(select(Department))
        for d in res.scalars().all():
            if norm(d.name) == norm(name):
                code = d.code
                break
        if not code:
            res2 = await db.execute(select(DepartmentAlias))
            for a in res2.scalars().all():
                if norm(a.alias) == norm(name):
                    code = a.code
                    break
    payload = NoticeCreate(
        title=notice_in.title,
        content=notice_in.content,
        target_role=notice_in.target_role,
        target_department=notice_in.target_department,
        target_department_code=code,
        publisher=notice_in.publisher
    )
    created = await crud_notice.create(db, obj_in=payload)
    # Fan-out recipients
    q = select(User)
    if payload.target_role != "all":
        q = q.where(User.role == payload.target_role)
    users = (await db.execute(q)).scalars().all()
    recs = []
    for u in users:
        # If department code is specified, try to match user department_code or normalize
        if code:
            # skip if user has department_code and not equal
            # Note: department_code may be null; allow normalize on the fly
            # naive normalize by querying alias table is overkill here; accept only exact code
            # assume admin sets code from dropdown so it's consistent
            # we include user when u.department_code == code
            # if user doesn't have code, we skip
            if getattr(u, "department_code", None) != code:
                continue
        recs.append(NoticeRecipient(notice_id=created.id, user_id=u.id))
    if recs:
        db.add_all(recs)
        await db.commit()
    return created

@router.post("", response_model=NoticeSchema, status_code=status.HTTP_201_CREATED)
async def create_notice_no_slash(
    *,
    db: AsyncSession = Depends(deps.get_db),
    notice_in: NoticeCreate,
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    code = notice_in.target_department_code
    name = notice_in.target_department
    def norm(s: str) -> str:
        return (s or "").strip().lower().replace(" ", "")
    if not code and name:
        res = await db.execute(select(Department))
        for d in res.scalars().all():
            if norm(d.name) == norm(name):
                code = d.code
                break
        if not code:
            res2 = await db.execute(select(DepartmentAlias))
            for a in res2.scalars().all():
                if norm(a.alias) == norm(name):
                    code = a.code
                    break
    payload = NoticeCreate(
        title=notice_in.title,
        content=notice_in.content,
        target_role=notice_in.target_role,
        target_department=notice_in.target_department,
        target_department_code=code,
        publisher=notice_in.publisher
    )
    created = await crud_notice.create(db, obj_in=payload)
    # Fan-out recipients
    q = select(User)
    if payload.target_role != "all":
        q = q.where(User.role == payload.target_role)
    users = (await db.execute(q)).scalars().all()
    recs = []
    for u in users:
        if code and getattr(u, "department_code", None) != code:
            continue
        recs.append(NoticeRecipient(notice_id=created.id, user_id=u.id))
    if recs:
        db.add_all(recs)
        await db.commit()
    return created
@router.get("/", response_model=List[NoticeSchema])
async def list_notices(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    return await crud_notice.get_multi(db, skip=skip, limit=limit)

@router.get("/mine", response_model=List[NoticeSchema])
async def list_my_notices(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    # join recipients
    res = await db.execute(select(NoticeModel).join(NoticeRecipient, NoticeRecipient.notice_id == NoticeModel.id).where(NoticeRecipient.user_id == current_user.id))
    return res.scalars().all()

@router.put("/{notice_id}/read")
async def mark_notice_read(
    notice_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(NoticeRecipient).where(NoticeRecipient.notice_id == notice_id, NoticeRecipient.user_id == current_user.id))
    rec = res.scalars().first()
    if rec:
        rec.is_read = True
        from datetime import datetime
        rec.read_at = datetime.utcnow()
        db.add(rec)
        await db.commit()
        return {"status": "ok"}
    return {"status": "ignored"}
