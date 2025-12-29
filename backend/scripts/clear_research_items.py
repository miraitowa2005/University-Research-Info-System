import asyncio
import os
import sys
from sqlalchemy import text
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
from app.db.session import AsyncSessionLocal

TABLES = [
    "ext_vertical_projects",
    "ext_horizontal_projects",
    "ext_academic_papers",
    "ext_patents",
    "ext_academic_books",
    "ext_awards",
    "research_collaborators",
    "research_items",
]

async def clear():
    async with AsyncSessionLocal() as session:
        try:
            await session.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        except Exception:
            pass
        for t in TABLES:
            try:
                await session.execute(text(f"DELETE FROM `{t}`"))
            except Exception:
                pass
        try:
            await session.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        except Exception:
            pass
        await session.commit()

if __name__ == "__main__":
    asyncio.run(clear())
