// src/lib/GenerationalContextParser.ts
import { QuestionId } from '@/config/questions';
import {
    ParsedBirthDate,
    ParsedBackground,
    ParsedInfluences,
    ParsedCurrentFocus
} from './interfaces/parser';

/**
 * Parser class for analyzing generational context from user responses
 */
export class GenerationalContextParser {
    private decadeMarkers: Record<string, string[]>;
    private socioEconomicMarkers: Record<string, string[]>;
    private technologyMarkers: Record<string, string[]>;
    private db: Pool;
    private logger: Console;

    constructor() {
        this.logger = console;

        // For debugging
    console.log('Parser Password check:', process.env.POSTGRES_PASSWORD ? 'Password is set' : 'Password is NOT set');
    
    // Use the imported db instance instead of creating a new one
        this.db = db;

        // Initialize with hardcoded values
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
        /**
     * Initialize markers from database
     */
        private async initializeMarkers() {
            try {
                const dbDecadeMarkers = await this.loadMarkers('decade');
                const dbSocioEconomicMarkers = await this.loadMarkers('socioEconomic');
                const dbTechnologyMarkers = await this.loadMarkers('technology');
    
                // Merge with existing markers if DB markers exist
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
                // Continue with hardcoded markers if database fails
            }
        }
    
        /**
         * Load markers from database
         */
        private async loadMarkers(type: string): Promise<Record<string, string[]>> {
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
    
        /**
         * Save response to database
         */
        public async saveResponse(questionId: QuestionId, response: string, parsedData: any) {
            try {
                const res = await fetch('/api/db', {
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
                console.error('Failed to save response:', error);
                throw error;
            }
        }
    
        /**
         * Parse user response based on question type
         */
        async parseResponse(questionId: string, response: string) {
            try {
                switch (questionId) {
                    case 'birthDate':
                        return this.parseBirthDate(response);
                    case 'background':
                        return this.parseBackground(response);
                    case 'influences':
                        return this.parseInfluences(response);
                    case 'currentFocus':
                        return this.parseCurrentFocus(response);
                    default:
                        throw new Error(`Unknown question ID: ${questionId}`);
                }
            } catch (error) {
                this.logger.error(`Error parsing response for ${questionId}:`, error);
                throw error;
            }
        }
    
        /**
         * Parse birth date response
         */
        private async parseBirthDate(response: string): Promise<ParsedBirthDate> {
            try {
                const decade = this.identifyDecade(response);
                const exactYear = this.extractExactYear(response);
                const culturalEra = this.identifyCulturalEra(response) || [];
                const technologicalEra = this.identifyTechEra(response) || [];
                
                return {
                    decade,
                    exactYear,
                    generationalCusp: this.isGenerationalCusp(decade, exactYear),
                    culturalEra,
                    technologicalEra,
                    confidence: this.calculateConfidence([decade, ...culturalEra, ...technologicalEra])
                };
            } catch (error) {
                this.logger.error('Error parsing birth date:', error);
                throw error;
            }
        }
    
        /**
         * Parse background response
         */
        private async parseBackground(response: string): Promise<ParsedBackground> {
            try {
                const location = this.extractLocation(response);
                const socioEconomic = this.identifySocioEconomicContext(response);
                const environment = this.identifyEnvironment(response);
                const culturalContext = this.extractCulturalContext(response) || [];
                
                return {
                    location,
                    socioEconomic,
                    environment,
                    culturalContext,
                    communityType: this.identifyCommunityType(response),
                    confidence: this.calculateConfidence([location, socioEconomic, environment])
                };
            } catch (error) {
                this.logger.error('Error parsing background:', error);
                throw error;
            }
        }
    
        /**
         * Parse influences response
         */
        private async parseInfluences(response: string): Promise<ParsedInfluences> {
            try {
                return {
                    events: this.extractEvents(response) || [],
                    technologies: this.extractTechnologies(response) || [],
                    socialChanges: this.extractSocialChanges(response) || [],
                    personalImpact: this.extractPersonalImpact(response) || [],
                    timeframe: this.extractTimeframe(response) || '',
                    confidence: 0.5
                };
            } catch (error) {
                this.logger.error('Error parsing influences:', error);
                throw error;
            }
        }
    
        /**
         * Parse current focus response
         */
        private async parseCurrentFocus(response: string): Promise<ParsedCurrentFocus> {
            try {
                return {
                    themes: this.extractThemes(response) || [],
                    concerns: this.extractConcerns(response) || [],
                    outlook: this.extractOutlook(response) || '',
                    generationalPerspective: this.identifyGenerationalPerspective(response) || '',
                    confidence: 0.5
                };
            } catch (error) {
                this.logger.error('Error parsing current focus:', error);
                throw error;
            }
        }
            /**
     * Identify decade from text
     */
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

    /**
     * Extract exact year from text
     */
    private extractExactYear(text: string): string | undefined {
        try {
            const yearMatch = text.match(/\b(19|20)\d{2}\b/);
            return yearMatch ? yearMatch[0] : undefined;
        } catch (error) {
            this.logger.error('Error extracting year:', error);
            return undefined;
        }
    }

    /**
     * Determine if year is on a generational cusp
     */
    private isGenerationalCusp(decade: string, year?: string): boolean {
        try {
            if (!year) return false;
            const yearNum = parseInt(year);
            const cuspYears = [1981, 1996, 2012]; // Gen X/Millennial, Millennial/Gen Z, Gen Z/Alpha
            return cuspYears.some(cuspYear => Math.abs(yearNum - cuspYear) <= 2);
        } catch (error) {
            this.logger.error('Error checking generational cusp:', error);
            return false;
        }
    }

    /**
     * Identify socio-economic context from text
     */
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

    /**
     * Identify technological era markers from text
     */
    private identifyTechEra(text: string): string[] {
        try {
            const eras: string[] = [];
            for (const [era, markers] of Object.entries(this.technologyMarkers)) {
                if (markers.some(marker => text.toLowerCase().includes(marker.toLowerCase()))) {
                    eras.push(era);
                }
            }
            return eras;
        } catch (error) {
            this.logger.error('Error identifying tech era:', error);
            return [];
        }
    }

    /**
     * Identify cultural era markers from text
     * TODO: Implement pattern matching for cultural eras
     */
    private identifyCulturalEra(text: string): string[] {
        try {
            // Placeholder for future implementation
            return [];
        } catch (error) {
            this.logger.error('Error identifying cultural era:', error);
            return [];
        }
    }

    /**
     * Identify environment type from text
     * TODO: Implement environment identification
     */
    private identifyEnvironment(text: string): string {
        try {
            // Placeholder for future implementation
            return 'unknown';
        } catch (error) {
            this.logger.error('Error identifying environment:', error);
            return 'unknown';
        }
    }

    /**
     * Identify community type from text
     * TODO: Implement community type identification
     */
    private identifyCommunityType(text: string): string {
        try {
            // Placeholder for future implementation
            return 'unknown';
        } catch (error) {
            this.logger.error('Error identifying community type:', error);
            return 'unknown';
        }
    }

    /**
     * Extract location from text
     * TODO: Implement location extraction
     */
    private extractLocation(text: string): string {
        try {
            return text.length > 0 ? text : 'unknown';
        } catch (error) {
            this.logger.error('Error extracting location:', error);
            return 'unknown';
        }
    }

    /**
     * Extract cultural context from text
     * TODO: Implement cultural context extraction
     */
    private extractCulturalContext(text: string): string[] {
        try {
            // Placeholder for future implementation
            return [];
        } catch (error) {
            this.logger.error('Error extracting cultural context:', error);
            return [];
        }
    }
        /**
     * Extract technologies mentioned in text
     * TODO: Implement technology extraction
     */
        private extractTechnologies(text: string): string[] {
            try {
                // Placeholder for future implementation
                return [];
            } catch (error) {
                this.logger.error('Error extracting technologies:', error);
                return [];
            }
        }
    
        /**
         * Extract social changes mentioned in text
         * TODO: Implement social changes extraction
         */
        private extractSocialChanges(text: string): string[] {
            try {
                // Placeholder for future implementation
                return [];
            } catch (error) {
                this.logger.error('Error extracting social changes:', error);
                return [];
            }
        }
    
        /**
         * Extract personal impact statements from text
         * TODO: Implement personal impact extraction
         */
        private extractPersonalImpact(text: string): string[] {
            try {
                // Placeholder for future implementation
                return [];
            } catch (error) {
                this.logger.error('Error extracting personal impact:', error);
                return [];
            }
        }
    
        /**
         * Extract significant events from text
         * TODO: Implement event extraction
         */
        private extractEvents(text: string): string[] {
            try {
                // Placeholder for future implementation
                return [];
            } catch (error) {
                this.logger.error('Error extracting events:', error);
                return [];
            }
        }
    
        /**
         * Extract timeframe references from text
         * TODO: Implement timeframe extraction
         */
        private extractTimeframe(text: string): string {
            try {
                // Placeholder for future implementation
                return '';
            } catch (error) {
                this.logger.error('Error extracting timeframe:', error);
                return '';
            }
        }
    
        /**
         * Extract themes from text
         * TODO: Implement theme extraction
         */
        private extractThemes(text: string): string[] {
            try {
                // Placeholder for future implementation
                return [];
            } catch (error) {
                this.logger.error('Error extracting themes:', error);
                return [];
            }
        }
    
        /**
         * Extract concerns from text
         * TODO: Implement concerns extraction
         */
        private extractConcerns(text: string): string[] {
            try {
                // Placeholder for future implementation
                return [];
            } catch (error) {
                this.logger.error('Error extracting concerns:', error);
                return [];
            }
        }
    
        /**
         * Extract outlook from text
         * TODO: Implement outlook extraction
         */
        private extractOutlook(text: string): string {
            try {
                // Placeholder for future implementation
                return '';
            } catch (error) {
                this.logger.error('Error extracting outlook:', error);
                return '';
            }
        }
    
        /**
         * Identify generational perspective from text
         * TODO: Implement generational perspective identification
         */
        private identifyGenerationalPerspective(text: string): string {
            try {
                // Placeholder for future implementation
                return '';
            } catch (error) {
                this.logger.error('Error identifying generational perspective:', error);
                return '';
            }
        }
    
        /**
         * Calculate confidence score based on matched markers
         */
        private calculateConfidence(markers: (string | string[])[]): number {
            try {
                const flatMarkers = markers.flat().filter(m => m && m !== 'unknown');
                return Math.min(flatMarkers.length * 0.2, 1);
            } catch (error) {
                this.logger.error('Error calculating confidence:', error);
                return 0;
            }
        }
    }