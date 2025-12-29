from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.review_template import ReviewTemplate as ReviewTemplateModel
from app.schemas.review_template import ReviewTemplateCreate, ReviewTemplateUpdate, ReviewTemplate as ReviewTemplateSchema

router = APIRouter()

@router.get("/", response_model=List[ReviewTemplateSchema])
async def list_templates(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    res = await db.execute(select(ReviewTemplateModel).order_by(ReviewTemplateModel.updated_at.desc()))
    return res.scalars().all()

@router.post("/", response_model=ReviewTemplateSchema, status_code=status.HTTP_201_CREATED)
async def create_template(
    body: ReviewTemplateCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    tpl = ReviewTemplateModel(title=body.title.strip(), content=body.content.strip(), is_shared=bool(body.is_shared))
    db.add(tpl)
    await db.commit()
    await db.refresh(tpl)
    return tpl

@router.put("/{tpl_id}", response_model=ReviewTemplateSchema)
async def update_template(
    tpl_id: int,
    body: ReviewTemplateUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    res = await db.execute(select(ReviewTemplateModel).where(ReviewTemplateModel.id == tpl_id))
    tpl = res.scalars().first()
    if not tpl:
        raise HTTPException(status_code=404, detail="template_not_found")
    if body.title is not None:
        tpl.title = body.title.strip()
    if body.content is not None:
        tpl.content = body.content.strip()
    if body.is_shared is not None:
        tpl.is_shared = bool(body.is_shared)
    db.add(tpl)
    await db.commit()
    await db.refresh(tpl)
    return tpl

@router.delete("/{tpl_id}")
async def delete_template(
    tpl_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_auditor),
) -> Any:
    res = await db.execute(select(ReviewTemplateModel).where(ReviewTemplateModel.id == tpl_id))
    tpl = res.scalars().first()
    if not tpl:
        raise HTTPException(status_code=404, detail="template_not_found")
    await db.delete(tpl)
    await db.commit()
    return {"status": "ok"}
