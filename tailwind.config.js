/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'obsidian-deep': '#0a0a0a', // Surface background
        'charcoal': '#1a1a1a', // Surface Container
        'kinetic-amber': '#ffb300', // Primary
        'neon-lime': '#97ff4f', // Success
        'vivid-orange': '#ff9d33', // Warning
        'sky-blue': '#5cc5f2', // Info
        'pure-white': '#ffffff', // On Surface
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
