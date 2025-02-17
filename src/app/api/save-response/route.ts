// src/app/api/save-response/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/database/db-server';
import { env } from '@/config/env';

const TABLE_NAME = 'generational_responses';

export async function POST(req: Request) {
    try {
        env.validate();
        
        const body = await req.json();
        console.log('Received data:', body); // Debug log
        
        const { questionId, response, parsedData } = body;
        
        console.log('Attempting database insert with:', { // Debug log
            questionId,
            response,
            parsedData
        });

        const result = await db.query(
            `INSERT INTO ${TABLE_NAME} (
                question_id,
                question_category,
                raw_response,
                parsed_data,
                confidence_score,
                processing_status,
                model_version,
                processed_by,
                source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                questionId,
                questionId,
                response,
                parsedData,
                parsedData?.confidence || 0,
                'completed',
                'claude-3-haiku-20240307',
                'GenerationalContextParser',
                'user_input'
            ]
        );

        console.log('Database result:', result.rows[0]); // Debug log

        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Save response error details:', { // Detailed error logging
            message: error.message,
            stack: error.stack,
            code: error.code, // PostgreSQL error code if present
            detail: error.detail // PostgreSQL error detail if present
        });
        
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to save response',
                details: process.env.NODE_ENV === 'development' ? {
                    message: error.message,
                    code: error.code,
                    detail: error.detail
                } : undefined
            },
            { status: 500 }
        );
    }
}