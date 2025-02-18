// src/app/onboarding/step-two/page.tsx
'use client'; // This tells Next.js this component runs in the browser

import { useEffect, useState } from 'react';
import { GenerationSelector } from './GenerationSelector';
import { useRouter } from 'next/navigation';

// Types help us maintain data consistency
interface StepOneData {
    birthDate: string;
    anonymousId?: string;
    selectedGeneration?: string;
}

export default function StepTwo() {
    const router = useRouter();
    
    // State management for our component
    const [initialData, setInitialData] = useState<StepOneData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anonymousId, setAnonymousId] = useState<string | null>(null);

    // This runs when the component mounts in the browser
    useEffect(() => {
        try {
            // First, try to get existing anonymous ID
            let storedAnonymousId = localStorage.getItem('anonymousId');
            
            // If we don't have one, we'll get it from the server later
            if (storedAnonymousId) {
                setAnonymousId(storedAnonymousId);
                console.log('Found existing anonymous ID:', storedAnonymousId);
            }

            // Get the data from step one
            const stepOneData = localStorage.getItem('onboarding-step-one');
            if (!stepOneData) {
                console.log('No step one data found, redirecting...');
                router.push('/onboarding/step-one');
                return;
            }

            // Parse and store the data
            const parsedData = JSON.parse(stepOneData) as StepOneData;
            console.log('Loaded step one data:', parsedData);
            setInitialData(parsedData);
            setLoading(false);
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Failed to load your previous responses');
            setLoading(false);
        }
    }, [router]); // Only runs when router changes

    // This function handles the generation selection
    async function handleGenerationSelect(generation: string) {
        try {
            console.log('Saving generation:', generation);
            setError(null); // Clear any previous errors

            // Make the API call to our server
            const response = await fetch('/api/generations/select', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    generation,
                    anonymousId, // Send our anonymous ID if we have one
                    birthDate: initialData?.birthDate
                }),
            });

            // Parse the server's response
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save generation selection');
            }

            // If the server sent us a new anonymous ID, save it
            if (data.anonymousId) {
                localStorage.setItem('anonymousId', data.anonymousId);
                setAnonymousId(data.anonymousId);
                console.log('Saved new anonymous ID:', data.anonymousId);
            }

            // Update local storage with the selection
            if (initialData) {
                const updatedData = {
                    ...initialData,
                    selectedGeneration: generation,
                    anonymousId: data.anonymousId || anonymousId
                };
                localStorage.setItem('onboarding-step-one', JSON.stringify(updatedData));
                console.log('Updated local storage:', updatedData);
            }

            // Optionally, show success message or redirect
            // router.push('/onboarding/step-three');
        } catch (error: any) {
            console.error('Error saving generation selection:', error);
            setError(error.message || 'Failed to save generation selection');
        }
    }

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F3522F]"></div>
            </div>
        );
    }

    // Main component render
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">
                Thanks! Now let's refine your results.
            </h1>
            
            {/* Show any errors */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Generation selector component */}
            <GenerationSelector
                initialGeneration={determineInitialGeneration(initialData)}
                mainGenerations={MAIN_GENERATIONS}
                microGenerations={MICRO_GENERATIONS}
                onSelect={handleGenerationSelect}
            />
        </div>
    );
}