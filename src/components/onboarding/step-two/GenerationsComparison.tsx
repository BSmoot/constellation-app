'use client'

import React from 'react'

type Generation = {
  id: string
  name: string
  yearRange: string
  keyEvents: string[]
  characteristics: string[]
}

const generations: Generation[] = [
  {
    id: 'silent',
    name: 'Silent Generation',
    yearRange: '1928-1945',
    keyEvents: [
      'Great Depression',
      'World War II',
      'Post-war economic boom'
    ],
    characteristics: [
      'Traditional values',
      'Strong work ethic',
      'Financial prudence'
    ]
  },
  {
    id: 'boomer',
    name: 'Baby Boomers',
    yearRange: '1946-1964',
    keyEvents: [
      'Civil Rights Movement',
      'Vietnam War',
      'Moon Landing'
    ],
    characteristics: [
      'Strong career focus',
      'Social change advocates',
      'Economic prosperity'
    ]
  },
  {
    id: 'genx',
    name: 'Generation X',
    yearRange: '1965-1980',
    keyEvents: [
      'Cold War end',
      'Rise of personal computers',
      'MTV era'
    ],
    characteristics: [
      'Independent',
      'Adaptable',
      'Work-life balance pioneers'
    ]
  },
  {
    id: 'millennial',
    name: 'Millennials',
    yearRange: '1981-1996',
    keyEvents: [
      '9/11',
      'Rise of internet',
      '2008 Financial Crisis'
    ],
    characteristics: [
      'Digital natives',
      'Value experiences',
      'Social consciousness'
    ]
  },
  {
    id: 'genz',
    name: 'Generation Z',
    yearRange: '1997-2012',
    keyEvents: [
      'Social media era',
      'Climate crisis',
      'COVID-19 pandemic'
    ],
    characteristics: [
      'Digital integration',
      'Global mindset',
      'Mental health aware'
    ]
  }
]

type GenerationsComparisonProps = {
  selectedGeneration: string
  onGenerationSelect: (generation: string) => void
}

export default function GenerationsComparison({
  selectedGeneration,
  onGenerationSelect
}: GenerationsComparisonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-dark mb-2">
          Traditional Generations
        </h2>
        <p className="text-text-light text-sm">
          Select the generation you most identify with:
        </p>
      </div>

      <div className="space-y-4">
        {generations.map((gen) => (
          <div
            key={gen.id}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selectedGeneration === gen.id
                ? 'border-secondary bg-secondary/5'
                : 'border-dark/20 hover:border-secondary/50'
            }`}
            onClick={() => onGenerationSelect(gen.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-dark">{gen.name}</h3>
                <p className="text-sm text-text-light">{gen.yearRange}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                selectedGeneration === gen.id
                  ? 'border-secondary bg-secondary'
                  : 'border-dark/20'
              }`} />
            </div>
            
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-sm font-medium text-dark mb-1">Key Events:</p>
                <ul className="text-sm text-text-light">
                  {gen.keyEvents.map((event, index) => (
                    <li key={index} className="inline">
                      {event}
                      {index < gen.keyEvents.length - 1 ? ', ' : ''}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-dark mb-1">Characteristics:</p>
                <ul className="text-sm text-text-light">
                  {gen.characteristics.map((char, index) => (
                    <li key={index} className="inline">
                      {char}
                      {index < gen.characteristics.length - 1 ? ', ' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-text-light italic">
        Note: These are traditional categorizations. Your personal experience may vary.
      </p>
    </div>
  )
}