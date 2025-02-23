'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { generationSelectorTheme as theme } from '@/styles/theme/generation-selector';
import { useRouter } from 'next/navigation';

interface GenerationOption {
    name: string;
    years: string;
    description?: string;
}

interface GenerationSelectorProps {
    initialGeneration: string;
    mainGenerations: GenerationOption[];
    microGenerations: GenerationOption[];
    onSelect: (generation: string) => void;
    confidence?: number;
    alternatives?: string[];
}

export function GenerationSelector({
    initialGeneration,
    mainGenerations,
    microGenerations,
    onSelect,
    confidence,
    alternatives
}: GenerationSelectorProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [selectedGeneration, setSelectedGeneration] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        setMounted(true);
        setSelectedGeneration(initialGeneration);
    }, [initialGeneration]);

    if (!mounted) {
        return (
            <div className={theme.container}>
                <div className={theme.header.wrapper}>
                    <p className={theme.header.text}>Loading...</p>
                </div>
            </div>
        );
    }

    const handleSelect = (generation: string) => {
        setSelectedGeneration(generation);
        onSelect(generation);
        setIsEditing(false);
        setIsConfirmed(true);
    };

    // Single sorted generations declaration
    const sortedGenerations = [...mainGenerations].sort((a, b) => {
        if (a.name === initialGeneration) return -1;
        if (b.name === initialGeneration) return 1;
        
        if (!alternatives?.length) return 0;
        
        const aIndex = alternatives.indexOf(a.name);
        const bIndex = alternatives.indexOf(b.name);
        
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        
        return aIndex - bIndex;
    });

    return (
        <div className={theme.container}>
            <button
                onClick={() => router.push('/onboarding/step-one')}
                className={theme.navigation.backButton}
            >
                <ArrowLeftIcon className={theme.navigation.backIcon} />
                Back to previous step
            </button>
            <div className={theme.header.wrapper}>
                <div className="space-y-2">
                    <p className={theme.header.text}>
                        {isEditing ? (
                            "Select your generation:"
                        ) : (
                            <>
                                You might think of yourself as part of the{' '}
                                <span
                                    className={theme.header.selectedText}
                                    onClick={() => setIsEditing(true)}
                                >
                                    {selectedGeneration}
                                </span>
                            </>
                        )}
                    </p>
                    {!isEditing && (
                        <div className="flex items-center space-x-2">
                            <p className={theme.header.confidence}>
                                We're {Math.round(confidence * 100)}% sure... but tell us if this is right.
                            </p>
                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                                <div 
                                    className="h-full bg-[#F3522F] rounded-full"
                                    style={{ width: `${Math.round(confidence * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {isConfirmed && !isEditing && (
                    <div className="flex items-center space-x-2">
                        <CheckCircleIcon className={theme.controls.checkmark} />
                        <button
                            onClick={() => setIsEditing(true)}
                            className={theme.controls.changeButton}
                        >
                            <ArrowPathIcon className={theme.controls.changeIcon} />
                            Change
                        </button>
                    </div>
                )}
            </div>

            {isEditing && (
                <div className={theme.selectionPanel.wrapper}>
                    <div>
                        <h3 className={theme.selectionPanel.section.title}>
                            Main Generations
                        </h3>
                        <div className={theme.selectionPanel.section.grid}>
                            {sortedGenerations.map((gen) => (
                                <button
                                    key={gen.name}
                                    onClick={() => handleSelect(gen.name)}
                                    className={`${theme.selectionPanel.option.base} ${
                                        selectedGeneration === gen.name 
                                            ? theme.selectionPanel.option.selected 
                                            : alternatives.includes(gen.name)
                                                ? theme.selectionPanel.option.alternative
                                                : ''
                                    }`}
                                >
                                    <div className={theme.selectionPanel.option.name}>
                                        {gen.name}
                                    </div>
                                    <div className={theme.selectionPanel.option.years}>
                                        {gen.years}
                                    </div>
                                    {alternatives.includes(gen.name) && (
                                        <div className={theme.selectionPanel.option.confidence}>
                                            {Math.round(
                                                (1 - alternatives.indexOf(gen.name) / alternatives.length) * 100
                                            )}% match
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className={theme.selectionPanel.section.title}>
                            Micro-Generations
                        </h3>
                        <div className={theme.selectionPanel.section.grid}>
                            {microGenerations.map((gen) => (
                                <button
                                    key={gen.name}
                                    onClick={() => handleSelect(gen.name)}
                                    className={`${theme.selectionPanel.option.base} ${
                                        selectedGeneration === gen.name 
                                            ? theme.selectionPanel.option.selected 
                                            : alternatives.includes(gen.name)
                                                ? theme.selectionPanel.option.alternative
                                                : ''
                                    }`}
                                >
                                    <div className={theme.selectionPanel.option.name}>
                                        {gen.name}
                                    </div>
                                    <div className={theme.selectionPanel.option.years}>
                                        {gen.years}
                                    </div>
                                    {gen.description && (
                                        <div className={theme.selectionPanel.option.description}>
                                            {gen.description}
                                        </div>
                                    )}
                                    {alternatives.includes(gen.name) && (
                                        <div className={theme.selectionPanel.option.confidence}>
                                            {Math.round(
                                                (1 - alternatives.indexOf(gen.name) / alternatives.length) * 100
                                            )}% match
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}