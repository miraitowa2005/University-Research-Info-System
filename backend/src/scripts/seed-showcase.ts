import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { ResearchItem } from '../models/ResearchItem';
import { ResearchCategory } from '../models/ResearchCategory';
import { ResearchSubtype } from '../models/ResearchSubtype';

function parseArgs() {
  const args = process.argv.slice(2);
  const res: Record<string, number> = { pending: 30, approved: 20, rejected: 10 };
  for (const a of args) {
    const m = a.match(/^--(pending|approved|rejected)=(\d+)$/);
    if (m) res[m[1]] = parseInt(m[2], 10);
  }
  return res;
}

function randomTitle(prefix: string, i: number) {
  const topics = ['人工智能', '大数据', '生物医药', '新材料', '量子计算', '智能制造', '医疗影像', '绿色能源', '智慧教育'];
  const suffix = ['研究', '关键技术', '应用', '平台搭建', '算法优化', '系统实现'];
  const t = topics[Math.floor(Math.random() * topics.length)];
  const s = suffix[Math.floor(Math.random() * suffix.length)];
  return `${t}${s}（${prefix}-${i.toString().padStart(3, '0')}）`;
}

async function ensureShowcaseUser() {
  const [user] = await User.findOrCreate({
    where: { username: 'teacher_showcase' },
    defaults: {
      username: 'teacher_showcase',
      password_hash: await bcrypt.hash('123', 10),
      real_name: '演示教师',
      email: 'teacher_showcase@example.com',
      is_active: true as any,
    }
  } as any);
  return user;
}

async function ensureCategoryAndSubtype() {
  const [cat] = await ResearchCategory.findOrCreate({
    where: { name: '科研项目' },
    defaults: { name: '科研项目', sort_order: 1, is_active: true as any }
  } as any);

  const [sub] = await ResearchSubtype.findOrCreate({
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

  return { categoryId: (cat as any).id, subtypeId: (sub as any).id };
}

function mkContent(i: number) {
  const agencies = ['国家自然科学基金委', '科技部', '省科技厅', '市科委'];
  const amount = (Math.floor(Math.random() * 90) + 10) * 1.0;
  const start = new Date();
  start.setMonth(start.getMonth() - Math.floor(Math.random() * 12));
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 2);
  return {
    project_no: `SHOW-${Date.now()}-${i}`,
    funding_agency: agencies[Math.floor(Math.random() * agencies.length)],
    amount,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10)
  } as any;
}

async function createItems(userId: number, subtypeId: number, status: 'pending' | 'approved' | 'rejected', count: number, prefix: string) {
  let created = 0;
  for (let i = 1; i <= count; i++) {
    const now = new Date();
    const submitted = new Date(now);
    submitted.setDate(now.getDate() - (5 + Math.floor(Math.random() * 20)));

    const approve = new Date(submitted);
    approve.setDate(submitted.getDate() + (1 + Math.floor(Math.random() * 5)));

    await ResearchItem.create({
      title: randomTitle(prefix, i),
      user_id: userId as any,
      subtype_id: subtypeId as any,
      content_json: mkContent(i),
      status: status as any,
      submit_time: status === 'pending' ? now : submitted,
      approve_time: status === 'approved' ? approve : null,
      audit_remarks: status === 'rejected' ? '资料不完整，请补充完善后重新提交。' : null,
      created_at: submitted,
      updated_at: status === 'pending' ? now : approve,
    } as any);
    created++;
  }
  return created;
}

async function main() {
  const cfg = parseArgs();
  console.log('[showcase] plan:', cfg);

  await sequelize.authenticate();
  await sequelize.sync();

  const user = await ensureShowcaseUser();
  const { subtypeId } = await ensureCategoryAndSubtype();

  const p1 = await createItems((user as any).id, subtypeId, 'pending', cfg.pending, '演示待审');
  const p2 = await createItems((user as any).id, subtypeId, 'approved', cfg.approved, '演示通过');
  const p3 = await createItems((user as any).id, subtypeId, 'rejected', cfg.rejected, '演示退回');

  console.log(`[showcase] done. pending=${p1}, approved=${p2}, rejected=${p3}`);
  await sequelize.close();
}

main().catch(err => {
  console.error('[showcase] error:', err);
  process.exit(1);
});

