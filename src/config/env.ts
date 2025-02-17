// src/config/env.ts
export const env = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY as string,
    
    // Function to validate environment variables
    validate: () => {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is required');
      }
    }
  };