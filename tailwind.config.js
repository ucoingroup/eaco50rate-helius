/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        eaco: {
          bg: '#0a0a0f',
          card: '#12121c',
          border: '#1e1e30',
          purple: '#8b5cf6',
          green: '#22c55e',
          gold: '#f59e0b',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
}
