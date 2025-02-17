// src/lib/database/db-server.ts
import pg from 'pg';
const { Pool } = pg;

let db: pg.Pool | null = null;

if (!db) {
    db = new Pool({
        user: 'postgres',
        password: process.env.POSTGRES_PASSWORD,
        host: 'localhost',
        port: 5432,
        database: 'your_generation_db'
    });
}

export default db;