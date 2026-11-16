import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: 'rgb(var(--paper) / <alpha-value>)',
          2: 'rgb(var(--paper-2) / <alpha-value>)'
        },
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)'
        },
        line: {
          DEFAULT: 'rgb(var(--line) / <alpha-value>)',
          strong: 'rgb(var(--line-strong) / <alpha-value>)'
        },
        clay: {
          DEFAULT: 'rgb(var(--clay) / <alpha-value>)',
          soft: 'rgb(var(--clay-soft) / <alpha-value>)',
          deep: 'rgb(var(--clay-deep) / <alpha-value>)'
        },
        moss: {
          DEFAULT: 'rgb(var(--moss) / <alpha-value>)',
          soft: 'rgb(var(--moss-soft) / <alpha-value>)'
        },
        slateblue: {
          DEFAULT: 'rgb(var(--slateblue) / <alpha-value>)',
          soft: 'rgb(var(--slateblue-soft) / <alpha-value>)'
        },
        plum: {
          DEFAULT: 'rgb(var(--plum) / <alpha-value>)',
          soft: 'rgb(var(--plum-soft) / <alpha-value>)'
        },
        ochre: {
          DEFAULT: 'rgb(var(--ochre) / <alpha-value>)',
          soft: 'rgb(var(--ochre-soft) / <alpha-value>)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif']
      },
      maxWidth: { content: '74rem' },
      boxShadow: {
        lift: '0 32px 80px -48px rgb(var(--shadow) / 0.45)',
        glow: '0 0 0 1px rgb(var(--glow) / 0.12), 0 24px 60px -40px rgb(var(--shadow) / 0.32)'
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
