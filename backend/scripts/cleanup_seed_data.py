#!/usr/bin/env python3
import asyncio
import os
import sys
import aiomysql
from typing import Dict, List

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, ROOT_DIR)
sys.path.insert(0, os.path.join(ROOT_DIR, "app"))
from app.core.config import settings

TARGET_SUBTYPE_NAMES = [
    "纵向科研项目",
    "横向科研项目",
    "学术论文",
    "出版著作",
    "专利成果",
    "科研获奖",
]

def map_target(name: str):
    n = (name or "").strip()
    if n in TARGET_SUBTYPE_NAMES:
        return n
    low = n.lower()
    if "纵向" in n:
        return "纵向科研项目"
    if "横向" in n:
        return "横向科研项目"
    if "论文" in n:
        return "学术论文"
    if ("出版" in n) or ("著作" in n) or ("书" in n):
        return "出版著作"
    if ("专利" in n) or ("发明" in n):
        return "专利成果"
    if ("奖励" in n) or ("获奖" in n):
        return "科研获奖"
    return None

async def run():
    conf = {
        "host": settings.DB_HOST,
        "port": settings.DB_PORT,
        "user": settings.DB_USER,
        "password": settings.DB_PASS,
        "db": settings.DB_NAME,
        "charset": "utf8mb4",
        "autocommit": True,
    }
    pool = await aiomysql.create_pool(**conf)
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # 1) Delete demo research_items by content_hash prefix
                prefixes = ["hash_v_", "hash_h_", "hash_p_", "hash_pt_", "hash_bk_", "hash_aw_", "hash_extra_"]
                where = " OR ".join([f"content_hash LIKE '{p}%'" for p in prefixes])
                await cur.execute(f"SELECT COUNT(*) FROM research_items WHERE {where}")
                cnt = (await cur.fetchone())[0]
                if cnt:
                    await cur.execute(f"DELETE FROM research_items WHERE {where}")
                    print(f"Deleted demo research_items by prefix: {cnt}")
                # 2) Delete demo departments and aliases by code pattern DPT%
                await cur.execute("SELECT COUNT(*) FROM department_aliases WHERE code LIKE 'DPT%'")
                acnt = (await cur.fetchone())[0]
                if acnt:
                    await cur.execute("DELETE FROM department_aliases WHERE code LIKE 'DPT%'")
                    print(f"Deleted department_aliases demo: {acnt}")
                await cur.execute("SELECT COUNT(*) FROM departments WHERE code LIKE 'DPT%'")
                dcnt = (await cur.fetchone())[0]
                if dcnt:
                    await cur.execute("DELETE FROM departments WHERE code LIKE 'DPT%'")
                    print(f"Deleted departments demo: {dcnt}")
                # 3) Delete demo users with @local except admin@local
                await cur.execute("SELECT id FROM users WHERE email LIKE '%@local' AND email <> 'admin@local'")
                del_user_ids = [r[0] for r in await cur.fetchall()] or []
                if del_user_ids:
                    ids_csv = ",".join(str(i) for i in del_user_ids)
                    # delete research items owned by these users (cascades ext tables)
                    await cur.execute(f"DELETE FROM research_items WHERE user_id IN ({ids_csv})")
                    # remove related collaborators and notice recipients
                    await cur.execute(f"DELETE FROM research_collaborators WHERE user_id IN ({ids_csv})")
                    await cur.execute(f"DELETE FROM notice_recipients WHERE user_id IN ({ids_csv})")
                    await cur.execute(f"DELETE FROM user_experiences WHERE user_id IN ({ids_csv})")
                    await cur.execute(f"DELETE FROM users WHERE id IN ({ids_csv})")
                    print(f"Deleted demo users: {len(del_user_ids)}")
                # 4) Ensure only target subtypes remain
                # Create targets if missing
                existing: Dict[str,int] = {}
                await cur.execute("SELECT id,name FROM research_subtypes")
                rows = await cur.fetchall()
                for rid, name in rows:
                    existing[name] = rid
                for name in TARGET_SUBTYPE_NAMES:
                    if name not in existing:
                        await cur.execute("INSERT INTO research_subtypes (name) VALUES (%s)", (name,))
                        await cur.execute("SELECT LAST_INSERT_ID()")
                        rid = (await cur.fetchone())[0]
                        existing[name] = rid
                # Map other subtypes to targets
                await cur.execute("SELECT id,name FROM research_subtypes")
                rows = await cur.fetchall()
                for sid, name in rows:
                    if name in TARGET_SUBTYPE_NAMES:
                        continue
                    target = map_target(name)
                    if target:
                        tid = existing[target]
                        # reassign items
                        await cur.execute("UPDATE research_items SET subtype_id=%s WHERE subtype_id=%s", (tid, sid))
                        # delete the old subtype
                        await cur.execute("DELETE FROM research_subtypes WHERE id=%s", (sid,))
                        print(f"Mapped subtype '{name}' -> '{target}' and removed old id={sid}")
                # Delete any remaining non-target subtypes with zero items
                await cur.execute("SELECT rs.id, rs.name, COUNT(ri.id) FROM research_subtypes rs LEFT JOIN research_items ri ON rs.id=ri.subtype_id GROUP BY rs.id, rs.name")
                rows = await cur.fetchall()
                for sid, name, cnt in rows:
                    if (name not in TARGET_SUBTYPE_NAMES) and (cnt == 0):
                        await cur.execute("DELETE FROM research_subtypes WHERE id=%s", (sid,))
                        print(f"Removed orphan subtype '{name}' id={sid}")
                # Ensure only target subtypes remain
                await cur.execute("DELETE FROM research_subtypes WHERE name NOT IN (%s,%s,%s,%s,%s,%s)", TARGET_SUBTYPE_NAMES)
                # Deduplicate target names: keep smallest id
                for name in TARGET_SUBTYPE_NAMES:
                    await cur.execute("SELECT id FROM research_subtypes WHERE name=%s ORDER BY id ASC", (name,))
                    ids = [r[0] for r in await cur.fetchall()]
                    if len(ids) > 1:
                        keep = ids[0]
                        extras = ids[1:]
                        placeholders = ",".join(["%s"]*len(extras))
                        await cur.execute(f"UPDATE research_items SET subtype_id=%s WHERE subtype_id IN ({placeholders})", (keep, *extras))
                        await cur.execute(f"DELETE FROM research_subtypes WHERE id IN ({placeholders})", tuple(extras))
                # Summary counts
                for t in ["departments","department_aliases","users","research_subtypes","research_items"]:
                    await cur.execute(f"SELECT COUNT(*) FROM {t}")
                    print(f"[COUNT] {t}: {(await cur.fetchone())[0]}")
    finally:
        pool.close()
        await pool.wait_closed()

if __name__ == "__main__":
    asyncio.run(run())
