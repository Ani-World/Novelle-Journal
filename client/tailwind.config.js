/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: '#FDF8F0',
        charcoal: '#1A1A1A',
        surface: {
          light: '#FFFFFF',
          dark: '#2A2A2A',
        },
        primary: {
          light: '#D4B8A7',
          dark: '#C4A484',
        },
        secondary: {
          light: '#C5B4A3',
          dark: '#9B8E7F',
        },
        gold: {
          light: '#C4A484',
          dark: '#D4B8A7',
        },
        lavender: {
          light: '#E6E0F0',
          dark: '#4A3F5E',
        },
        textPrimary: {
          light: '#2C2418',
          dark: '#F5F0E6',
        },
        textSecondary: {
          light: '#6B5E4A',
          dark: '#B8AA98',
        },
        borderLight: '#E8E0D5',
        borderDark: '#3A352C',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        'pill': '40px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(44, 36, 24, 0.05)',
        'lift': '0 12px 30px rgba(44, 36, 24, 0.12)',
        'dark-soft': '0 4px 20px rgba(0, 0, 0, 0.2)',
        'dark-lift': '0 12px 30px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
