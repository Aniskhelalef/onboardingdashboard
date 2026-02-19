/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'color-1': '#2D2D2D',
        'color-2': '#FC6D41',
        'color-2-light': '#FD8A63',
        'color-2-dark': '#E35220',
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
          DEFAULT: '#FC6D41',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#2D2D2D',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F5F5F5',
          foreground: '#2D2D2D',
        },
        background: '#FFFFFF',
        foreground: '#2D2D2D',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#2D2D2D',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#6B7280',
        },
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#FC6D41',
      },
      fontSize: {
        'h1': '20px',
        'h2': '18px',
        'h3': '16px',
        'body': '14px',
        'small': '12px',
        'caption': '10px',
      },
      borderRadius: {
        'pill': '9999px',
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
