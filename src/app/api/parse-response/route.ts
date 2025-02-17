// src/app/api/parse-response/route.ts (keep as is)
import { NextResponse } from 'next/server';
import { GenerationalContextParser } from '@/lib/GenerationalContextParser';
import { env } from '@/config/env';

export async function POST(req: Request) {
    try {
        // Validate environment variables
        env.validate();
        
        const { questionId, response } = await req.json();
        const parser = new GenerationalContextParser();
        const parsed = await parser.parseResponse(questionId, response);
        
        return NextResponse.json({ success: true, data: parsed });
    } catch (error) {
        console.error('Parse response error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to parse response',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}