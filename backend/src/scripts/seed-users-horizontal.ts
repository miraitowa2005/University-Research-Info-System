import 'dotenv/config';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { ResearchCategory } from '../models/ResearchCategory';
import { ResearchSubtype } from '../models/ResearchSubtype';
import { ResearchItem } from '../models/ResearchItem';
import '../models';

const USERS = [
  { username: '123@123.com' },
  { username: '234@234.com' },
  { username: '345@345.com' },
];

function randBetween(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function dateShift(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function mkContent(i: number) {
  const agencies = ['国家自然科学基金委', '科技部', '省科技厅', '市科委'];
  const amount = randBetween(30, 150);
  const start = dateShift(randBetween(15, 120));
  const end = new Date(start); end.setMonth(end.getMonth() + 12);
  return {
    project_no: `HUSR-${Date.now()}-${i}-${Math.floor(Math.random()*1000)}`,
    funding_agency: agencies[Math.floor(Math.random() * agencies.length)],
    amount,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10)
  } as any;
}

async function ensureHorizontalSubtype() {
  const [cat] = await ResearchCategory.findOrCreate({
    where: { name: '科研项目' },
    defaults: { name: '科研项目', sort_order: 1, is_active: true as any }
  } as any);
  const [sub] = await ResearchSubtype.findOrCreate({
    where: { name: '横向项目' },
    defaults: {
      name: '横向项目',
      category_id: (cat as any).id,
      required_fields_json: {
        contract_no: { type: 'string' },
        partner: { type: 'string' },
        amount: { type: 'number' },
        start_date: { type: 'date' },
        end_date: { type: 'date' }
      },
      is_active: true as any
    }
  } as any);
  return (sub as any).id as number;
}

async function createItemsForUser(userId: number, subtypeId: number) {
  const statuses: Array<'pending'|'approved'|'rejected'> = ['pending','approved','pending','rejected','approved','pending'];
  let i = 1;
  for (const st of statuses) {
    const submit = dateShift(randBetween(1, 20));
    const approve = st === 'approved' ? dateShift(randBetween(0, 10)) : null;
    await ResearchItem.create({
      title: `用户横向项目（${i.toString().padStart(2,'0')}）`,
      user_id: userId as any,
      subtype_id: subtypeId as any,
      content_json: mkContent(i),
      status: st as any,
      submit_time: submit,
      approve_time: st === 'approved' ? approve : null,
      audit_remarks: st === 'rejected' ? '合同信息缺失，请补充相关资料。' : null,
      created_at: submit,
      updated_at: approve ?? submit,
    } as any);
    i++;
  }
}

async function main() {
  console.log('[users-horizontal] start');
  await sequelize.authenticate();
  await sequelize.sync();
  const subtypeId = await ensureHorizontalSubtype();

  let processed = 0;
  for (const u of USERS) {
    const user = await User.findOne({ where: { username: u.username } });
    if (!user) { console.warn(`[users-horizontal] 用户未找到，跳过: ${u.username}`); continue; }
    await createItemsForUser((user as any).id, subtypeId);
    processed++;
    console.log(`[users-horizontal] 完成: ${u.username}`);
  }

  console.log(`[users-horizontal] done. processed=${processed}/${USERS.length}`);
  await sequelize.close();
}

main().catch(err => { console.error('[users-horizontal] error:', err); process.exit(1); });

