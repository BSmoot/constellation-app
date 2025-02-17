// src/config/parser-prompts.ts
export const createSystemPrompts = (markers: {
    decadeMarkers: Record<string, string[]>,
    technologyMarkers: Record<string, string[]>,
    socioEconomicMarkers: Record<string, string[]>
}) => ({
    birthDate: {
        prompt: `Analyze this birth date response and extract relevant information. Use the following markers for validation:
        Decades: ${JSON.stringify(markers.decadeMarkers)}
        Technology Eras: ${JSON.stringify(markers.technologyMarkers)}
        
        Format the response as JSON with:
        {
            decade: string,
            exactYear?: string,
            generationalCusp: boolean,
            culturalEra: string[],
            technologicalEra: string[],
            confidence: number
        }`,
    },
    background: {
        prompt: `Analyze this background response and extract relevant information. Use the following markers for validation:
        Socio-Economic: ${JSON.stringify(markers.socioEconomicMarkers)}
        
        Format the response as JSON with:
        {
            location: string,
            socioEconomic: string,
            environment: string,
            culturalContext: string[],
            communityType: string,
            confidence: number
        }`,
    },
    influences: {
        prompt: `Analyze this influences response and extract:
        - Key events
        - Technologies (using: ${JSON.stringify(markers.technologyMarkers)})
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
    }
});