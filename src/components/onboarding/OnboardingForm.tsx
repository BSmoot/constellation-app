'use client'

import React, { useState } from 'react'
import { styles, cn } from '@/config'

type FormData = {
  birthDate: string
  birthPlace: string
  currentResidence: string
}

export default function OnboardingForm() {
  const [formData, setFormData] = useState<FormData>({
    birthDate: '',
    birthPlace: '',
    currentResidence: ''
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="relative">
          <label htmlFor="birthDate" className="block text-sm font-medium text-text-light mb-2">
            Birth Date
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-dark/20 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:border-secondary transition-colors duration-200 text-text-light/60 [&:not(:placeholder-shown)]:text-text-light/30 [&::-webkit-calendar-picker-indicator]:opacity-50"
            suppressHydrationWarning
          />
        </div>

        <div className="relative">
          <label htmlFor="birthPlace" className="block text-sm font-medium text-text-light mb-2">
            Birth Place
          </label>
          <input
            type="text"
            id="birthPlace"
            name="birthPlace"
            value={formData.birthPlace}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-dark/20 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:border-secondary transition-colors duration-200 placeholder:text-text-light/30 text-text-light"
            placeholder="City, Country"
          />
        </div>

        <div className="relative">
          <label htmlFor="currentResidence" className="block text-sm font-medium text-text-light mb-2">
            Current Residence
          </label>
          <input
            type="text"
            id="currentResidence"
            name="currentResidence"
            value={formData.currentResidence}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-dark/20 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:border-secondary transition-colors duration-200 placeholder:text-text-light/30 text-text-light"
            placeholder="City, Country"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-dark text-white rounded-lg hover:bg-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
      >
        Continue Your Journey
      </button>
    </form>
  )
}