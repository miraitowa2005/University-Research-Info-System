import { sequelize } from '../config/database';

async function main() {
  const cfg = {
    DIALECT: process.env.DB_DIALECT,
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    NAME: process.env.DB_NAME,
    USER: process.env.DB_USER,
  };
  console.log('[test-db] env:', cfg);
  try {
    await sequelize.authenticate();
    console.log('[test-db] Database connection established successfully');
    await sequelize.close();
    console.log('[test-db] Connection closed');
    process.exit(0);
  } catch (err: any) {
    console.error('[test-db] Connection failed:', err?.message || err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();

