import 'dotenv/config';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { ResearchSubtype } from '../models/ResearchSubtype';
import { ResearchItem } from '../models/ResearchItem';
import '../models'; // Ensure associations are loaded

async function testSubmission() {
  console.log('[Test] 正在检查教师项目申报功能...');

  try {
    await sequelize.authenticate();
    console.log('[Test] 1/4: 数据库连接成功。');

    const testUser = await User.findOne({ where: { username: '123@123.com' } });
    if (!testUser) throw new Error('测试用户 123@123.com 未找到。');
    console.log(`[Test] 2/4: 测试用户 '${(testUser as any).real_name}' 已找到。`);

    const subtype = await ResearchSubtype.findOne({ where: { name: '纵向项目' } });
    if (!subtype) throw new Error('科研子类 "纵向项目" 未找到。');
    console.log(`[Test] 3/4: 科研子类 '${(subtype as any).name}' 已找到。`);

    const testData = {
      title: `自动化测试项目 - ${new Date().getTime()}`,
      user_id: (testUser as any).id,
      subtype_id: (subtype as any).id,
      status: 'draft' as const,
      content_json: {
        project_no: 'TEST-2025-001',
        funding: 123.45,
        start_date: '2025-01-01',
      },
    };

    const newItem = await ResearchItem.create(testData as any);
    console.log(`[Test] 4/4: 项目创建成功，ID: ${newItem.id}。`);

    // Verification step
    const createdItem = await ResearchItem.findByPk(newItem.id);
    if (!createdItem) throw new Error('验证失败：创建的项目在数据库中未找到。');
    if (createdItem.title !== testData.title) throw new Error('验证失败：标题不匹配。');
    if ((createdItem as any).content_json.funding !== testData.content_json.funding) throw new Error('验证失败：经费数据不匹配。');

    console.log('\n[成功] 项目申报功能健全。数据已成功创建并验证。');
    
    // Clean up the test data
    await createdItem.destroy();
    console.log(`[清理] 已删除测试项目 ID: ${newItem.id}。`);

  } catch (error: any) {
    console.error('\n[失败] 项目申报功能测试失败:', error.message);
    return false;
  } finally {
    await sequelize.close();
  }
  return true;
}

testSubmission();

