// src/app/api/follow-up/route.ts

import { NextResponse } from 'next/server';
import { followUpSystem } from '@/lib/SmartFollowUpSystem';

// Helper function to extract just the question from LLM response
function extractQuestion(llmResponse: string): string {
    // Look for the actual question within quotes
    const questionMatch = llmResponse.match(/"([^"]+)"/);
    if (questionMatch) return questionMatch[1];

    // If no quotes, look for the first sentence that ends with a question mark
    const questionSentence = llmResponse.split(/[.!?]/)
        .find(sentence => sentence.trim().endsWith('?'));
    if (questionSentence) return questionSentence.trim();

    // If still no match, take the first sentence
    const firstSentence = llmResponse.split(/[.!?]/)[0];
    return firstSentence.trim();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { responses, attempts = 0 } = body;

        // Enhanced input validation
        if (!responses) {
            return NextResponse.json({
                success: false,
                error: 'Missing responses'
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

            // If we have all required info or this is step-one-b response, proceed
            if (!analysis.needsFollowUp || Object.keys(responses).includes('response0')) {
                return NextResponse.json({
                    success: true,
                    needsFollowUp: false,
                    proceedWithUnknown: false,
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

            // Extract just the question from the LLM response
            const cleanQuestion = extractQuestion(followUpResponse.question);

            return NextResponse.json({
                success: true,
                needsFollowUp: true,
                proceedWithUnknown: false,
                question: cleanQuestion,
                requiredInfo: analysis.missingInfo,
                
                // Debug information only included in development
                ...(process.env.NODE_ENV === 'development' && {
                    debug: {
                        rawResponse: followUpResponse.question,
                        analysis: {
                            hasBirthTimeframe: analysis.hasBirthTimeframe,
                            hasGeography: analysis.hasGeography,
                            extractedInfo: analysis.extractedInfo
                        },
                        targetInfo: followUpResponse.targetInfo
                    }
                })
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