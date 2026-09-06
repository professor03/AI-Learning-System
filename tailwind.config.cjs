module.exports = {
  content: ['index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fdd079',
          dark: '#f2b860',
        },
        secondary: '#a5b4fc',
        midnight: '#0b1120',
        background: '#f5f7fb',
        card: '#ffffff',
        text: {
          dark: '#0f172a',
          normal: '#1f2937',
        },
        gray: {
          100: '#F1F5F9',
          300: '#CBD5E1',
          500: '#64748B',
        },
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 25px 60px rgba(15, 23, 42, 0.12)',
        glow: '0 30px 80px rgba(129, 140, 248, 0.35)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        fadeIn: 'fadeIn 0.6s ease forwards',
      },
    },
  },
  plugins: [],
};

