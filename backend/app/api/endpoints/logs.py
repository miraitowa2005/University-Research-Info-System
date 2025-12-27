from typing import List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[dict])
@router.get("", response_model=List[dict])
async def list_logs(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    stmt = (
        select(AuditLog, User.full_name)
        .outerjoin(User, User.id == AuditLog.user_id)
        .order_by(AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    res = await db.execute(stmt)
    rows = res.all()
    out: List[dict] = []
    for l, full_name in rows:
        operator = full_name or (f"用户#{l.user_id}" if getattr(l, "user_id", None) else "-")
        diff = None
        if getattr(l, "old_value", None) is not None or getattr(l, "new_value", None) is not None:
            diff = {"oldValue": getattr(l, "old_value", None), "newValue": getattr(l, "new_value", None)}
        out.append(
            {
                "id": str(l.id),
                "operatorName": operator,
                "action": getattr(l, "action", ""),
                "targetId": str(l.target_id) if getattr(l, "target_id", None) is not None else "",
                "timestamp": l.created_at.isoformat() if getattr(l, "created_at", None) else "",
                "ip": getattr(l, "ip", "") or "",
                "diff": diff,
            }
        )
    return out
