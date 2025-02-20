// src/app/api/follow-up/route.ts
import { NextResponse } from 'next/server';
import { SmartFollowUpSystem } from '@/lib/SmartFollowUpSystem';

let followUpSystem: SmartFollowUpSystem | null = null;

export async function POST(request: Request) {
    try {
        // Initialize the system if not already done
        if (!followUpSystem) {
            followUpSystem = new SmartFollowUpSystem();
        }

        const body = await request.json();
        const { responses, attempts } = body;

        const analysis = followUpSystem.analyzeResponses(responses);
        if (!analysis.needsFollowUp) {
            return NextResponse.json({
                success: true,
                needsFollowUp: false
            });
        }

        const followUpResponse = await followUpSystem.generateFollowUp(analysis);

        return NextResponse.json({
            success: true,
            needsFollowUp: true,
            question: followUpResponse.question,
            targetInfo: followUpResponse.targetInfo
        });

    } catch (error: any) {
        console.error('Error in follow-up:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to generate follow-up'
            },
            { status: 500 }
        );
    }
}