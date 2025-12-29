#!/usr/bin/env python3
"""
测试total_funding计算逻辑
直接使用提供的JSON数据进行测试
"""

import json

def calculate_total_funding_from_json():
    """从提供的JSON数据计算total_funding累计和"""
    
    print("🔬 测试total_funding计算逻辑")
    print("="*60)
    
    # 您提供的JSON数据
    json_data_1 = {
        "end_date": "2025-12-29", 
        "start_date": "2025-04-18", 
        "project_level": "", 
        "total_funding": 54000, 
        "project_source": "国家社科基金", 
        "approval_number": "62302451"
    }
    
    json_data_2 = {
        "end_date": "2025-12-29", 
        "start_date": "2025-12-29", 
        "partner_name": "深圳市大疆创新科技有限公司", 
        "total_funding": 120, 
        "contract_number": "HT-2024-DJI-003"
    }
    
    print("📋 提供的JSON数据:")
    print(f"数据1: {json.dumps(json_data_1, ensure_ascii=False, indent=2)}")
    print(f"数据2: {json.dumps(json_data_2, ensure_ascii=False, indent=2)}")
    
    # 计算total_funding
    total_funding_1 = json_data_1.get("total_funding", 0)
    total_funding_2 = json_data_2.get("total_funding", 0)
    
    total_sum = total_funding_1 + total_funding_2
    
    print("\n" + "="*60)
    print("📈 计算结果:")
    print("="*60)
    print(f"数据1 total_funding: {total_funding_1}")
    print(f"数据2 total_funding: {total_funding_2}")
    print(f"累计和: {total_funding_1} + {total_funding_2} = {total_sum}")
    print("="*60)
    
    # 验证预期结果
    expected_result = 54120
    print(f"\n✅ 预期结果: {expected_result}")
    print(f"📊 实际计算结果: {total_sum}")
    
    if total_sum == expected_result:
        print("🎉 计算结果与预期一致！")
    else:
        print("❌ 计算结果与预期不一致！")
    
    return total_sum

def test_database_query_logic():
    """测试数据库查询逻辑"""
    
    print("\n" + "="*60)
    print("🔍 测试数据库查询逻辑")
    print("="*60)
    
    # 模拟数据库查询结果
    mock_database_results = [
        {
            "id": 1,
            "content_json": json.dumps({
                "end_date": "2025-12-29", 
                "start_date": "2025-04-18", 
                "project_level": "", 
                "total_funding": 54000, 
                "project_source": "国家社科基金", 
                "approval_number": "62302451"
            }),
            "dept_id": 1,
            "subtype_id": 1
        },
        {
            "id": 2,
            "content_json": json.dumps({
                "end_date": "2025-12-29", 
                "start_date": "2025-12-29", 
                "partner_name": "深圳市大疆创新科技有限公司", 
                "total_funding": 120, 
                "contract_number": "HT-2024-DJI-003"
            }),
            "dept_id": 1,
            "subtype_id": 2
        }
    ]
    
    print("📋 模拟数据库查询结果 (dept_id=1, subtype_id=1或2):")
    
    total_funding = 0.0
    item_count = 0
    
    for item in mock_database_results:
        item_id = item["id"]
        content_json_str = item["content_json"]
        dept_id = item["dept_id"]
        subtype_id = item["subtype_id"]
        
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
            else:
                print(f"ℹ️  记录 {item_id}: content_json为空")
                
        except json.JSONDecodeError as e:
            print(f"❌ 记录 {item_id}: JSON解析错误 - {e}")
        except Exception as e:
            print(f"❌ 处理记录 {item_id} 时出错: {e}")
    
    print("\n" + "="*60)
    print("📈 数据库查询逻辑测试结果:")
    print("="*60)
    print(f"📄 解析的记录数: {item_count}")
    print(f"💰 total_funding累计和: {total_funding:.2f}")
    print("="*60)
    
    # 验证预期结果
    expected_result = 54120
    print(f"\n✅ 预期结果: {expected_result}")
    print(f"📊 实际计算结果: {total_funding}")
    
    if total_funding == expected_result:
        print("🎉 数据库查询逻辑计算结果与预期一致！")
    else:
        print("❌ 数据库查询逻辑计算结果与预期不一致！")
    
    return total_funding

def main():
    """主函数"""
    print("🔬 total_funding计算测试脚本")
    print("="*60)
    
    # 测试直接JSON数据计算
    result1 = calculate_total_funding_from_json()
    
    # 测试数据库查询逻辑
    result2 = test_database_query_logic()
    
    print("\n" + "="*60)
    print("📊 最终测试结果汇总:")
    print("="*60)
    print(f"直接JSON计算: {result1}")
    print(f"数据库逻辑测试: {result2}")
    print(f"预期结果: 54120")
    
    if result1 == 54120 and result2 == 54120:
        print("🎉 所有测试通过！计算逻辑正确。")
    else:
        print("❌ 部分测试未通过，请检查计算逻辑。")

if __name__ == "__main__":
    main()