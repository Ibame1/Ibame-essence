/** Mirrors the config that used to be inlined for the Tailwind Play CDN. Run from repo root. */
module.exports = {
  content: ['./index.html', './404.html'],
  theme: {
    extend: {
      colors: {
        ibame: { black: '#050505', charcoal: '#0F0E13', copper: '#B87333', bone: '#F5F5F0', grey: '#8A8A8A' }
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Playfair Fallback"', 'Georgia', 'serif'],
        sans: ['Inter', '"Inter Fallback"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: []
};
