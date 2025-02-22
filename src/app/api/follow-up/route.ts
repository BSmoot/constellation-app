// src/app/api/follow-up/route.ts

import { NextResponse } from 'next/server';
import { followUpSystem } from '@/lib/SmartFollowUpSystem';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { responses, attempts, input } = body;

        // Enhanced input validation
        if (attempts === undefined || !responses) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, {
                status: 400
            });
        }

        // Validate attempts is a number and within range
        if (typeof attempts !== 'number' || attempts < 0 || attempts > 3) {
            return NextResponse.json({
                success: false,
                error: 'Invalid attempt number'
            }, {
                status: 400
            });
        }

        // Validate responses structure
        if (typeof responses !== 'object') {
            return NextResponse.json({
                success: false,
                error: 'Invalid responses format'
            }, {
                status: 400
            });
        }

        try {
            const analysis = followUpSystem.analyzeResponses(responses);

            // If we have all required info, no need for follow-up
            if (!analysis.needsFollowUp) {
                return NextResponse.json({
                    success: true,
                    needsFollowUp: false,
                    analysis: {
                        hasBirthTimeframe: analysis.hasBirthTimeframe,
                        hasGeography: analysis.hasGeography,
                        extractedInfo: analysis.extractedInfo
                    }
                });
            }

            // Generate follow-up question
            const followUpResponse = await followUpSystem.generateFollowUp(analysis, {
                attemptNumber: attempts,
                previousResponses: responses
            });

            // Check if we should proceed with unknown generation
            const shouldProceedWithUnknown = attempts >= 3;

            return NextResponse.json({
                success: true,
                needsFollowUp: !shouldProceedWithUnknown,
                proceedWithUnknown: shouldProceedWithUnknown,
                question: followUpResponse.question,
                targetInfo: followUpResponse.targetInfo,
                requiredInfo: analysis.missingInfo,
                extractedInfo: analysis.extractedInfo,
                analysis: {
                    hasBirthTimeframe: analysis.hasBirthTimeframe,
                    hasGeography: analysis.hasGeography
                }
            });

        } catch (analysisError) {
            console.error('Error analyzing responses:', analysisError);
            return NextResponse.json({
                success: false,
                error: 'Error analyzing responses',
                details: process.env.NODE_ENV === 'development' ? analysisError.message : undefined
            }, {
                status: 500
            });
        }

    } catch (error) {
        console.error('Error in follow-up:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process request',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, {
            status: 500
        });
    }
}

// Add options handler for CORS if needed
export async function OPTIONS(request: Request) {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}