// src/app/onboarding/step-two/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { GenerationSelector } from './GenerationSelector';
import { useRouter } from 'next/navigation';

// Constants
const MAIN_GENERATIONS = [
    {
        name: "Baby Boomer",
        years: "1946-1964",
    },
    {
        name: "Generation X",
        years: "1965-1980",
    },
    {
        name: "Millennial",
        years: "1981-1996",
    },
    {
        name: "Generation Z",
        years: "1997-2012",
    },
    {
        name: "Generation Alpha",
        years: "2013-Present",
    }
];

const MICRO_GENERATIONS = [
    {
        name: "Generation Jones",
        years: "1954-1965",
        description: "Late Boomers with different cultural experiences"
    },
    {
        name: "Xennials",
        years: "1977-1983",
        description: "Analog childhood, digital young adulthood"
    },
    {
        name: "Zillennials",
        years: "1994-1998",
        description: "Cusp of Millennials and Gen Z"
    }
];

// Types
interface StepOneData {
    birthDate: string;
    anonymousId?: string;
    selectedGeneration?: string;
}

function determineInitialGeneration(data: StepOneData | null) {
    if (!data || !data.birthDate) {
        console.warn('No birth date found in data:', data);
        return 'Unknown Generation';
    }

    try {
        const birthYear = new Date(data.birthDate).getFullYear();
        console.log('Determined birth year:', birthYear);

        if (birthYear >= 2013) return "Generation Alpha";
        if (birthYear >= 1997) return "Generation Z";
        if (birthYear >= 1981) return "Millennial";
        if (birthYear >= 1965) return "Generation X";
        if (birthYear >= 1946) return "Baby Boomer";
        return "Traditionalist";
    } catch (error) {
        console.error('Error determining generation:', error);
        return 'Unknown Generation';
    }
}

export default function StepTwo() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [initialData, setInitialData] = useState<StepOneData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [anonymousId, setAnonymousId] = useState<string | null>(null);

    // Handle mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle data loading after mount
    useEffect(() => {
        if (!mounted) return;

        try {
            // First, try to get existing anonymous ID
            let storedAnonymousId = localStorage.getItem('anonymousId');
            if (storedAnonymousId) {
                setAnonymousId(storedAnonymousId);
                console.log('Found existing anonymous ID:', storedAnonymousId);
            }

            // Get step one data
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
    }, [mounted, router]);

    // Don't render anything until mounted
    if (!mounted) {
        return null;
    }

    async function handleGenerationSelect(generation: string) {
        try {
            console.log('Saving generation:', generation);
            setError(null);

            const response = await fetch('/api/generations/select', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    generation,
                    anonymousId,
                    birthDate: initialData?.birthDate
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save generation selection');
            }

            if (data.anonymousId) {
                localStorage.setItem('anonymousId', data.anonymousId);
                setAnonymousId(data.anonymousId);
                console.log('Saved new anonymous ID:', data.anonymousId);
            }

            if (initialData) {
                const updatedData = {
                    ...initialData,
                    selectedGeneration: generation,
                    anonymousId: data.anonymousId || anonymousId
                };
                localStorage.setItem('onboarding-step-one', JSON.stringify(updatedData));
                console.log('Updated local storage:', updatedData);
            }
        } catch (error: any) {
            console.error('Error saving generation selection:', error);
            setError(error.message || 'Failed to save generation selection');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F3522F]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-6">
                Thanks! Now let's refine your results.
            </h1>
            
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                </div>
            )}

            <GenerationSelector
                initialGeneration={determineInitialGeneration(initialData)}
                mainGenerations={MAIN_GENERATIONS}
                microGenerations={MICRO_GENERATIONS}
                onSelect={handleGenerationSelect}
            />
        </div>
    );
}