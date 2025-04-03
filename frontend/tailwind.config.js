/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  // Remove the presets line that's causing the error
  theme: {
    extend: {},
  },
  plugins: [],
}