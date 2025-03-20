/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          dark: {
            primary: '#1a1f2c',
            secondary: '#242a38',
            accent: '#2f3a4f'
          }
        }
      },
    },
    plugins: [],
  }