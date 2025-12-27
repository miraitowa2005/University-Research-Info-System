from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api import deps
from app.models.rbac import Role, RolePermission
from app.models.permission_catalog import PermissionCatalog
from app.schemas.rbac import RoleCreate, RoleUpdate, RoleResponse, RolePermissionsUpdate

router = APIRouter()

@router.get("/permissions")
async def list_permissions(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(PermissionCatalog))
    rows = res.scalars().all()
    return [{"id": p.id, "code": p.code, "name": p.name, "module": p.module, "description": p.description, "enabled": p.enabled} for p in rows]

@router.post("/permissions")
async def create_permission(
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    code = (body.get("code") or "").strip()
    name = (body.get("name") or "").strip()
    module = (body.get("module") or "").strip()
    description = body.get("description")
    if not code or not name or not module:
        raise HTTPException(status_code=400, detail="code, name, module required")
    p = PermissionCatalog(code=code, name=name, module=module, description=description)
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return {"id": p.id, "code": p.code, "name": p.name, "module": p.module, "description": p.description, "enabled": p.enabled}

@router.put("/permissions/{perm_id}")
async def update_permission(
    perm_id: int,
    body: dict,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    res = await db.execute(select(PermissionCatalog).where(PermissionCatalog.id == perm_id))
    p = res.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    if "name" in body: p.name = (body.get("name") or "").strip() or p.name
    if "module" in body: p.module = (body.get("module") or "").strip() or p.module
    if "description" in body: p.description = body.get("description")
    if "enabled" in body: p.enabled = bool(body.get("enabled"))
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return {"id": p.id, "code": p.code, "name": p.name, "module": p.module, "description": p.description, "enabled": p.enabled}

@router.delete("/permissions/{perm_id}")
async def delete_permission(
    perm_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    res = await db.execute(select(PermissionCatalog).where(PermissionCatalog.id == perm_id))
    p = res.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(p)
    await db.commit()
    return {"status": "ok"}
@router.get("/roles", response_model=List[RoleResponse])
async def list_roles(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user),
) -> Any:
    res = await db.execute(select(Role))
    roles = res.scalars().all()
    out = []
    for r in roles:
        codes = [p.code for p in r.permissions]
        out.append(RoleResponse(id=r.id, name=r.name, description=r.description, is_system=r.is_system, created_at=r.created_at, permissions=codes))
    return out

@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    body: RoleCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    r = Role(name=body.name, description=body.description, is_system=bool(body.is_system))
    db.add(r)
    await db.commit()
    await db.refresh(r)
    return RoleResponse(id=r.id, name=r.name, description=r.description, is_system=r.is_system, created_at=r.created_at, permissions=[])

@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    body: RoleUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    res = await db.execute(select(Role).where(Role.id == role_id))
    r = res.scalars().first()
    if not r:
        raise HTTPException(status_code=404, detail="Role not found")
    if body.name is not None:
        r.name = body.name
    if body.description is not None:
        r.description = body.description
    db.add(r)
    await db.commit()
    await db.refresh(r)
    codes = [p.code for p in r.permissions]
    return RoleResponse(id=r.id, name=r.name, description=r.description, is_system=r.is_system, created_at=r.created_at, permissions=codes)

@router.delete("/roles/{role_id}")
async def delete_role(
    role_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    res = await db.execute(select(Role).where(Role.id == role_id))
    r = res.scalars().first()
    if not r:
        raise HTTPException(status_code=404, detail="Role not found")
    if r.is_system:
        raise HTTPException(status_code=400, detail="Cannot delete system role")
    await db.delete(r)
    await db.commit()
    return {"status": "ok"}

@router.put("/roles/{role_id}/permissions", response_model=RoleResponse)
async def save_role_permissions(
    role_id: int,
    body: RolePermissionsUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
) -> Any:
    res = await db.execute(select(Role).where(Role.id == role_id))
    r = res.scalars().first()
    if not r:
        raise HTTPException(status_code=404, detail="Role not found")
    await db.execute(select(RolePermission).where(RolePermission.role_id == role_id))
    for p in list(r.permissions):
        await db.delete(p)
    await db.commit()
    new_perms = [RolePermission(role_id=role_id, code=c) for c in set(body.codes or [])]
    db.add_all(new_perms)
    await db.commit()
    await db.refresh(r)
    codes = [p.code for p in r.permissions]
    return RoleResponse(id=r.id, name=r.name, description=r.description, is_system=r.is_system, created_at=r.created_at, permissions=codes)
