// src/app/api/test-parser/route.ts
import { NextResponse } from 'next/server';
import { GenerationalContextParser } from '@/lib/GenerationalContextParser';

export async function GET() {
    try {
        const parser = new GenerationalContextParser();
        const testResponse = await parser.parseResponse(
            'birthDate',
            'I was born in 1985 during the early computer age'
        );
        
        return NextResponse.json({ success: true, data: testResponse });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}