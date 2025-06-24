// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sebino': ['"Sebino Extra Bold"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
