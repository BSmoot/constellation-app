import type { Config } from "tailwindcss";

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FCCA46',
          50: '#FEF9E8',
          100: '#FEF3D1',
          200: '#FDE7A3',
          300: '#FDDB75',
          400: '#FCCA46', // Your original primary color
          500: '#FCB846',
          600: '#E6A641',
          700: '#CC8F39',
          800: '#B37831',
          900: '#996129',
        },
        secondary: {
          DEFAULT: '#1A89CC',
          light: '#3AA1E9',
          dark: '#156FA8',
        },
        dark: '#232C33',
        background: '#F7E1D7',
        text: {
          DEFAULT: '#232C33',
          light: '#4A5561',
        },
        metal: '#2C3E50',
        steel: '#95A5A6',
        accent: '#E74C3C',
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        jakarta: ['var(--font-plus-jakarta)'],
        sans: ['var(--font-outfit)'],
      }
    },
  },
  plugins: [],
} satisfies Config;