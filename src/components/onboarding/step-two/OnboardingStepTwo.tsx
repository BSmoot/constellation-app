'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { styles, cn } from '@/config'
import GenerationsComparison from './GenerationsComparison'

type StepTwoData = {
  culturalInfluences: string
  valuesPriorities: string
  generationIdentity: string
}

export default function OnboardingStepTwo() {
  const router = useRouter()
  const [formData, setFormData] = useState<StepTwoData>({
    culturalInfluences: '',
    valuesPriorities: '',
    generationIdentity: ''
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('onboarding-step-two', JSON.stringify(formData))
    // We'll add navigation to results page later
    console.log('Form submitted:', formData)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-text-light hover:text-dark transition-colors duration-200"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Back to Previous Step
        </button>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
              1
            </div>
            <div className="w-16 h-1 bg-secondary"></div>
            <div className="w-8 h-8 rounded-full border-2 border-secondary bg-white text-secondary flex items-center justify-center">
              2
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side: Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="relative">
                  <label htmlFor="culturalInfluences" className="block text-sm font-medium text-text-light mb-2">
                    What cultural influences shaped your worldview?
                  </label>
                  <textarea
                    id="culturalInfluences"
                    name="culturalInfluences"
                    value={formData.culturalInfluences}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-dark/20 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:border-secondary transition-colors duration-200 min-h-[100px] text-text-light"
                    placeholder="Consider media, technology, historical events..."
                  />
                </div>

                <div className="relative">
                  <label htmlFor="valuesPriorities" className="block text-sm font-medium text-text-light mb-2">
                    What values and priorities define your generation?
                  </label>
                  <textarea
                    id="valuesPriorities"
                    name="valuesPriorities"
                    value={formData.valuesPriorities}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-dark/20 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:border-secondary transition-colors duration-200 min-h-[100px] text-text-light"
                    placeholder="Think about work-life balance, social causes, technology adoption..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-dark text-white rounded-lg hover:bg-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              >
                Continue to Results
              </button>
            </form>
          </div>

          {/* Right side: Generations Comparison */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm">
            <GenerationsComparison 
              selectedGeneration={formData.generationIdentity}
              onGenerationSelect={(gen) => setFormData(prev => ({ ...prev, generationIdentity: gen }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}