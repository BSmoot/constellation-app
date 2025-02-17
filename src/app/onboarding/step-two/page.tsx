import OnboardingStepTwo from '@/components/onboarding/step-two/OnboardingStepTwo'
import { styles, layout, cn } from '@/config'

export default function StepTwoPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-medium text-dark mb-2 font-jakarta">
            Your Generational Context
          </h1>
          <p className="text-lg md:text-xl text-text-light font-jakarta">
            Help us understand your place in history
          </p>
        </header>
        <div className="max-w-md mx-auto">
          <OnboardingStepTwo />
        </div>
      </div>
    </main>
  )
}