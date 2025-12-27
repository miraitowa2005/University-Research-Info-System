from typing import List, Optional
from datetime import datetime

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.crud.base import CRUDBase
from app.models.research_item import ResearchItem, ApprovalStatus
from app.models.user import User
from app.models.research_collaborator import ResearchCollaborator
from app.schemas.research import ResearchItemCreate, ResearchItemUpdate


class CRUDResearchItem(CRUDBase[ResearchItem, ResearchItemCreate, ResearchItemUpdate]):
    async def create_with_owner(
        self, db: AsyncSession, *, obj_in: ResearchItemCreate, owner_id: int
    ) -> ResearchItem:
        """Create a new research item and assign an owner."""
        db_obj = ResearchItem(
            title=obj_in.title,
            subtype_id=obj_in.subtype_id,
            content_json=obj_in.content_json,
            status=obj_in.status,
            file_url=obj_in.file_url,
            user_id=owner_id,
        )
        db.add(db_obj)
        await db.flush()

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
