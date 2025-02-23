// src/types/index.ts
export interface StepOneData {
    raw: Record<string, string>;
    analysis: {
        timeframe?: string;
        locations?: string[];
        birthDate?: string;
        geography?: string;
        sentiments?: Record<string, string[]>;
    };
    timestamp: number;
}

export interface GenerationAnalysis {
    mainGeneration: string;
    confidence: number;
    alternativeGenerations: string[];
    microGenerations: string[];
    region: string;
}