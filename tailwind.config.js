/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#2d4a3e',
          light: '#3d6151',
          dark: '#1e3329',
        },
        burnt: {
          DEFAULT: '#c2580a',
          light: '#d9742a',
          dark: '#a04508',
        },
        cream: '#f7f4ef',
        stone: {
          bg: '#faf8f5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
