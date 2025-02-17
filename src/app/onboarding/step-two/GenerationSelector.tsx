// src/app/onboarding/step-two/GenerationSelector.tsx
'use client';

import { generationSelectorTheme as theme } from '@/styles/theme/generation-selector';
import { useState, useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

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
}

export function GenerationSelector({
    initialGeneration,
    mainGenerations,
    microGenerations,
    onSelect
}: GenerationSelectorProps) {
    const [mounted, setMounted] = useState(false);
    const [selectedGeneration, setSelectedGeneration] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        setMounted(true);
        setSelectedGeneration(initialGeneration);
    }, [initialGeneration]);

    const handleSelect = (generation: string) => {
        setSelectedGeneration(generation);
        onSelect(generation);
        setIsEditing(false);
        setIsConfirmed(true);
    };

    if (!mounted) {
        return (
            <div className={theme.container}>
                <div className={theme.header.wrapper}>
                    <p className={theme.header.text}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={theme.container}>
            <div className={theme.header.wrapper}>
                <p className={theme.header.text}>
                    {isEditing ? (
                        "Select your generation:"
                    ) : (
                        <>
                            You are considered part of the{' '}
                            <span
                                className={theme.header.selectedText}
                                onClick={() => setIsEditing(true)}
                            >
                                {selectedGeneration || 'Loading...'}
                            </span>
                        </>
                    )}
                </p>
                {isConfirmed && !isEditing && (
                    <>
                        <CheckCircleIcon className={theme.controls.checkmark} />
                        <button
                            onClick={() => setIsEditing(true)}
                            className={theme.controls.changeButton}
                        >
                            <ArrowPathIcon className={theme.controls.changeIcon} />
                            Change
                        </button>
                    </>
                )}
            </div>

            {isEditing && (
                <div className={theme.selectionPanel.wrapper}>
                    <div>
                        <h3 className={theme.selectionPanel.section.title}>
                            Main Generations
                        </h3>
                        <div className={theme.selectionPanel.section.grid}>
                            {mainGenerations.map((gen) => (
                                <button
                                    key={gen.name}
                                    onClick={() => handleSelect(gen.name)}
                                    className={`${theme.selectionPanel.option.base} ${
                                        selectedGeneration === gen.name ? theme.selectionPanel.option.selected : ''
                                    }`}
                                >
                                    <div className={theme.selectionPanel.option.name}>{gen.name}</div>
                                    <div className={theme.selectionPanel.option.years}>{gen.years}</div>
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
                                        selectedGeneration === gen.name ? theme.selectionPanel.option.selected : ''
                                    }`}
                                >
                                    <div className={theme.selectionPanel.option.name}>{gen.name}</div>
                                    <div className={theme.selectionPanel.option.years}>{gen.years}</div>
                                    {gen.description && (
                                        <div className={theme.selectionPanel.option.description}>
                                            {gen.description}
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