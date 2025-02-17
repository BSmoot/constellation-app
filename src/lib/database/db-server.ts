// src/lib/database/db-server.ts
import pg from 'pg';
const { Pool } = pg;

let db: pg.Pool | null = null;

// Only initialize the database connection on the server side
if (typeof window === 'undefined') {
    if (!db) {
        if (!process.env.POSTGRES_PASSWORD) {
            throw new Error('POSTGRES_PASSWORD is required');
        }

        db = new Pool({
            user: process.env.POSTGRES_USER || 'postgres',
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            database: process.env.POSTGRES_DATABASE || 'your_generation_db',
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false
            } : undefined
        });

        db.on('error', (err) => {
            console.error('Unexpected error on idle database client', err);
            process.exit(-1);
        });

        db.query('SELECT NOW()', (err) => {
            if (err) {
                console.error('Database connection failed:', err);
            } else {
                console.log('Database connected successfully');
            }
        });
    }
}

export default db;