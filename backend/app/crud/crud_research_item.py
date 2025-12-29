from typing import List, Optional
from datetime import datetime
import json, hashlib

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.crud.base import CRUDBase
from app.models.research_item import ResearchItem, ApprovalStatus
from app.models.user import User
from app.models.research_collaborator import ResearchCollaborator
from app.schemas.research import ResearchItemCreate, ResearchItemUpdate
from app.models.research_type import ResearchSubtype
from app.models.research_extensions import VerticalProject, HorizontalProject, AcademicPaper, Patent, AcademicBook, Award


class CRUDResearchItem(CRUDBase[ResearchItem, ResearchItemCreate, ResearchItemUpdate]):
    async def create_with_owner(
        self, db: AsyncSession, *, obj_in: ResearchItemCreate, owner_id: int
    ) -> ResearchItem:
        """Create a new research item and assign an owner."""
        def compute_hash(title: str, content: Optional[dict]) -> str:
            try:
                payload = {
                    "title": title or "",
                    "content": content or {}
                }
                s = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
                return hashlib.sha256(s.encode("utf-8")).hexdigest()
            except Exception:
                return ""
        h = compute_hash(obj_in.title, obj_in.content_json)
        if h:
            existing = (await db.execute(
                select(ResearchItem).where(
                    ResearchItem.user_id == owner_id,
                    ResearchItem.subtype_id == obj_in.subtype_id,
                    ResearchItem.content_hash == h
                )
            )).scalars().first()
            if existing:
                return existing
        db_obj = ResearchItem(
            title=obj_in.title,
            subtype_id=obj_in.subtype_id,
            content_json=obj_in.content_json,
            status=obj_in.status,
            file_url=obj_in.file_url,
            user_id=owner_id,
            content_hash=h or None,
        )
        db.add(db_obj)
        await db.flush()

        try:
            subtype = (await db.execute(select(ResearchSubtype).where(ResearchSubtype.id == obj_in.subtype_id))).scalars().first()
            subtype_name = (subtype.name if subtype else "") or ""
            data = obj_in.content_json or {}
            if "纵向" in subtype_name:
                ext = VerticalProject(
                    id=db_obj.id,
                    project_source=data.get("project_source"),
                    approval_number=data.get("approval_number"),
                    total_funding=data.get("total_funding"),
                    project_level=data.get("project_level"),
                    start_date=data.get("start_date"),
                    end_date=data.get("end_date"),
                )
                db.add(ext)
            elif "横向" in subtype_name:
                ext = HorizontalProject(
                    id=db_obj.id,
                    partner_name=data.get("partner_name"),
                    contract_number=data.get("contract_number"),
                    total_funding=data.get("total_funding"),
                    start_date=data.get("start_date"),
                    end_date=data.get("end_date"),
                )
                db.add(ext)
            elif "论文" in subtype_name:
                ext = AcademicPaper(
                    id=db_obj.id,
                    journal_name=data.get("journal_name"),
                    impact_factor=data.get("impact_factor"),
                    publish_date=data.get("publish_date"),
                    volume_issue=data.get("volume_issue"),
                    is_sci=data.get("is_sci"),
                )
                db.add(ext)
            elif "专利" in subtype_name or "发明" in subtype_name:
                ext = Patent(
                    id=db_obj.id,
                    patent_number=data.get("patent_number"),
                    grant_date=data.get("grant_date"),
                    inventor=data.get("inventor"),
                    patent_type=data.get("patent_type"),
                    assignee=data.get("assignee"),
                )
                db.add(ext)
            elif "出版" in subtype_name or "著作" in subtype_name or "书" in subtype_name:
                ext = AcademicBook(
                    id=db_obj.id,
                    publisher=data.get("publisher"),
                    isbn=data.get("isbn"),
                    publish_date=data.get("publish_date"),
                    pages=data.get("pages"),
                )
                db.add(ext)
            elif "奖励" in subtype_name or "获奖" in subtype_name:
                ext = Award(
                    id=db_obj.id,
                    awarding_body=data.get("awarding_body"),
                    award_level=data.get("award_level"),
                    award_year=data.get("award_year"),
                    certificate_no=data.get("certificate_no"),
                )
                db.add(ext)
            else:
                if any(k in data for k in ("project_source", "approval_number", "project_level")):
                    ext = VerticalProject(
                        id=db_obj.id,
                        project_source=data.get("project_source"),
                        approval_number=data.get("approval_number"),
                        total_funding=data.get("total_funding"),
                        project_level=data.get("project_level"),
                        start_date=data.get("start_date"),
                        end_date=data.get("end_date"),
                    )
                    db.add(ext)
                elif any(k in data for k in ("partner_name", "contract_number", "contract_amount", "total_funding")):
                    ext = HorizontalProject(
                        id=db_obj.id,
                        partner_name=data.get("partner_name"),
                        contract_number=data.get("contract_number"),
                        total_funding=data.get("contract_amount") or data.get("total_funding"),
                        start_date=data.get("start_date"),
                        end_date=data.get("end_date"),
                    )
                    db.add(ext)
                elif any(k in data for k in ("journal_name", "journal", "impact_factor", "publish_date")):
                    ext = AcademicPaper(
                        id=db_obj.id,
                        journal_name=data.get("journal_name") or data.get("journal"),
                        impact_factor=data.get("impact_factor"),
                        publish_date=data.get("publish_date"),
                        volume_issue=data.get("volume_issue") or data.get("vol_issue_page"),
                        is_sci=bool(data.get("is_sci")),
                    )
                    db.add(ext)
                elif any(k in data for k in ("patent_number", "patent_no", "patent_type", "approve_date", "grant_date")):
                    ext = Patent(
                        id=db_obj.id,
                        patent_number=data.get("patent_number") or data.get("patent_no"),
                        grant_date=data.get("grant_date") or data.get("approve_date"),
                        inventor=data.get("inventor"),
                        patent_type=data.get("patent_type"),
                        assignee=data.get("assignee"),
                    )
                    db.add(ext)
                elif any(k in data for k in ("publisher", "isbn", "publish_date", "pages", "word_count")):
                    ext = AcademicBook(
                        id=db_obj.id,
                        publisher=data.get("publisher"),
                        isbn=data.get("isbn"),
                        publish_date=data.get("publish_date"),
                        pages=data.get("pages") or data.get("word_count"),
                    )
                    db.add(ext)
                elif any(k in data for k in ("awarding_body", "award_level", "award_year", "certificate_no", "grant_body", "cert_no")):
                    ext = Award(
                        id=db_obj.id,
                        awarding_body=data.get("awarding_body") or data.get("grant_body"),
                        award_level=data.get("award_level"),
                        award_year=data.get("award_year"),
                        certificate_no=data.get("certificate_no") or data.get("cert_no"),
                    )
                    db.add(ext)
        except Exception:
            pass

        if obj_in.team_members:
            result = await db.execute(
                select(User).filter(User.full_name.in_(obj_in.team_members))
            )
            users_to_add = result.scalars().all()

            for user in users_to_add:
                collaborator = ResearchCollaborator(item_id=db_obj.id, user_id=user.id)
                db.add(collaborator)

        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi_by_owner(
        self, db: AsyncSession, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[ResearchItem]:
        """Retrieve research items belonging to a specific owner."""
        result = await db.execute(
            select(self.model)
            .filter(ResearchItem.user_id == owner_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_multi_for_user(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[ResearchItem]:
        """Retrieve research items where the user is owner or collaborator."""
        result = await db.execute(
            select(self.model)
            .filter(
                (ResearchItem.user_id == user_id) |
                (ResearchItem.id.in_(
                    select(ResearchCollaborator.item_id).filter(ResearchCollaborator.user_id == user_id)
                ))
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_multi_by_status(
        self, db: AsyncSession, *, status: ApprovalStatus, skip: int = 0, limit: int = 100
    ) -> List[ResearchItem]:
        """Retrieve research items by their approval status."""
        result = await db.execute(
            select(self.model)
            .filter(ResearchItem.status == status)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def update_status_multi(
        self, db: AsyncSession, *, ids: List[int], status: ApprovalStatus, remarks: Optional[str]
    ) -> int:
        """Update the status of multiple research items."""
        values_to_update = {
            "status": status,
            "audit_remarks": remarks,
        }
        if status == ApprovalStatus.approved:
            values_to_update["approve_time"] = datetime.utcnow()

        result = await db.execute(
            update(ResearchItem)
            .where(ResearchItem.id.in_(ids))
            .values(**values_to_update)
        )
        await db.commit()
        return result.rowcount

research_item = CRUDResearchItem(ResearchItem)
