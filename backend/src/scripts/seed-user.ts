import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { ResearchCategory } from '../models/ResearchCategory';
import { ResearchSubtype } from '../models/ResearchSubtype';
import { ResearchItem } from '../models/ResearchItem';
import { ResearchTag } from '../models/ResearchTag';
import '../models';

function parseArgs() {
  const args = process.argv.slice(2);
  const cfg: any = { username: '', vertical: 6, horizontal: 6 };
  for (const a of args) {
    if (a.startsWith('--username=')) cfg.username = a.split('=')[1];
    if (a.startsWith('--vertical=')) cfg.vertical = parseInt(a.split('=')[1], 10) || cfg.vertical;
    if (a.startsWith('--horizontal=')) cfg.horizontal = parseInt(a.split('=')[1], 10) || cfg.horizontal;
  }
  return cfg;
}

function randBetween(a: number, b: number) { return Math.floor(Math.random()*(b-a+1))+a; }
function dateShift(days: number) { const d=new Date(); d.setDate(d.getDate()-days); return d; }

function mkContent(prefix: string, i: number) {
  const agencies = ['国家自然科学基金委','科技部','省科技厅','市科委'];
  const amount = randBetween(20, 200);
  const start = dateShift(randBetween(10, 180));
  const end = new Date(start); end.setMonth(end.getMonth()+12+randBetween(0,12));
  return {
    project_no: `${prefix}-${Date.now()}-${i}-${Math.floor(Math.random()*1000)}`,
    funding_agency: agencies[Math.floor(Math.random()*agencies.length)],
    amount,
    start_date: start.toISOString().slice(0,10),
    end_date: end.toISOString().slice(0,10)
  } as any;
}

async function ensureSubtypes() {
  const [cat] = await ResearchCategory.findOrCreate({ where: { name: '科研项目' }, defaults: { name: '科研项目', sort_order: 1, is_active: true as any } } as any);
  const [v] = await ResearchSubtype.findOrCreate({ where: { name: '纵向项目' }, defaults: { name: '纵向项目', category_id: (cat as any).id, required_fields_json: {}, is_active: true as any } } as any);
  const [h] = await ResearchSubtype.findOrCreate({ where: { name: '横向项目' }, defaults: { name: '横向项目', category_id: (cat as any).id, required_fields_json: {}, is_active: true as any } } as any);
  return { verticalId: (v as any).id as number, horizontalId: (h as any).id as number };
}

async function createItems(userId: number, subtypeId: number, prefix: string, count: number) {
  const statuses: Array<'pending'|'approved'|'rejected'> = ['pending','approved','pending','rejected','approved','pending'];
  let created = 0;
  for (let i=1; i<=count; i++) {
    const st = statuses[(i-1) % statuses.length];
    const submit = dateShift(randBetween(1, 40));
    const approve = st==='approved' ? dateShift(randBetween(0, 15)) : null;
    await ResearchItem.create({
      title: `${prefix}（${String(i).padStart(2,'0')}）`,
      user_id: userId as any,
      subtype_id: subtypeId as any,
      content_json: mkContent(prefix.startsWith('纵向')?'VUSR':'HUSR', i),
      status: st as any,
      submit_time: submit,
      approve_time: st==='approved'?approve:null,
      audit_remarks: st==='rejected' ? '资料不完整，请补充后重新提交。' : null,
      created_at: submit,
      updated_at: approve ?? submit,
    } as any);
    created++;
  }
  return created;
}

async function main(){
  const cfg = parseArgs();
  if (!cfg.username) { console.error('[seed-user] 请通过 --username=邮箱 指定用户'); process.exit(1); }

  console.log('[seed-user] plan:', cfg);
  await sequelize.authenticate();
  await sequelize.sync();

  const user = await User.findOne({ where: { username: cfg.username } });
  if (!user) { console.error('[seed-user] 未找到用户:', cfg.username); process.exit(1); }

  const { verticalId, horizontalId } = await ensureSubtypes();

  // 可选：为该用户打上示例标签（若无）
  const tagNames = ['人工智能','数据挖掘','高校项目'];
  const tags: any[] = [];
  for (const n of tagNames) {
    const [t] = await ResearchTag.findOrCreate({ where: { name: n }, defaults: { name: n } });
    tags.push(t);
  }
  // @ts-ignore
  await (user as any).addTags && (user as any).addTags(tags);

  const c1 = await createItems((user as any).id, verticalId, '纵向项目-用户演示', cfg.vertical);
  const c2 = await createItems((user as any).id, horizontalId, '横向项目-用户演示', cfg.horizontal);

  console.log(`[seed-user] done for ${cfg.username}. vertical=${c1}, horizontal=${c2}`);
  await sequelize.close();
}

main().catch(err=>{ console.error('[seed-user] error:', err); process.exit(1); });

