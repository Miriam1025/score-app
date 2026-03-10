/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base palette from UI_SPEC
        background: '#FAFAFA',
        card: '#FFFFFF',
        'text-primary': '#333333',
        'text-secondary': '#666666',
        'time-accent': '#B8860B', // Dark goldenrod for times/durations
        'action-primary': '#2563EB',
        'success': '#16A34A',
        'border': '#E5E5E5',
      },
      fontFamily: {
        // Dyslexic-friendly font stack
        sans: ['OpenDyslexic', 'Lexie Readable', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'dyslexic': '0.05em',
      },
      lineHeight: {
        'dyslexic': '1.5',
      },
      maxWidth: {
        'readable': '70ch', // Max 70 characters per line
      },
    },
  },
  plugins: [],
}
