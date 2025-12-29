import asyncio
import os
import sys
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
from sqlalchemy.future import select
from sqlalchemy import delete, update
from app.db.session import AsyncSessionLocal
from app.models.research_type import ResearchSubtype
import app.models.research_extensions  # noqa: F401
from app.models.research_item import ResearchItem

SUBTYPES = ["纵向科研项目","横向科研项目","科研论文","专著/著作","专利成果","科研获奖"]

async def reset():
    async with AsyncSessionLocal() as session:
        existing = (await session.execute(select(ResearchSubtype))).scalars().all()
        targets: dict[str, int] = {}
        for name in SUBTYPES:
            found = next((s for s in existing if s.name == name), None)
            if not found:
                s = ResearchSubtype(name=name)
                session.add(s)
                await session.flush()
                targets[name] = s.id
            else:
                targets[name] = found.id
        for old in existing:
            if old.name in SUBTYPES:
                continue
            n = old.name or ""
            if "纵向" in n:
                tgt = targets["纵向科研项目"]
            elif "横向" in n:
                tgt = targets["横向科研项目"]
            elif "论文" in n:
                tgt = targets["科研论文"]
            elif ("出版" in n) or ("著作" in n) or ("书" in n):
                tgt = targets["专著/著作"]
            elif ("专利" in n) or ("发明" in n):
                tgt = targets["专利成果"]
            elif ("奖励" in n) or ("获奖" in n):
                tgt = targets["科研获奖"]
            else:
                tgt = targets["科研论文"]
            await session.execute(update(ResearchItem).where(ResearchItem.subtype_id == old.id).values(subtype_id=tgt))
        await session.execute(delete(ResearchSubtype).where(ResearchSubtype.name.not_in(SUBTYPES)))
        await session.commit()

if __name__ == "__main__":
    asyncio.run(reset())
