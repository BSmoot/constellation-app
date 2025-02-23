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
    generationInfo?: GenerationInfo;
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

interface GenerationInfo {
    generation: string;
    confidence: number;
    region: string;
    microGeneration?: string;
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
    
        let generationInfo: GenerationInfo | undefined;
        if (hasBirthTimeframe && hasGeography) {
            generationInfo = this.analyzeGeneration(
                contentAnalysis.timeframe!,
                contentAnalysis.locations
            );
        }
    
        return {
            needsFollowUp: !hasBirthTimeframe || !hasGeography,
            hasBirthTimeframe,
            hasGeography,
            generationInfo,
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
        // Add more sophisticated patterns
        const timePatterns = [
            /\b(19|20)\d{2}\b/, // Years
            /\b(19|20)\d{0}s\b/, // Decades
            /born\s+in\s+(?:the\s+)?(19|20)\d{2}/i,
            /grew\s+up\s+in\s+the\s+(19|20)\d{0}s/i,
            /during\s+the\s+(19|20)\d{0}s/i,
            /early\s+(19|20)\d{0}s/i,
            /late\s+(19|20)\d{0}s/i
        ];
    
        const matches = timePatterns
            .map(pattern => text.match(pattern))
            .filter(match => match !== null);
    
        if (matches.length > 0) {
            // Return the most specific match (prefer full years over decades)
            const fullYearMatch = matches.find(match => /\d{4}/.test(match![0]));
            return fullYearMatch ? fullYearMatch[0] : matches[0]![0];
        }
        return undefined;
    }
    
    private extractLocations(text: string): string[] {
        const locations: string[] = [];
        const locationPatterns = [
            /(?:in|at|from|grew up in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /(?:city|town|country|state) of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /born\s+in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /lived\s+in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /moved\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
        ];
    
        locationPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) locations.push(match[1].trim());
            }
        });
    
        return [...new Set(locations)];
    }

    private analyzeGeneration(timeframe: string, locations: string[]): GenerationInfo {
        const year = this.parseYear(timeframe);
        const region = this.determineRegion(locations);
        
        const generationData = getGenerationInfo(year, region);
        const confidence = this.calculateGenerationConfidence(generationData, year, locations);
    
        return {
            generation: generationData.mainGeneration?.name || 'Unknown',
            confidence: confidence,
            region: region,
            microGeneration: generationData.microGeneration?.name
        };
    }
    
    private parseYear(timeframe: string): number {
        const yearMatch = timeframe.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) return parseInt(yearMatch[0]);
        
        const decadeMatch = timeframe.match(/\b(19|20)\d{0}s\b/);
        if (decadeMatch) return parseInt(decadeMatch[0]) + 5; // middle of decade
        
        return 0;
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

    private storeAnalysisResult(analysis: AnalysisResult) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('generation-analysis', JSON.stringify({
                timestamp: Date.now(),
                analysis
            }));
        }
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
    
        // New structured approach for questions based on what's missing
        const questionStrategies = {
            timeframe: {
                indirect: [
                    "What world events do you remember most vividly from your childhood?",
                    "Which technological changes had the biggest impact on your early years?",
                    "What was popular culture like when you were growing up?"
                ],
                direct: [
                    "When you think about your childhood, what decade stands out the most?",
                    "Which era shaped your early experiences?",
                    "What year or decade represents your earliest memories?"
                ]
            },
            geography: {
                indirect: [
                    "What cultural traditions shaped your early years?",
                    "How would you describe the community where you spent your childhood?",
                    "What was unique about where you grew up?"
                ],
                direct: [
                    "Where did your earliest memories take place?",
                    "Which place had the biggest influence on your childhood?",
                    "What area do you consider your childhood home?"
                ]
            }
        };
    
        // Determine question approach based on attempt number
        const useDirectQuestions = attemptNumber >= 2;
        const needsBoth = analysis.missingInfo.birthTimeframe && analysis.missingInfo.geography;
    
        let questionFocus;
        if (needsBoth) {
            // If we need both, alternate between timeframe and geography
            questionFocus = attemptNumber % 2 === 0 ? 'timeframe' : 'geography';
        } else {
            // Otherwise, focus on what's missing
            questionFocus = analysis.missingInfo.birthTimeframe ? 'timeframe' : 'geography';
        }
    
        const basePrompt = `You are an engaging interviewer helping to understand someone's generational context. Your goal is to naturally gather ${needsBoth ? 'both timeframe and geographic' : analysis.missingInfo.birthTimeframe ? 'timeframe' : 'geographic'} information.
    
    Current context:
    - Attempt: ${attemptNumber + 1}/4
    - Missing: ${Object.entries(analysis.missingInfo)
        .filter(([_, missing]) => missing)
        .map(([key, _]) => key)
        .join(', ')}
    - Previous responses: ${JSON.stringify(responseValues)}
    - Already know: ${JSON.stringify(existingInfo)}
    
    Your approach should be:
    ${useDirectQuestions ? '- More direct, as previous indirect questions haven\'t yielded needed information' : '- Conversational and natural'}
    - Focused primarily on ${questionFocus}
    ${needsBoth ? '- But open to gathering both types of information' : ''}
    - Different from previous questions: ${this.previousQuestions.join(', ')}
    
    Example questions for this stage:
    ${questionStrategies[questionFocus][useDirectQuestions ? 'direct' : 'indirect']
        .map(q => `- ${q}`).join('\n')}
    
    Generate a single question that:
    1. Naturally leads to information about ${questionFocus}
    2. Is engaging and conversational
    3. Cannot be answered with a simple yes/no
    4. Builds on any partial information already shared
    5. ${useDirectQuestions ? 'Is direct but friendly' : 'Is subtle but purposeful'}
    
    Return only the question text.`;
    
        return basePrompt;
    }
    
    // Add validation for responses
    private validateResponse(response: string, targetInfo: { birthTimeframe: boolean; geography: boolean }): {
        isValid: boolean;
        extractedInfo: {
            timeframe?: string;
            location?: string;
        }
    } {
        const timeframe = this.extractTimeframe(response);
        const locations = this.extractLocations(response);
    
        return {
            isValid: (targetInfo.birthTimeframe ? !!timeframe : true) && 
                    (targetInfo.geography ? locations.length > 0 : true),
            extractedInfo: {
                timeframe,
                location: locations[0]
            }
        };
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
            let question: string;
            if (attemptNumber >= 2 && (analysis.missingInfo.birthTimeframe || analysis.missingInfo.geography)) {
                question = this.generateFallbackQuestion(analysis, attemptNumber);
                this.previousQuestions.push(question);
            } else {
                const prompt = this.constructPrompt(analysis, attemptNumber, previousResponses);
                this.debugLog('prompt-generated', { prompt });
    
                if (!this.anthropic) {
                    question = this.generateVariedQuestion(analysis, attemptNumber);
                    this.previousQuestions.push(question);
                } else {
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
    
                        question = message.content[0].text.trim();
                        if (this.isQuestionTooSimilar(question, this.previousQuestions)) {
                            question = this.generateVariedQuestion(analysis, attemptNumber);
                        }
                        this.previousQuestions.push(question);
                    } catch (llmError) {
                        this.debugLog('llm-error', { error: llmError });
                        question = this.generateVariedQuestion(analysis, attemptNumber);
                        this.previousQuestions.push(question);
                    }
                }
            }
    
            // Store the accumulated responses and analysis in localStorage
            if (typeof window !== 'undefined') {
                const existingData = localStorage.getItem('onboarding-step-one');
                const existingParsed = existingData ? JSON.parse(existingData) : {};
    
                const updatedData = {
                    ...existingParsed,
                    raw: previousResponses || {},
                    analysis: {
                        timeframe: analysis.extractedInfo?.timeframe,
                        locations: analysis.extractedInfo?.locations,
                        birthDate: analysis.extractedInfo?.timeframe, // for compatibility with step two
                        geography: analysis.extractedInfo?.locations?.[0],
                        sentiments: analysis.extractedInfo?.sentiments,
                        generationInfo: analysis.generationInfo
                    },
                    timestamp: Date.now(),
                    lastQuestion: question,
                    attemptNumber: attemptNumber
                };
    
                localStorage.setItem('onboarding-step-one', JSON.stringify(updatedData));
                
                // Store debug information separately
                this.debugLog('storage-update', {
                    previousData: existingParsed,
                    newData: updatedData
                });
            }
    
            return {
                question,
                targetInfo: analysis.missingInfo,
                validateResponse: (response: string) => this.validateResponse(response, analysis.missingInfo)
            };
    
        } catch (error) {
            this.debugLog('general-error', { error });
            const fallbackQuestion = this.generateVariedQuestion(analysis, attemptNumber);
            this.previousQuestions.push(fallbackQuestion);
            return {
                question: fallbackQuestion,
                targetInfo: analysis.missingInfo,
                validateResponse: (response: string) => this.validateResponse(response, analysis.missingInfo)
            };
        }
    }
    
    private generateDirectQuestion(missingInfo: { birthTimeframe: boolean; geography: boolean }): string {
        if (missingInfo.birthTimeframe && missingInfo.geography) {
            return "To help connect you with others who share your experiences, could you tell me when and where you grew up?";
        } else if (missingInfo.birthTimeframe) {
            return "What decade represents your earliest memories?";
        } else {
            return "Where did you spend your childhood years?";
        }
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