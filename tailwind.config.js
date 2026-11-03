/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070a13',
          900: '#0B0F19',
          850: '#0f172a',
          800: '#131d33',
          750: '#17233e',
          700: '#1e2d4d',
          600: '#2a3b61',
        },
        brand: {
          purple: '#8B5CF6',
          indigo: '#6366F1',
          violet: '#7C3AED',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px -3px rgba(139, 92, 246, 0.3)' },
          '100%': { boxShadow: '0 0 25px 2px rgba(99, 102, 241, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}

