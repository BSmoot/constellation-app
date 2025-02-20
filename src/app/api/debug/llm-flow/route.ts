// src/app/api/debug/llm-flow/route.ts

import { NextResponse } from 'next/server';
import { GenerationalContextParser } from '@/lib/GenerationalContextParser';
import { QuestionId } from '@/config/questions';

const USE_REAL_LLM = true;

export async function POST(request: Request) {
  console.log('API Route: Starting debug LLM flow');
  
  try {
    const body = await request.json();
    console.log('API Route: Received body:', {
      hasResponses: !!body.responses,
      responseKeys: Object.keys(body.responses || {}),
      actualResponses: body.responses
    });

    if (!body.responses || Object.keys(body.responses).length === 0) {
      console.log('API Route: No valid responses found in request');
      return NextResponse.json({
        success: false,
        message: 'No valid responses provided'
      }, { status: 400 });
    }

    if (!USE_REAL_LLM) {
      // Mock implementation remains the same...
      // ...
    }

    // Real LLM Implementation
    try {
      console.log('API Route: Attempting to initialize GenerationalContextParser');
      const parser = new GenerationalContextParser();
      console.log('API Route: Parser initialized successfully');

      // Process each response through the parser
      const parsedResults = {};
      for (const [questionId, response] of Object.entries(body.responses)) {
        console.log(`API Route: Processing question ${questionId}`);
        try {
          const parsedResponse = await parser.parseResponse(
            questionId as QuestionId, 
            response as string
          );
          parsedResults[questionId] = parsedResponse;
        } catch (parseError) {
          console.error(`API Route: Error parsing ${questionId}:`, parseError);
        }
      }

      console.log('API Route: Parsed Results:', parsedResults);

      // Extract timeframe and geography from parsed results
      const timeframe = parsedResults?.birthDate?.decade || null;
      const geography = parsedResults?.background?.location || null;

      // Construct the response
      const processedResponse = {
        timeframe: {
          identified: timeframe,
          confidence: timeframe ? 0.8 : 0
        },
        geography: {
          identified: geography,
          confidence: geography ? 0.8 : 0
        },
        sentiment: {
          cultural: parsedResults?.influences?.socialChanges || [],
          personal: parsedResults?.currentFocus?.themes || []
        },
        followUpQuestion: !timeframe || !geography 
          ? "Could you provide more details about when and where you grew up?"
          : "Thank you for the information. Would you like to add anything else?",
        recommendedPath: timeframe && geography ? "continue" : "unknown"
      };

      return NextResponse.json({
        success: true,
        prompt: "Using existing parser configuration",
        response: parsedResults,
        parsed: processedResponse,
        message: 'Successfully processed LLM request'
      });

    } catch (parserError) {
      console.error('API Route: Parser/LLM Error:', {
        error: parserError,
        message: parserError.message,
        stack: parserError.stack
      });
      return NextResponse.json({
        success: false,
        message: 'Error in LLM processing',
        error: parserError.message,
        stack: process.env.NODE_ENV === 'development' ? parserError.stack : undefined
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API Route: General Error:', {
      error,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({
      success: false,
      message: 'Server error processing request',
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}