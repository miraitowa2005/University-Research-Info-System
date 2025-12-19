import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { Department } from '../models/Department';
import { Title } from '../models/Title';
import { Role } from '../models/Role';
import { ResearchCategory } from '../models/ResearchCategory';
import { ResearchSubtype } from '../models/ResearchSubtype';
import { ResearchItem } from '../models/ResearchItem';
import { ResearchTag } from '../models/ResearchTag';
import '../models'; // ensure associations are initialized

interface SeedUser {
  username: string; // registered username (email)
  real_name: string;
  email: string;
  deptCode: string;
  deptName: string;
  tags: string[];
}

const USERS: SeedUser[] = [
  { username: '123@123.com', real_name: '柴泽同', email: '123@123.com', deptCode: 'cs',  deptName: '计算机学院', tags: ['人工智能','大数据'] },
  { username: '234@234.com', real_name: '孙朝阳', email: '234@234.com', deptCode: 'mat', deptName: '材料学院',   tags: ['新材料','智能制造'] },
  { username: '345@345.com', real_name: '李汶骏', email: '345@345.com', deptCode: 'med', deptName: '医学院',     tags: ['医疗影像','生物医药'] },
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
  const amount = randBetween(20, 180);
  const start = dateShift(randBetween(30, 200));
  const end = new Date(start); end.setMonth(end.getMonth() + 18);
  return {
    project_no: `USR-${Date.now()}-${i}-${Math.floor(Math.random()*1000)}`,
    funding_agency: agencies[Math.floor(Math.random() * agencies.length)],
    amount,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10)
  } as any;
}

async function ensureDept(code: string, name: string) {
  const [dept] = await Department.findOrCreate({
    where: { code },
    defaults: { code, name, level: 1 as any, is_active: true as any }
  } as any);
  return dept as any;
}

async function ensureTitle() {
  const [title] = await Title.findOrCreate({
    where: { name: '研究员' },
    defaults: { name: '研究员', level: 1 as any }
  } as any);
  return title as any;
}

async function ensureTeacherRole() {
  const [role] = await Role.findOrCreate({
    where: { code: 'teacher' },
    defaults: { name: '教师', code: 'teacher', description: '普通教师用户', is_system: true as any }
  } as any);
  return role as any;
}

async function ensureCategorySubtype() {
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

async function ensureTags(names: string[]) {
  const tagModels: any[] = [];
  for (const n of names) {
    const [t] = await ResearchTag.findOrCreate({ where: { name: n }, defaults: { name: n } });
    tagModels.push(t);
  }
  return tagModels;
}

async function createItemsForUser(userId: number, subtypeId: number) {
  const statuses: Array<'pending'|'approved'|'rejected'> = ['pending','approved','pending','rejected','approved','pending'];
  let i = 1;
  for (const st of statuses) {
    const submit = dateShift(randBetween(1, 30));
    const approve = st === 'approved' ? dateShift(randBetween(0, 15)) : null;
    await ResearchItem.create({
      title: `用户演示项目（${i.toString().padStart(2,'0')}）`,
      user_id: userId as any,
      subtype_id: subtypeId as any,
      content_json: mkContent(i),
      status: st as any,
      submit_time: submit,
      approve_time: st === 'approved' ? approve : null,
      audit_remarks: st === 'rejected' ? '资料不完整，请根据模板补充信息后重新提交。' : null,
      created_at: submit,
      updated_at: approve ?? submit,
    } as any);
    i++;
  }
}

async function main() {
  console.log('[users-extras] start');
  await sequelize.authenticate();
  await sequelize.sync();

  const title = await ensureTitle();
  const teacherRole = await ensureTeacherRole();
  const { subtypeId } = await ensureCategorySubtype();

  let processed = 0;
  for (const u of USERS) {
    const dept = await ensureDept(u.deptCode, u.deptName);

    const user = await User.findOne({ where: { username: u.username } });
    if (!user) {
      console.warn(`[users-extras] 用户未找到，跳过: ${u.username}`);
      continue;
    }

    // update profile fields
    await user.update({
      real_name: u.real_name,
      email: u.email,
      dept_id: (dept as any).id,
      title_id: (title as any).id,
      is_active: true as any
    } as any);

    // role binding
    await (user as any).addRole(teacherRole);

    // tags binding
    const tags = await ensureTags(u.tags);
    await (user as any).setTags([]); // clear existing to avoid duplicates
    await (user as any).addTags(tags);

    // research items
    await createItemsForUser((user as any).id, subtypeId);

    processed++;
    console.log(`[users-extras] 完成: ${u.username}`);
  }

  console.log(`[users-extras] done. processed=${processed}/${USERS.length}`);
  await sequelize.close();
}

main().catch(err => { console.error('[users-extras] error:', err); process.exit(1); });

