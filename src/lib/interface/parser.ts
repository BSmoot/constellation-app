// src/lib/interfaces/parser.ts
export interface ParsedBirthDate {
    decade: string;
    exactYear?: string;
    generationalCusp?: boolean;
    culturalEra: string[];
    technologicalEra: string[];
    confidence: number;
}

export interface ParsedBackground {
    location: string;
    socioEconomic: string;
    environment: string;
    culturalContext: string[];
    communityType: string;
    confidence: number;
}

export interface ParsedInfluences {
    events: string[];
    technologies: string[];
    socialChanges: string[];
    personalImpact: string[];
    timeframe: string;
    confidence: number;
}

export interface ParsedCurrentFocus {
    themes: string[];
    concerns: string[];
    outlook: string;
    generationalPerspective: string;
    confidence: number;
}