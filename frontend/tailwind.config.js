/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        logistics: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3daf0',
          300: '#94bfe7',
          400: '#5e9ed9',
          500: '#387ec8',
          600: '#2664aa',
          700: '#1f508a',
          800: '#1d4472',
          900: '#1c3b60',
          950: '#0f243d',
        }
      }
    },
  },
  plugins: [],
}
