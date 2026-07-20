/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          500: '#7c3aed',
          600: '#6d28d9',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        surface: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(17, 24, 39, 0.65)',
        },
      },
      fontFamily: {
        display: ['"Baloo Da 2"', '"Hind Siliguri"', 'sans-serif'],
        body: ['"Hind Siliguri"', '"Inter"', 'sans-serif'],
        data: ['"Inter"', '"Hind Siliguri"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-aurora':
          'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.35), transparent 40%), radial-gradient(circle at 80% 30%, rgba(124,58,237,0.3), transparent 45%), radial-gradient(circle at 50% 80%, rgba(99,102,241,0.25), transparent 40%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(31, 41, 55, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.35)',
        glow: '0 0 40px rgba(124, 58, 237, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(3%, -4%) scale(1.08)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        aurora: 'aurora 14s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
