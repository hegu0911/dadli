/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F43F5E",
        secondary: "#0F172A",
        accent: "#F59E0B",
        "cooking-bg": "#0F172A",
        "page-bg": "#FAFAFA",
        "card-bg": "#FFFFFF",
        error: "#EF4444",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "app": "480px",
      },
    },
  },
  plugins: [],
};
