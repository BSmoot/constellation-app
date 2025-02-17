'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StepTwoPage() {
  const router = useRouter()
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Add loading state

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('onboarding-step-one')
      if (savedData) {
        setParsedData(JSON.parse(savedData))
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleStartOver = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding-step-one')
    }
    router.push('/onboarding/step-one')
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!parsedData) {
    router.push('/onboarding/step-one')
    return null
  }

  return (
    <main className="min-h-screen bg-[#E9F1F7] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Parsing Results</h1>
          <button 
            onClick={handleStartOver}
            className="px-6 py-3 bg-[#F3522F] text-white rounded-lg 
                     hover:bg-[#f4633f] transition-colors duration-200"
          >
            Back to Beginning
          </button>
        </div>
        
        <div className="space-y-8">
          {/* Original Responses */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-4">Original Responses</h2>
            {Object.entries(parsedData.raw).map(([key, value]) => (
              <div key={key} className="mb-4">
                <h3 className="font-medium text-black">{key}:</h3>
                <p className="mt-1 text-gray-600">{value}</p>
              </div>
            ))}
          </section>

          {/* Parsed Birth Date */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-4">Birth Date Analysis</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-black">Decade:</h3>
                <p className="mt-1 text-gray-600">{parsedData.parsed.birthDate.decade}</p>
              </div>
              {parsedData.parsed.birthDate.exactYear && (
                <div>
                  <h3 className="font-medium text-black">Exact Year:</h3>
                  <p className="mt-1 text-gray-600">{parsedData.parsed.birthDate.exactYear}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium text-black">Generational Cusp:</h3>
                <p className="mt-1 text-gray-600">
                  {parsedData.parsed.birthDate.generationalCusp ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-black">Confidence:</h3>
                <p className="mt-1 text-gray-600">
                  {(parsedData.parsed.birthDate.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            {parsedData.parsed.birthDate.culturalEra.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-black">Cultural Era Markers:</h3>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  {parsedData.parsed.birthDate.culturalEra.map((era, i) => (
                    <li key={i}>{era}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Background Analysis */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-4">Background Analysis</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-black">Location:</h3>
                <p className="mt-1 text-gray-600">{parsedData.parsed.background.location}</p>
              </div>
              <div>
                <h3 className="font-medium text-black">Socio-Economic Context:</h3>
                <p className="mt-1 text-gray-600">{parsedData.parsed.background.socioEconomic}</p>
              </div>
              <div>
                <h3 className="font-medium text-black">Environment:</h3>
                <p className="mt-1 text-gray-600">{parsedData.parsed.background.environment}</p>
              </div>
              <div>
                <h3 className="font-medium text-black">Community Type:</h3>
                <p className="mt-1 text-gray-600">{parsedData.parsed.background.communityType}</p>
              </div>
            </div>
          </section>

          {/* Analysis Summary */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-4">Analysis Summary</h2>
            <div>
              <h3 className="font-medium text-black">Needs Follow-up:</h3>
              <p className="mt-1 text-gray-600">{parsedData.analysis.needsFollowUp ? 'Yes' : 'No'}</p>
            </div>
            {parsedData.analysis.gaps.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-black">Information Gaps:</h3>
                <ul className="mt-1 list-disc list-inside text-gray-600">
                  {parsedData.analysis.gaps.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}