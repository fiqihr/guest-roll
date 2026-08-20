/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#eae3e9',
          dark: '#f5f1e8',
        },
        gold: '#e0cc9c',
        dark: '#3e2a27',
        maroon: '#4a0a15',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Meow Script"', 'cursive'],
      }
    },
  },
  plugins: [],
}
