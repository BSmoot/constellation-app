// src/lib/SmartFollowUpSystem.ts
import { onboardingQuestions } from '@/config/questions';

type ContextConfidence = {
    required: boolean;
    confidence: number;
    value?: string | string[];
}

type ContextNeeded = Record<string, ContextConfidence>;

export class SmartFollowUpSystem {
    private contextNeeded: ContextNeeded;

    constructor() {
        this.contextNeeded = onboardingQuestions.reduce((acc, question) => ({
            ...acc,
            [question.id]: { 
                required: true, 
                confidence: 0 
            }
        }), {});
    }

    analyzeResponses(responses: Record<string, string>) {
        const gaps: string[] = [];
        
        const analysis = {
            birthTimeframe: this.extractTimeframe(responses.birthDate),
            location: this.extractLocation(responses.background),
            socioeconomic: this.extractSocioeconomic(responses.background),
            cultural: this.extractCultural(responses.background),
            events: this.extractEvents(responses.influences),
            changes: this.extractChanges(responses.influences),
            current: this.extractCurrent(responses.currentFocus)
        };

        // Update confidence levels and identify gaps
        Object.entries(analysis).forEach(([key, value]) => {
            if (this.contextNeeded[key]) {
                this.contextNeeded[key].confidence = value.confidence;
                this.contextNeeded[key].value = value.markers;

                if (this.contextNeeded[key].required && value.confidence < 0.7) {
                    gaps.push(key);
                }
            }
        });

        return {
            analysis,
            gaps,
            needsFollowUp: gaps.length > 0
        };
    }

    generateFollowUp(analysis: { gaps: string[] }) {
        const followUps: string[] = [];

        if (analysis.gaps.includes('birthTimeframe')) {
            followUps.push("Can you tell me more about what was happening in the world when you were growing up?");
        }

        if (analysis.gaps.includes('location')) {
            followUps.push("What was your neighborhood or community like during your childhood?");
        }

        if (analysis.gaps.includes('events') || analysis.gaps.includes('changes')) {
            followUps.push("How did things change for people around you as you were growing up?");
        }

        if (analysis.gaps.includes('current')) {
            followUps.push("What differences do you notice most between now and your earlier years?");
        }

        return followUps.length > 0 ? followUps[0] : null;
    }

    private extractTimeframe(text: string) {
        let confidence = 0;
        const markers: string[] = [];

        // Basic implementation - should be enhanced
        if (text.length > 0) {
            confidence = 0.5;
            markers.push(text);
        }

        return {
            confidence,
            markers
        };
    }

    private extractLocation(text: string) {
        return {
            confidence: text.length > 0 ? 0.5 : 0,
            markers: text.length > 0 ? [text] : []
        };
    }

    private extractSocioeconomic(text: string) {
        return {
            confidence: text.length > 0 ? 0.5 : 0,
            markers: text.length > 0 ? [text] : []
        };
    }

    private extractCultural(text: string) {
        return {
            confidence: text.length > 0 ? 0.5 : 0,
            markers: text.length > 0 ? [text] : []
        };
    }

    private extractEvents(text: string) {
        return {
            confidence: text.length > 0 ? 0.5 : 0,
            markers: text.length > 0 ? [text] : []
        };
    }

    private extractChanges(text: string) {
        return {
            confidence: text.length > 0 ? 0.5 : 0,
            markers: text.length > 0 ? [text] : []
        };
    }

    private extractCurrent(text: string) {
        return {
            confidence: text.length > 0 ? 0.5 : 0,
            markers: text.length > 0 ? [text] : []
        };
    }

    private constructPrompt(analysis: AnalysisResult, attemptNumber: number, responses: Record<string, string> | null | undefined): string {
        // Safely handle potentially undefined responses
        const responseValues = responses ? Object.values(responses) : [];
        const existingInfo = this.analyzeResponseContent(responseValues.join(' '));
        
        const approachByAttempt = [
            {
                focus: "broad historical context",
                examples: [
                    "What's your earliest memory of a major world event that affected your community?",
                    "Which cultural or social movements were most talked about during your childhood?"
                ]
            },
            // ... rest of approachByAttempt array
        ];
    
        const currentApproach = approachByAttempt[attemptNumber % approachByAttempt.length];
        
        const basePrompt = `You are helping build connections between people through shared experiences and perspectives...`;
    
        return basePrompt;
    }
}