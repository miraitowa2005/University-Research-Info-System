from typing import List, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.crud import crud_research_item, crud_audit_log
from app.models.user import User
from app.models.research_item import ApprovalStatus
from app.models.research_type import ResearchSubtype
from app.models.department import Department
from app.models.research_collaborator import ResearchCollaborator
from app.models.research_item import ResearchItem as ResearchItemModel
from app.models.research_extensions import VerticalProject as VerticalExt, HorizontalProject as HorizontalExt
from app.schemas.research import ResearchItemCreate, ResearchItemResponse, ResearchItemUpdate
from app.schemas.research_status import ResearchItemStatusUpdate, ResearchItemBatchStatusUpdate
from app.schemas.audit_log import AuditLogCreate
from app.schemas.research_type import ResearchSubtype as ResearchSubtypeSchema
from sqlalchemy import or_
from sqlalchemy import func
import io, json, csv, zipfile
from fastapi import Response
import os
from datetime import datetime

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
    result = await db.execute(
        select(crud_research_item.research_item.model)
        .options(selectinload(crud_research_item.research_item.model.subtype))
        .where(crud_research_item.research_item.model.id == new_item.id)
    )
    new_item_loaded = result.scalars().first()
    log_entry = AuditLogCreate(
        user_id=current_user.id,
        action='创建科研项目',
        target_type='research_item',
        target_id=new_item.id,
        new_value=item_in.model_dump(),
        ip=request.client.host
    )
    await crud_audit_log.audit_log.create(db, obj_in=log_entry)
    return new_item_loaded or new_item


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
        .options(selectinload(crud_research_item.research_item.model.subtype))
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
        .options(selectinload(crud_research_item.research_item.model.subtype))
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
        .options(selectinload(crud_research_item.research_item.model.subtype))
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
        .options(selectinload(crud_research_item.research_item.model.subtype))
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
    """
    删除科研项目（级联删除成员及扩展信息）
    """
    result = await db.execute(select(crud_research_item.research_item.model).where(crud_research_item.research_item.model.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="未找到该科研项目 (No record to delete)")
    if not current_user.is_superuser and item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="您没有权限删除此项目")
    await db.delete(item)
    await db.commit()
    return item

@router.post("/export")
async def export_research_data(
    *, 
    db: AsyncSession = Depends(deps.get_db),
    body: dict,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    types = body.get("types") or []
    fmt = (body.get("format") or "csv").lower()
    if fmt not in ("csv", "json"):
        raise HTTPException(status_code=400, detail="unsupported_format")
    result = await db.execute(
        select(crud_research_item.research_item.model)
        .options(selectinload(crud_research_item.research_item.model.subtype))
        .filter(crud_research_item.research_item.model.user_id == current_user.id)
    )
    items = result.scalars().all()
    def match_type(tid: str, it) -> bool:
        cat = getattr(it, "category", "")
        if tid == "vertical_projects":
            return "纵向" in cat
        if tid == "horizontal_projects":
            return "横向" in cat
        if tid == "papers":
            return "论文" in cat
        if tid == "books":
            return "出版" in cat or "著作" in cat
        if tid == "patents":
            return "专利" in cat
        if tid == "awards":
            return "奖励" in cat or "获奖" in cat
        if tid == "attachments":
            return False
        return True
    selected = {t: [it for it in items if match_type(t, it)] for t in types}
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for t, lst in selected.items():
            if fmt == "json":
                payload = []
                for it in lst:
                    cj = getattr(it, "content_json", None)
                    payload.append({
                        "id": it.id,
                        "title": it.title,
                        "category": getattr(it, "category", ""),
                        "status": getattr(it, "status", None).value if getattr(it, "status", None) else None,
                        "content_json": cj,
                    })
                data = json.dumps(payload, ensure_ascii=False, indent=2)
                zf.writestr(f"{t}.json", data)
            else:
                headers = ["ID","标题","类别","状态","经费(万元)","来源","编号","参与角色","驳回原因","协作者"]
                out = io.StringIO()
                writer = csv.writer(out)
                writer.writerow(headers)
                for it in lst:
                    cj = getattr(it, "content_json", {}) or {}
                    funding = cj.get("funding") or cj.get("amount") or ""
                    source = cj.get("source") or cj.get("agency") or ""
                    number = cj.get("project_no") or cj.get("projectNo") or cj.get("number") or ""
                    role = cj.get("role") or ""
                    remarks = getattr(it, "audit_remarks", "") or ""
                    writer.writerow([it.id, it.title, getattr(it, "category", ""), getattr(it, "status", None).value if getattr(it, "status", None) else "", funding, source, number, role, remarks, ""])
                zf.writestr(f"{t}.csv", out.getvalue())
    buffer.seek(0)
    content = buffer.getvalue()
    fname = f"research_export_{str(current_user.id)}.zip"
    headers = {
        "Content-Disposition": f'attachment; filename="{fname}"',
        "Content-Length": str(len(content)),
    }
    return Response(content=content, media_type="application/zip", headers=headers)

@router.post("/export-cv")
async def export_cv(
    *,
    db: AsyncSession = Depends(deps.get_db),
    body: dict = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    res_items = await db.execute(
        select(crud_research_item.research_item.model)
        .options(selectinload(crud_research_item.research_item.model.subtype))
        .filter(crud_research_item.research_item.model.user_id == current_user.id)
    )
    items = res_items.scalars().all()
    types = (body or {}).get("types") or []
    def match_type(tid: str, it) -> bool:
        cat = getattr(it, "category", "")
        if tid == "vertical_projects":
            return "纵向" in cat
        if tid == "horizontal_projects":
            return "横向" in cat
        if tid == "papers":
            return "论文" in cat
        if tid == "books":
            return "出版" in cat or "著作" in cat
        if tid == "patents":
            return "专利" in cat
        if tid == "awards":
            return "奖励" in cat or "获奖" in cat
        return True
    if types:
        items = [it for it in items if any(match_type(t, it) for t in types)]
    name = getattr(current_user, "full_name", None) or getattr(current_user, "name", None) or ""
    email = getattr(current_user, "email", "") or ""
    phone = getattr(current_user, "phone", "") or ""
    dept_id = getattr(current_user, "dept_id", None)
    dept_name = ""
    if dept_id:
        r = await db.execute(select(Department.name).where(Department.id == dept_id))
        rr = r.first()
        if rr:
            dept_name = rr[0]
    office = getattr(current_user, "office_location", "") or ""
    highest_education = getattr(current_user, "highest_education", "") or ""
    degree = getattr(current_user, "degree", "") or ""
    alma_mater = getattr(current_user, "alma_mater", "") or ""
    major = getattr(current_user, "major", "") or ""
    research_direction = getattr(current_user, "research_direction", "") or ""
    advisor_qualification = getattr(current_user, "advisor_qualification", "") or ""
    birth_date = getattr(current_user, "birth_date", None)
    birth_date_str = ""
    try:
        if birth_date:
            birth_date_str = birth_date if isinstance(birth_date, str) else (birth_date.isoformat() if hasattr(birth_date, "isoformat") else str(birth_date))
    except Exception:
        birth_date_str = ""
    def esc(s: str) -> str:
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    def p(text: str, style: str = None) -> str:
        style_tag = f'<w:pStyle w:val="{style}"/>' if style else ''
        return f'<w:p><w:pPr>{style_tag}</w:pPr><w:r><w:t xml:space="preserve">{esc(text)}</w:t></w:r></w:p>'
    sections = []
    sections.append(p(name, "Title"))
    sections.append(p(f"{email} | {phone}", "Subtitle"))
    sections.append(p(f"{dept_name} · {office}", "Subtitle"))
    sections.append(p("个人信息", "Heading1"))
    sections.append(p(f"学历：{highest_education} · 学位：{degree} · 毕业院校：{alma_mater}", "Normal"))
    sections.append(p(f"专业：{major}", "Normal"))
    sections.append(p(f"研究方向：{research_direction}", "Normal"))
    sections.append(p(f"导师资格：{advisor_qualification}", "Normal"))
    if birth_date_str:
        sections.append(p(f"出生日期：{birth_date_str}", "Normal"))
    sections.append(p("科研成果概览", "Heading1"))
    cats = [
        ("纵向项目", [it for it in items if "纵向" in getattr(it, "category", "")]),
        ("横向项目", [it for it in items if "横向" in getattr(it, "category", "")]),
        ("学术论文", [it for it in items if "论文" in getattr(it, "category", "")]),
        ("专利成果", [it for it in items if "专利" in getattr(it, "category", "")]),
        ("出版著作", [it for it in items if ("出版" in getattr(it, "category", "")) or ("著作" in getattr(it, "category", ""))]),
        ("科研获奖", [it for it in items if ("奖励" in getattr(it, "category", "")) or ("获奖" in getattr(it, "category", ""))]),
    ]
    for title, lst in cats:
        if not lst:
            continue
        sections.append(p(title, "Heading2"))
        for it in lst[:20]:
            cj = getattr(it, "content_json", {}) or {}
            src = cj.get("source") or cj.get("agency") or ""
            num = cj.get("project_no") or cj.get("projectNo") or cj.get("number") or ""
            line = f"• {getattr(it, 'title', '')}"
            meta = "；".join([s for s in [src, num] if s])
            if meta:
                line = f"{line}（{meta}）"
            sections.append(p(line, "ListParagraph"))
    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:before="360" w:after="240" w:line="360" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="40"/><w:color w:val="1D4ED8"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>
    <w:rPr><w:sz w:val="22"/><w:color w:val="6B7280"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr>
      <w:spacing w:before="300" w:after="160" w:line="320" w:lineRule="auto"/>
      <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="D1D5DB"/></w:pBdr>
    </w:pPr>
    <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="111827"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:before="240" w:after="120" w:line="300" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1F2937"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/><w:qFormat/>
    <w:pPr><w:spacing w:line="300" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:sz w:val="22"/><w:color w:val="374151"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/>
    <w:pPr><w:ind w:left="720"/><w:spacing w:after="60" w:line="300" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:sz w:val="22"/></w:rPr>
  </w:style>
</w:styles>
"""
    doc_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    %s
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1800" w:right="1800" w:bottom="1800" w:left="1800"/></w:sectPr>
  </w:body>
</w:document>
""" % ("\n".join(sections))
    rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>
"""
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"""
    core_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/">
  <dc:title>{esc(name)} CV</dc:title>
  <dc:creator>{esc(name)}</dc:creator>
  <cp:lastModifiedBy>{esc(name)}</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">{datetime.utcnow().isoformat()}Z</dcterms:created>
</cp:coreProperties>
"""
    app_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>University Research Info System</Application>
</Properties>
"""
    out_buf = io.BytesIO()
    with zipfile.ZipFile(out_buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", rels_xml)
        zf.writestr("word/document.xml", doc_xml)
        zf.writestr("word/styles.xml", styles_xml)
        zf.writestr("docProps/core.xml", core_xml)
        zf.writestr("docProps/app.xml", app_xml)
    out_buf.seek(0)
    content = out_buf.getvalue()
    fname = f"CV_{str(current_user.id)}.docx"
    headers = {
        "Content-Disposition": f'attachment; filename="{fname}"',
        "Content-Length": str(len(content)),
    }
    return Response(content=content, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers=headers)

@router.get("/funding/dept/{dept_id}")
async def department_total_funding(
    dept_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    r = await db.execute(
        select(ResearchItemModel)
        .join(User, User.id == ResearchItemModel.user_id)
        .where(User.dept_id == dept_id)
        .where(ResearchItemModel.subtype_id.in_([1, 2]))
    )
    items = r.scalars().all()
    total_json = 0.0
    for it in items:
        try:
            cj = getattr(it, "content_json", {}) or {}
            v = cj.get("total_funding")
            if v is None:
                v = cj.get("funding") or cj.get("amount")
            if v is not None:
                try:
                    total_json += float(v)
                except Exception:
                    try:
                        total_json += float(str(v).replace(',', '').strip())
                    except Exception:
                        pass
        except Exception:
            pass
    # Fallback to extension tables if present
    qv = (
        select(func.coalesce(func.sum(VerticalExt.total_funding), 0))
        .select_from(
            ResearchItemModel.__table__
            .join(User, User.id == ResearchItemModel.user_id)
            .join(VerticalExt, VerticalExt.id == ResearchItemModel.id, isouter=True)
        )
        .where(User.dept_id == dept_id)
    )
    qh = (
        select(func.coalesce(func.sum(HorizontalExt.total_funding), 0))
        .select_from(
            ResearchItemModel.__table__
            .join(User, User.id == ResearchItemModel.user_id)
            .join(HorizontalExt, HorizontalExt.id == ResearchItemModel.id, isouter=True)
        )
        .where(User.dept_id == dept_id)
    )
    sv = (await db.execute(qv)).scalar() or 0
    sh = (await db.execute(qh)).scalar() or 0
    try:
        total_ext = float(sv) + float(sh)
    except Exception:
        total_ext = (sv or 0) + (sh or 0)
    total = total_ext if total_ext > 0 else total_json
    return {"dept_id": dept_id, "total_funding": total}

@router.get("/reports/yearend")
async def yearend_department_report(
    year: int,
    dept_id: Optional[int] = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_auditor),
) -> Any:
    did = dept_id
    if did is None:
        did = getattr(current_user, "dept_id", None)
    if did is None and getattr(current_user, "role", None) in ("research_admin", "sys_admin"):
        did = 1
    if did is None:
        raise HTTPException(status_code=400, detail="dept_id_required")
    q = (
        select(ResearchItemModel)
        .join(User, User.id == ResearchItemModel.user_id)
        .where(User.dept_id == did)
        .where(func.year(ResearchItemModel.created_at) == year)
    )
    items = (await db.execute(q)).scalars().all()
    totals = {
        "total_items": 0,
        "approved_count": 0,
        "pending_count": 0,
        "rejected_count": 0,
    }
    categories = {
        "vertical_count": 0,
        "horizontal_count": 0,
        "papers_count": 0,
        "books_count": 0,
        "patents_count": 0,
        "awards_count": 0,
    }
    funding_total = 0.0
    monthly = {m: {"created": 0, "approved": 0} for m in range(1, 13)}
    for it in items:
        totals["total_items"] += 1
        st = str(getattr(it, "status", "") or "").lower()
        if st == "approved":
            totals["approved_count"] += 1
        elif st == "pending":
            totals["pending_count"] += 1
        elif st == "rejected":
            totals["rejected_count"] += 1
        cat = getattr(it, "category", "") or ""
        if "纵向" in cat:
            categories["vertical_count"] += 1
        elif "横向" in cat:
            categories["horizontal_count"] += 1
        elif "论文" in cat:
            categories["papers_count"] += 1
        elif "出版" in cat or "著作" in cat:
            categories["books_count"] += 1
        elif "专利" in cat:
            categories["patents_count"] += 1
        elif "获奖" in cat or "奖励" in cat:
            categories["awards_count"] += 1
        try:
            cj = getattr(it, "content_json", {}) or {}
            v = cj.get("total_funding")
            if v is None:
                v = cj.get("funding") or cj.get("amount")
            if v is not None:
                try:
                    funding_total += float(v)
                except Exception:
                    funding_total += float(str(v).replace(",", "").strip())
        except Exception:
            pass
        try:
            created = getattr(it, "created_at", None)
            if created:
                m = int(str(created)[5:7])
                monthly[m]["created"] += 1
                if st == "approved":
                    monthly[m]["approved"] += 1
        except Exception:
            pass
    qv = (
        select(func.coalesce(func.sum(VerticalExt.total_funding), 0))
        .select_from(
            ResearchItemModel.__table__
            .join(User, User.id == ResearchItemModel.user_id)
            .join(VerticalExt, VerticalExt.id == ResearchItemModel.id, isouter=True)
        )
        .where(User.dept_id == did)
        .where(func.year(ResearchItemModel.created_at) == year)
    )
    qh = (
        select(func.coalesce(func.sum(HorizontalExt.total_funding), 0))
        .select_from(
            ResearchItemModel.__table__
            .join(User, User.id == ResearchItemModel.user_id)
            .join(HorizontalExt, HorizontalExt.id == ResearchItemModel.id, isouter=True)
        )
        .where(User.dept_id == did)
        .where(func.year(ResearchItemModel.created_at) == year)
    )
    sv = (await db.execute(qv)).scalar() or 0
    sh = (await db.execute(qh)).scalar() or 0
    try:
        ext_sum = float(sv) + float(sh)
    except Exception:
        ext_sum = (sv or 0) + (sh or 0)
    if ext_sum > 0:
        funding_total = ext_sum
    return {
        "year": year,
        "dept_id": did,
        "totals": totals,
        "categories": categories,
        "funding_total": funding_total,
        "monthly": [{"month": m, **monthly[m]} for m in range(1, 13)],
    }
