// src/app/onboarding/step-two/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { GenerationSelector } from './GenerationSelector';
import { useRouter } from 'next/navigation';

export default function StepTwo() {
    const router = useRouter();
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Retrieve step one data from localStorage
        const stepOneData = localStorage.getItem('onboarding-step-one');
        if (!stepOneData) {
            router.push('/onboarding/step-one');
            return;
        }
        
        setInitialData(JSON.parse(stepOneData));
        setLoading(false);
    }, [router]);

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
            
            <GenerationSelector 
                initialGeneration={determineInitialGeneration(initialData)}
                mainGenerations={MAIN_GENERATIONS}
                microGenerations={MICRO_GENERATIONS}
                onSelect={handleGenerationSelect}
            />
        </div>
    );
}

// Sample generation data (we'll move this to a proper data file)
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

function determineInitialGeneration(data: any) {
    // This is a placeholder - we'll implement proper generation determination logic
    const birthYear = new Date(data.birthDate).getFullYear();
    
    if (birthYear >= 2013) return "Generation Alpha";
    if (birthYear >= 1997) return "Generation Z";
    if (birthYear >= 1981) return "Millennial";
    if (birthYear >= 1965) return "Generation X";
    if (birthYear >= 1946) return "Baby Boomer";
    
    return "Traditionalist";
}

async function handleGenerationSelect(generation: string) {
    try {
        // Save to database
        const response = await fetch('/api/generations/select', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ generation }),
        });

        if (!response.ok) {
            throw new Error('Failed to save generation selection');
        }

        // Update localStorage
        const stepOneData = localStorage.getItem('onboarding-step-one');
        if (stepOneData) {
            const data = JSON.parse(stepOneData);
            data.selectedGeneration = generation;
            localStorage.setItem('onboarding-step-one', JSON.stringify(data));
        }
    } catch (error) {
        console.error('Error saving generation selection:', error);
        // Handle error appropriately
    }
}