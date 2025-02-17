// src/lib/database/test-connection.ts
import { db } from './client'

const testConnection = async () => {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('Database connected:', result.rows[0]);
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    } finally {
        await db.end();
    }
}

testConnection()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });