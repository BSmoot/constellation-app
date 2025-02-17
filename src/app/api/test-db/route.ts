// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/database/db-server';

export async function GET() {
    try {
        const result = await db.query('SELECT NOW()');
        return NextResponse.json({
            success: true,
            time: result.rows[0].now,
            message: 'Database connection successful'
        });
    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}