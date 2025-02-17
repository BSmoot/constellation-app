import OnboardingForm from '@/components/onboarding/OnboardingForm'
import { styles, layout, cn } from '@/config'

export default function StepOnePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-medium text-dark mb-2 font-jakarta">
            Build an Events Constellation
          </h1>
          <p className="text-lg md:text-xl text-text-light font-jakarta">
            Let's find out your REAL Generation:
          </p>
        </header>
        <div className="max-w-md mx-auto">
          <OnboardingForm />
        </div>
      </div>
    </main>
  )
}