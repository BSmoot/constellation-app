// src/lib/SmartFollowUpSystem.ts (Part 1)

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
    extractedInfo?: {
        timeframe?: string;
        locations?: string[];
        events?: string[];
        sentiments?: Record<string, string[]>;
    };
}

class SmartFollowUpSystem {
    private anthropic: any | null = null;
    private supabase: any | null = null;
    private logger: Console;
    private previousQuestions: string[] = [];

    constructor() {
        this.logger = console;
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

    public analyzeResponses(responses: Record<string, string> | any): AnalysisResult {
        const normalizedResponses = this.normalizeResponses(responses);
        const allResponses = Object.values(normalizedResponses).join(' ');
        const contentAnalysis = this.analyzeResponseContent(allResponses);

        const hasBirthTimeframe = !!contentAnalysis.timeframe;
        const hasGeography = contentAnalysis.locations.length > 0;

        return {
            needsFollowUp: !hasBirthTimeframe || !hasGeography,
            hasBirthTimeframe,
            hasGeography,
            extractedInfo: contentAnalysis,
            missingInfo: {
                birthTimeframe: !hasBirthTimeframe,
                geography: !hasGeography
            }
        };
    }

    private normalizeResponses(responses: any): Record<string, string> {
        if (!responses) return {};
        if (responses.responses) {
            responses = responses.responses;
        }

        const normalized: Record<string, string> = {};
        Object.entries(responses).forEach(([key, value]) => {
            if (typeof value === 'string') {
                normalized[key] = value;
            }
        });

        return normalized;
    }

    private analyzeResponseContent(response: string): {
        timeframe?: string;
        locations?: string[];
        events?: string[];
        sentiments?: Record<string, string[]>;
    } {
        return {
            timeframe: this.extractTimeframe(response),
            locations: this.extractLocations(response),
            events: this.extractEvents(response),
            sentiments: this.extractSentiments(response)
        };
    }

    private extractTimeframe(text: string): string | undefined {
        const timePatterns = [
            /\b(19|20)\d{2}\b/,
            /\b(19|20)\d{0}s\b/,
            /born\s+in\s+(?:the\s+)?(19|20)\d{2}/i,
            /grew\s+up\s+in\s+the\s+(19|20)\d{0}s/i
        ];

        for (const pattern of timePatterns) {
            const match = text.match(pattern);
            if (match) return match[0];
        }
        return undefined;
    }

    private extractLocations(text: string): string[] {
        const locations: string[] = [];
        const locationPatterns = [
            /(?:in|at|from|grew up in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /(?:city|town|country|state) of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
        ];

        locationPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) locations.push(match[1]);
            }
        });

        return [...new Set(locations)];
    }
    private extractEvents(text: string): string[] {
        // This could be expanded based on your needs
        return [];
    }

    private extractSentiments(text: string): Record<string, string[]> {
        const sentiments: Record<string, string[]> = {
            community: [],
            events: []
        };

        const communityPatterns = [
            /(?:identify|connected|belong)\s+(?:with|to)\s+([^,.]+)/gi,
            /(?:part of|member of)\s+([^,.]+)/gi
        ];

        communityPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) sentiments.community.push(match[1].trim());
            }
        });

        return sentiments;
    }

    private debugLog(type: string, data: any) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            data
        };
        console.log('SmartFollowUpSystem Debug:', logEntry);
        if (typeof window !== 'undefined') {
            const logs = JSON.parse(localStorage.getItem('followup-debug-logs') || '[]');
            logs.push(logEntry);
            localStorage.setItem('followup-debug-logs', JSON.stringify(logs));
        }
    }

    private constructPrompt(analysis: AnalysisResult, attemptNumber: number, responses: Record<string, string> | null | undefined): string {
        const responseValues = responses ? Object.values(responses) : [];
        const existingInfo = this.analyzeResponseContent(responseValues.join(' '));
        
        const approachByAttempt = [
            {
                focus: "broad historical context",
                examples: [
                    "What's your earliest memory of a major world event that affected your community?",
                    "Which cultural or social movements were most talked about during your childhood?"
                ]
            },
            {
                focus: "personal experience",
                examples: [
                    "How did significant changes in technology or society affect your early life?",
                    "What traditions or celebrations shaped your childhood experiences?"
                ]
            },
            {
                focus: "community impact",
                examples: [
                    "How did your community respond to major changes happening in the world?",
                    "What social or economic shifts had the biggest impact on your early environment?"
                ]
            },
            {
                focus: "specific events",
                examples: [
                    "Which historical moments from your youth left the strongest impression?",
                    "How did local customs and global events interact in your early years?"
                ]
            }
        ];

        const currentApproach = approachByAttempt[attemptNumber % approachByAttempt.length];
        
        const basePrompt = `You are helping build connections between people through shared experiences and perspectives. Your immediate goal is to gather essential timeline and location context, but do this through questions about experiences and reactions to events.

        Current context:
        - Attempt: ${attemptNumber + 1}/4 (Focus: ${currentApproach.focus})
        - Previous responses: ${JSON.stringify(responseValues)}
        - Already know: ${JSON.stringify(existingInfo)}
        - Still need: ${analysis.missingInfo.birthTimeframe ? 'timeline context' : ''} ${analysis.missingInfo.geography ? 'location context' : ''}

        Question Guidelines:
        1. Focus on ${currentApproach.focus} for this attempt
        2. Frame questions around major events, cultural shifts, or social movements
        3. If timeline context is needed, ask about their experience with specific historical events
        4. If location context is needed, ask about cultural experiences rather than direct geography
        5. Never repeat previous questions or use similar phrasings
        6. Never ask directly "where did you grow up" or similar variations

        Current approach examples:
        ${currentApproach.examples.join('\n        ')}

        Previous questions asked: ${this.previousQuestions.join('\n        ')}

        Generate a single, natural-sounding question that:
        1. Is distinctly different from previous questions
        2. Follows the current attempt's focus (${currentApproach.focus})
        3. Naturally leads to information about ${analysis.missingInfo.birthTimeframe ? 'timeline' : ''}${analysis.missingInfo.birthTimeframe && analysis.missingInfo.geography ? ' and ' : ''}${analysis.missingInfo.geography ? 'location' : ''}
        4. Builds toward constellation/cohort connections

        Return only the question text.`;

        return basePrompt;
    }

    async generateFollowUp(analysis: AnalysisResult, config?: FollowUpConfig) {
        const attemptNumber = config?.attemptNumber || 0;
        let { previousResponses } = config || {};

        this.debugLog('attempt-start', {
            attemptNumber,
            previousResponses,
            analysis
        });

        try {
            if (attemptNumber >= 2 && (analysis.missingInfo.birthTimeframe || analysis.missingInfo.geography)) {
                const fallbackQuestion = this.generateFallbackQuestion(analysis, attemptNumber);
                this.previousQuestions.push(fallbackQuestion);
                return {
                    question: fallbackQuestion,
                    targetInfo: analysis.missingInfo
                };
            }

            const prompt = this.constructPrompt(analysis, attemptNumber, previousResponses);
            this.debugLog('prompt-generated', { prompt });

            if (!this.anthropic) {
                const variedQuestion = this.generateVariedQuestion(analysis, attemptNumber);
                this.previousQuestions.push(variedQuestion);
                return {
                    question: variedQuestion,
                    targetInfo: analysis.missingInfo
                };
            }

            try {
                const message = await this.anthropic.messages.create({
                    model: DEFAULT_MODEL,
                    max_tokens: MAX_TOKENS,
                    messages: [{ role: "user", content: prompt }]
                });

                this.debugLog('llm-response', { message });

                if (!message?.content?.[0]?.text) {
                    throw new Error('Invalid LLM response structure');
                }

                const question = message.content[0].text.trim();
                if (this.isQuestionTooSimilar(question, this.previousQuestions)) {
                    const variedQuestion = this.generateVariedQuestion(analysis, attemptNumber);
                    this.previousQuestions.push(variedQuestion);
                    return {
                        question: variedQuestion,
                        targetInfo: analysis.missingInfo
                    };
                }

                this.previousQuestions.push(question);
                return {
                    question,
                    targetInfo: analysis.missingInfo
                };

            } catch (llmError) {
                this.debugLog('llm-error', { error: llmError });
                const variedQuestion = this.generateVariedQuestion(analysis, attemptNumber);
                this.previousQuestions.push(variedQuestion);
                return {
                    question: variedQuestion,
                    targetInfo: analysis.missingInfo
                };
            }

        } catch (error) {
            this.debugLog('general-error', { error });
            const variedQuestion = this.generateVariedQuestion(analysis, attemptNumber);
            this.previousQuestions.push(variedQuestion);
            return {
                question: variedQuestion,
                targetInfo: analysis.missingInfo
            };
        }
    }

    private isQuestionTooSimilar(newQuestion: string, previousQuestions: string[]): boolean {
        const normalized = newQuestion.toLowerCase().trim();
        return previousQuestions.some(prev => {
            const similarity = this.calculateSimilarity(normalized, prev);
            return similarity > 0.7;
        });
    }

    private calculateSimilarity(str1: string, str2: string): number {
        const words1 = new Set(str1.split(/\s+/));
        const words2 = new Set(str2.split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }

    private generateVariedQuestion(analysis: AnalysisResult, attemptNumber: number): string {
        const variedQuestions = {
            timeframeQuestions: [
                "What technological innovations caused the biggest changes during your childhood?",
                "Which global events from your youth had the most impact on your community?",
                "How did entertainment and media evolve during your early years?",
                "What social changes do you remember most vividly from your childhood?"
            ],
            culturalQuestions: [
                "What traditions or celebrations were most meaningful in your early years?",
                "How did your childhood community handle major cultural shifts?",
                "What values or beliefs shaped your early environment?",
                "Which cultural influences had the strongest impact on your youth?"
            ],
            combinedQuestions: [
                "How did historical events affect your childhood community?",
                "What social movements or changes defined your early experiences?",
                "How did your community adapt to global changes during your youth?",
                "Which cultural shifts had the biggest impact on your early environment?"
            ]
        };

        const questionSet = analysis.missingInfo.birthTimeframe && analysis.missingInfo.geography
            ? variedQuestions.combinedQuestions
            : analysis.missingInfo.birthTimeframe
                ? variedQuestions.timeframeQuestions
                : variedQuestions.culturalQuestions;

        const unusedQuestions = questionSet.filter(q =>
            !this.previousQuestions.some(prev => this.isQuestionTooSimilar(q, prev))
        );

        if (unusedQuestions.length > 0) {
            return unusedQuestions[attemptNumber % unusedQuestions.length];
        }

        return this.generateFallbackQuestion(analysis, attemptNumber);
    }

    private generateFallbackQuestion(analysis: AnalysisResult, attemptNumber: number): string {
        const fallbackQuestions = {
            birthTimeframe: [
                "What major world events do you remember from your childhood?",
                "Which technological changes had the biggest impact on your early years?",
                "What social or cultural movements were significant during your youth?",
                "How did global events shape your early perspective of the world?"
            ],
            geography: [
                "How would you describe the community that shaped your early perspectives?",
                "What cultural traditions or celebrations were important in your childhood?",
                "How did your early environment influence your worldview?",
                "What aspects of your childhood community had the biggest impact on you?"
            ],
            combined: [
                "What events or experiences defined your childhood community?",
                "How did your early environment respond to major world events?",
                "Which cultural or social movements shaped your community growing up?",
                "How did local and global changes affect your early perspectives?"
            ]
        };

        const safeAttemptNumber = Math.min(attemptNumber, fallbackQuestions.birthTimeframe.length - 1);

        if (analysis.missingInfo.birthTimeframe && analysis.missingInfo.geography) {
            return fallbackQuestions.combined[safeAttemptNumber];
        } else if (analysis.missingInfo.birthTimeframe) {
            return fallbackQuestions.birthTimeframe[safeAttemptNumber];
        } else if (analysis.missingInfo.geography) {
            return fallbackQuestions.geography[safeAttemptNumber];
        } else {
            return "How did your early experiences shape your perspective on the world?";
        }
    }
}

// Export a singleton instance
export const followUpSystem = new SmartFollowUpSystem();