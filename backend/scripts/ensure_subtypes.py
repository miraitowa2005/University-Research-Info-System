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

DESIRED = [
    (1, '纵向科研项目'),
    (2, '横向科研项目'),
    (3, '科研论文'),
    (4, '专著/著作'),
    (5, '专利成果'),
    (6, '科研获奖'),
]

async def ensure():
    async with AsyncSessionLocal() as session:
        subs = (await session.execute(select(ResearchSubtype))).scalars().all()
        name_to_ids = {}
        for s in subs:
            name_to_ids.setdefault(s.name, []).append(s.id)
        await session.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        # Ensure desired mapping by name
        for did, dname in DESIRED:
            existing_ids = name_to_ids.get(dname, [])
            # ensure row at id=did
            row_at_did = (await session.execute(text("SELECT id FROM research_subtypes WHERE id=:id"), {"id": did})).fetchone()
            if not row_at_did:
                await session.execute(text("INSERT INTO research_subtypes (id, name) VALUES (:id, :name)"), {"id": did, "name": dname})
            else:
                await session.execute(text("UPDATE research_subtypes SET name=:name WHERE id=:id"), {"id": did, "name": dname})
            # Move all other ids with same name to did
            for oid in existing_ids:
                if oid == did:
                    continue
                await session.execute(text("UPDATE research_items SET subtype_id=:did WHERE subtype_id=:oid"), {"did": did, "oid": oid})
                await session.execute(text("DELETE FROM research_subtypes WHERE id=:id"), {"id": oid})
        # Remove any subtypes not in desired names
        desired_names = [n for _, n in DESIRED]
        await session.execute(text("DELETE FROM research_subtypes WHERE name NOT IN (:n1, :n2, :n3, :n4, :n5, :n6)"),
                              {"n1": desired_names[0], "n2": desired_names[1], "n3": desired_names[2],
                               "n4": desired_names[3], "n5": desired_names[4], "n6": desired_names[5]})
        await session.execute(text("ALTER TABLE research_subtypes AUTO_INCREMENT = 7"))
        await session.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        await session.commit()

if __name__ == "__main__":
    asyncio.run(ensure())
