// src/lib/database/client.ts
import pg from 'pg';
const { Pool } = pg;
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env.local') });

const db = new Pool({
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: 'your_generation_db'
});

export default db;