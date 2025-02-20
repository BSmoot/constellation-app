// src/app/api/follow-up/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { input, anonymousId: clientAnonymousId } = await req.json();

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'Input is required' },
        { status: 400 }
      );
    }

    // Get the user's session
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    const userId = session?.user?.id || clientAnonymousId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User identification failed' },
        { status: 401 }
      );
    }

    // Simulate processing of the input
    const responseMessage = `Processed input: ${input}`;

    // You can add logic here to save the interaction to Supabase if needed

    return NextResponse.json({
      success: true,
      message: responseMessage,
    });

  } catch (error: any) {
    console.error('Error processing follow-up:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process follow-up',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}