// src/app/api/test-parser/route.ts
import { NextResponse } from 'next/server';
import { GenerationalContextParser } from '@/lib/GenerationalContextParser';

export async function POST(req: Request) {
    try {
        console.log('Received request to test-parser');
        const body = await req.json();
        console.log('Request body:', body);
        
        const { questionId, response } = body;
        if (!questionId || !response) {
            return NextResponse.json(
                { success: false, error: 'Missing questionId or response' },
                { status: 400 }
            );
        }

        const parser = new GenerationalContextParser();
        console.log('Parser initialized');
        
        const parsed = await parser.parseResponse(questionId, response);
        console.log('Parsed result:', parsed);
        
        return NextResponse.json({ success: true, data: parsed });
    } catch (error) {
        console.error('Parse test error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
            },
            { status: 500 }
        );
    }
}