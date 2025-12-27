from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.crud import crud_research_item, crud_audit_log
from app.models.user import User
from app.models.research_item import ApprovalStatus
from app.models.research_type import ResearchSubtype
from app.models.research_collaborator import ResearchCollaborator
from app.schemas.research import ResearchItemCreate, ResearchItemResponse, ResearchItemUpdate
from app.schemas.research_status import ResearchItemStatusUpdate, ResearchItemBatchStatusUpdate
from app.schemas.audit_log import AuditLogCreate
from app.schemas.research_type import ResearchSubtype as ResearchSubtypeSchema
from sqlalchemy import or_

router = APIRouter()


@router.post("/", response_model=ResearchItemResponse, status_code=status.HTTP_201_CREATED)
async def create_research_item(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    item_in: ResearchItemCreate,
    current_user: User = Depends(deps.get_current_active_user),
    request: Request
) -> Any:
    """Create new research item."""
    new_item = await crud_research_item.research_item.create_with_owner(
        db=db, obj_in=item_in, owner_id=current_user.id
    )
    log_entry = AuditLogCreate(
        user_id=current_user.id,
        action='创建科研项目',
        target_type='research_item',
        target_id=new_item.id,
        new_value=item_in.model_dump(),
        ip=request.client.host
    )
    await crud_audit_log.audit_log.create(db, obj_in=log_entry)
    return new_item


@router.get("/pending", response_model=List[ResearchItemResponse])
async def read_pending_research_items(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_auditor),
) -> Any:
    """Retrieve pending research items for approval."""
    result = await db.execute(
        select(crud_research_item.research_item.model)
        .options(
            selectinload(crud_research_item.research_item.model.subtype).selectinload(ResearchSubtype.type)
        )
        .filter(crud_research_item.research_item.model.status == ApprovalStatus.pending)
        .offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return items


@router.get("/", response_model=List[ResearchItemResponse])
async def read_research_items(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve research items for the current user."""
    result = await db.execute(
        select(crud_research_item.research_item.model)
        .options(
            selectinload(crud_research_item.research_item.model.subtype).selectinload(ResearchSubtype.type)
        )
        .filter(crud_research_item.research_item.model.user_id == current_user.id)
        .offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return items

@router.get("/categories")
async def list_categories(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    cats = ['纵向项目','横向项目','学术论文','出版著作','专利','科技奖励']
    out = []
    for c in cats:
        q = select(crud_research_item.research_item.model).join(ResearchSubtype, ResearchSubtype.id == crud_research_item.research_item.model.subtype_id)
        cond = None
        if c == '纵向项目':
            cond = ResearchSubtype.name.like('%纵向%')
        elif c == '横向项目':
            cond = ResearchSubtype.name.like('%横向%')
        elif c == '学术论文':
            cond = ResearchSubtype.name.like('%论文%')
        elif c == '出版著作':
            cond = or_(ResearchSubtype.name.like('%出版%'), ResearchSubtype.name.like('%著作%'))
        elif c == '专利':
            cond = or_(ResearchSubtype.name.like('%专利%'), ResearchSubtype.name.like('%发明%'))
        elif c == '科技奖励':
            cond = or_(ResearchSubtype.name.like('%奖励%'), ResearchSubtype.name.like('%获奖%'))
        q = q.filter(cond).filter(crud_research_item.research_item.model.user_id == current_user.id)
        items = (await db.execute(q)).scalars().all()
        out.append({"category": c, "count": len(items)})
    return out

@router.get("/category/{category}", response_model=List[ResearchItemResponse])
async def read_research_items_by_category(
    category: str,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    q = select(crud_research_item.research_item.model).join(ResearchSubtype, ResearchSubtype.id == crud_research_item.research_item.model.subtype_id)
    if category == '纵向项目':
        q = q.filter(ResearchSubtype.name.like('%纵向%'))
    elif category == '横向项目':
        q = q.filter(ResearchSubtype.name.like('%横向%'))
    elif category == '学术论文':
        q = q.filter(ResearchSubtype.name.like('%论文%'))
    elif category == '出版著作':
        q = q.filter(or_(ResearchSubtype.name.like('%出版%'), ResearchSubtype.name.like('%著作%')))
    elif category == '专利':
        q = q.filter(or_(ResearchSubtype.name.like('%专利%'), ResearchSubtype.name.like('%发明%')))
    elif category == '科技奖励':
        q = q.filter(or_(ResearchSubtype.name.like('%奖励%'), ResearchSubtype.name.like('%获奖%')))
    q = q.filter(crud_research_item.research_item.model.user_id == current_user.id).offset(skip).limit(limit)
    items = (await db.execute(q)).scalars().all()
    return items


@router.get("/all", response_model=List[ResearchItemResponse])
async def read_all_research_items(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_auditor),
) -> Any:
    """Retrieve all research items (admin/auditor only)."""
    result = await db.execute(
        select(crud_research_item.research_item.model)
        .options(
            selectinload(crud_research_item.research_item.model.subtype).selectinload(ResearchSubtype.type)
        )
        .offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return items


@router.put("/batch/status", status_code=status.HTTP_200_OK)
async def batch_update_research_item_status(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    status_in: ResearchItemBatchStatusUpdate,
    current_user: User = Depends(deps.get_current_active_auditor),
    request: Request
) -> Any:
    """Batch update the status of research items."""
    # Only allow update for items currently pending
    # Filter ids to pending items
    pending_items = await crud_research_item.research_item.get_multi_by_status(
        db=db, status=ApprovalStatus.pending
    )
    pending_ids = {i.id for i in pending_items}
    target_ids = [i for i in status_in.ids if i in pending_ids]
    if not target_ids:
        raise HTTPException(status_code=400, detail="No pending items to update")
    updated_count = await crud_research_item.research_item.update_status_multi(
        db=db, ids=target_ids, status=status_in.status, remarks=status_in.remarks
    )
    log_entry = AuditLogCreate(
        user_id=current_user.id,
        action=f'批量更新项目状态为 {status_in.status.value}',
        target_type='research_item',
        new_value=status_in.model_dump(),
        ip=request.client.host
    )
    await crud_audit_log.audit_log.create(db, obj_in=log_entry)
    return {"message": f"Successfully updated {updated_count} items"}


@router.put("/{id}/status", response_model=ResearchItemResponse)
async def update_research_item_status(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    status_in: ResearchItemStatusUpdate,
    current_user: User = Depends(deps.get_current_active_auditor),
    request: Request
) -> Any:
    """Update the status of a single research item."""
    item = await crud_research_item.research_item.get(db=db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Research item not found")
    if item.status != ApprovalStatus.pending:
        raise HTTPException(status_code=400, detail="Item has already been reviewed")
    old_status = item.status
    updated_item = await crud_research_item.research_item.update(db=db, db_obj=item, obj_in=status_in)
    
    log_entry = AuditLogCreate(
        user_id=current_user.id,
        action='更新项目状态',
        target_type='research_item',
        target_id=id,
        old_value={'status': old_status.value},
        new_value=status_in.model_dump(),
        ip=request.client.host
    )
    await crud_audit_log.audit_log.create(db, obj_in=log_entry)
    return updated_item


@router.get("/user/{user_id}", response_model=List[ResearchItemResponse])
async def read_research_items_for_user(
    db: AsyncSession = Depends(deps.get_db),
    user_id: int = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve research items where the specified user is owner or collaborator."""
    if user_id is None:
        user_id = current_user.id
    result = await db.execute(
        select(crud_research_item.research_item.model)
        .options(
            selectinload(crud_research_item.research_item.model.subtype).selectinload(ResearchSubtype.type)
        )
        .filter(
            (crud_research_item.research_item.model.user_id == user_id) |
            (crud_research_item.research_item.model.id.in_(
                select(ResearchCollaborator.item_id).filter(ResearchCollaborator.user_id == user_id)
            ))
        )
        .offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return items


@router.get("/subtypes", response_model=List[ResearchSubtypeSchema])
async def list_research_subtypes(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """List available research subtypes for binding correct DB IDs."""
    result = await db.execute(select(ResearchSubtype))
    subs = result.scalars().all()
    return subs

@router.get("/subtypes/mapping")
async def list_research_subtype_category_mapping(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    result = await db.execute(select(ResearchSubtype))
    subs = result.scalars().all()
    def map_cat(n: str) -> str:
        if "纵向" in n:
            return "纵向项目"
        if "横向" in n:
            return "横向项目"
        if "论文" in n:
            return "学术论文"
        if "专利" in n or "发明" in n:
            return "专利"
        if "出版" in n or "著作" in n or "书" in n:
            return "出版著作"
        if "奖励" in n or "获奖" in n:
            return "科技奖励"
        return "其他"
    return [{"id": s.id, "name": s.name, "category": map_cat(s.name or "")} for s in subs]


@router.put("/{id}", response_model=ResearchItemResponse)
async def update_research_item(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    item_in: ResearchItemUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Update a research item."""
    item = await crud_research_item.research_item.get(db=db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Research item not found")
    if item.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    updated_item = await crud_research_item.research_item.update(db=db, db_obj=item, obj_in=item_in)
    return updated_item


@router.delete("/{id}", response_model=ResearchItemResponse)
async def delete_research_item(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Delete a research item."""
    item = await crud_research_item.research_item.get(db=db, id=id)
    if not item:
        raise HTTPException(status_code=404, detail="Research item not found")
    if item.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    deleted_item = await crud_research_item.research_item.remove(db=db, id=id)
    return deleted_item
