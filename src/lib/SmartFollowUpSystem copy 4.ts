// src/lib/SmartFollowUpSystem.ts

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/config/env';
import { AI_MODELS, DEFAULT_MODEL, MAX_TOKENS } from '@/config/ai-models';

interface FollowUpConfig {
    attemptNumber: number;
    previousResponses: Record<string, string>;
}

interface AnalysisResult {
    needsFollowUp: boolean;
    hasBirthTimeframe: boolean;
    hasGeography: boolean;
    generation?: string;
    missingInfo: {
        birthTimeframe: boolean;
        geography: boolean;
    };
}

export class SmartFollowUpSystem {
    private anthropic: any | null = null;
    private supabase: any | null = null;
    private logger: Console;

    constructor() {
        this.logger = console;
        // Initialize Anthropic if server-side
        if (typeof window === 'undefined') {
            this.initializeServerSide().catch(error => {
                this.logger.error('Server-side initialization failed:', error);
            });
        }
    }

    private async initializeServerSide() {
        try {
            if (!process.env.ANTHROPIC_API_KEY) {
                throw new Error('ANTHROPIC_API_KEY is required');
            }
            this.anthropic = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });

            if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                this.supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                );
            }
        } catch (error) {
            this.logger.error('Server-side initialization error:', error);
            throw error;
        }
    }

    private normalizeResponses(responses: any): Record<string, string> {
        // Handle different response formats
        if (!responses) return {};
    
        // If responses is nested under a 'responses' key
        if (responses.responses) {
            responses = responses.responses;
        }
        // Check for different possible keys
        const birthDateKeys = ['birthDate', 'birth_date', 'birthdate', 'response0'];
        const backgroundKeys = ['background', 'geography', 'location', 'response1'];

        const normalized: Record<string, string> = {};

        // Try to find birth date information
        for (const key of birthDateKeys) {
            if (typeof responses[key] === 'string') {
                normalized.birthDate = responses[key];
                break;
            }
        }

        // Try to find background information
        for (const key of backgroundKeys) {
            if (typeof responses[key] === 'string') {
                normalized.background = responses[key];
                break;
            }
        }

        return normalized;
    } 

    public analyzeResponses(responses: Record<string, string> | any): AnalysisResult {
        // Normalize the responses first
        const normalizedResponses = this.normalizeResponses(responses);
        
        const hasBirthTimeframe = this.checkForBirthTimeframe(normalizedResponses);
        const hasGeography = this.checkForGeography(normalizedResponses);
    
        console.log('Analysis results:', { 
            original: responses,
            normalized: normalizedResponses,
            hasBirthTimeframe, 
            hasGeography 
        }); // Enhanced debug log
    
        return {
            needsFollowUp: !hasBirthTimeframe || !hasGeography,
            hasBirthTimeframe,
            hasGeography,
            missingInfo: {
                birthTimeframe: !hasBirthTimeframe,
                geography: !hasGeography
            }
        };
    }

    async generateFollowUp(analysis: AnalysisResult, config?: FollowUpConfig) {
        const attemptNumber = config?.attemptNumber || 0;
        let { previousResponses } = config || {};
    
        try {
            const prompt = this.constructPrompt(analysis, attemptNumber, previousResponses);
            console.log('Sending prompt to LLM:', prompt); // For debugging
    
            if (this.anthropic) {
                const message = await this.anthropic.messages.create({
                    model: DEFAULT_MODEL,
                    max_tokens: MAX_TOKENS,
                    messages: [{ role: "user", content: prompt }]
                });
    
                const question = message.content[0].text;
    
                // Analyze response to decide next step
                const newAnalysis = this.analyzeResponses(previousResponses);
                if (!newAnalysis.needsFollowUp) {
                    return { question: "Thank you! We have all the information we need.", targetInfo: newAnalysis.missingInfo };
                }
    
                return { question, targetInfo: newAnalysis.missingInfo };
            }
        } catch (error) {
            this.logger.error('Error generating follow-up:', error);
        }
    
        return { question: this.generateFallbackQuestion(analysis, attemptNumber), targetInfo: analysis.missingInfo };
    }

    private constructPrompt(analysis: AnalysisResult, attemptNumber: number, responses: Record<string, string>): string {
        const allResponses = Object.values(responses).join(' ');
        const missingInfo = [];
        
        if (analysis.missingInfo.birthTimeframe) missingInfo.push('birth timeframe');
        if (analysis.missingInfo.geography) missingInfo.push('geography');
    
        const basePrompt = `You are a friendly, conversational assistant trying to gather specific information about when and where someone grew up.
    
        Current attempt: ${attemptNumber + 1}/4.
        Previous response(s): "${allResponses}"
        Still missing: ${missingInfo.join(' and ')}
    
        Important:
        1. DO NOT ask about information that appears in the previous responses
        2. Focus ONLY on gathering the missing information: ${missingInfo.join(' and ')}
        3. Be more specific with each attempt (${attemptNumber + 1}/4)
        4. Keep a friendly tone but be increasingly direct
        5. Return only the question text, no explanations or additional text
    
        Generate a natural, conversational follow-up question.`;
    
        return basePrompt;
    }

    private generateFallbackQuestion(analysis: AnalysisResult, attemptNumber: number): string {
        const fallbackQuestions = {
            birthTimeframe: [
                "Could you tell me more specifically when you were born or grew up?",
                "I'm still not clear about when you grew up. Could you mention a decade or year?",
                "Just to pin down the timeline - what year or decade were you born in?",
                "I need to know when you were born - could you share the year or decade?"
            ],
            geography: [
                "Where did you spend your early years?",
                "Could you tell me more specifically where you grew up?",
                "I'd love to know which city, town, or country you grew up in.",
                "Please share where you were born or grew up - any specific location?"
            ]
        };

        if (analysis.missingInfo.birthTimeframe && analysis.missingInfo.geography) {
            return `${fallbackQuestions.birthTimeframe[attemptNumber]} Also, ${fallbackQuestions.geography[attemptNumber].toLowerCase()}`;
        } else if (analysis.missingInfo.birthTimeframe) {
            return fallbackQuestions.birthTimeframe[attemptNumber];
        } else {
            return fallbackQuestions.geography[attemptNumber];
        }
    }

    private checkForBirthTimeframe(responses: Record<string, string>): boolean {
        // Check all responses, not just birthDate
        const allResponses = Object.values(responses).join(' ').toLowerCase();
        
        const timeframePatterns = [
            /\b(19|20)\d{2}\b/,                    // Years
            /\b(19|20)\d{0}s\b/,                   // Decades
            /born\s+in\s+(?:the\s+)?(19|20)\d{2}/i,// "born in" followed by year
            /grew\s+up\s+in\s+the\s+(19|20)\d{0}s/i// "grew up in the" followed by decade
        ];
    
        return timeframePatterns.some(pattern => pattern.test(allResponses));
    }
    
    private checkForGeography(responses: Record<string, string>): boolean {
        // Check all responses, not just background
        const allResponses = Object.values(responses).join(' ').toLowerCase();
        
        const locationPatterns = [
            /(city|town|country|state|province)\s+of\s+\w+/i,
            /\b(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
            /\b(?:grew\s+up|raised|lived)\s+in\s+\w+/i,
            /\b(?:born|raised)\s+in\s+\w+/i
        ];
    
        return locationPatterns.some(pattern => pattern.test(allResponses));
    }
}