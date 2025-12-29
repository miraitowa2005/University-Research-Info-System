#!/usr/bin/env python3
"""
计算MySQL数据库中research_items.user_id对应的dept_id=1且subtype_id=1或2的content_json属性中total_funding的累计和
使用项目已有的异步MySQL连接方式
"""

import asyncio
import json
import os
import sys
from urllib.parse import quote_plus

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import aiomysql
    from backend.app.core.config import settings
except ImportError:
    # 如果直接导入失败，尝试相对导入
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
    import aiomysql
    from app.core.config import settings

async def check_mysql_connection():
    """检查MySQL数据库连接"""
    try:
        print("🔌 尝试连接MySQL数据库...")
        
        # 使用项目配置
        config = {
            'host': settings.DB_HOST,
            'port': settings.DB_PORT,
            'user': settings.DB_USER,
            'password': settings.DB_PASS,
            'db': settings.DB_NAME,
            'charset': 'utf8mb4'
        }
        
        print(f"  主机: {config['host']}:{config['port']}")
        print(f"  数据库: {config['db']}")
        print(f"  用户: {config['user']}")
        
        # 创建连接池
        pool = await aiomysql.create_pool(**config)
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 检查数据库中的表
                await cursor.execute("SHOW TABLES")
                tables = await cursor.fetchall()
                
                if tables:
                    table_names = [table[0] for table in tables]
                    print(f"📊 数据库中的表: {table_names}")
                    
                    # 检查必要的表是否存在
                    required_tables = ['research_items', 'users']
                    missing_tables = []
                    
                    for table in required_tables:
                        if table not in table_names:
                            missing_tables.append(table)
                    
                    if missing_tables:
                        print(f"❌ 错误: 缺少必要的表: {missing_tables}")
                        pool.close()
                        await pool.wait_closed()
                        return None
                    
                    print("✅ MySQL数据库连接成功")
                    return pool
                else:
                    print("⚠️  警告: 数据库中没有表")
                    pool.close()
                    await pool.wait_closed()
                    return None
        
    except Exception as e:
        print(f"❌ MySQL数据库连接错误: {e}")
        print("💡 请确保:")
        print("  1. MySQL服务正在运行")
        print("  2. 数据库 research_db 存在")
        print("  3. 用户名和密码正确")
        return None

async def calculate_total_funding():
    """计算特定条件下的total_funding累计和"""
    
    pool = await check_mysql_connection()
    if not pool:
        return 0
    
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                print("\n🔍 开始计算total_funding累计和...")
                print("📋 查询条件: dept_id=1 且 subtype_id=1或2")
                
                # 查询符合条件的记录
                query = """
                SELECT ri.id, ri.content_json, u.dept_id, ri.subtype_id
                FROM research_items ri
                JOIN users u ON ri.user_id = u.id
                WHERE u.dept_id = 1 AND ri.subtype_id IN (1, 2)
                """
                
                await cursor.execute(query)
                items = await cursor.fetchall()
                
                if not items:
                    print("ℹ️  没有找到符合条件的记录")
                    
                    # 显示一些统计信息
                    await cursor.execute("SELECT COUNT(*) FROM research_items")
                    total_items = (await cursor.fetchone())[0]
                    
                    await cursor.execute("SELECT COUNT(*) FROM users WHERE dept_id = 1")
                    dept1_users = (await cursor.fetchone())[0]
                    
                    await cursor.execute("SELECT COUNT(*) FROM research_items WHERE subtype_id IN (1, 2)")
                    subtype_items = (await cursor.fetchone())[0]
                    
                    print(f"📊 数据库统计:")
                    print(f"  - 总research_items记录数: {total_items}")
                    print(f"  - dept_id=1的用户数: {dept1_users}")
                    print(f"  - subtype_id=1或2的记录数: {subtype_items}")
                    
                    return 0
                
                total_funding = 0.0
                item_count = 0
                
                print(f"✅ 找到 {len(items)} 条符合条件的记录")
                
                for item in items:
                    item_id = item[0]
                    content_json_str = item[1]
                    dept_id = item[2]
                    subtype_id = item[3]
                    
                    try:
                        if content_json_str:
                            content_json = json.loads(content_json_str)
                            
                            # 尝试从content_json中提取total_funding
                            funding_value = None
                            
                            if "total_funding" in content_json:
                                funding_value = content_json["total_funding"]
                            elif "funding" in content_json:
                                funding_value = content_json["funding"]
                            elif "amount" in content_json:
                                funding_value = content_json["amount"]
                            
                            if funding_value is not None:
                                try:
                                    # 转换为浮点数
                                    if isinstance(funding_value, str):
                                        # 处理字符串格式的数字（如包含逗号）
                                        funding_value = float(funding_value.replace(',', '').strip())
                                    else:
                                        funding_value = float(funding_value)
                                    
                                    total_funding += funding_value
                                    item_count += 1
                                    print(f"📄 记录 {item_id} (subtype_id={subtype_id}): total_funding = {funding_value}")
                                    
                                except (ValueError, TypeError) as e:
                                    print(f"⚠️  记录 {item_id}: 无法解析total_funding值: {funding_value} - {e}")
                            else:
                                print(f"ℹ️  记录 {item_id}: content_json中未找到total_funding相关字段")
                                # 显示content_json的键以便调试
                                print(f"    content_json键: {list(content_json.keys())}")
                        else:
                            print(f"ℹ️  记录 {item_id}: content_json为空")
                            
                    except json.JSONDecodeError as e:
                        print(f"❌ 记录 {item_id}: JSON解析错误 - {e}")
                    except Exception as e:
                        print(f"❌ 处理记录 {item_id} 时出错: {e}")
                
                # 检查扩展表中的数据
                print("\n🔍 检查扩展表中的total_funding数据...")
                
                # 检查扩展表是否存在
                await cursor.execute("SHOW TABLES LIKE 'ext_vertical_projects'")
                vertical_table_exists = await cursor.fetchone() is not None
                
                await cursor.execute("SHOW TABLES LIKE 'ext_horizontal_projects'")
                horizontal_table_exists = await cursor.fetchone() is not None
                
                total_ext = 0.0
                
                if vertical_table_exists:
                    # 查询纵向项目扩展表
                    query_vertical = """
                    SELECT SUM(evp.total_funding) 
                    FROM ext_vertical_projects evp
                    JOIN research_items ri ON evp.id = ri.id
                    JOIN users u ON ri.user_id = u.id
                    WHERE u.dept_id = 1 AND ri.subtype_id IN (1, 2)
                    """
                    
                    await cursor.execute(query_vertical)
                    vertical_sum = (await cursor.fetchone())[0] or 0
                    print(f"📊 纵向项目扩展表total_funding总和: {vertical_sum}")
                    total_ext += float(vertical_sum)
                else:
                    print("ℹ️  纵向项目扩展表不存在")
                
                if horizontal_table_exists:
                    # 查询横向项目扩展表
                    query_horizontal = """
                    SELECT SUM(ehp.total_funding) 
                    FROM ext_horizontal_projects ehp
                    JOIN research_items ri ON ehp.id = ri.id
                    JOIN users u ON ri.user_id = u.id
                    WHERE u.dept_id = 1 AND ri.subtype_id IN (1, 2)
                    """
                    
                    await cursor.execute(query_horizontal)
                    horizontal_sum = (await cursor.fetchone())[0] or 0
                    print(f"📊 横向项目扩展表total_funding总和: {horizontal_sum}")
                    total_ext += float(horizontal_sum)
                else:
                    print("ℹ️  横向项目扩展表不存在")
                
                print(f"📊 扩展表total_funding总计: {total_ext}")
                
                # 选择较大的值作为最终结果
                final_total = total_ext if total_ext > 0 else total_funding
                
                print("\n" + "="*60)
                print("📈 计算结果汇总:")
                print("="*60)
                print(f"📄 从content_json中解析的记录数: {item_count}")
                print(f"💰 content_json中total_funding累计和: {total_funding:.2f}")
                print(f"💰 扩展表中total_funding累计和: {total_ext:.2f}")
                print(f"💰 最终total_funding累计和: {final_total:.2f}")
                print("="*60)
                
                return final_total
        
    except Exception as e:
        print(f"❌ 数据库查询出错: {e}")
        return 0
    finally:
        if pool:
            pool.close()
            await pool.wait_closed()

async def main():
    """主函数"""
    print("🔬 科研项目经费统计脚本 (MySQL异步版本)")
    print("="*60)
    
    try:
        total = await calculate_total_funding()
        
        if total > 0:
            print(f"\n✅ 统计完成！")
            print(f"🏫 计算机科学与技术学院(dept_id=1)的纵向和横向项目(subtype_id=1或2)")
            print(f"💰 总经费累计和: {total:.2f} 万元")
        else:
            print(f"\nℹ️  统计完成，但没有找到符合条件的经费数据")
            print("💡 提示: 请确保MySQL数据库中有相应的数据记录")
        
    except Exception as e:
        print(f"❌ 执行过程中出错: {e}")

if __name__ == "__main__":
    asyncio.run(main())