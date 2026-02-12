/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e6eef5',
          100: '#ccdcea',
          200: '#99b9d5',
          300: '#6696c0',
          400: '#3373ab',
          500: '#005096',
          600: '#003d78',
          700: '#002d5f',
          800: '#002d5f',
          900: '#001d3f',
        },
        secondary: {
          50: '#fffdf0',
          100: '#fffae0',
          200: '#fff5c2',
          300: '#fff0a3',
          400: '#ffeb85',
          500: '#f2cd48',
          600: '#e6b800',
          700: '#cc9f00',
          800: '#b38600',
          900: '#996d00',
        },
        accent: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
        },
        '.scrollbar-track-transparent::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb': {
          background: '#d1d5db',
          'border-radius': '3px',
        },
        '.scrollbar-thumb-gray-300:hover::-webkit-scrollbar-thumb': {
          background: '#9ca3af',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
}
