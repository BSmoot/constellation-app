// src/lib/client/useSmartFollowUp.ts
'use client'

import { useCallback } from 'react';

export function useSmartFollowUp() {
    const analyzeClientResponses = useCallback(async (responses: Record<string, string>) => {
        try {
            const response = await fetch('/api/follow-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ responses }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to analyze responses');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error analyzing responses:', error);
            throw error;
        }
    }, []);

    return { analyzeClientResponses };
}