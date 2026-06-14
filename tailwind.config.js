/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#111111",
        secondary: "#555555",
        accent: "#6366f1",
        border: "#e5e7eb",
        surface: "#f9fafb",
      },
    },
  },
  plugins: [],
}

