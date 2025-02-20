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
        const previousResponses = config?.previousResponses || {};

        try {
            // Use Anthropic to generate contextual questions
            const prompt = this.constructPrompt(analysis, attemptNumber, previousResponses);
            
            if (this.anthropic) {
                const message = await this.anthropic.messages.create({
                    model: DEFAULT_MODEL,
                    max_tokens: MAX_TOKENS,
                    messages: [{
                        role: "user",
                        content: prompt
                    }]
                });

                return {
                    question: message.content[0].text,
                    targetInfo: analysis.missingInfo
                };
            } else {
                // Fallback to deterministic questions if LLM is unavailable
                return {
                    question: this.generateFallbackQuestion(analysis, attemptNumber),
                    targetInfo: analysis.missingInfo
                };
            }
        } catch (error) {
            this.logger.error('Error generating follow-up:', error);
            return {
                question: this.generateFallbackQuestion(analysis, attemptNumber),
                targetInfo: analysis.missingInfo
            };
        }
    }

    private constructPrompt(analysis: AnalysisResult, attemptNumber: number, responses: Record<string, string>): string {
        const basePrompt = `You are a friendly, conversational assistant trying to gather specific information about when and where someone grew up. 
        Current attempt: ${attemptNumber + 1}/4.
        Missing information: ${analysis.missingInfo.birthTimeframe ? 'birth timeframe' : ''} ${analysis.missingInfo.geography ? 'geography' : ''}
        Previous responses: ${JSON.stringify(responses)}
        
        Generate a natural, conversational follow-up question that:
        1. Acknowledges any information they've already shared
        2. Specifically targets the missing information
        3. Is more direct and specific with each attempt
        4. Maintains a friendly, encouraging tone
        
        Return only the question text.`;

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
        const birthDateResponse = responses['birthDate'] || '';
        const hasTimeframe = birthDateResponse.length > 0 &&
            (birthDateResponse.match(/\b(19|20)\d{2}\b/) ||
             birthDateResponse.toLowerCase().includes('born') ||
             birthDateResponse.toLowerCase().includes('birth'));
        console.log('Birth timeframe check:', { birthDateResponse, hasTimeframe }); // Debug log
        return hasTimeframe;
    }

    private checkForGeography(responses: Record<string, string>): boolean {
        const backgroundResponse = responses['background'] || '';
        const hasGeography = backgroundResponse.length > 0 &&
            (backgroundResponse.toLowerCase().includes('city') ||
             backgroundResponse.toLowerCase().includes('country') ||
             backgroundResponse.toLowerCase().includes('town') ||
             backgroundResponse.toLowerCase().includes('born in'));
        console.log('Geography check:', { backgroundResponse, hasGeography }); // Debug log
        return hasGeography;
    }
}