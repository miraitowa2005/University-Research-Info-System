import 'dotenv/config';
import { sequelize } from '../config/database';
import { User } from '../models/User';
import { ResearchItem } from '../models/ResearchItem';
import { ResearchTag } from '../models/ResearchTag';

const USERS = ['123@123.com','234@234.com','345@345.com'];

async function main() {
  await sequelize.authenticate();
  const result: any[] = [];
  for (const username of USERS) {
    const user = await User.findOne({ where: { username } });
    if (!user) { result.push({ username, found:false }); continue; }
    const total = await ResearchItem.count({ where: { user_id: (user as any).id } });
    const pending = await ResearchItem.count({ where: { user_id: (user as any).id, status: 'pending' as any } });
    const approved = await ResearchItem.count({ where: { user_id: (user as any).id, status: 'approved' as any } });
    const rejected = await ResearchItem.count({ where: { user_id: (user as any).id, status: 'rejected' as any } });
    // Tags via raw join as simple list
    const [rows]: any = await sequelize.query(
      `SELECT t.name FROM research_tags t 
       JOIN user_tags ut ON ut.tag_id = t.id
       WHERE ut.user_id = ?`, { replacements: [(user as any).id] });
    const tags = rows.map((r: any) => r.name);
    result.push({ username, found:true, items: { total, pending, approved, rejected }, tags });
  }
  console.log(JSON.stringify(result, null, 2));
  await sequelize.close();
}

main().catch(err => { console.error(err); process.exit(1); });

