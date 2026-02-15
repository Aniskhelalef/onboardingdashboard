/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleur 1 - Dark/Black
        'color-1': '#2D2D2D',
        // Couleur 2 - Coral/Orange (Primary)
        'color-2': '#FC6D41',
        'color-2-light': '#FD8A63',
        'color-2-dark': '#E35220',
        // Couleur 3 - Light Gray
        'color-3': '#F5F5F5',
        primary: {
          50: '#FFF4F0',
          100: '#FFE9E1',
          200: '#FFD3C3',
          300: '#FFBDA5',
          400: '#FFA787',
          500: '#FC6D41',
          600: '#E35220',
          700: '#B84119',
          800: '#8D3113',
          900: '#62210D',
        },
      },
      fontSize: {
        'h1': '32px',
        'h2': '24px',
        'h3': '20px',
        'h4': '18px',
        'body': '16px',
        'small': '14px',
        'caption': '12px',
      },
      borderRadius: {
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}
