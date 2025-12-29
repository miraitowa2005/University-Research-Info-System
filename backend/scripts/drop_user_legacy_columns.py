import asyncio
import os
import sys
from sqlalchemy import text
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
from app.db.session import AsyncSessionLocal

TARGET_COLS = ["role_id", "department", "department_code"]

async def drop_columns():
    async with AsyncSessionLocal() as session:
        # Get existing columns
        res = await session.execute(text("SHOW COLUMNS FROM users"))
        cols = [row[0] for row in res.fetchall()]
        to_drop = [c for c in TARGET_COLS if c in cols]
        if not to_drop:
            return
        # Disable FK checks
        try:
            await session.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
        except Exception:
            pass
        for col in to_drop:
            try:
                await session.execute(text(f"ALTER TABLE users DROP COLUMN {col}"))
            except Exception:
                pass
        try:
            await session.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        except Exception:
            pass
        await session.commit()

if __name__ == "__main__":
    asyncio.run(drop_columns())
