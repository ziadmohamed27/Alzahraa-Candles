/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50:  '#fdfdf8',
          100: '#faf8f0',
          200: '#f4f0e2',
          300: '#ece6d0',
        },
        olive: {
          50:  '#f4f7ee',
          100: '#e5edcf',
          200: '#c8d9a0',
          300: '#a9c36e',
          400: '#8aad44',
          500: '#6b9228',
          600: '#537319',
          700: '#3d5610',
          800: '#293a09',
          900: '#161e04',
        },
        honey: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
        },
        coffee: {
          50:  '#fdf8f4',
          100: '#f9ede0',
          200: '#f0d4b8',
          300: '#e4b48a',
          400: '#d48f5a',
          500: '#bf6e35',
          600: '#9e5220',
          700: '#7a3b13',
          800: '#58280a',
          900: '#381804',
        },
        charcoal: {
          50:  '#f5f5f5',
          100: '#e8e8e8',
          200: '#d0d0d0',
          300: '#a8a8a8',
          400: '#787878',
          500: '#555555',
          600: '#3a3a3a',
          700: '#282828',
          800: '#1a1a1a',
          900: '#0f0f0f',
        },
        price: {
          DEFAULT: '#e8650a',
          light:   '#ff8534',
          dark:    '#c04e00',
        }
      },
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
        display: ['"El Messiri"', 'sans-serif'],
      },
      boxShadow: {
        'card':    '0 4px 20px rgba(0,0,0,0.08)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.16)',
        'modal':   '0 25px 80px rgba(0,0,0,0.25)',
        'btn':     '0 4px 14px rgba(232,101,10,0.35)',
      },
      borderRadius: {
        'xl2': '1.25rem',
        'xl3': '1.5rem',
        'xl4': '2rem',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up':     'fade-up 0.6s ease forwards',
        'fade-in':     'fade-in 0.4s ease forwards',
        'scale-in':    'scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-right': 'slide-right 0.35s cubic-bezier(0.4,0,0.2,1) forwards',
        'shimmer':     'shimmer 2s linear infinite',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
