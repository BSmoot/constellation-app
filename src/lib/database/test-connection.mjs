// src/lib/database/test-connection.mjs
import pg from 'pg';
const { Pool } = pg;

// Log everything except password
console.log('Testing connection with:');
console.log('User: postgres');
console.log('Host: localhost');
console.log('Port: 5432');
console.log('Database: your_generation_db');

const db = new Pool({
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: 'your_generation_db'
});

async function testConnection() {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('Success! Database connected:', result.rows[0]);
        return true;
    } catch (error) {
        console.error('Connection details were incorrect:', error.message);
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

// Add to test-connection.mjs
async function testTables() {
    try {
        const markers = await db.query('SELECT * FROM generation_markers LIMIT 1');
        console.log('Generation markers:', markers.rows);
        
        const responses = await db.query('SELECT * FROM user_responses LIMIT 1');
        console.log('User responses:', responses.rows);
    } catch (error) {
        console.error('Table query failed:', error.message);
    }
}

// Add to the end of the file:
testTables();