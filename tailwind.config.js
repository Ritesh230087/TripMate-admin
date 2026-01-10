/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B4513", // TripMate Brown
        secondary: "#6D5D42", // Olive Brown
        bgBeige: "#F9F5E9", // App Background
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '40px',
      }
    },
  },
  plugins: [],
}