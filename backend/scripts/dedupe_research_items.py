import asyncio
import os
import sys
import json
import hashlib
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
from sqlalchemy import text, select
from app.db.session import AsyncSessionLocal
from app.models.research_item import ResearchItem
import app.models.research_extensions  # noqa: F401

def compute_hash(title: str, content: dict) -> str:
    try:
        payload = {"title": title or "", "content": content or {}}
        s = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(s.encode("utf-8")).hexdigest()
    except Exception:
        return ""

async def dedupe():
    async with AsyncSessionLocal() as session:
        items = (await session.execute(select(ResearchItem))).scalars().all()
        # Prepare hashes in memory to avoid violating unique constraint while updating
        updates = []
        for it in items:
            h = it.content_hash or compute_hash(it.title or "", it.content_json or {})
            updates.append((it.id, h))
        # Delete duplicates first using grouping on would-be hash
        rows = (await session.execute(text("""
            SELECT user_id, subtype_id, 
                   CONCAT(sha2(CONCAT_WS('|', COALESCE(title,''), COALESCE(JSON_OBJECT(), '')), 256)) AS ch,
                   GROUP_CONCAT(id ORDER BY id ASC) AS ids, COUNT(*) AS cnt
            FROM research_items
            GROUP BY user_id, subtype_id, ch
            HAVING cnt > 1
        """))).fetchall()
        to_delete_ids = []
        for r in rows:
            ids = str(r.ids).split(",")
            keep = ids[0]
            to_delete_ids.extend(ids[1:])
        if to_delete_ids:
            for tid in to_delete_ids:
                try:
                    await session.execute(text("DELETE FROM research_collaborators WHERE item_id=:id"), {"id": tid})
                except Exception:
                    pass
                for t in [
                    "ext_vertical_projects","ext_horizontal_projects",
                    "ext_academic_papers","ext_patents","ext_academic_books","ext_awards"
                ]:
                    try:
                        await session.execute(text(f"DELETE FROM `{t}` WHERE id=:id"), {"id": tid})
                    except Exception:
                        pass
            await session.execute(text(f"DELETE FROM research_items WHERE id IN ({','.join(to_delete_ids)})"))
            await session.commit()
        # Now update hashes safely
        for rid, h in updates:
            await session.execute(text("UPDATE research_items SET content_hash=:h WHERE id=:id"), {"h": h, "id": rid})
        await session.commit()

if __name__ == "__main__":
    asyncio.run(dedupe())
