// app/api/db/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database/db-server';
import { QuestionId } from '@/config/questions';

type DBRequestBody = {
    questionId: QuestionId;
    response: string;
    parsedData: any;
}

export async function POST(request: NextRequest) {
    try {
        const body: DBRequestBody = await request.json();
        const { questionId, response, parsedData } = body;
        
        const result = await db?.query(
            `INSERT INTO user_responses 
             (question_id, response_text, parsed_data) 
             VALUES ($1, $2, $3)
             RETURNING id`,
            [questionId, response, JSON.stringify(parsedData)]
        );

        return NextResponse.json({ success: true, data: result?.rows[0] });
    } catch (error) {
        console.error('Database API error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}