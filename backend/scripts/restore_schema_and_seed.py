#!/usr/bin/env python3
import asyncio
import os
import sys
from typing import List
import aiomysql

# ensure import path
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, ROOT_DIR)
sys.path.insert(0, os.path.join(ROOT_DIR, "app"))
from app.core.config import settings

SCHEMA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "db", "schema_mysql.sql")

DDL_SEED_SQL: List[str] = [
    # Minimal seed: Departments
    "INSERT INTO departments (code, name) VALUES ('CS', '计算机科学与技术学院') ON DUPLICATE KEY UPDATE name=VALUES(name);",
    "INSERT INTO departments (code, name) VALUES ('PHY', '物理学院') ON DUPLICATE KEY UPDATE name=VALUES(name);",
    # Subtypes (names用于分类映射)
    "INSERT INTO research_subtypes (name) VALUES ('纵向项目') ON DUPLICATE KEY UPDATE name=VALUES(name);",
    "INSERT INTO research_subtypes (name) VALUES ('横向项目') ON DUPLICATE KEY UPDATE name=VALUES(name);",
    "INSERT INTO research_subtypes (name) VALUES ('学术论文') ON DUPLICATE KEY UPDATE name=VALUES(name);",
    "INSERT INTO research_subtypes (name) VALUES ('专利') ON DUPLICATE KEY UPDATE name=VALUES(name);",
    "INSERT INTO research_subtypes (name) VALUES ('出版著作') ON DUPLICATE KEY UPDATE name=VALUES(name);",
    "INSERT INTO research_subtypes (name) VALUES ('科技奖励') ON DUPLICATE KEY UPDATE name=VALUES(name);",
    # Roles
    "INSERT INTO roles (name, description, is_system) VALUES ('teacher','教师/科研人员',1) ON DUPLICATE KEY UPDATE description=VALUES(description);",
    "INSERT INTO roles (name, description, is_system) VALUES ('research_admin','科研管理员',1) ON DUPLICATE KEY UPDATE description=VALUES(description);",
    "INSERT INTO roles (name, description, is_system) VALUES ('sys_admin','系统管理员',1) ON DUPLICATE KEY UPDATE description=VALUES(description);",
]

async def run():
    print("🔧 Restoring schema and seeding minimal data...")
    db_conf = {
        "host": settings.DB_HOST,
        "port": settings.DB_PORT,
        "user": settings.DB_USER,
        "password": settings.DB_PASS,
        "db": settings.DB_NAME,
        "charset": "utf8mb4",
        "autocommit": True,
    }
    # Ensure database exists
    print(f"📦 Ensure database '{settings.DB_NAME}' exists...")
    root_conf = db_conf.copy()
    root_conf["db"] = None
    pool0 = await aiomysql.create_pool(**root_conf)
    async with pool0.acquire() as conn0:
        async with conn0.cursor() as cur0:
            await cur0.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` DEFAULT CHARACTER SET utf8mb4;")
    pool0.close()
    await pool0.wait_closed()

    pool = await aiomysql.create_pool(**db_conf)
    try:
        schema_sql = ""
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            schema_sql = f.read()
        # Split by semicolon while keeping order; filter empty lines
        statements = [s.strip() for s in schema_sql.split(";\n") if s.strip()]
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                for stmt in statements:
                    print(f"DDL> {stmt[:80]}...")
                    await cur.execute(stmt + ";")
                # Ensure users table has legacy columns required by startup seeding
                print("CHECK> users legacy columns (department, department_code)")
                await cur.execute("SHOW COLUMNS FROM users")
                cols = [row[0] for row in await cur.fetchall()]
                if "department" not in cols:
                    print("ALTER> ADD users.department VARCHAR(255) NULL")
                    await cur.execute("ALTER TABLE users ADD COLUMN department VARCHAR(255) NULL")
                if "department_code" not in cols:
                    print("ALTER> ADD users.department_code VARCHAR(50) NULL")
                    await cur.execute("ALTER TABLE users ADD COLUMN department_code VARCHAR(50) NULL")
                for seed in DDL_SEED_SQL:
                    print(f"SEED> {seed}")
                    await cur.execute(seed)
        print("✅ Schema restored and seeds applied successfully.")
    finally:
        pool.close()
        await pool.wait_closed()

if __name__ == "__main__":
    asyncio.run(run())
