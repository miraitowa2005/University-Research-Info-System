#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库初始化脚本
- 创建数据库表
- 填充示例数据
"""

import os
import sys
import asyncio

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.session import AsyncSessionLocal as async_session
from app.db.base import Base
from app.models.user import User
from app.models.research_type import ResearchType, ResearchSubtype
from app.models.research_item import ResearchItem
from app.models.research_collaborator import ResearchCollaborator
from app.models.audit_log import AuditLog
from app.core.security import get_password_hash
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

async def create_database_tables(engine: AsyncEngine):
    """创建数据库表"""
    print("正在创建数据库表...")
    async with engine.begin() as conn:
        # 先删除所有表，禁用外键检查以避免依赖问题
        try:
            # 禁用外键约束检查
            await conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))
            
            # 获取数据库中所有表的名称
            tables = await conn.execute(text("SHOW TABLES"))
            table_names = [row[0] for row in tables]
            
            # 删除所有表
            for table_name in table_names:
                await conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
            
            # 重新启用外键约束检查
            await conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        except SQLAlchemyError as e:
            print(f"清理数据库表时出现警告: {e}")
            # 继续执行，不中断流程
            await conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        
        # 然后使用模型创建所有表
        await conn.run_sync(Base.metadata.create_all)
    print("数据库表创建完成")

async def seed_sample_data():
    """填充示例数据"""
    print("正在填充示例数据...")
    
    async with async_session() as session:
        try:
            # 创建研究类型
            research_types = [
                ResearchType(name="基础研究", description="探索自然规律的基础性研究"),
                ResearchType(name="应用研究", description="解决实际问题的应用研究"),
                ResearchType(name="技术开发", description="新技术、新产品的开发"),
                ResearchType(name="软科学研究", description="管理、政策等软科学研究")
            ]
            session.add_all(research_types)
            await session.flush()
            
            # 创建研究子类型
            research_subtypes = [
                ResearchSubtype(name="理论研究", type_id=research_types[0].id),
                ResearchSubtype(name="实验研究", type_id=research_types[0].id),
                ResearchSubtype(name="技术应用", type_id=research_types[1].id),
                ResearchSubtype(name="产品开发", type_id=research_types[2].id)
            ]
            session.add_all(research_subtypes)
            await session.flush()
            
            # 创建用户
            users = [
                User(
                    email="admin@example.com",
                    hashed_password=get_password_hash("admin123"),
                    full_name="管理员",
                    is_superuser=True
                ),
                User(
                    email="teacher1@example.com",
                    hashed_password=get_password_hash("teacher123"),
                    full_name="张教授",
                    is_superuser=False
                ),
                User(
                    email="teacher2@example.com",
                    hashed_password=get_password_hash("teacher123"),
                    full_name="李副教授",
                    is_superuser=False
                )
            ]
            session.add_all(users)
            await session.flush()
            
            # 创建研究项目
            research_items = [
                ResearchItem(
                    title="人工智能在医学影像诊断中的应用",
                    content_json={"description": "研究利用深度学习技术辅助医学影像诊断"},
                    subtype_id=research_subtypes[0].id,  # 使用理论研究子类型
                    user_id=users[1].id,
                    status="pending"
                ),
                ResearchItem(
                    title="新能源材料的合成与性能研究",
                    content_json={"description": "研究新型能源材料的合成方法及其性能"},
                    subtype_id=research_subtypes[1].id,  # 使用实验研究子类型
                    user_id=users[2].id,
                    status="approved"
                )
            ]
            session.add_all(research_items)
            await session.flush()
            
            # 创建研究合作者
            collaborators = [
                ResearchCollaborator(item_id=research_items[0].id, user_id=users[2].id, role="co_investigator"),
                ResearchCollaborator(item_id=research_items[1].id, user_id=users[1].id, role="consultant")
            ]
            session.add_all(collaborators)
            
            # 提交所有更改
            await session.commit()
            print("示例数据填充完成")
            
            # 输出创建的用户信息
            print("\n创建的用户：")
            print("- 管理员: 邮箱=admin@example.com, 密码=admin123")
            print("- 教师1: 邮箱=teacher1@example.com, 密码=teacher123")
            print("- 教师2: 邮箱=teacher2@example.com, 密码=teacher123")
            
        except SQLAlchemyError as e:
            await session.rollback()
            print(f"填充示例数据时出错: {e}")
            return False
    
    return True

async def main():
    """主函数"""
    print("开始初始化数据库...")
    
    try:
        # 创建数据库表
        from app.db.session import engine
        await create_database_tables(engine)
        
        # 填充示例数据
        if not await seed_sample_data():
            return 1
        
        print("\n数据库初始化完成！")
        return 0
        
    except Exception as e:
        print(f"数据库初始化失败: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
