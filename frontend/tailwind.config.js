/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '400px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        accent: {
          indigo: 'var(--color-accent-indigo)',
          green: 'var(--color-accent-green)',
          orange: 'var(--color-accent-orange)',
          red: 'var(--color-accent-red)',
        },
        bg: {
          page: 'var(--color-bg-page)',
          card: 'var(--color-bg-card)',
          surface: 'var(--color-bg-surface)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        },
        light: {
          blue: 'var(--color-light-blue)',
          green: 'var(--color-light-green)',
          orange: 'var(--color-light-orange)',
          purple: 'var(--color-light-purple)',
        },
        sidebar: 'var(--color-sidebar)',
        navbar: 'var(--color-navbar)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        chart: {
          1: 'var(--color-chart-1)',
          2: 'var(--color-chart-2)',
          3: 'var(--color-chart-3)',
          4: 'var(--color-chart-4)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Outfit', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      width: {
        4.5: '1.125rem',
      },
      height: {
        4.5: '1.125rem',
      },
    },
  },
  plugins: [],
}
