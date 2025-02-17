// src/config/env.ts
export const env = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  // ... other env variables

  validate() {
      if (typeof window === 'undefined' && !this.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY is required on server side');
      }
      // ... other validations
  }
}