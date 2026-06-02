/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        amasa: {
          50: '#FFF8F0',
          100: '#FBE9D0',
          200: '#F1D2A6',
          300: '#E3A857',
          400: '#D4953F',
          500: '#C8893F',
          600: '#A66E2C',
          700: '#7A4F1F',
          800: '#5A3A18',
          900: '#3A2A1A',
        },
        crema: '#FFF8F0',
        marron: '#3A2A1A',
        listo: '#16a34a',
        produccion: '#ea7c1c',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        suave: '0 4px 20px rgba(58, 42, 26, 0.08)',
        media: '0 8px 30px rgba(58, 42, 26, 0.12)',
      },
    },
  },
  plugins: [],
};
