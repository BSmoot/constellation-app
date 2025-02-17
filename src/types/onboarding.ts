import { z } from 'zod'

export const OnboardingSchema = z.object({
  birthDate: z.string()
    .min(1, 'Birth date is required')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      return birthDate <= today
    }, 'Birth date cannot be in the future'),
  birthPlace: z.string()
    .min(2, 'Birth place must be at least 2 characters')
    .max(100, 'Birth place must be less than 100 characters'),
  currentResidence: z.string()
    .min(2, 'Current residence must be at least 2 characters')
    .max(100, 'Current residence must be less than 100 characters')
})

export type OnboardingData = z.infer<typeof OnboardingSchema>
