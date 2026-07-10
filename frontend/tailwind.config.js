/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        accent: {
          indigo: '#4F46E5',
          green: '#22C55E',
          orange: '#F59E0B',
          red: '#EF4444',
        },
        bg: {
          page: '#F8FAFC',
          card: '#FFFFFF',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
        },
        border: '#E2E8F0',
        light: {
          blue: '#DBEAFE',
          green: '#DCFCE7',
          orange: '#FEF3C7',
          purple: '#EDE9FE',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
