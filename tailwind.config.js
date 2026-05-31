/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        cricket: {
          pitch: '#854d0e',
          grass: '#15803d',
          gold: '#fbbf24',
          accent: '#f59e0b',
          dark: '#050a05',
          darker: '#020502',
          card: '#0a100a',
        }
      }
    },
  },
  plugins: [],
}
