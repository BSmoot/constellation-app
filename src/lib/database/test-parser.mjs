// src/lib/database/test-parser.mjs
import pg from 'pg';
import { GenerationalContextParser } from '../GenerationalContextParser.ts';  // Changed to .ts

const { Pool } = pg;

const db = new Pool({
    user: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: 'your_generation_db'
});

async function testParser() {
    const parser = new GenerationalContextParser();
    
    // Test sample responses
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
            
            // Save to database
            await parser.saveResponse(questionId, response, parsed);
            console.log('Saved to database successfully');
        }

        // Verify saved data
        const savedResponses = await db.query('SELECT * FROM user_responses ORDER BY id DESC LIMIT 4');
        console.log('\nRecently saved responses:', savedResponses.rows);

    } catch (error) {
        console.error('Parser test failed:', error);
    } finally {
        await db.end();
    }
}

testParser()
    .then(() => console.log('Parser test completed'))
    .catch(console.error);