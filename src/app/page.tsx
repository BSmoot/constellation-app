import OnboardingForm from '@/components/onboarding/OnboardingForm'
import { styles, layout, cn } from '@/config'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-medium text-dark mb-2 font-outfit">
            Build an Event Constellation
          </h1>
          <p className="text-lg md:text-xl text-text-light font-outfit">
            Let's map your REAL generation:
          </p>
        </header>
        <div className="max-w-md mx-auto">
          <OnboardingForm />
        </div>
      </div>
    </main>
  )
}