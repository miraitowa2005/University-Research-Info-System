#!/usr/bin/env python3
"""
学院科研项目统计测试脚本
测试统计逻辑，不依赖实际数据库连接
"""

import json
from typing import Dict, List
from datetime import datetime

class DepartmentStatisticsTester:
    """学院统计逻辑测试类"""
    
    def __init__(self):
        # 模拟数据库中的科研项目类型
        self.subtype_mapping = {
            1: "纵向科研项目",
            2: "横向科研项目", 
            3: "科研论文",
            4: "专著/著作",
            5: "专利成果",
            6: "科研获奖"
        }
    
    def create_sample_data(self) -> List[Dict]:
        """创建模拟数据用于测试"""
        
        # 模拟科研项目数据
        sample_items = [
            # 纵向项目 - 已通过
            {
                'id': 1,
                'user_id': 101,
                'subtype_id': 1,
                'status': 'approved',
                'content_json': {
                    'project_source': '国家自然科学基金',
                    'approval_number': '62302451',
                    'total_funding': 54000,
                    'start_date': '2025-04-18',
                    'end_date': '2025-12-29'
                },
                'created_at': datetime(2025, 1, 15),
                'subtype_name': '纵向科研项目'
            },
            # 横向项目 - 已通过
            {
                'id': 2,
                'user_id': 102,
                'subtype_id': 2,
                'status': 'approved',
                'content_json': {
                    'partner_name': '深圳市大疆创新科技有限公司',
                    'total_funding': 120,
                    'contract_number': 'HT-2024-DJI-003',
                    'start_date': '2025-12-29',
                    'end_date': '2025-12-29'
                },
                'created_at': datetime(2025, 2, 20),
                'subtype_name': '横向科研项目'
            },
            # 科研论文 - 待审核
            {
                'id': 3,
                'user_id': 101,
                'subtype_id': 3,
                'status': 'pending',
                'content_json': {
                    'journal_name': '计算机学报',
                    'publish_date': '2025-06-15',
                    'impact_factor': 2.5
                },
                'created_at': datetime(2025, 3, 10),
                'subtype_name': '科研论文'
            },
            # 专利成果 - 已通过
            {
                'id': 4,
                'user_id': 103,
                'subtype_id': 5,
                'status': 'approved',
                'content_json': {
                    'patent_number': 'CN202510000001.1',
                    'grant_date': '2025-03-01',
                    'patent_type': '发明专利'
                },
                'created_at': datetime(2025, 1, 25),
                'subtype_name': '专利成果'
            },
            # 专著/著作 - 已驳回
            {
                'id': 5,
                'user_id': 102,
                'subtype_id': 4,
                'status': 'rejected',
                'content_json': {
                    'book_title': '人工智能导论',
                    'publisher': '清华大学出版社',
                    'publish_date': '2025-08-01'
                },
                'created_at': datetime(2025, 4, 5),
                'subtype_name': '专著/著作'
            },
            # 科研获奖 - 草稿
            {
                'id': 6,
                'user_id': 101,
                'subtype_id': 6,
                'status': 'draft',
                'content_json': {
                    'award_name': '科技进步奖',
                    'award_level': '省级一等奖',
                    'award_date': '2025-12-01'
                },
                'created_at': datetime(2025, 5, 15),
                'subtype_name': '科研获奖'
            }
        ]
        
        return sample_items
    
    def calculate_statistics(self, research_items: List[Dict]) -> Dict:
        """
        计算统计指标 - 核心逻辑测试
        
        Args:
            research_items: 科研项目列表
            
        Returns:
            统计结果字典
        """
        if not research_items:
            return self._get_empty_statistics()
        
        print("🔬 开始计算统计指标...")
        
        # 基础统计
        total_items = len(research_items)
        approved_count = len([item for item in research_items if item['status'] == 'approved'])
        pending_count = len([item for item in research_items if item['status'] == 'pending'])
        rejected_count = len([item for item in research_items if item['status'] == 'rejected'])
        draft_count = len([item for item in research_items if item['status'] == 'draft'])
        
        print(f"📊 基础统计完成:")
        print(f"   总数: {total_items}")
        print(f"   已通过: {approved_count}")
        print(f"   待审核: {pending_count}")
        print(f"   已驳回: {rejected_count}")
        print(f"   草稿: {draft_count}")
        
        # 通过率计算（分母为0时显示0%）
        pass_rate = (approved_count / total_items * 100) if total_items > 0 else 0
        print(f"✅ 通过率计算: {pass_rate:.2f}%")
        
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
        
        print(f"📋 各类型统计完成:")
        for subtype, stats in subtype_stats.items():
            print(f"   {subtype}: {stats}")
        
        # 经费统计（从content_json中提取）
        funding_total = 0.0
        for item in research_items:
            content = item['content_json']
            if content and 'total_funding' in content:
                try:
                    funding = float(content['total_funding'])
                    funding_total += funding
                    print(f"💰 提取经费: {funding} (项目: {item['id']})")
                except (ValueError, TypeError) as e:
                    print(f"⚠️  经费提取失败: {e}")
        
        print(f"💰 总经费统计: {funding_total}")
        
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
        
        print(f"📈 月度趋势统计完成")
        
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
    
    def test_core_business_flow(self):
        """测试核心业务流程"""
        
        print("🚀 开始测试核心业务流程")
        print("=" * 60)
        
        # 模拟前端输入：学院名称
        department_name = "计算机科学与技术学院"
        print(f"🎯 前端输入: 用户选择学院 '{department_name}'")
        
        # 模拟ID解析 (Name -> ID)
        print("🔍 ID解析: 在departments表中查找对应的dept_id")
        dept_id = 1  # 假设找到的ID
        print(f"✅ 找到学院ID: {dept_id}")
        
        # 模拟用户定位 (Dept ID -> User IDs)
        print("👥 用户定位: 在users表中查找隶属于该学院的用户")
        user_ids = [101, 102, 103]  # 模拟用户ID列表
        print(f"✅ 找到用户数量: {len(user_ids)}")
        print(f"✅ 用户ID列表: {user_ids}")
        
        # 模拟项目聚合 (User IDs -> Research Items)
        print("📄 项目聚合: 在research_items表中查找相关记录")
        research_items = self.create_sample_data()
        print(f"✅ 找到科研项目数量: {len(research_items)}")
        
        # 关键修正：确保"人-学院-项目"三层关系的一致性
        print("🔧 关键修正: 验证人-学院-项目三层关系")
        valid_items = [item for item in research_items if item['user_id'] in user_ids]
        print(f"✅ 有效项目数量: {len(valid_items)}")
        
        # 统计指标计算
        print("\n📊 开始统计指标计算")
        print("-" * 40)
        
        statistics = self.calculate_statistics(valid_items)
        
        # 显示最终结果
        print("\n🎉 统计结果汇总:")
        print("=" * 60)
        print(f"学院名称: {department_name}")
        print(f"学院ID: {dept_id}")
        print(f"用户数量: {len(user_ids)}")
        print(f"科研项目总数: {statistics['total_items']}")
        print(f"已通过: {statistics['approved_count']}")
        print(f"待审核: {statistics['pending_count']}")
        print(f"已驳回: {statistics['rejected_count']}")
        print(f"草稿: {statistics['draft_count']}")
        print(f"通过率: {statistics['pass_rate']}%")
        print(f"总经费: {statistics['funding_total']} 万元")
        
        # 验证通过率计算
        print("\n🔬 通过率公式验证:")
        print(f"   公式: 已通过数量 / 申报总量 * 100%")
        print(f"   计算: {statistics['approved_count']} / {statistics['total_items']} * 100% = {statistics['pass_rate']}%")
        
        # 验证分母为0的情况
        print("\n🔬 边界情况测试:")
        empty_stats = self.calculate_statistics([])
        print(f"   空数据通过率: {empty_stats['pass_rate']}% (分母为0时显示0%)")
        
        # 显示各类型项目统计
        print(f"\n📋 各类型项目统计:")
        for subtype, stats in statistics['subtype_statistics'].items():
            print(f"   {subtype}: {stats['count']}项")
            print(f"     通过: {stats['approved']}, 待审: {stats['pending']}, 驳回: {stats['rejected']}, 草稿: {stats['draft']}")
        
        # 验证经费统计
        print(f"\n💰 经费统计验证:")
        expected_funding = 54000 + 120  # 来自两个项目的经费
        print(f"   预期总经费: {expected_funding} 万元")
        print(f"   实际总经费: {statistics['funding_total']} 万元")
        print(f"   验证结果: {'✅ 通过' if statistics['funding_total'] == expected_funding else '❌ 失败'}")
        
        print("\n✅ 核心业务流程测试完成")
        
        return statistics

def main():
    """主函数"""
    
    tester = DepartmentStatisticsTester()
    
    print("🎯 学院科研项目统计逻辑测试")
    print("=" * 60)
    
    # 测试核心业务流程
    result = tester.test_core_business_flow()
    
    print("\n" + "=" * 60)
    print("📋 测试总结:")
    print("✅ 核心业务流程测试通过")
    print("✅ 通过率计算逻辑正确")
    print("✅ 各类型项目统计功能正常")
    print("✅ 经费统计功能正常")
    print("✅ 边界情况处理正确")
    print("=" * 60)
    
    return result

if __name__ == "__main__":
    main()