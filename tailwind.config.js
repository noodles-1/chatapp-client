/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark-blue': '#03101e',
        'bg-blue': '#0A2647',
        'dark-blue': '#144272',
        'blue': '#205295',
        'light-blue': '#2C74B3',
      },
    },
  },
  plugins: [],
}

