// src/lib/types/parser.ts
export type ParsedBirthDate = {
    decade: string;
    exactYear?: string;
    generationalCusp?: boolean;
    culturalEra: string[];
    technologicalEra: string[];
    confidence: number;
}

export type ParsedBackground = {
    location: string;
    socioEconomic: string;
    environment: string;
    culturalContext: string[];
    communityType: string;
    confidence: number;
}

export type ParsedInfluences = {
    events: string[];
    technologies: string[];
    socialChanges: string[];
    personalImpact: string[];
    timeframe: string;
    confidence: number;
}

export type ParsedCurrentFocus = {
    themes: string[];
    concerns: string[];
    outlook: string;
    generationalPerspective: string;
    confidence: number;
}