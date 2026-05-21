/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050811',
          900: '#0a0f1c',
          800: '#111827',
          700: '#1f2937',
          600: '#374151',
        },
        primary: {
          500: '#3b82f6',
          400: '#60a5fa',
        },
        accent: '#0ea5e9'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
