/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#ffff",
        secondary: "#542d48",
        inactive: "#efeaea",
        accent: "#fcd503",
        base: "#FAF5FF",
        blue: {
          200: "#B3CDE0",
        },
        slate: {
          400: "#6497B1",
        },
        amber: {
          200: "#FBE47E",
          400: "#FFC837",
        },
        purple: {
          200: "#e1d4dc",
          400: "#8c3673",
        },
      },
    },
  },
  plugins: [],
};