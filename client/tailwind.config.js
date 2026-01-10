export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pikayellow: '#FFCB05',
        pikaorange: '#FF7F50',
        pikapink: '#FF69B4',
        pokeblue: '#3B4CCA',
        pokered: '#FF1C1C',
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#3B4CCA',
          600: '#2E3DA8',
          700: '#243091'
        },
        accent: {
          50: '#FFF9E6',
          100: '#FFF3CC',
          200: '#FFE699',
          500: '#FFCB05',
          600: '#E6B700',
          700: '#CCA300'
        }
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'hover': '0 8px 24px rgba(0, 0, 0, 0.15)'
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
};