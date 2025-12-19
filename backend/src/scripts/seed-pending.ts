import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { ResearchItem } from '../models/ResearchItem';
import { ResearchCategory } from '../models/ResearchCategory';
import { ResearchSubtype } from '../models/ResearchSubtype';

function parseCount(): number {
  const args = process.argv.slice(2);
  let count = 50;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10) || count;
    } else if (a.startsWith('--count=')) {
      count = parseInt(a.split('=')[1], 10) || count;
    }
  }
  return count;
}

function randomTitle(i: number) {
  const topics = ['人工智能', '大数据', '生物医药', '新材料', '量子计算', '智能制造', '医疗影像', '绿色能源', '智慧教育'];
  const suffix = ['研究', '关键技术', '应用', '平台搭建', '算法优化', '系统实现'];
  const t = topics[Math.floor(Math.random() * topics.length)];
  const s = suffix[Math.floor(Math.random() * suffix.length)];
  return `${t}${s}（演示-${i.toString().padStart(3, '0')}）`;
}

async function ensureTeacherUser() {
  const [user] = await User.findOrCreate({
    where: { username: 'teacher_demo' },
    defaults: {
      username: 'teacher_demo',
      password_hash: await bcrypt.hash('123', 10),
      real_name: '示例教师',
      email: 'teacher_demo@example.com',
      is_active: true
    }
  });
  return user;
}

async function ensureCategoryAndSubtype() {
  const [cat] = await ResearchCategory.findOrCreate({
    where: { name: '科研项目' },
    defaults: { name: '科研项目', sort_order: 1, is_active: true as any }
  } as any);

  const [subtype] = await ResearchSubtype.findOrCreate({
    where: { name: '纵向项目' },
    defaults: {
      name: '纵向项目',
      category_id: (cat as any).id,
      required_fields_json: {
        project_no: { type: 'string', required: true },
        funding_agency: { type: 'string' },
        amount: { type: 'number' },
        start_date: { type: 'date' },
        end_date: { type: 'date' }
      },
      is_active: true as any
    }
  } as any);

  return { categoryId: (cat as any).id, subtypeId: (subtype as any).id };
}

function randomContent(i: number) {
  const agencies = ['国家自然科学基金委', '科技部', '省科技厅', '市科委'];
  const amount = (Math.floor(Math.random() * 90) + 10);
  const start = new Date();
  start.setMonth(start.getMonth() - Math.floor(Math.random() * 12));
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 2);
  return {
    project_no: `DEMO-${Date.now()}-${i}`,
    funding_agency: agencies[Math.floor(Math.random() * agencies.length)],
    amount,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10)
  };
}

async function main() {
  const count = parseCount();
  console.log(`[seed] preparing to create ${count} pending research items...`);

  await sequelize.authenticate();
  await sequelize.sync();

  const user = await ensureTeacherUser();
  const { subtypeId } = await ensureCategoryAndSubtype();

  let created = 0;
  for (let i = 1; i <= count; i++) {
    await ResearchItem.create({
      title: randomTitle(i),
      user_id: (user as any).id,
      subtype_id: subtypeId,
      content_json: randomContent(i) as any,
      status: 'pending' as any,
      submit_time: new Date()
    } as any);
    created++;
  }

  console.log(`[seed] done. created ${created} pending items.`);
  await sequelize.close();
}

main().catch(err => {
  console.error('[seed] error:', err);
  process.exit(1);
});

