#!/usr/bin/env python3
"""
学院科研项目统计脚本
实现核心业务流程：前端选择学院名称 -> 统计该学院下属所有教师的科研项目数据
"""

import asyncio
import aiomysql
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime

# 数据库配置（从.env文件读取）
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "@LYMoa4pta8w",
    "db": "research_db",
    "charset": "utf8mb4"
}

class DepartmentResearchStatistics:
    """学院科研项目统计类"""
    
    def __init__(self, db_config: Dict):
        self.db_config = db_config
        self.pool = None
    
    async def connect(self):
        """建立数据库连接池"""
        try:
            self.pool = await aiomysql.create_pool(**self.db_config)
            print("✅ 数据库连接池创建成功")
            return True
        except Exception as e:
            print(f"❌ 数据库连接失败: {e}")
            return False
    
    async def close(self):
        """关闭数据库连接"""
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()
            print("✅ 数据库连接已关闭")
    
    async def get_department_id_by_name(self, department_name: str) -> Optional[int]:
        """
        根据学院名称获取dept_id
        
        Args:
            department_name: 学院名称（如"计算机科学与技术学院"）
            
        Returns:
            dept_id 或 None（如果未找到）
        """
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 先在departments表中查找
                query = "SELECT id FROM departments WHERE name = %s"
                await cursor.execute(query, (department_name,))
                result = await cursor.fetchone()
                
                if result:
                    dept_id = result[0]
                    print(f"✅ 找到学院 '{department_name}'，dept_id: {dept_id}")
                    return dept_id
                
                # 如果在departments表中没找到，尝试在department_aliases表中查找
                query = """
                SELECT d.id 
                FROM department_aliases da 
                JOIN departments d ON da.code = d.code 
                WHERE da.alias = %s
                """
                await cursor.execute(query, (department_name,))
                result = await cursor.fetchone()
                
                if result:
                    dept_id = result[0]
                    print(f"✅ 通过别名找到学院 '{department_name}'，dept_id: {dept_id}")
                    return dept_id
                
                print(f"❌ 未找到学院: {department_name}")
                return None
    
    async def get_users_by_department(self, dept_id: int) -> List[int]:
        """
        根据dept_id获取该学院的所有用户ID
        
        Args:
            dept_id: 学院ID
            
        Returns:
            用户ID列表
        """
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                query = "SELECT id FROM users WHERE dept_id = %s"
                await cursor.execute(query, (dept_id,))
                results = await cursor.fetchall()
                
                user_ids = [row[0] for row in results]
                print(f"📊 学院ID {dept_id} 下属用户数量: {len(user_ids)}")
                return user_ids
    
    async def get_research_items_by_users(self, user_ids: List[int]) -> List[Dict]:
        """
        根据用户ID列表获取所有科研项目
        
        Args:
            user_ids: 用户ID列表
            
        Returns:
            科研项目列表
        """
        if not user_ids:
            return []
            
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # 构建IN查询的占位符
                placeholders = ','.join(['%s'] * len(user_ids))
                query = f"""
                SELECT 
                    ri.id, 
                    ri.user_id, 
                    ri.subtype_id, 
                    ri.status, 
                    ri.content_json,
                    ri.created_at,
                    rs.name as subtype_name
                FROM research_items ri
                JOIN research_subtypes rs ON ri.subtype_id = rs.id
                WHERE ri.user_id IN ({placeholders})
                ORDER BY ri.created_at DESC
                """
                
                await cursor.execute(query, user_ids)
                results = await cursor.fetchall()
                
                items = []
                for row in results:
                    item = {
                        'id': row[0],
                        'user_id': row[1],
                        'subtype_id': row[2],
                        'status': row[3],
                        'content_json': json.loads(row[4]) if row[4] else {},
                        'created_at': row[5],
                        'subtype_name': row[6]
                    }
                    items.append(item)
                
                print(f"📊 科研项目总数: {len(items)}")
                return items
    
    def calculate_statistics(self, research_items: List[Dict]) -> Dict:
        """
        计算统计指标
        
        Args:
            research_items: 科研项目列表
            
        Returns:
            统计结果字典
        """
        if not research_items:
            return self._get_empty_statistics()
        
        # 基础统计
        total_items = len(research_items)
        approved_count = len([item for item in research_items if item['status'] == 'approved'])
        pending_count = len([item for item in research_items if item['status'] == 'pending'])
        rejected_count = len([item for item in research_items if item['status'] == 'rejected'])
        draft_count = len([item for item in research_items if item['status'] == 'draft'])
        
        # 通过率计算（分母为0时显示0%）
        pass_rate = (approved_count / total_items * 100) if total_items > 0 else 0
        
        # 按subtype统计
        subtype_stats = {}
        for item in research_items:
            subtype_name = item['subtype_name']
            if subtype_name not in subtype_stats:
                subtype_stats[subtype_name] = {
                    'count': 0,
                    'approved': 0,
                    'pending': 0,
                    'rejected': 0,
                    'draft': 0
                }
            
            subtype_stats[subtype_name]['count'] += 1
            if item['status'] == 'approved':
                subtype_stats[subtype_name]['approved'] += 1
            elif item['status'] == 'pending':
                subtype_stats[subtype_name]['pending'] += 1
            elif item['status'] == 'rejected':
                subtype_stats[subtype_name]['rejected'] += 1
            elif item['status'] == 'draft':
                subtype_stats[subtype_name]['draft'] += 1
        
        # 经费统计（从content_json中提取）
        funding_total = 0.0
        for item in research_items:
            content = item['content_json']
            if content and 'total_funding' in content:
                try:
                    funding = float(content['total_funding'])
                    funding_total += funding
                except (ValueError, TypeError):
                    pass
        
        # 按状态分组的时间趋势（按月份）
        monthly_stats = {}
        for item in research_items:
            if item['created_at']:
                month_key = item['created_at'].strftime('%Y-%m')
                if month_key not in monthly_stats:
                    monthly_stats[month_key] = {
                        'total': 0,
                        'approved': 0,
                        'pending': 0,
                        'rejected': 0
                    }
                
                monthly_stats[month_key]['total'] += 1
                if item['status'] == 'approved':
                    monthly_stats[month_key]['approved'] += 1
                elif item['status'] == 'pending':
                    monthly_stats[month_key]['pending'] += 1
                elif item['status'] == 'rejected':
                    monthly_stats[month_key]['rejected'] += 1
        
        return {
            'total_items': total_items,
            'approved_count': approved_count,
            'pending_count': pending_count,
            'rejected_count': rejected_count,
            'draft_count': draft_count,
            'pass_rate': round(pass_rate, 2),
            'funding_total': round(funding_total, 2),
            'subtype_statistics': subtype_stats,
            'monthly_statistics': monthly_stats
        }
    
    def _get_empty_statistics(self) -> Dict:
        """返回空统计结果"""
        return {
            'total_items': 0,
            'approved_count': 0,
            'pending_count': 0,
            'rejected_count': 0,
            'draft_count': 0,
            'pass_rate': 0.0,
            'funding_total': 0.0,
            'subtype_statistics': {},
            'monthly_statistics': {}
        }
    
    async def get_department_statistics(self, department_name: str) -> Dict:
        """
        获取指定学院的完整统计信息
        
        Args:
            department_name: 学院名称
            
        Returns:
            统计结果字典
        """
        print(f"\n🎯 开始统计学院: {department_name}")
        print("=" * 60)
        
        # 1. 获取学院ID
        dept_id = await self.get_department_id_by_name(department_name)
        if not dept_id:
            return {
                'department_name': department_name,
                'error': f'未找到学院: {department_name}',
                **self._get_empty_statistics()
            }
        
        # 2. 获取学院用户
        user_ids = await self.get_users_by_department(dept_id)
        if not user_ids:
            return {
                'department_name': department_name,
                'dept_id': dept_id,
                'error': '该学院暂无用户',
                **self._get_empty_statistics()
            }
        
        # 3. 获取科研项目
        research_items = await self.get_research_items_by_users(user_ids)
        
        # 4. 计算统计指标
        statistics = self.calculate_statistics(research_items)
        
        result = {
            'department_name': department_name,
            'dept_id': dept_id,
            'user_count': len(user_ids),
            **statistics
        }
        
        return result

async def main():
    """主函数 - 测试脚本功能"""
    
    # 创建统计器实例
    stats = DepartmentResearchStatistics(DB_CONFIG)
    
    # 建立数据库连接
    if not await stats.connect():
        print("❌ 无法连接到数据库，请检查数据库配置")
        return
    
    try:
        # 测试统计功能
        test_departments = [
            "计算机科学与技术学院",
            "计算机学院",  # 可能存在的别名
            "物理系"
        ]
        
        for dept_name in test_departments:
            print(f"\n{'='*80}")
            result = await stats.get_department_statistics(dept_name)
            
            # 显示统计结果
            print(f"\n📊 {result['department_name']} 科研统计结果:")
            print(f"   学院ID: {result.get('dept_id', 'N/A')}")
            print(f"   用户数量: {result.get('user_count', 0)}")
            print(f"   科研项目总数: {result['total_items']}")
            print(f"   已通过: {result['approved_count']}")
            print(f"   待审核: {result['pending_count']}")
            print(f"   已驳回: {result['rejected_count']}")
            print(f"   草稿: {result['draft_count']}")
            print(f"   通过率: {result['pass_rate']}%")
            print(f"   总经费: {result['funding_total']} 万元")
            
            # 显示各类型项目统计
            if result['subtype_statistics']:
                print(f"\n   📋 各类型项目统计:")
                for subtype, stats in result['subtype_statistics'].items():
                    print(f"      {subtype}: {stats['count']}项 (通过: {stats['approved']}, 待审: {stats['pending']}, 驳回: {stats['rejected']}, 草稿: {stats['draft']})")
            
            # 显示月度趋势
            if result['monthly_statistics']:
                print(f"\n   📈 月度申报趋势:")
                for month, monthly_stats in sorted(result['monthly_statistics'].items()):
                    print(f"      {month}: 总数{monthly_stats['total']} (通过{monthly_stats['approved']}, 待审{monthly_stats['pending']}, 驳回{monthly_stats['rejected']})")
            
            if 'error' in result:
                print(f"⚠️  警告: {result['error']}")
            
            print(f"\n✅ {dept_name} 统计完成")
            print("-" * 60)
    
    finally:
        # 关闭数据库连接
        await stats.close()

if __name__ == "__main__":
    print("🚀 学院科研项目统计脚本启动")
    print("=" * 60)
    
    # 运行异步主函数
    asyncio.run(main())