import { sequelize } from '../config/database';
import { ResearchItem } from '../models/ResearchItem';

async function main() {
  await sequelize.authenticate();
  const total = await ResearchItem.count();
  const pending = await ResearchItem.count({ where: { status: 'pending' as any } });
  const approved = await ResearchItem.count({ where: { status: 'approved' as any } });
  const rejected = await ResearchItem.count({ where: { status: 'rejected' as any } });
  console.log(JSON.stringify({ total, pending, approved, rejected }));
  await sequelize.close();
}

main().catch(err => { console.error(err); process.exit(1); });

