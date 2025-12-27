from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.db.session import engine

from app.api.api import api_router
from app.core.config import settings

app = FastAPI(
    title="University Research Info System",
    openapi_url=f"/api/v1/openapi.json"
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.on_event("startup")
async def ensure_mysql_role_column():
    url = settings.DATABASE_URL
    if "mysql" not in url:
        return
    async with engine.begin() as conn:
        res = await conn.execute(text("SHOW COLUMNS FROM users"))
        cols = [row[0] for row in res.fetchall()]
        if "role" not in cols:
            await conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'teacher'"))
            await conn.execute(text("UPDATE users SET role='sys_admin' WHERE is_superuser=1"))
            await conn.execute(text("UPDATE users SET role='teacher' WHERE is_superuser=0 AND (role IS NULL OR role='')"))
        # Ensure notices table exists
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS notices (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(255) NOT NULL,
            content VARCHAR(2000) NOT NULL,
            target_role VARCHAR(50) NOT NULL,
            target_department VARCHAR(255),
            target_department_code VARCHAR(50),
            publisher VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        # Ensure column target_department_code exists (for pre-existing tables)
        res_notices = await conn.execute(text("SHOW COLUMNS FROM notices"))
        ncols = [row[0] for row in res_notices.fetchall()]
        if "target_department_code" not in ncols:
            await conn.execute(text("ALTER TABLE notices ADD COLUMN target_department_code VARCHAR(50)"))
        # Ensure departments tables exist and seed
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS departments (
            id INT PRIMARY KEY AUTO_INCREMENT,
            code VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) UNIQUE NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS department_aliases (
            id INT PRIMARY KEY AUTO_INCREMENT,
            alias VARCHAR(255) UNIQUE NOT NULL,
            code VARCHAR(50) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        # Seed CS department
        await conn.execute(text("INSERT IGNORE INTO departments (code, name) VALUES ('CS', '计算机学院')"))
        await conn.execute(text("INSERT IGNORE INTO department_aliases (alias, code) VALUES ('计算机科学与技术学院','CS'),('计院','CS'),('计算机','CS')"))
        # Ensure backups table exists
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS backups (
            id INT PRIMARY KEY AUTO_INCREMENT,
            status VARCHAR(50) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        # Ensure RBAC tables exist and seed
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS roles (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) UNIQUE NOT NULL,
            description VARCHAR(255),
            is_system TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS role_permissions (
            id INT PRIMARY KEY AUTO_INCREMENT,
            role_id INT NOT NULL,
            code VARCHAR(100) NOT NULL,
            INDEX(role_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        await conn.execute(text("INSERT IGNORE INTO roles (id, name, description, is_system) VALUES (1, '系统管理员', '系统管理权限', 1), (2, '科研管理员', '科研管理权限', 1), (3, '教师', '教师默认权限', 1)"))
        # Ensure permissions catalog exists and seed
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS permissions_catalog (
            id INT PRIMARY KEY AUTO_INCREMENT,
            code VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            module VARCHAR(100) NOT NULL,
            description VARCHAR(255),
            enabled TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        await conn.execute(text("""
        INSERT IGNORE INTO permissions_catalog (code, name, module) VALUES
        ('system.health.view','查看系统健康','System'),
        ('system.backup.run','执行备份','System'),
        ('system.cache.clear','清理缓存','System'),
        ('system.users.manage','用户管理','System'),
        ('system.rbac.manage','角色与权限管理','System'),
        ('master.departments.manage','学院字典管理','System'),
        ('research.audit','科研审核','Research'),
        ('research.notice.publish','发布通知','Research'),
        ('research.stats.view','查看科研统计','Research'),
        ('research.data.export','数据导出','Research')
        """))
        # Seed research types and subtypes for categories
        await conn.execute(text("INSERT IGNORE INTO research_types (id, name, description) VALUES (1, '项目', '科研项目'), (2, '成果', '论文专著等成果')"))
        await conn.execute(text("""
        INSERT IGNORE INTO research_subtypes (id, name, type_id) VALUES
        (1,'纵向科研项目',1),
        (2,'横向科研项目',1),
        (3,'学术论文',2),
        (4,'出版著作',2),
        (5,'发明专利',2),
        (6,'科技奖励',2)
        """))
        # Ensure user_experiences table
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS user_experiences (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            type VARCHAR(20) NOT NULL,
            start_date DATE NULL,
            end_date DATE NULL,
            title VARCHAR(255),
            institution VARCHAR(255),
            description VARCHAR(2000),
            order_index INT,
            INDEX(user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))
        # Ensure new user profile columns exist
        res_users2 = await conn.execute(text("SHOW COLUMNS FROM users"))
        ucols2 = [row[0] for row in res_users2.fetchall()]
        async def ensure_col(name: str, ddl: str):
            nonlocal ucols2
            if name not in ucols2:
                await conn.execute(text(f"ALTER TABLE users ADD COLUMN {ddl}"))
                res_u = await conn.execute(text("SHOW COLUMNS FROM users"))
                ucols2 = [row[0] for row in res_u.fetchall()]
        await ensure_col("employee_id", "employee_id VARCHAR(100) NULL")
        await ensure_col("gender", "gender VARCHAR(20) NULL")
        await ensure_col("birth_date", "birth_date DATE NULL")
        await ensure_col("phone", "phone VARCHAR(50) NULL")
        await ensure_col("office_location", "office_location VARCHAR(255) NULL")
        await ensure_col("highest_education", "highest_education VARCHAR(100) NULL")
        await ensure_col("degree", "degree VARCHAR(100) NULL")
        await ensure_col("alma_mater", "alma_mater VARCHAR(255) NULL")
        await ensure_col("major", "major VARCHAR(255) NULL")
        await ensure_col("research_direction", "research_direction VARCHAR(500) NULL")
        await ensure_col("advisor_qualification", "advisor_qualification VARCHAR(50) NULL")
        await ensure_col("profile_public", "profile_public TINYINT(1) DEFAULT 0")
        # Ensure users have department fields
        res_users = await conn.execute(text("SHOW COLUMNS FROM users"))
        ucols = [row[0] for row in res_users.fetchall()]
        if "department" not in ucols:
            await conn.execute(text("ALTER TABLE users ADD COLUMN department VARCHAR(255)"))
        if "department_code" not in ucols:
            await conn.execute(text("ALTER TABLE users ADD COLUMN department_code VARCHAR(50)"))
        # Ensure notice recipients table exists
        await conn.execute(text("""
        CREATE TABLE IF NOT EXISTS notice_recipients (
            id INT PRIMARY KEY AUTO_INCREMENT,
            notice_id INT NOT NULL,
            user_id INT NOT NULL,
            is_read TINYINT(1) DEFAULT 0,
            read_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (notice_id),
            INDEX (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """))

app.include_router(api_router, prefix="/api/v1")
