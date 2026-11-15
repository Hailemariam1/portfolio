import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#FBFAF7', 2: '#F3F0E9' },
        surface: '#FFFFFF',
        ink: { DEFAULT: '#16130F', soft: '#403A33', muted: '#736A5F' },
        line: { DEFAULT: '#E4DFD5', strong: '#D2CBBB' },
        clay: { DEFAULT: '#AE4F2E', soft: '#F8EBE4', deep: '#883B20' },
        moss: { DEFAULT: '#2C5B4C', soft: '#E8F1EC' },
        slateblue: { DEFAULT: '#36557D', soft: '#E9EEF5' },
        ochre: { DEFAULT: '#84601C', soft: '#F7EFDD' }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif']
      },
      maxWidth: { content: '74rem' },
      boxShadow: {
        lift: '0 24px 60px -32px rgba(22, 19, 15, 0.28)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.85)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'pulse-dot': 'pulse-dot 2.4s ease-in-out infinite'
      }
    }
  },
  plugins: [typography]
};
