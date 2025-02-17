// src/config/ai-models.ts
export const AI_MODELS = {
    CLAUDE: {
        SONNET: "claude-3-5-sonnet-20241022", // older fallback: "claude-3-sonnet-20240229",
        OPUS: "claude-3-opus-20240229",
        HAIKU: "claude-3-haiku-20240307"  // newest model as of now
    }
} as const;

// You can add more configuration here
export const DEFAULT_MODEL = AI_MODELS.CLAUDE.HAIKU;
export const MAX_TOKENS = 1000;