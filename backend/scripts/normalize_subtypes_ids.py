import asyncio
import os
import sys
from sqlalchemy.future import select
from sqlalchemy import text
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
from app.db.session import AsyncSessionLocal
from app.models.research_type import ResearchSubtype
import app.models.research_extensions  # noqa: F401

KEEP_IDS = [5,6,7,8,9,10]
NEW_ORDER = [
    (1, 5),  # 纵向科研项目
    (2, 6),  # 横向科研项目
    (3, 7),  # 科研论文
    (4, 8),  # 专著/著作
    (5, 9),  # 专利成果
    (6, 10), # 科研获奖
]

async def normalize():
    async with AsyncSessionLocal() as session:
        subs = (await session.execute(select(ResearchSubtype))).scalars().all()
        by_id = {s.id: s for s in subs}
        await session.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        for s in subs:
            if s.id not in KEEP_IDS and s.id not in [n for n,_ in NEW_ORDER]:
                await session.execute(text("DELETE FROM research_subtypes WHERE id=:id"), {"id": s.id})
        for new_id, old_id in NEW_ORDER:
            old = by_id.get(old_id)
            if not old:
                continue
            await session.execute(text("DELETE FROM research_subtypes WHERE id=:id"), {"id": new_id})
            await session.execute(text("INSERT INTO research_subtypes (id, name) VALUES (:id, :name)"), {"id": new_id, "name": old.name})
        for new_id, old_id in NEW_ORDER:
            await session.execute(text("UPDATE research_items SET subtype_id=:new_id WHERE subtype_id=:old_id"), {"new_id": new_id, "old_id": old_id})
        for _, old_id in NEW_ORDER:
            await session.execute(text("DELETE FROM research_subtypes WHERE id=:id"), {"id": old_id})
        await session.execute(text("ALTER TABLE research_subtypes AUTO_INCREMENT = 7"))
        await session.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        await session.commit()

if __name__ == "__main__":
    asyncio.run(normalize())
