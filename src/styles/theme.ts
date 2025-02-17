// src/styles/theme.ts

export const theme = {
    fonts: {
      header: 'font-jakarta',
      body: 'font-sans', // This will use Outfit as configured
    },
    text: {
      sizes: {
        h1: 'text-4xl md:text-5xl',
        h2: 'text-3xl md:text-4xl',
        h3: 'text-2xl md:text-3xl',
        subtitle: 'text-lg md:text-xl',
        body: 'text-base',
        small: 'text-sm',
      },
      weights: {
        normal: 'font-normal',
        medium: 'font-medium',
        bold: 'font-bold',
      }
    },
    colors: {
      primary: '#FCCA46',
      secondary: '#1A89CC',
      dark: '#232C33',
      background: '#F7E1D7',
      text: {
        primary: '#232C33',
        light: '#4A5561',
      }
    }
  } as const
  
  export function cn(...classes: (string | undefined)[]) {
    return classes.filter(Boolean).join(' ')
  }
  
  // Define specific component styles
  export const styles = {
    header: {
      h1: cn(
        theme.fonts.header,
        theme.text.sizes.h1,
        theme.text.weights.bold,
        'text-dark'
      ),
      subtitle: cn(
        theme.fonts.header,
        theme.text.sizes.subtitle,
        'text-text-light'
      )
    },
    form: {
      label: 'block text-sm font-medium text-text-light mb-2',
      input: 'w-full px-4 py-3 border border-dark/20 rounded-lg bg-white/80 backdrop-blur-sm focus:outline-none focus:border-secondary transition-colors duration-200',
      button: 'w-full py-3 px-4 bg-dark text-white rounded-lg hover:bg-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary'
    }
  }