// src/lib/GenerationalContextParser.ts
// Remove the direct import
// import db from './database/db-server';
import { QuestionId } from '@/config/questions';
import {
    ParsedBirthDate,
    ParsedBackground,
    ParsedInfluences,
    ParsedCurrentFocus
} from './interfaces/parser';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/config/env';

export class GenerationalContextParser {
    private anthropic: Anthropic | null;
    private decadeMarkers: Record<string, string[]>;
    private socioEconomicMarkers: Record<string, string[]>;
    private technologyMarkers: Record<string, string[]>;
    private db: any; // temporarily use any
    private logger: Console;

    constructor() {
        this.logger = console;
        this.anthropic = null;
        
        // Only initialize db and anthropic on the server side
        if (typeof window === 'undefined') {
            // Dynamic import
            import('./database/db-server').then(db => {
                this.db = db.default;
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

        // Initialize database markers
        this.initializeMarkers().catch(error => {
            this.logger.error('Failed to initialize markers:', error);
        });
    }

    // Keep your existing initializeMarkers and loadMarkers methods
    private async initializeMarkers() {
        // ... (your existing implementation)
    }

    private async loadMarkers(type: string): Promise<Record<string, string[]>> {
        if (typeof window !== 'undefined') {
            return {};
        }

        try {
            const result = await this.db?.query(
                'SELECT key, markers FROM generation_markers WHERE marker_type = $1',
                [type]
            );
            return result?.rows.reduce((acc, row) => ({
                ...acc,
                [row.key]: row.markers
            }), {}) || {};
        } catch (error) {
            this.logger.error(`Failed to load ${type} markers:`, error);
            return {};
        }
    }


    /**
     * Parse user response using Claude
     */
    async parseResponse(questionId: string, response: string) {
        try {
            const systemPrompts = {
                birthDate: {
                    prompt: `Analyze this birth date response and extract relevant information. Use the following markers for validation:
                    Decades: ${JSON.stringify(this.decadeMarkers)}
                    Technology Eras: ${JSON.stringify(this.technologyMarkers)}
                    
                    Format the response as JSON with:
                    {
                        decade: string,
                        exactYear?: string,
                        generationalCusp: boolean,
                        culturalEra: string[],
                        technologicalEra: string[],
                        confidence: number
                    }`,
                    validator: this.parseBirthDate.bind(this)
                },
                background: {
                    prompt: `Analyze this background response and extract relevant information. Use the following markers for validation:
                    Socio-Economic: ${JSON.stringify(this.socioEconomicMarkers)}
                    
                    Format the response as JSON with:
                    {
                        location: string,
                        socioEconomic: string,
                        environment: string,
                        culturalContext: string[],
                        communityType: string,
                        confidence: number
                    }`,
                    validator: this.parseBackground.bind(this)
                },
                influences: {
                    prompt: `Analyze this influences response and extract:
                    - Key events
                    - Technologies (using: ${JSON.stringify(this.technologyMarkers)})
                    - Social changes
                    - Personal impact statements
                    - Timeframe references
                    
                    Format as JSON with:
                    {
                        events: string[],
                        technologies: string[],
                        socialChanges: string[],
                        personalImpact: string[],
                        timeframe: string,
                        confidence: number
                    }`,
                    validator: this.parseInfluences.bind(this)
                },
                currentFocus: {
                    prompt: `Analyze this current focus response and extract:
                    - Main themes
                    - Key concerns
                    - Overall outlook
                    - Generational perspective
                    
                    Format as JSON with:
                    {
                        themes: string[],
                        concerns: string[],
                        outlook: string,
                        generationalPerspective: string,
                        confidence: number
                    }`,
                    validator: this.parseCurrentFocus.bind(this)
                }
            };

            // Get the appropriate prompt and validator
            const config = systemPrompts[questionId as keyof typeof systemPrompts];
            if (!config) {
                throw new Error(`Unknown question ID: ${questionId}`);
            }

            // Call Claude API
            const message = await this.anthropic.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 1000,
                messages: [{
                    role: "user",
                    content: `${config.prompt}\n\nResponse to analyze: "${response}"`
                }]
            });

            // Parse Claude's response
            const claudeParsed = JSON.parse(message.content[0].text);

            // Validate with existing methods
            const validatedResponse = await config.validator(response);

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

    // Keep all your existing parsing methods as fallbacks and validators
    private async parseBirthDate(response: string): Promise<ParsedBirthDate> {
        // ... (your existing implementation)
    }

    private async parseBackground(response: string): Promise<ParsedBackground> {
        // ... (your existing implementation)
    }

    // ... (keep all other existing methods)
}