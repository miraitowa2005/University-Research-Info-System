#!/usr/bin/env python3
"""
计算数据库中research_items.user_id对应的dept_id=1且subtype_id=1或2的content_json属性中total_funding的累计和
"""

import asyncio
import json
import sys
import os
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 导入数据库模型
try:
    from backend.app.models.user import User
    from backend.app.models.research_item import ResearchItem
    from backend.app.models.research_extensions import VerticalProject, HorizontalProject
    from backend.app.core.config import settings
except ImportError:
    # 如果直接导入失败，尝试相对导入
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
    from app.models.user import User
    from app.models.research_item import ResearchItem
    from app.models.research_extensions import VerticalProject, HorizontalProject
    from app.core.config import settings


async def calculate_total_funding():
    """计算特定条件下的total_funding累计和"""
    
    # 创建数据库连接
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            print("开始计算total_funding累计和...")
            print("查询条件: dept_id=1 且 subtype_id=1或2")
            
            # 方法1: 从content_json中提取total_funding
            query_json = (
                select(ResearchItem)
                .join(User, User.id == ResearchItem.user_id)
                .where(User.dept_id == 1)
                .where(ResearchItem.subtype_id.in_([1, 2]))
            )
            
            result = await session.execute(query_json)
            items = result.scalars().all()
            
            total_json = 0.0
            item_count = 0
            
            print(f"\n找到 {len(items)} 条符合条件的记录")
            
            for item in items:
                try:
                    cj = getattr(item, "content_json", {}) or {}
                    
                    # 尝试从content_json中提取total_funding
                    v = cj.get("total_funding")
                    if v is None:
                        v = cj.get("funding") or cj.get("amount")
                    
                    if v is not None:
                        try:
                            funding_value = float(v)
                            total_json += funding_value
                            item_count += 1
                            print(f"记录 {item.id}: total_funding = {funding_value}")
                        except (ValueError, TypeError):
                            try:
                                # 处理字符串格式的数字（如包含逗号）
                                funding_value = float(str(v).replace(',', '').strip())
                                total_json += funding_value
                                item_count += 1
                                print(f"记录 {item.id}: total_funding = {funding_value}")
                            except (ValueError, TypeError):
                                print(f"记录 {item.id}: 无法解析total_funding值: {v}")
                    else:
                        print(f"记录 {item.id}: content_json中未找到total_funding相关字段")
                        
                except Exception as e:
                    print(f"处理记录 {item.id} 时出错: {e}")
            
            # 方法2: 从扩展表中查询total_funding（如果存在）
            print("\n检查扩展表中的total_funding数据...")
            
            # 查询纵向项目扩展表
            query_vertical = (
                select(func.coalesce(func.sum(VerticalProject.total_funding), 0))
                .select_from(
                    ResearchItem.__table__
                    .join(User, User.id == ResearchItem.user_id)
                    .join(VerticalProject, VerticalProject.id == ResearchItem.id, isouter=True)
                )
                .where(User.dept_id == 1)
                .where(ResearchItem.subtype_id.in_([1, 2]))
            )
            
            # 查询横向项目扩展表
            query_horizontal = (
                select(func.coalesce(func.sum(HorizontalProject.total_funding), 0))
                .select_from(
                    ResearchItem.__table__
                    .join(User, User.id == ResearchItem.user_id)
                    .join(HorizontalProject, HorizontalProject.id == ResearchItem.id, isouter=True)
                )
                .where(User.dept_id == 1)
                .where(ResearchItem.subtype_id.in_([1, 2]))
            )
            
            vertical_sum = (await session.execute(query_vertical)).scalar() or 0
            horizontal_sum = (await session.execute(query_horizontal)).scalar() or 0
            
            try:
                total_ext = float(vertical_sum) + float(horizontal_sum)
            except Exception:
                total_ext = (vertical_sum or 0) + (horizontal_sum or 0)
            
            print(f"纵向项目扩展表total_funding总和: {vertical_sum}")
            print(f"横向项目扩展表total_funding总和: {horizontal_sum}")
            print(f"扩展表total_funding总计: {total_ext}")
            
            # 选择较大的值作为最终结果
            final_total = total_ext if total_ext > 0 else total_json
            
            print("\n" + "="*60)
            print("计算结果汇总:")
            print("="*60)
            print(f"从content_json中解析的记录数: {item_count}")
            print(f"content_json中total_funding累计和: {total_json:.2f}")
            print(f"扩展表中total_funding累计和: {total_ext:.2f}")
            print(f"最终total_funding累计和: {final_total:.2f}")
            print("="*60)
            
            return final_total
            
    except Exception as e:
        print(f"数据库查询出错: {e}")
        return 0
    finally:
        await engine.dispose()


async def main():
    """主函数"""
    print("科研项目经费统计脚本")
    print("="*60)
    
    try:
        total = await calculate_total_funding()
        
        print(f"\n统计完成！")
        print(f"计算机科学与技术学院(dept_id=1)的纵向和横向项目(subtype_id=1或2)")
        print(f"总经费累计和: {total:.2f} 万元")
        
    except Exception as e:
        print(f"执行过程中出错: {e}")


if __name__ == "__main__":
    asyncio.run(main())