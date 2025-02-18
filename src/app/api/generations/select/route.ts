// src/app/api/generations/select/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const VALID_GENERATIONS = [
    "Baby Boomer", "Generation Jones", "Generation X",
    "Xennials", "Millennial", "Zillennials",
    "Generation Z", "Generation Alpha"
];

export async function POST(req: Request) {
    try {
        const { generation, anonymousId: clientAnonymousId, birthDate } = await req.json();

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

        // Get the user's session
        const supabaseAuth = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookies().get(name)?.value
                    },
                }
            }
        );

        const { data: { session }, error: authError } = await supabaseAuth.auth.getSession();

        if (authError) {
            console.error('Auth error:', authError);
        }

        // Use session ID, cookie ID, or client-provided anonymous ID
        const userId = session?.user?.id ||
                      cookies().get('anonymousId')?.value ||
                      clientAnonymousId;

        if (!userId) {
            // Generate anonymous ID if none exists
            const newAnonymousId = crypto.randomUUID();
            cookies().set('anonymousId', newAnonymousId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 365 // 1 year
            });

            // Use the new anonymous ID
            const [generationResult, onboardingResult] = await Promise.all([
                supabase
                    .from('user_generations')
                    .insert({
                        user_id: newAnonymousId,
                        generation,
                        birth_date: birthDate,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single(),
                supabase
                    .from('onboarding_responses')
                    .insert({
                        user_id: newAnonymousId,
                        question_id: 'generation_selection',
                        response: generation
                    })
            ]);

            if (generationResult.error) {
                throw generationResult.error;
            }

            if (onboardingResult.error) {
                console.error('Onboarding response error:', onboardingResult.error);
                // Continue even if onboarding response fails
            }

            return NextResponse.json({
                success: true,
                data: generationResult.data,
                anonymousId: newAnonymousId,
                message: `Successfully saved generation: ${generation}`
            });
        }

        // Check for existing generation for this user
        const { data: existingData, error: fetchError } = await supabase
            .from('user_generations')
            .select()
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Fetch error:', fetchError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Database query failed',
                    details: process.env.NODE_ENV === 'development' ? fetchError.message : undefined
                },
                { status: 500 }
            );
        }

        let generationResult;

        if (existingData) {
            // Update existing record
            generationResult = await supabase
                .from('user_generations')
                .update({
                    generation,
                    birth_date: birthDate,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .select()
                .single();
        } else {
            // Insert new record
            generationResult = await supabase
                .from('user_generations')
                .insert({
                    user_id: userId,
                    generation,
                    birth_date: birthDate,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
        }

        // Save to onboarding_responses regardless of existing data
        const onboardingResult = await supabase
            .from('onboarding_responses')
            .insert({
                user_id: userId,
                question_id: 'generation_selection',
                response: generation
            });

        if (onboardingResult.error) {
            console.error('Onboarding response error:', onboardingResult.error);
            // Continue even if onboarding response fails
        }

        const { data, error: saveError } = generationResult;

        if (saveError) {
            console.error('Save error:', saveError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to save generation',
                    details: process.env.NODE_ENV === 'development' ? saveError.message : undefined
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
            message: `Successfully saved generation: ${generation}`
        });
    } catch (error: any) {
        console.error('Error saving generation:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to save generation selection',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}