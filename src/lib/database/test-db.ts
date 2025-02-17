// src/lib/database/test-db.ts
import pg from 'pg';
const { Pool } = pg;
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env.local') });

console.log('Attempting database connection...');
console.log('Using password:', process.env.POSTGRES_PASSWORD ? '[SET]' : '[NOT SET]');

const pool = new Pool({
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: 'your_generation_db'
});

async function testDB() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database connection successful:', result.rows[0]);
    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await pool.end();
        process.exit(0);  // Add explicit exit
    }
}

testDB().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);  // Exit on error
});