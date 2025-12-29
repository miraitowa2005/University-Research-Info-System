from typing import List, Any
from fastapi import APIRouter, Depends, status, HTTPException
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
    body: dict,
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    # Determine target_dept_id from current user
    res_me = await db.execute(select(User.dept_id).where(User.id == getattr(current_user, "id", None)))
    me_row = res_me.first()
    if not me_row or not me_row[0]:
        raise HTTPException(status_code=400, detail="publisher_dept_unknown")
    target_dept_id = int(me_row[0])
    payload = NoticeCreate(
        title=(body.get("title") or "").strip(),
        content=(body.get("content") or "").strip(),
        target_role=(body.get("target_role") or "all").strip(),
        target_dept_id=target_dept_id,
        publisher=body.get("publisher") or getattr(current_user, "id", None)
    )
    created = await crud_notice.create(db, obj_in=payload)
    # build recipients query
    q = select(User).where(User.dept_id == target_dept_id).where(User.role == "teacher")
    users = (await db.execute(q)).scalars().all()
    recs = [NoticeRecipient(notice_id=created.id, user_id=u.id) for u in users]
    if recs:
        db.add_all(recs)
        await db.commit()
    return created

@router.post("", response_model=NoticeSchema, status_code=status.HTTP_201_CREATED)
async def create_notice_no_slash(
    *,
    db: AsyncSession = Depends(deps.get_db),
    body: dict,
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    # Determine target_dept_id from current user
    res_me = await db.execute(select(User.dept_id).where(User.id == getattr(current_user, "id", None)))
    me_row = res_me.first()
    if not me_row or not me_row[0]:
        raise HTTPException(status_code=400, detail="publisher_dept_unknown")
    target_dept_id = int(me_row[0])
    payload = NoticeCreate(
        title=(body.get("title") or "").strip(),
        content=(body.get("content") or "").strip(),
        target_role=(body.get("target_role") or "all").strip(),
        target_dept_id=target_dept_id,
        publisher=body.get("publisher") or getattr(current_user, "id", None)
    )
    created = await crud_notice.create(db, obj_in=payload)
    q = select(User).where(User.dept_id == target_dept_id).where(User.role == "teacher")
    users = (await db.execute(q)).scalars().all()
    recs = [NoticeRecipient(notice_id=created.id, user_id=u.id) for u in users]
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

@router.get("/unread-count")
async def unread_count(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(NoticeRecipient).where(NoticeRecipient.user_id == current_user.id, NoticeRecipient.is_read == False))  # noqa: E712
    rows = res.scalars().all()
    return {"count": len(rows)}

@router.delete("/{notice_id}/mine")
async def delete_my_notice(
    notice_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(NoticeRecipient).where(NoticeRecipient.notice_id == notice_id, NoticeRecipient.user_id == current_user.id))
    rec = res.scalars().first()
    if not rec:
        raise HTTPException(status_code=404, detail="recipient_not_found")
    await db.delete(rec)
    await db.commit()
    return {"status": "ok"}
