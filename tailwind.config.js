/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Cambia esto a "media" si quieres que siga el sistema
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "white",
        foreground: "black",
        primary: "black",
        secondary: "#f5f5f5",
      },
    },
  },
  plugins: [],
};
