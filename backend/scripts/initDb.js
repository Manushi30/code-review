import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '../database/schema.sql');

async function init() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required in .env');
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('Database schema initialized successfully.');
}

init().catch((err) => {
  console.error('Init failed:', err);
  process.exit(1);
});
