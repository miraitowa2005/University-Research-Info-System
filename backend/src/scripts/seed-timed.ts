import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { ResearchItem } from '../models/ResearchItem';
import { ResearchCategory } from '../models/ResearchCategory';
import { ResearchSubtype } from '../models/ResearchSubtype';

function parseArgs() {
  const args = process.argv.slice(2);
  const res: Record<string, number> = { pending7: 15, approvedLastMonth: 12, rejectedWeek: 8 };
  for (const a of args) {
    const m = a.match(/^--(pending7|approvedLastMonth|rejectedWeek)=(\d+)$/);
    if (m) res[m[1]] = parseInt(m[2], 10);
  }
  return res;
}

function startOfToday(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d = new Date()) {
  // ISO week starts Monday
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day === 0 ? -6 : 1 - day); // days to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return startOfToday(monday);
}

function endOfWeek(d = new Date()) {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  end.setMilliseconds(-1);
  return end;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d = new Date()) {
  const first = startOfMonth(d);
  const end = new Date(first.getFullYear(), first.getMonth() + 1, 1);
  end.setMilliseconds(-1);
  return end;
}

function randomBetween(start: Date, end: Date) {
  const s = start.getTime();
  const e = end.getTime();
  const t = s + Math.random() * (e - s);
  return new Date(t);
}

function randomTitle(prefix: string, i: number) {
  const topics = ['人工智能', '大数据', '生物医药', '新材料', '量子计算', '智能制造', '医疗影像', '绿色能源', '智慧教育'];
  const suffix = ['研究', '关键技术', '应用', '平台搭建', '算法优化', '系统实现'];
  const t = topics[Math.floor(Math.random() * topics.length)];
  const s = suffix[Math.floor(Math.random() * suffix.length)];
  return `${t}${s}（${prefix}-${i.toString().padStart(3, '0')}）`;
}

async function ensureTimedUser() {
  const [user] = await User.findOrCreate({
    where: { username: 'teacher_timed' },
    defaults: {
      username: 'teacher_timed',
      password_hash: await bcrypt.hash('123', 10),
      real_name: '时间维度演示教师',
      email: 'teacher_timed@example.com',
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
    project_no: `TIME-${Date.now()}-${i}`,
    funding_agency: agencies[Math.floor(Math.random() * agencies.length)],
    amount,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10)
  } as any;
}

async function createPendingLast7Days(userId: number, subtypeId: number, count: number) {
  const today = startOfToday(new Date());
  let created = 0;
  for (let i = 1; i <= count; i++) {
    const dayOffset = Math.floor(Math.random() * 7); // 0..6
    const day = new Date(today);
    day.setDate(today.getDate() - dayOffset);
    const submit = randomBetween(day, new Date(day.getTime() + 23 * 3600 * 1000));
    await ResearchItem.create({
      title: randomTitle('近7天待审', i),
      user_id: userId as any,
      subtype_id: subtypeId as any,
      content_json: mkContent(i),
      status: 'pending' as any,
      submit_time: submit,
      approve_time: null,
      audit_remarks: null,
      created_at: submit,
      updated_at: new Date(),
    } as any);
    created++;
  }
  return created;
}

async function createApprovedLastMonth(userId: number, subtypeId: number, count: number) {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthEnd = new Date(thisMonthStart.getTime() - 1);
  const lastMonthStart = startOfMonth(lastMonthEnd);
  let created = 0;
  for (let i = 1; i <= count; i++) {
    const approve = randomBetween(lastMonthStart, lastMonthEnd);
    const submit = new Date(approve);
    submit.setDate(approve.getDate() - (1 + Math.floor(Math.random() * 5)));
    await ResearchItem.create({
      title: randomTitle('上月通过', i),
      user_id: userId as any,
      subtype_id: subtypeId as any,
      content_json: mkContent(i),
      status: 'approved' as any,
      submit_time: submit,
      approve_time: approve,
      audit_remarks: null,
      created_at: submit,
      updated_at: approve,
    } as any);
    created++;
  }
  return created;
}

async function createRejectedThisWeek(userId: number, subtypeId: number, count: number) {
  const startWeek = startOfWeek(new Date());
  const endWeek = endOfWeek(new Date());
  let created = 0;
  for (let i = 1; i <= count; i++) {
    const rejectAt = randomBetween(startWeek, endWeek);
    const submit = new Date(rejectAt);
    submit.setDate(rejectAt.getDate() - (1 + Math.floor(Math.random() * 5)));
    await ResearchItem.create({
      title: randomTitle('本周退回', i),
      user_id: userId as any,
      subtype_id: subtypeId as any,
      content_json: mkContent(i),
      status: 'rejected' as any,
      submit_time: submit,
      approve_time: null,
      audit_remarks: '资料不完整或格式不规范，请按模板补充并重新提交。',
      created_at: submit,
      updated_at: rejectAt,
    } as any);
    created++;
  }
  return created;
}

async function main() {
  const cfg = parseArgs();
  console.log('[timed] plan:', cfg);

  await sequelize.authenticate();
  await sequelize.sync();

  const user = await ensureTimedUser();
  const { subtypeId } = await ensureCategoryAndSubtype();

  const c1 = await createPendingLast7Days((user as any).id, subtypeId, cfg.pending7);
  const c2 = await createApprovedLastMonth((user as any).id, subtypeId, cfg.approvedLastMonth);
  const c3 = await createRejectedThisWeek((user as any).id, subtypeId, cfg.rejectedWeek);

  console.log(`[timed] done. pending7=${c1}, approvedLastMonth=${c2}, rejectedWeek=${c3}`);
  await sequelize.close();
}

main().catch(err => { console.error('[timed] error:', err); process.exit(1); });

