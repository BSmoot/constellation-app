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
    extractedInfo: {
        birthYear?: number;        // Normalized year
        birthDecade?: number;      // Normalized decade
        locations: string[];       // Primary and secondary locations
        primaryRegion?: string;    // Main geographic region
        interests?: string[];      // Topics/events of interest
        culturalMarkers?: string[]; // Cultural identifiers
    };
    missingInfo: {
        birthTimeframe: boolean;
        geography: boolean;
    };
}

interface FollowUpResponse {
    question: string;           // User-facing question only
    isEnrichment: boolean;      // Helps determine context
    debugInfo: {
        prompt: string;         // Full prompt sent to LLM
        analysis: AnalysisResult;
        state: typeof SmartFollowUpSystem.prototype.state;
        patterns: ReturnType<typeof SmartFollowUpSystem.prototype.getPatternMatches>;
        previousQuestions: string[];
        context: string;        // The context/commentary used to generate the question
    };
}

class SmartFollowUpSystem {
    private anthropic: any | null = null;
    private supabase: any | null = null;
    private logger: Console;
    private previousQuestions: Set<string> = new Set();
    private state: {
        currentAttempt: number;
        lastAnalysis: AnalysisResult | null;
        enrichmentPhase: boolean;
    } = {
        currentAttempt: 0,
        lastAnalysis: null,
        enrichmentPhase: false
    };

    constructor() {
        this.logger = console;
        if (typeof window === 'undefined') {
            this.initializeServerSide().catch(error => {
                this.logger.error('Server-side initialization failed:', error);
            });
        } else {
            // Restore state from localStorage if available
            const savedState = localStorage.getItem('followup-state');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                this.previousQuestions = new Set(parsed.previousQuestions);
                this.state = parsed.state;
            }
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

    private extractTimeframe(text: string): { year?: number; decade?: number } {
        const patterns = {
            fullYear: /\b(19|20)\d{2}\b/,                    // 1985
            shortYear: /\b[\'']?(\d{2})\b/,                  // '85 or 85
            decadeSpecific: /\b(19|20)\d{0}s\b/,            // 1980s or 80s
            decadeColloquial: /\b(early|mid|late)\s+(19|20)\d{0}s\b/, // early 80s
            birthYear: /born\s+in\s+(?:the\s+)?(?:year\s+)?(\d{2,4})/i,
            birthDecade: /born\s+in\s+(?:the\s+)?(19|20)\d{0}s/i
        };

        // Try to extract exact year first
        const fullYearMatch = text.match(patterns.fullYear);
        if (fullYearMatch) {
            return { year: parseInt(fullYearMatch[0]) };
        }

        // Try short year format
        const shortYearMatch = text.match(patterns.shortYear);
        if (shortYearMatch) {
            const year = parseInt(shortYearMatch[1]);
            // Determine century (19xx or 20xx)
            const century = year > 50 ? 1900 : 2000;
            return { year: century + year };
        }

        // Try decade formats
        const decadeMatch = text.match(patterns.decadeSpecific) || 
                           text.match(patterns.decadeColloquial);
        if (decadeMatch) {
            const decade = parseInt(decadeMatch[0].match(/\d{2,3}/)[0]) * 10;
            return { decade };
        }

        return {};
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

    private extractInterests(text: string): string[] {
        const interests: string[] = [];
        const interestPatterns = [
            /(?:interested in|fascinated by|passionate about)\s+([^,.]+)/gi,
            /(?:love|enjoy|like)\s+(?:to\s+)?([^,.]+)/gi,
            /(?:my|our)\s+(?:hobby|interest|passion)\s+(?:is|was)\s+([^,.]+)/gi
        ];

        interestPatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) interests.push(match[1].trim());
            }
        });

        return [...new Set(interests)];
    }

    private extractCulturalMarkers(text: string): string[] {
        const markers: string[] = [];
        const patterns = [
            /(?:identify|connected|belong)\s+(?:with|to)\s+([^,.]+)/gi,
            /(?:part of|member of)\s+([^,.]+)/gi,
            /(?:my|our)\s+(?:culture|community|people)\s+([^,.]+)/gi
        ];

        patterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match[1]) markers.push(match[1].trim());
            }
        });

        return [...new Set(markers)];
    }

    private determinePrimaryRegion(locations: string[]): string | undefined {
        return locations[0]; // This should be enhanced with region mapping logic
    }

    private debugLog(type: string, data: any) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            data,
            state: this.state,
            analysis: {
                patterns: {
                    timeframe: {
                        fullYear: /\b(19|20)\d{2}\b/.test(data?.text || ''),
                        decade: /\b(19|20)\d{0}s\b/.test(data?.text || '')
                    },
                    location: {
                        direct: /\b(?:city|country|town|state)\b/i.test(data?.text || ''),
                        context: /\b(?:born|grew up|raised)\s+in\b/i.test(data?.text || '')
                    }
                }
            }
        };
        console.log('SmartFollowUpSystem Debug:', logEntry);
        
        if (typeof window !== 'undefined') {
            const logs = JSON.parse(localStorage.getItem('followup-debug-logs') || '[]');
            logs.push(logEntry);
            localStorage.setItem('followup-debug-logs', JSON.stringify(logs));
        }
    }

    private getPatternMatches(text: string) {
        return {
            timeframe: {
                fullYear: /\b(19|20)\d{2}\b/.test(text),
                shortYear: /\b[\'']?\d{2}\b/.test(text),
                decade: /\b(19|20)\d{0}s\b/.test(text),
                decadeColloquial: /\b(early|mid|late)\s+(19|20)\d{0}s\b/.test(text)
            },
            location: {
                direct: /\b(?:city|country|town|state)\b/i.test(text),
                context: /\b(?:born|grew up|raised)\s+in\b/i.test(text),
                cultural: /\b(?:community|neighborhood|region)\b/i.test(text)
            }
        };
    }

    public analyzeResponses(responses: Record<string, string>): AnalysisResult {
        const allText = Object.values(responses).join(' ');
        const timeframe = this.extractTimeframe(allText);
        const locations = this.extractLocations(allText);
        const interests = this.extractInterests(allText);

        return {
            needsFollowUp: !timeframe.year && !timeframe.decade || locations.length === 0,
            hasBirthTimeframe: !!timeframe.year || !!timeframe.decade,
            hasGeography: locations.length > 0,
            extractedInfo: {
                birthYear: timeframe.year,
                birthDecade: timeframe.decade,
                locations,
                primaryRegion: this.determinePrimaryRegion(locations),
                interests,
                culturalMarkers: this.extractCulturalMarkers(allText)
            },
            missingInfo: {
                birthTimeframe: !timeframe.year && !timeframe.decade,
                geography: locations.length === 0
            }
        };
    }

    // Modify the question generation methods:
    private async generateEnrichmentQuestion(analysis: AnalysisResult, attemptNumber: number): Promise<FollowUpResponse> {
        const context = `We know they were ${analysis.extractedInfo.birthYear ? 
            `born in ${analysis.extractedInfo.birthYear}` : 
            `born in the ${analysis.extractedInfo.birthDecade}s`} 
        in ${analysis.extractedInfo.primaryRegion}.
        Known interests: ${analysis.extractedInfo.interests?.join(', ') || 'none yet'}
        Cultural markers: ${analysis.extractedInfo.culturalMarkers?.join(', ') || 'none yet'}`;

        const prompt = `${context}
        
        Previous questions: ${Array.from(this.previousQuestions).join(', ')}
        
        Generate a single, conversational question about their experience with historical events, 
        cultural changes, or social movements from their formative years.
        
        Return only the question, with no additional commentary or context.`;

        const message = await this.anthropic.messages.create({
            model: DEFAULT_MODEL,
            max_tokens: MAX_TOKENS,
            messages: [{ role: "user", content: prompt }]
        });

        return {
            question: message.content[0].text.trim(),
            isEnrichment: true,
            debugInfo: {
                prompt,
                analysis,
                state: this.state,
                patterns: this.getPatternMatches(message.content[0].text),
                previousQuestions: Array.from(this.previousQuestions),
                context
            }
        };
    }

    private async generateRequiredInfoQuestion(analysis: AnalysisResult, attemptNumber: number) {
        const prompt = `Generate a single, natural conversational question to help establish ${
            analysis.missingInfo.birthTimeframe ? 'when' : ''
        }${analysis.missingInfo.birthTimeframe && analysis.missingInfo.geography ? ' and ' : ''}${
            analysis.missingInfo.geography ? 'where' : ''
        } this person grew up.
        
        IMPORTANT: Return ONLY the question itself, with no explanation or context.
        Previous questions: ${Array.from(this.previousQuestions).join(', ')}`;
    
        const message = await this.anthropic.messages.create({
            model: DEFAULT_MODEL,
            max_tokens: MAX_TOKENS,
            messages: [{ role: "user", content: prompt }]
        });
    
        return {
            question: message.content[0].text.trim(),
            targetInfo: analysis.missingInfo,
            isEnrichment: false
        };
    }

    async generateFollowUp(analysis: AnalysisResult, config?: FollowUpConfig) {
        const attemptNumber = config?.attemptNumber || 0;
        this.state.currentAttempt = attemptNumber;
        this.state.lastAnalysis = analysis;
        
        const hasRequiredInfo = !analysis.missingInfo.birthTimeframe && 
                               !analysis.missingInfo.geography;

        // Update state
        this.state.enrichmentPhase = hasRequiredInfo;
        
        // Store state in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('followup-state', JSON.stringify({
                previousQuestions: Array.from(this.previousQuestions),
                state: this.state
            }));
        }

        try {
            const result = hasRequiredInfo ? 
                await this.generateEnrichmentQuestion(analysis, attemptNumber) :
                await this.generateRequiredInfoQuestion(analysis, attemptNumber);

            this.previousQuestions.add(result.question);

            return {
                ...result,
                debugInfo: {
                    previousQuestions: Array.from(this.previousQuestions),
                    state: this.state,
                    patterns: this.getPatternMatches(result.question)
                }
            };
        } catch (error) {
            this.debugLog('error', { error, state: this.state });
            throw error;
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
}

// Export singleton instance
export const followUpSystem = new SmartFollowUpSystem();