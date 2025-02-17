// src/components/onboarding/OnboardingForm.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { onboardingQuestions } from '@/config/questions'
import { SmartFollowUpSystem } from '@/lib/SmartFollowUpSystem'
import { GenerationalContextParser } from '@/lib/GenerationalContextParser'

export default function OnboardingForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [storyData, setStoryData] = useState(() =>
    onboardingQuestions.reduce((acc, q) => ({
      ...acc,
      [q.id]: ''
    }), {})
  )

  // Add this useEffect right here, after the state declarations and before handleKeyDown
  useEffect(() => {
    // Try multiple times to ensure focus
    const focusAttempts = [0, 100, 200, 300].map(delay => 
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, delay)
    )

    // Cleanup all timeouts
    return () => focusAttempts.forEach(timeout => clearTimeout(timeout))
  }, [currentStep])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (storyData[onboardingQuestions[currentStep].id].trim()) {
        handleNext();
      }
    }
  }

  async function handleNext() {
    setIsProcessing(true)
    
    try {
      if (currentStep < onboardingQuestions.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        const smartSystem = new SmartFollowUpSystem()
        const analysis = smartSystem.analyzeResponses(storyData)
  
        if (analysis.needsFollowUp) {
          const followUpQuestion = smartSystem.generateFollowUp(analysis)
          console.log('Follow up needed:', followUpQuestion)
          return
        }
  
        const parser = new GenerationalContextParser()
        const parsedResponses = await Object.keys(storyData).reduce(
          async (acc, questionId) => ({
            ...await acc,
            [questionId]: await parser.parseResponse(questionId, storyData[questionId])
          }),
          Promise.resolve({})
        )
        
        localStorage.setItem('onboarding-step-one', JSON.stringify({
          raw: storyData,
          parsed: parsedResponses,
          analysis: analysis
        }))
        
        router.push('/onboarding/step-two')
      }
    } catch (error) {
      console.error('Error processing input:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-3">
            <div className="relative">
              <div className="h-[56px] flex items-end pb-2">
                <label className="block text-lg font-medium text-text-light">
                  {onboardingQuestions[currentStep].prompt}
                </label>
              </div>
              <textarea
                ref={textareaRef}
                value={storyData[onboardingQuestions[currentStep].id]}
                onChange={(e) => setStoryData(prev => ({
                  ...prev,
                  [onboardingQuestions[currentStep].id]: e.target.value
                }))}
                onKeyDown={handleKeyDown}
                placeholder={onboardingQuestions[currentStep].placeholder}
                className="w-full px-4 py-3 border border-[#232C33] 
                         border-opacity-50 rounded-lg 
                         bg-white/90 backdrop-blur-sm focus:outline-none 
                         focus:border-[#232C33] transition-colors duration-200
                         text-text-light resize-none shadow-sm
                         h-32"
              />
              <div className="ml-4 mt-1 text-xs text-text-light/50">
                Press Enter to continue, Shift+Enter for new line
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-text-light hover:text-dark transition-colors"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={isProcessing || !storyData[onboardingQuestions[currentStep].id].trim()}
              className={`ml-auto px-6 py-3 bg-[#F3522F] text-white rounded-lg 
                       hover:bg-[#f4633f] transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? 'Processing...' : 
               currentStep === onboardingQuestions.length - 1 ? 'Continue' : 'Next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center space-x-2 mt-2">
        {onboardingQuestions.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-colors duration-200 ${
              index === currentStep ? 'bg-[#F3522F]' : 'bg-[#F3522F]/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}