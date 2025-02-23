// src/app/onboarding/step-one-b/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import DebugPanel with no SSR
const DebugPanel = dynamic(() => import('@/components/DebugPanel'), {
    ssr: false,
    loading: () => null
});

interface StepOneBData {
    previousResponses: Record<string, string>;
    requiredInfo: {
        birthTimeframe: boolean;
        geography: boolean;
    };
}


interface ApiResponse {
    success: boolean;
    question?: string;
    error?: string;
    requiredInfo?: {
        birthTimeframe: boolean;
        geography: boolean;
    };
    proceedWithUnknown?: boolean;
}

const initialStepData: StepOneBData = {
    previousResponses: {},
    requiredInfo: {
        birthTimeframe: false,
        geography: false,
    }
};

export default function StepOneBPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [followUpQuestion, setFollowUpQuestion] = useState('');
    const [isProcessing, setIsProcessing] = useState(true);
    const [stepData, setStepData] = useState<StepOneBData>(initialStepData);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                const stepOneData = localStorage.getItem('onboarding-step-one');
                if (stepOneData) {
                    const parsed = JSON.parse(stepOneData);
                    setStepData(prev => ({
                        ...prev,
                        previousResponses: parsed.raw || {},
                    }));
                    await generateInitialQuestion(parsed.raw || {});
                } else {
                    await generateInitialQuestion({});
                }
            } catch (error) {
                console.error('Error during initialization:', error);
                setFeedback('There was an issue loading your data. Please try refreshing the page.');
            } finally {
                setMounted(true);
            }
        };
    
        initialize();
    }, []);

    const generateInitialQuestion = async (responses: Record<string, string>) => {
        setIsProcessing(true);
        try {
            const response = await fetch('/api/follow-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    responses: responses || {},
                    attempts: 0
                }),
            });
    
            const data: ApiResponse = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
    
            if (data.success) {
                setFollowUpQuestion(data.question || '');
                if (data.requiredInfo) {
                    setStepData(prev => ({
                        ...prev,
                        requiredInfo: data.requiredInfo,
                    }));
                }
            } else {
                throw new Error(data.error || 'Failed to generate question');
            }
        } catch (error) {
            console.error('Error generating initial question:', error);
            setFeedback('There was an issue generating the question. Please try refreshing the page.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isProcessing) {
                handleSubmit(e);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;
    
        setIsProcessing(true);
        setFeedback('');
    
        const updatedResponses = {
            ...stepData.previousResponses,
            [`response${stepData.currentAttempt}`]: input,
        };
    
        try {
            const response = await fetch('/api/follow-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    responses: updatedResponses,
                    attempts: stepData.currentAttempt
                }),
            });
    
            const data: ApiResponse = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }
    
            // Store responses and proceed to step two
            localStorage.setItem('onboarding-complete', JSON.stringify({
                responses: updatedResponses,
                generation: data.generation || 'unknown',
                timestamp: Date.now()
            }));
            
            router.push('/onboarding/step-two');
    
        } catch (error) {
            console.error('Error processing response:', error);
            setFeedback('There was an issue processing your response. Please try again.');
        } finally {
            setIsProcessing(false);
            setInput('');
        }
    };

    if (!mounted) {
        return (
            <main className="min-h-screen bg-[#E9F1F7] flex items-center justify-center">
                <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#E9F1F7] flex items-center justify-center">
          <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
            <header className="mb-8 space-y-2">
              <div className="h-[48px] flex items-center justify-center">
                <h1 className="text-4xl md:text-5xl font-bold text-dark font-jakarta">
                  Let's Get More Specific
                </h1>
              </div>
              <div className="h-[32px] flex items-center justify-center">
                <p className="text-lg md:text-xl text-text-light font-jakarta">
                  Help us understand your story better
                </p>
              </div>
            </header>
    
            <div className="max-w-md mx-auto">
              <AnimatePresence mode="wait">
                {isProcessing ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center items-center py-12"
                  >
                    <div className="spinner"></div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="question"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-sm"
                  >
                    {followUpQuestion && (
                      <p className="text-lg text-dark mb-4">{followUpQuestion}</p>
                    )}
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your response here..."
                      className="w-full px-4 py-3 border border-[#232C33] border-opacity-50 
                               rounded-lg focus:outline-none focus:border-[#232C33] 
                               transition-colors duration-200 text-text-light resize-none h-32"
                    />
                    <div className="flex justify-end items-center mt-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || !input.trim()}
                        className="px-6 py-3 bg-[#F3522F] text-white rounded-lg
                                hover:bg-[#f4633f] transition-colors duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Processing...' : 'Continue'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
    
              {feedback && (
                <div className="mt-3 text-center">
                  <p className="text-lg text-text-light">{feedback}</p>
                </div>
              )}
            </div>
          </div>
        </main>
    );
}
{/* process.env.NODE_ENV === 'development' && <DebugPanel /> */}