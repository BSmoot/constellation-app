// src/app/onboarding/step-one/page.tsx
'use client';

import OnboardingForm from '@/components/onboarding/OnboardingForm'

export default function StepOnePage() {
  return (
    <main className="min-h-screen bg-[#E9F1F7] flex items-center justify-center">
      <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-2">
          <div className="h-[48px] flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-dark font-jakarta">
              Let's Make History!
            </h1>
          </div>
          <div className="h-[32px] flex items-center justify-center">
            <p className="text-lg md:text-xl text-text-light font-jakarta">
              Map your life's context and find your REAL generation
            </p>
          </div>
        </header>
        <div className="max-w-md mx-auto">
          <OnboardingForm />
        </div>
      </div>
    </main>
  )
}