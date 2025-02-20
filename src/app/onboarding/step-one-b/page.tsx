'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Move interface outside component
interface StepOneBData {
  previousResponses: Record<string, string>;
  currentAttempt: number;
  requiredInfo: {
    birthTimeframe: boolean;
    geography: boolean;
  };
}

// Initial state constant
const initialStepData: StepOneBData = {
  previousResponses: {},
  currentAttempt: 0,
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepData, setStepData] = useState<StepOneBData>(initialStepData);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle client-side initialization
  useEffect(() => {
    setMounted(true);
    const stepOneData = localStorage.getItem('onboarding-step-one');
    if (stepOneData) {
      const parsed = JSON.parse(stepOneData);
      setStepData(prev => ({
        ...prev,
        previousResponses: parsed.raw || {}
      }));
      generateInitialQuestion(parsed.raw || {});
    } else {
      generateInitialQuestion({});
    }
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
                responses,
                attempts: 0
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            setFollowUpQuestion(data.question || 'Tell us more about when and where you grew up.');
            setStepData(prev => ({
                ...prev,
                requiredInfo: data.requiredInfo || prev.requiredInfo
            }));
        } else {
            throw new Error(data.error || 'Failed to generate question');
        }
    } catch (error) {
        console.error('Error generating initial question:', error);
        setFollowUpQuestion('Tell us more about when and where you grew up.');
        setFeedback('There was an issue generating the question, but you can still continue.');
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
    setIsProcessing(true);
    setFeedback('');

    try {
        const response = await fetch('/api/follow-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input,
                previousResponses: stepData.previousResponses,
                attempts: stepData.currentAttempt
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Update local storage with new responses
        const updatedResponses = {
            ...stepData.previousResponses,
            [`response${stepData.currentAttempt}`]: input
        };

        if (data.proceedWithUnknown || stepData.currentAttempt >= 3) {
            localStorage.setItem('onboarding-complete', JSON.stringify({
                responses: updatedResponses,
                generation: 'unknown',
                timestamp: Date.now()
            }));
            router.push('/onboarding/step-two');
        } else {
            setStepData(prev => ({
                ...prev,
                currentAttempt: prev.currentAttempt + 1,
                requiredInfo: data.requiredInfo || prev.requiredInfo,
                previousResponses: updatedResponses
            }));
            setFollowUpQuestion(data.question);
        }
    } catch (error) {
        console.error('Error processing response:', error);
        setFeedback('There was an issue processing your response. Please try again.');
    } finally {
        setIsProcessing(false);
        setInput('');
    }
};

  // Don't render content until client-side hydration is complete
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
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={followUpQuestion}
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
                  className="w-full px-4 py-3 border border-[#232C33]
                           border-opacity-50 rounded-lg focus:outline-none
                           focus:border-[#232C33] transition-colors duration-200
                           text-text-light resize-none h-32"
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-text-light">
                    {4 - stepData.currentAttempt} questions remaining
                  </span>
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
            </AnimatePresence>

            {feedback && (
              <div className="mt-3 text-center">
                <p className="text-lg text-text-light">{feedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}