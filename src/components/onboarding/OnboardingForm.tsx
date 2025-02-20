'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { onboardingQuestions } from '@/config/questions'
// Remove SmartFollowUpSystem import
import { GenerationalContextParser } from '@/lib/GenerationalContextParser'

export default function OnboardingForm() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Initialize storyData without accessing localStorage
  const [storyData, setStoryData] = useState<Record<string, string>>(() => 
    onboardingQuestions.reduce((acc, q) => ({...acc, [q.id]: ''}), {})
  )

  // Handle client-side initialization
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding-step-one')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setStoryData(parsed.raw || storyData)
        } catch (error) {
          console.error('Error parsing saved data:', error)
        }
      }
    }
  }, [])

  // Focus effect remains the same
  useEffect(() => {
    const focusAttempts = [0, 100, 200, 300].map(delay =>
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, delay)
    )
    return () => focusAttempts.forEach(clearTimeout)
  }, [currentStep])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mounted) return;
    
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }
  
    if (e.key === 'Enter') {
      e.preventDefault();
      if (storyData[onboardingQuestions[currentStep].id].trim()) {
        handleNext();
      }
    }
  };
  

  async function handleNext() {
    setIsProcessing(true)
    try {
      if (currentStep < onboardingQuestions.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('onboarding-responses', JSON.stringify(storyData))
        }
        router.push('/onboarding/step-one-b')
      }
    } catch (error) {
      console.error('Error processing input:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Don't render anything until mounted
  if (!mounted) {
    return null
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
                onKeyDown={mounted ? handleKeyDown : undefined}
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
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-text-light hover:text-dark transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!mounted || isProcessing || !storyData[onboardingQuestions[currentStep].id].trim()}
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