// src/app/api/generations/select/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

const VALID_GENERATIONS = [
    "Baby Boomer", "Generation Jones", "Generation X",
    "Xennials", "Millennial", "Zillennials",
    "Generation Z", "Generation Alpha"
];

export async function POST(req: Request) {
    try {
        const { generation, birthDate } = await req.json();

        // Input validation
        if (!generation) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Generation is required'
                },
                { status: 400 }
            );
        }

        // Validate generation value
        if (!VALID_GENERATIONS.includes(generation)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid generation value'
                },
                { status: 400 }
            );
        }

        // Get temporary user ID
        const tempUserId = cookies().get('tempUserId')?.value || 'anonymous';

        // Check for existing generation for this user
        const { data: existingData } = await supabase
            .from('user_generations')
            .select()
            .eq('user_id', tempUserId)
            .single();

        let result;

        if (existingData) {
            // Update existing record
            result = await supabase
                .from('user_generations')
                .update({
                    generation,
                    birth_date: birthDate,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', tempUserId)
                .select()
                .single();
        } else {
            // Insert new record
            result = await supabase
                .from('user_generations')
                .insert({
                    generation,
                    user_id: tempUserId,
                    birth_date: birthDate,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
        }

        const { data, error } = result;

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Database operation failed',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                },
                { status: 500 }
            );
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