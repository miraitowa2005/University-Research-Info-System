from typing import List, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.models.department import Department, DepartmentAlias

router = APIRouter()

@router.get("/", response_model=List[dict])
async def list_departments(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(Department))
    rows = res.scalars().all()
    return [{"id": d.id, "code": d.code, "name": d.name} for d in rows]

@router.post("/")
async def create_department(
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    code = (body.get("code") or "").strip()
    name = (body.get("name") or "").strip()
    if not code or not name:
        raise HTTPException(status_code=400, detail="code and name required")
    d = Department(code=code, name=name)
    db.add(d)
    await db.commit()
    return {"status": "ok"}

@router.put("/{code}")
async def update_department(
    code: str,
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    res = await db.execute(select(Department).where(Department.code == code))
    d = res.scalars().first()
    if not d:
        raise HTTPException(status_code=404, detail="Not found")
    name = (body.get("name") or "").strip()
    if name:
        d.name = name
        db.add(d)
        await db.commit()
    return {"status": "ok"}

@router.delete("/{code}")
async def delete_department(
    code: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    res = await db.execute(select(Department).where(Department.code == code))
    d = res.scalars().first()
    if not d:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(d)
    await db.commit()
    return {"status": "ok"}
@router.get("/normalize")
async def normalize_department(
    name: str = Query(..., description="院系名称或别名"),
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    def norm(s: str) -> str:
        return (s or "").strip().lower().replace(" ", "")
    n = norm(name)
    # Match name
    res = await db.execute(select(Department))
    for d in res.scalars().all():
        if norm(d.name) == n:
            return {"code": d.code, "name": d.name}
    # Match aliases
    res2 = await db.execute(select(DepartmentAlias))
    for a in res2.scalars().all():
        if norm(a.alias) == n:
            # resolve code
            res3 = await db.execute(select(Department).where(Department.code == a.code))
            d = res3.scalars().first()
            if d:
                return {"code": d.code, "name": d.name}
            return {"code": a.code}
    return {"code": None}
