// src/config/fonts.ts
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google'

export const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta'
})

export const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit'
})