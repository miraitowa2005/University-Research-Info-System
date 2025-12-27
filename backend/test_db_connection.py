#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库连接测试脚本
用于测试是否能够成功连接到本地数据库
"""

import os
import sys
import asyncio

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def test_db_connection():
    """测试数据库连接"""
    print(f"正在测试数据库连接: {settings.DATABASE_URL}")
    
    try:
        # 创建异步引擎
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=True,  # 打印SQL语句，便于调试
            pool_pre_ping=True  # 连接池预检查
        )
        
        # 测试连接
        async with engine.begin() as conn:
            # 执行一个简单的SQL查询
            result = await conn.execute(text("SELECT 1"))
            print(f"数据库连接成功！查询结果: {result.scalar_one()}")
        
        # 关闭引擎
        await engine.dispose()
        return True
        
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_db_connection())
    sys.exit(0 if success else 1)
