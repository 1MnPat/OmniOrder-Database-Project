/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0058bc',
        'primary-container': '#0070eb',
        surface: '#f9f9fe',
        'on-surface': '#1a1c1f',
        'on-surface-variant': '#414755',
        'surface-container-low': '#f3f3f8',
        'surface-container-lowest': '#ffffff',
        'surface-container': '#ededf2',
        outline: '#717786',
        'outline-variant': '#c1c6d7',
        error: '#ba1a1a',
        tertiary: '#006b27',
        secondary: '#006494',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ambient: '0 12px 40px rgba(0, 0, 0, 0.08)',
        nav: '0 8px 32px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        card: '1.25rem',
      },
    },
  },
  plugins: [],
};
