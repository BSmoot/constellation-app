import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
          light: '#4A5561',
        }
      },
      fontFamily: {
        jakarta: ['var(--font-plus-jakarta)'],
        sans: ['var(--font-outfit)'],
      }
    },
  },
  plugins: [],
} satisfies Config;