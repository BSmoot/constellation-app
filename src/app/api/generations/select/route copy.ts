// src/app/api/generations/select/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { generation } = await req.json();

        if (!generation) {
            return NextResponse.json(
                { error: 'Generation is required' },
                { status: 400 }
            );
        }

        // For now, we'll use a temporary user ID until auth is set up
        const tempUserId = cookies().get('tempUserId')?.value || 'anonymous';

        const { data, error } = await supabase
            .from('user_generations')
            .insert({
                generation,
                user_id: tempUserId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        return NextResponse.json({ 
            success: true, 
            data,
            message: `Successfully saved generation: ${generation}`
        });
    } catch (error) {
        console.error('Error saving generation:', error);
        return NextResponse.json(
            { 
                success: false,
                error: 'Failed to save generation selection',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            },
            { status: 500 }
        );
    }
}