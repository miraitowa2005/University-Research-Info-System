import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { ResearchCategory } from '../models/ResearchCategory';
import { ResearchSubtype } from '../models/ResearchSubtype';
import { ResearchItem } from '../models/ResearchItem';

interface DeptDef { code: string; name: string; }

const DEPTS: DeptDef[] = [
  { code: 'cs', name: '计算机学院' },
  { code: 'mat', name: '材料学院' },
  { code: 'med', name: '医学院' },
];

const SUBTYPES = ['纵向项目', '横向项目'] as const;
const BANDS = [
  { key: 'lt50', label: '<50万', min: 10, max: 49 },
  { key: '50to100', label: '50-100万', min: 50, max: 100 },
  { key: 'gt100', label: '>100万', min: 101, max: 300 }
] as const;

function parseCount() {
  const args = process.argv.slice(2);
  let count = 10; // default per (dept x subtype x band)
  for (const a of args) {
    const m = a.match(/^--count=(\d+)$/);
    if (m) count = parseInt(m[1], 10) || count;
  }
  return count;
}

function randomInRange(min: number, max: number) { // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateInLastDays(days: number) {
  const now = Date.now();
  const start = now - days * 24 * 3600 * 1000;
  const t = start + Math.random() * (now - start);
  return new Date(t);
}

function randomTitle(prefix: string, dept: string, subtype: string, bandLabel: string, i: number) {
  return `维度演示-${dept}-${subtype}-${bandLabel}（${String(i).padStart(2, '0')}）`;
}

async function ensureCategoryAndSubtypes() {
  const [cat] = await ResearchCategory.findOrCreate({
    where: { name: '科研项目' },
    defaults: { name: '科研项目', sort_order: 1, is_active: true as any }
  } as any);

  const subIds: Record<string, number> = {};
  for (const s of SUBTYPES) {
    const [sub] = await ResearchSubtype.findOrCreate({
      where: { name: s },
      defaults: {
        name: s,
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
    subIds[s] = (sub as any).id;
  }
  return subIds;
}

async function ensureDeptAndTeacher(dept: DeptDef) {
  const [d] = await Department.findOrCreate({
    where: { code: dept.code },
    defaults: { code: dept.code, name: dept.name, level: 1 as any, is_active: true as any }
  } as any);

  const username = `teacher_${dept.code}`;
  const [u] = await User.findOrCreate({
    where: { username },
    defaults: {
      username,
      password_hash: await bcrypt.hash('123', 10),
      real_name: `${dept.name}示例教师`,
      email: `${username}@example.com`,
      dept_id: (d as any).id,
      is_active: true as any,
    }
  } as any);

  return { dept: d as any, user: u as any };
}

function mkContent(i: number, amount: number) {
  const agencies = ['国家自然科学基金委', '科技部', '省科技厅', '市科委'];
  const start = randomDateInLastDays(180);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 24);
  return {
    project_no: `DIM-${Date.now()}-${i}-${Math.floor(Math.random()*1000)}`,
    funding_agency: agencies[Math.floor(Math.random() * agencies.length)],
    amount,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10)
  } as any;
}

async function main() {
  const count = parseCount();
  console.log('[dimensions] plan: per cell count =', count);

  await sequelize.authenticate();
  await sequelize.sync();

  const subIds = await ensureCategoryAndSubtypes();

  let total = 0;
  for (const dept of DEPTS) {
    const { dept: d, user } = await ensureDeptAndTeacher(dept);

    for (const subtype of SUBTYPES) {
      const subtypeId = subIds[subtype];

      for (const band of BANDS) {
        for (let i = 1; i <= count; i++) {
          const amount = randomInRange(band.min, band.max);
          const submit = randomDateInLastDays(90);
          await ResearchItem.create({
            title: randomTitle('维度演示', d.name, subtype, band.label, i),
            user_id: user.id,
            subtype_id: subtypeId,
            content_json: mkContent(i, amount),
            status: 'pending' as any,
            submit_time: submit,
            approve_time: null,
            audit_remarks: null,
            created_at: submit,
            updated_at: submit,
          } as any);
          total++;
        }
        console.log(`[dimensions] ${d.name} - ${subtype} - ${band.label}: +${count}`);
      }
    }
  }

  console.log(`[dimensions] done. inserted = ${total}`);
  await sequelize.close();
}

main().catch(err => { console.error('[dimensions] error:', err); process.exit(1); });

