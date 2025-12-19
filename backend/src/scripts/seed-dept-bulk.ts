import 'dotenv/config';
import { sequelize } from '../config/database';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { ResearchCategory } from '../models/ResearchCategory';
import { ResearchSubtype } from '../models/ResearchSubtype';
import { ResearchItem } from '../models/ResearchItem';
import bcrypt from 'bcryptjs';
import '../models';

function parseArgs() {
  const args = process.argv.slice(2);
  let dept = 'cs';
  let status: 'pending'|'approved'|'rejected' = 'approved';
  let count = 40;
  for (const a of args) {
    if (a.startsWith('--dept=')) dept = a.split('=')[1];
    if (a.startsWith('--status=')) status = a.split('=')[1] as any;
    if (a.startsWith('--count=')) count = parseInt(a.split('=')[1], 10) || count;
  }
  return { dept, status, count };
}

function randBetween(a: number, b: number) { return Math.floor(Math.random()*(b-a+1))+a; }
function dateShift(days: number) { const d=new Date(); d.setDate(d.getDate()-days); return d; }

function mkContent(i: number) {
  const agencies = ['国家自然科学基金委','科技部','省科技厅','市科委'];
  const amount = randBetween(30,200);
  const start = dateShift(randBetween(5,180));
  const end = new Date(start); end.setMonth(end.getMonth()+24);
  return {
    project_no: `DEPT-${Date.now()}-${i}-${Math.floor(Math.random()*1000)}`,
    funding_agency: agencies[Math.floor(Math.random()*agencies.length)],
    amount,
    start_date: start.toISOString().slice(0,10),
    end_date: end.toISOString().slice(0,10)
  } as any;
}

async function ensureSubtype(name: string) {
  const [cat] = await ResearchCategory.findOrCreate({ where: { name: '科研项目' }, defaults: { name: '科研项目', sort_order: 1, is_active: true as any } } as any);
  const [sub] = await ResearchSubtype.findOrCreate({ where: { name }, defaults: { name, category_id: (cat as any).id, required_fields_json: {}, is_active: true as any } } as any);
  return (sub as any).id as number;
}

async function ensureDeptTeacher(deptCode: string, deptName: string) {
  const [dept] = await Department.findOrCreate({ where: { code: deptCode }, defaults: { code: deptCode, name: deptName || deptCode, level: 1 as any, is_active: true as any } } as any);
  // try find any user in this department
  const anyUser = await User.findOne({ where: { dept_id: (dept as any).id } });
  if (anyUser) return { dept: dept as any, user: anyUser as any };
  // else create a demo teacher for this dept
  const username = `teacher_demo_${deptCode}`;
  const [user] = await User.findOrCreate({
    where: { username },
    defaults: { username, password_hash: await bcrypt.hash('123',10), real_name: `${deptName||deptCode}批量教师`, email: `${username}@example.com`, dept_id: (dept as any).id, is_active: true as any }
  } as any);
  return { dept: dept as any, user: user as any };
}

async function main(){
  const { dept, status, count } = parseArgs();
  console.log('[dept-bulk] plan:', { dept, status, count });
  await sequelize.authenticate();
  await sequelize.sync();

  // simple code->name map
  const nameMap: Record<string,string> = { cs:'计算机学院', mat:'材料学院', med:'医学院' };
  const { dept: deptModel, user } = await ensureDeptTeacher(dept, nameMap[dept]||dept);

  const subtypeId = await ensureSubtype('纵向项目');

  let created=0;
  for (let i=1;i<=count;i++){
    const submit = dateShift(randBetween(1,60));
    const approve = status==='approved' ? dateShift(randBetween(0,30)) : null;
    await ResearchItem.create({
      title: `院系对比项目（${deptModel.name}-${status}-${String(i).padStart(3,'0')}）`,
      user_id: user.id,
      subtype_id: subtypeId,
      content_json: mkContent(i),
      status: status as any,
      submit_time: submit,
      approve_time: status==='approved'?approve:null,
      audit_remarks: status==='rejected'?'资料不完整，退回修改。':null,
      created_at: submit,
      updated_at: approve ?? submit,
    } as any);
    created++;
  }
  console.log(`[dept-bulk] done. created=${created} for dept=${deptModel.name} user=${user.username}`);
  await sequelize.close();
}

main().catch(err=>{console.error('[dept-bulk] error:', err); process.exit(1);});

