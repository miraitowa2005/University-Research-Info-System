import { Sequelize } from 'sequelize';
import path from 'path';
import 'dotenv/config';

// Support MySQL via environment variables, fallback to SQLite for local/dev
// Env vars:
// DB_DIALECT=mysql|sqlite (default sqlite)
// DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, DB_LOGGING=true|false

const DIALECT = (process.env.DB_DIALECT || '').toLowerCase();

let sequelize: Sequelize;

if (DIALECT === 'mysql') {
  const host = (process.env.DB_HOST || '127.0.0.1').trim();
  const port = Number(process.env.DB_PORT || 3306);
  const database = process.env.DB_NAME || 'research_db';
  const username = (process.env.DB_USER || 'root').trim();
  const password = process.env.DB_PASS || '';
  const logging = process.env.DB_LOGGING === 'true' ? console.log : false;

  sequelize = new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'mysql',
    logging,
    dialectOptions: {
      charset: 'utf8mb4',
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: false,
    },
  });
} else {
  // Default to SQLite for zero-config local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    // Note: charset/collate options are no-ops for sqlite but kept for consistency
    charset: 'utf8mb4' as any,
    collate: 'utf8mb4_unicode_ci' as any,
    logging: process.env.DB_LOGGING === 'false' ? false : console.log,
  } as any);
}

export { sequelize };
