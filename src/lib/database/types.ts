// src/lib/database/types.ts
export interface DbGenerationMarker {
    id: number;
    markerType: 'decade' | 'socioEconomic' | 'technology' | 'cultural';
    key: string;
    markers: string[];
}

export interface DbUserResponse {
    id: number;
    questionId: QuestionId;
    responseText: string;
    timestamp: Date;
    parsedData: {
        birthDate?: ParsedBirthDate;
        background?: ParsedBackground;
        influences?: ParsedInfluences;
        currentFocus?: ParsedCurrentFocus;
    };
}