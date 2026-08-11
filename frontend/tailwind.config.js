/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c7',
          400: '#8590a6',
          500: '#67718a',
          600: '#525a70',
          700: '#43495b',
          800: '#3a3f4d',
          900: '#1f2330',
          950: '#131620',
        },
        brand: {
          50: '#eefbf3',
          100: '#d6f7e1',
          200: '#aeeec4',
          300: '#79dd9f',
          400: '#3fc576',
          500: '#19a85a',
          600: '#0d8a48',
          700: '#0c6d3a',
          800: '#0d5630',
          900: '#0c4628',
          950: '#042717',
        },
        accent: {
          50: '#fff8eb',
          100: '#ffeac6',
          200: '#ffd388',
          300: '#ffb649',
          400: '#ff9d20',
          500: '#f97d07',
          600: '#dd5c02',
          700: '#b74106',
          800: '#94320d',
          900: '#7a2a10',
          950: '#431006',
        },
        success: {
          500: '#19a85a',
          600: '#0d8a48',
        },
        warning: {
          500: '#f97d07',
        },
        error: {
          500: '#e5484d',
          600: '#c93a3f',
        },
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'bounce-dot': 'bounce-dot 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
