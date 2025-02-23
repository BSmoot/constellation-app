import type { Config } from "tailwindcss";

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Note: covers app directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // covers component directory
    './src/**/*.{js,ts,jsx,tsx,mdx}', // covers src directory if you're using it
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FCCA46',
        secondary: '#1A89CC',
        dark: '#232C33',
        background: '#F7E1D7',
        text: {
          DEFAULT: '#232C33',
          light: '#7992A4',
        },
        metal: '#2C3E50',
        steel: '#95A5A6',
        accent: '#E74C3C'
      },
      fontFamily: {
        jakarta: ['var(--font-plus-jakarta)'],
        sans: ['var(--font-outfit)'],
      }
    },
  },
  plugins: [],
} satisfies Config;