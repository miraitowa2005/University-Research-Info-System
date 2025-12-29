import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
import sys

# Ensure 'app' package is importable when running as a script
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.research_item import ResearchItem, ApprovalStatus
from app.models.research_type import ResearchSubtype
from app.models.research_collaborator import ResearchCollaborator

VERTICAL = ("纵向项目", [
    ("国家自然科学基金", "623%04d"),
    ("科技部重点研发计划", "KJ-%04d"),
    ("教育部人文社科", "RJ-%04d"),
])
HORIZONTAL = ("横向项目", [
    ("校企合作", "HX-%04d"),
    ("地方政府项目", "DF-%04d"),
])

async def ensure_subtypes(session: AsyncSession):
    # Ensure six subtypes exist (no parent type)
    names = ["纵向科研项目","横向科研项目","科研论文","专著/著作","专利成果","科研获奖"]
    ids: dict[str, int] = {}
    for nm in names:
        res = await session.execute(select(ResearchSubtype).filter(ResearchSubtype.name == nm))
        sub = res.scalars().first()
        if not sub:
            sub = ResearchSubtype(name=nm)
            session.add(sub)
            await session.flush()
        ids[nm] = sub.id
    return ids["纵向科研项目"], ids["横向科研项目"]

def random_date(start_days_ago=400, end_days_ago=0):
    base = datetime.utcnow() - timedelta(days=random.randint(end_days_ago, start_days_ago))
    return base.strftime("%Y-%m-%d")

async def seed_for_teachers():
    async with AsyncSessionLocal() as session:
        v_id, h_id = await ensure_subtypes(session)
        # Get all teachers
        res = await session.execute(select(User).filter(User.role == "teacher"))
        teachers = res.scalars().all()
        # Collect all teacher ids for collaborator assignment
        teacher_ids = [t.id for t in teachers]
        for t in teachers:
            # Random number of items per teacher
            n = random.randint(1, 4)
            for _ in range(n):
                is_vertical = random.choice([True, False])
                if is_vertical:
                    source, fmt_no = random.choice(VERTICAL[1])
                    content = {
                        "source": source,
                        "funding": random.choice([50, 80, 120, 200]),
                        "project_no": fmt_no % random.randint(1000, 9999),
                        "start_date": random_date(800, 400),
                        "end_date": random_date(400, 0),
                        "role": random.choice(["主持人", "参与人"]),
                    }
                    title = f"{t.full_name or '教师'}的{source}项目"
                    subtype_id = v_id
                    category = "纵向项目"
                else:
                    source, fmt_no = random.choice(HORIZONTAL[1])
                    content = {
                        "source": source,
                        "funding": random.choice([30, 60, 100, 150]),
                        "project_no": fmt_no % random.randint(1000, 9999),
                        "start_date": random_date(800, 400),
                        "end_date": random_date(400, 0),
                        "role": random.choice(["负责人", "成员"]),
                    }
                    title = f"{t.full_name or '教师'}的{source}项目"
                    subtype_id = h_id
                    category = "横向项目"
                # Create pending item
                item = ResearchItem(
                    title=title,
                    user_id=t.id,
                    subtype_id=subtype_id,
                    content_json=content,
                    status=ApprovalStatus.pending,
                    file_url=None,
                )
                session.add(item)
                await session.flush()
                # Random collaborators 0-2
                collab_count = random.randint(0, 2)
                cand = [uid for uid in teacher_ids if uid != t.id]
                random.shuffle(cand)
                for uid in cand[:collab_count]:
                    session.add(ResearchCollaborator(item_id=item.id, user_id=uid))
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_for_teachers())
