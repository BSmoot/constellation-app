// src/lib/GenerationalContextParser.ts
import type { Pool } from 'pg';
import { QuestionId } from '@/config/questions';
import {
    ParsedBirthDate,
    ParsedBackground,
    ParsedInfluences,
    ParsedCurrentFocus
} from './interfaces/parser';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/config/env';
import { AI_MODELS, DEFAULT_MODEL, MAX_TOKENS } from '@/config/ai-models';
import { createSystemPrompts } from '@/config/parser-prompts';

export class GenerationalContextParser {
    private anthropic: Anthropic | null;
    private decadeMarkers: Record<string, string[]>;
    private socioEconomicMarkers: Record<string, string[]>;
    private technologyMarkers: Record<string, string[]>;
    private db: any; // temporarily use any
    private logger: Console;
    private systemPrompts: ReturnType<typeof createSystemPrompts>;

    constructor() {
        this.logger = console;
        this.anthropic = null;
        this.db = null;

        // Only initialize db and anthropic on the server side
        if (typeof window === 'undefined') {
            // Dynamic import with proper error handling
            import('./database/db-server').then(db => {
                this.db = db.default;
                this.logger.log('Database initialized successfully');
            }).catch(err => {
                this.logger.error('Failed to load database:', err);
            });

            // Initialize Anthropic client
            if (!process.env.ANTHROPIC_API_KEY) {
                throw new Error('ANTHROPIC_API_KEY is required');
            }
            
            this.anthropic = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
        }

        // Initialize markers
        this.decadeMarkers = {
            '1960s': ['sixties', '60s', '1960'],
            '1970s': ['seventies', '70s', '1970'],
            '1980s': ['eighties', '80s', '1980'],
            '1990s': ['nineties', '90s', '1990'],
            '2000s': ['two thousands', '00s', '2000']
        };

        this.socioEconomicMarkers = {
            'working-class': ['working class', 'blue collar', 'factory', 'labor'],
            'middle-class': ['middle class', 'suburban', 'comfortable'],
            'upper-middle-class': ['upper middle', 'privileged', 'well-off'],
            'lower-income': ['poor', 'struggling', 'difficult', 'poverty']
        };

        this.technologyMarkers = {
            'pre-digital': ['before computers', 'no internet', 'landline'],
            'early-digital': ['dial-up', 'first computer', 'early internet'],
            'mobile-transition': ['flip phone', 'cell phone', 'nokia'],
            'smartphone-era': ['iphone', 'smartphone', 'apps'],
            'social-media-era': ['facebook', 'social media', 'instagram']
        };

        // Initialize system prompts
        this.systemPrompts = createSystemPrompts({
            decadeMarkers: this.decadeMarkers,
            technologyMarkers: this.technologyMarkers,
            socioEconomicMarkers: this.socioEconomicMarkers
        });

        // Initialize database markers
        this.initializeMarkers().catch(error => {
            this.logger.error('Failed to initialize markers:', error);
        });
    }

    private async initializeMarkers() {
        try {
            const dbDecadeMarkers = await this.loadMarkers('decade');
            const dbSocioEconomicMarkers = await this.loadMarkers('socioEconomic');
            const dbTechnologyMarkers = await this.loadMarkers('technology');

            if (Object.keys(dbDecadeMarkers).length > 0) {
                this.decadeMarkers = { ...this.decadeMarkers, ...dbDecadeMarkers };
            }
            if (Object.keys(dbSocioEconomicMarkers).length > 0) {
                this.socioEconomicMarkers = { ...this.socioEconomicMarkers, ...dbSocioEconomicMarkers };
            }
            if (Object.keys(dbTechnologyMarkers).length > 0) {
                this.technologyMarkers = { ...this.technologyMarkers, ...dbTechnologyMarkers };
            }
        } catch (error) {
            this.logger.error('Failed to initialize markers:', error);
        }
    }

    private async loadMarkers(type: string): Promise<Record<string, string[]>> {
        if (!this.db) {
            this.logger.warn('Database not initialized');
            return {};
        }

        try {
            const result = await this.db.query(
                'SELECT key, markers FROM generation_markers WHERE marker_type = $1',
                [type]
            );
            return result.rows.reduce((acc, row) => ({
                ...acc,
                [row.key]: row.markers
            }), {});
        } catch (error) {
            this.logger.error(`Failed to load ${type} markers:`, error);
            return {};
        }
    }

    async parseResponse(questionId: string, response: string) {
        try {
            if (!this.anthropic) {
                throw new Error('Anthropic client not initialized');
            }

            const config = this.systemPrompts[questionId as keyof typeof this.systemPrompts];
            if (!config) {
                throw new Error(`Unknown question ID: ${questionId}`);
            }

            // Call Claude API
            const message = await this.anthropic.messages.create({
                model: DEFAULT_MODEL,
                max_tokens: MAX_TOKENS,
                messages: [{
                    role: "user",
                    content: `${config.prompt}\n\nResponse to analyze: "${response}"`
                }]
            });

            // Parse Claude's response
            const claudeParsed = JSON.parse(message.content[0].text);

            // Validate with existing methods
            const validator = this[`parse${questionId.charAt(0).toUpperCase() + questionId.slice(1)}`].bind(this);
            const validatedResponse = await validator(response);

            // Merge Claude's insights with validated data
            const mergedResponse = {
                ...validatedResponse,
                ...claudeParsed,
                confidence: Math.max(validatedResponse.confidence, claudeParsed.confidence)
            };

            // Save the response
            await this.saveResponse(questionId as QuestionId, response, mergedResponse);

            return mergedResponse;

        } catch (error) {
            this.logger.error(`Error parsing response for ${questionId}:`, error);
            throw error;
        }
    }

    // Existing parsing methods
    private async parseBirthDate(response: string): Promise<ParsedBirthDate> {
        try {
            return {
                decade: this.identifyDecade(response),
                exactYear: this.extractExactYear(response),
                generationalCusp: false,
                culturalEra: [],
                technologicalEra: [],
                confidence: 0.5
            };
        } catch (error) {
            this.logger.error('Error parsing birth date:', error);
            throw error;
        }
    }

    private async parseBackground(response: string): Promise<ParsedBackground> {
        try {
            return {
                location: 'unknown',
                socioEconomic: this.identifySocioEconomicContext(response),
                environment: 'unknown',
                culturalContext: [],
                communityType: 'unknown',
                confidence: 0.5
            };
        } catch (error) {
            this.logger.error('Error parsing background:', error);
            throw error;
        }
    }

    private async parseInfluences(response: string): Promise<ParsedInfluences> {
        try {
            return {
                events: [],
                technologies: [],
                socialChanges: [],
                personalImpact: [],
                timeframe: '',
                confidence: 0.5
            };
        } catch (error) {
            this.logger.error('Error parsing influences:', error);
            throw error;
        }
    }

    private async parseCurrentFocus(response: string): Promise<ParsedCurrentFocus> {
        try {
            return {
                themes: [],
                concerns: [],
                outlook: '',
                generationalPerspective: '',
                confidence: 0.5
            };
        } catch (error) {
            this.logger.error('Error parsing current focus:', error);
            throw error;
        }
    }

    // In GenerationalContextParser.ts
    private async saveResponse(questionId: QuestionId, response: string, parsedData: any) {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${baseUrl}/api/save-response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    questionId,
                    response,
                    parsedData
                })
            });
            
            if (!res.ok) {
                throw new Error('Failed to save response');
            }
            
            return await res.json();
        } catch (error) {
            this.logger.error('Failed to save response:', error);
            throw error;
        }
    }

    private identifyDecade(text: string): string {
        try {
            for (const [decade, markers] of Object.entries(this.decadeMarkers)) {
                if (markers.some(marker => text.toLowerCase().includes(marker.toLowerCase()))) {
                    return decade;
                }
            }
            return 'unknown';
        } catch (error) {
            this.logger.error('Error identifying decade:', error);
            return 'unknown';
        }
    }

    private extractExactYear(text: string): string | undefined {
        try {
            const yearMatch = text.match(/\b(19|20)\d{2}\b/);
            return yearMatch ? yearMatch[0] : undefined;
        } catch (error) {
            this.logger.error('Error extracting year:', error);
            return undefined;
        }
    }

    private identifySocioEconomicContext(text: string): string {
        try {
            for (const [context, markers] of Object.entries(this.socioEconomicMarkers)) {
                if (markers.some(marker => text.toLowerCase().includes(marker.toLowerCase()))) {
                    return context;
                }
            }
            return 'unknown';
        } catch (error) {
            this.logger.error('Error identifying socio-economic context:', error);
            return 'unknown';
        }
    }
}