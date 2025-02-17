// src/lib/database/test-parser.ts
import pg from 'pg';
const { Pool } = pg;
import { GenerationalContextParser } from '../GenerationalContextParser.js';
import { QuestionId } from '@/config/questions';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../../.env.local') });

// Debug environment variables
console.log('Environment check:');
console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');

// Test database connection first
const testConnection = async () => {
    const db = new Pool({
        user: 'postgres',
        password: process.env.POSTGRES_PASSWORD,
        host: 'localhost',
        port: 5432,
        database: 'your_generation_db'
    });

    try {
        const result = await db.query('SELECT NOW()');
        console.log('Database connection test successful:', result.rows[0]);
        await db.end();
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error);
        await db.end();
        return false;
    }
};

async function testParser() {
    // Test connection first
    const connectionSuccessful = await testConnection();
    if (!connectionSuccessful) {
        console.error('Stopping test due to connection failure');
        return;
    }

    const parser = new GenerationalContextParser();
    
    const testData = {
        birthDate: "I was born in the late 80s",
        background: "I grew up in a middle-class suburb",
        influences: "The rise of the internet and mobile phones changed everything",
        currentFocus: "I think about how technology is changing society"
    };

    try {
        console.log('Testing parser with sample data...');
        
        for (const [questionId, response] of Object.entries(testData)) {
            console.log(`\nProcessing question: ${questionId}`);
            console.log('Response:', response);
            
            const parsed = await parser.parseResponse(questionId, response);
            console.log('Parsed result:', parsed);
            
            await parser.saveResponse(questionId as QuestionId, response, parsed);
            console.log('Saved to database successfully');
        }

    } catch (error) {
        console.error('Parser test failed:', error);
    }
}

testParser()
    .then(() => console.log('Parser test completed'))
    .catch(console.error);