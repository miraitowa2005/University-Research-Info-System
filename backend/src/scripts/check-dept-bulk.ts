import 'dotenv/config';
import { sequelize } from '../config/database';

function parseArgs() {
  const args = process.argv.slice(2);
  let dept = 'cs';
  for (const a of args) {
    if (a.startsWith('--dept=')) dept = a.split('=')[1];
  }
  return { dept };
}

async function main(){
  const { dept } = parseArgs();
  await sequelize.authenticate();
  const [rows]: any = await sequelize.query(
    `SELECT r.status, COUNT(*) AS cnt
     FROM research_items r
     JOIN users u ON u.id = r.user_id
     JOIN mdm_departments d ON d.id = u.dept_id
     WHERE d.code = ? AND r.title LIKE '院系对比项目（%'
     GROUP BY r.status`
  , { replacements: [dept] });
  console.log(JSON.stringify({ dept, summary: rows }, null, 2));
  await sequelize.close();
}

main().catch(err=>{ console.error(err); process.exit(1); });

