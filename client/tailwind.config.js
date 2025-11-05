/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class", // ← IMPORTANT: class-based dark mode only
  theme: {
    extend: {},
  },
  plugins: [],
};