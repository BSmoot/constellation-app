// src/lib/GenerationalContextParser.ts


type ParsedBirthDate = {
    decade: string;
    exactYear?: string;
    generationalCusp?: boolean;
    culturalEra: string[];
    technologicalEra: string[];
    confidence: number;
}

type ParsedBackground = {
    location: string;
    socioEconomic: string;
    environment: string;
    culturalContext: string[];
    communityType: string;
    confidence: number;
}

type ParsedInfluences = {
    events: string[];
    technologies: string[];
    socialChanges: string[];
    personalImpact: string[];
    timeframe: string;
    confidence: number;
}

type ParsedCurrentFocus = {
    themes: string[];
    concerns: string[];
    outlook: string;
    generationalPerspective: string;
    confidence: number;
}

export class GenerationalContextParser {
    private readonly decadeMarkers = {
        '1960s': ['sixties', '60s', '1960'],
        '1970s': ['seventies', '70s', '1970'],
        '1980s': ['eighties', '80s', '1980'],
        '1990s': ['nineties', '90s', '1990'],
        '2000s': ['two thousands', '00s', '2000']
    }

    private readonly socioEconomicMarkers = {
        'working-class': ['working class', 'blue collar', 'factory', 'labor'],
        'middle-class': ['middle class', 'suburban', 'comfortable'],
        'upper-middle-class': ['upper middle', 'privileged', 'well-off'],
        'lower-income': ['poor', 'struggling', 'difficult', 'poverty']
    }

    private readonly technologyMarkers = {
        'pre-digital': ['before computers', 'no internet', 'landline'],
        'early-digital': ['dial-up', 'first computer', 'early internet'],
        'mobile-transition': ['flip phone', 'cell phone', 'nokia'],
        'smartphone-era': ['iphone', 'smartphone', 'apps'],
        'social-media-era': ['facebook', 'social media', 'instagram']
    }

    async parseResponse(questionId: string, response: string) {
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
    }

    private async parseBirthDate(response: string) {
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
    }

    private async parseBackground(response: string) {
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
    }

    private async parseInfluences(response: string) {
        return {
            events: this.extractEvents(response) || [],
            technologies: this.extractTechnologies(response) || [],
            socialChanges: this.extractSocialChanges(response) || [],
            personalImpact: this.extractPersonalImpact(response) || [],
            timeframe: this.extractTimeframe(response) || '',
            confidence: 0.5 // Default confidence for now
        };
    }

    private async parseCurrentFocus(response: string) {
        return {
            themes: this.extractThemes(response) || [],
            concerns: this.extractConcerns(response) || [],
            outlook: this.extractOutlook(response) || '',
            generationalPerspective: this.identifyGenerationalPerspective(response) || '',
            confidence: 0.5 // Default confidence for now
        };
    }

    private identifyDecade(text: string): string {
        for (const [decade, markers] of Object.entries(this.decadeMarkers)) {
            if (markers.some(marker => text.toLowerCase().includes(marker.toLowerCase()))) {
                return decade;
            }
        }
        return 'unknown';
    }

    private extractExactYear(text: string): string | undefined {
        const yearMatch = text.match(/\b(19|20)\d{2}\b/);
        return yearMatch ? yearMatch[0] : undefined;
    }

    private isGenerationalCusp(decade: string, year?: string): boolean {
        if (!year) return false;
        const yearNum = parseInt(year);
        const cuspYears = [1981, 1996, 2012];
        return cuspYears.some(cuspYear => Math.abs(yearNum - cuspYear) <= 2);
    }

    private identifySocioEconomicContext(text: string): string {
        for (const [context, markers] of Object.entries(this.socioEconomicMarkers)) {
            if (markers.some(marker => text.toLowerCase().includes(marker.toLowerCase()))) {
                return context;
            }
        }
        return 'unknown';
    }

    private identifyTechEra(text: string): string[] {
        const eras: string[] = [];
        for (const [era, markers] of Object.entries(this.technologyMarkers)) {
            if (markers.some(marker => text.toLowerCase().includes(marker.toLowerCase()))) {
                eras.push(era);
            }
        }
        return eras;
    }

    private identifyCulturalEra(text: string): string[] {
        return [];
    }

    private identifyEnvironment(text: string): string {
        return 'unknown';
    }

    private identifyCommunityType(text: string): string {
        return 'unknown';
    }

    private extractLocation(text: string): string {
        return text.length > 0 ? text : 'unknown';
    }

    private extractCulturalContext(text: string): string[] {
        return [];
    }

    private extractTechnologies(text: string): string[] {
        return [];
    }

    private extractSocialChanges(text: string): string[] {
        return [];
    }

    private extractPersonalImpact(text: string): string[] {
        return [];
    }

    private extractEvents(text: string): string[] {
        return [];
    }

    private extractTimeframe(text: string): string {
        return '';
    }

    private extractThemes(text: string): string[] {
        return [];
    }

    private extractConcerns(text: string): string[] {
        return [];
    }

    private extractOutlook(text: string): string {
        return '';
    }

    private identifyGenerationalPerspective(text: string): string {
        return '';
    }

    private calculateConfidence(markers: (string | string[])[]): number {
        const flatMarkers = markers.flat().filter(m => m && m !== 'unknown');
        return Math.min(flatMarkers.length * 0.2, 1);
    }
}