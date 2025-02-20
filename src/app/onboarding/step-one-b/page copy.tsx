// src/app/onboarding/step-one-b/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StepOneBPage() {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const focusAttempts = [0, 100, 200, 300].map((delay) =>
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, delay)
    );

    return () => focusAttempts.forEach((timeout) => clearTimeout(timeout));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFeedback(data.message);
    } catch (error) {
      console.error('Error fetching follow-up:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E9F1F7] flex items-center justify-center">
      <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-2">
          <div className="h-[48px] flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-dark font-jakarta">
              Follow-Up Questions
            </h1>
          </div>
          <div className="h-[32px] flex items-center justify-center">
            <p className="text-lg md:text-xl text-text-light font-jakarta">
              Help us refine your Constellation data
            </p>
          </div>
        </header>
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={feedback}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full px-4 py-3 border border-[#232C33]
                      border-opacity-50 rounded-lg
                      bg-white/90 backdrop-blur-sm focus:outline-none
                      focus:border-[#232C33] transition-colors duration-200
                      text-text-light resize-none shadow-sm
                      h-32"
                    />
                    <div className="ml-4 mt-1 text-xs text-text-light/50">
                      Press Enter to submit
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end items-center">
                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !input.trim()}
                    className={`ml-auto px-6 py-3 bg-[#F3522F] text-white rounded-lg
                      hover:bg-[#f4633f] transition-colors duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing ? 'Processing...' : 'Submit'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
            {feedback && (
              <div className="mt-3">
                <p className="text-lg text-text-light">{feedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}