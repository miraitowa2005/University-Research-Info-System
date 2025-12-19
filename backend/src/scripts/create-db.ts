import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const host = (process.env.DB_HOST || '127.0.0.1').trim();
  const port = Number(process.env.DB_PORT || 3306);
  const user = (process.env.DB_USER || 'root').trim();
  const pass = process.env.DB_PASS || '';
  const db   = process.env.DB_NAME || 'research_db';

  console.log(`[create-db] Connecting to ${host}:${port} as ${user} ...`);
  const conn = await mysql.createConnection({ host, port, user, password: pass });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`[create-db] Ensured database exists: ${db}`);
  await conn.end();
}

main().catch(err => { console.error('[create-db] error:', err.message || err); process.exit(1); });

