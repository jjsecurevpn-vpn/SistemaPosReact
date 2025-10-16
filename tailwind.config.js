/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#181818",
          container: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.06)",
          text: "#ffffff",
          "text-secondary": "#d1d5db",
          "text-muted": "#9ca3af",
        },
      },
      backgroundImage: {
        glass:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "glass-hover":
          "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
      },
      backdropBlur: {
        glass: "10px",
      },
    },
  },
  plugins: [],
};
