import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#c9a962",
          light: "#e8d5a3",
          dark: "#a8894a",
        },
        cream: "#f5f0e8",
        charcoal: "#1a1816",
        "luxury-black": "#080808",
        "luxury-panel": "#121212",
        "luxury-muted": "#2a2a2a",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "var(--font-playfair)", "serif"],
      },
      animation: {
        "hero-float": "hero-float 5.5s ease-in-out infinite",
        "gradient-shimmer": "gradient-shimmer 7s ease-in-out infinite",
        "orb-drift": "orb-drift 14s ease-in-out infinite",
        "light-sweep": "light-sweep 16s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
        marquee: "marquee 36s linear infinite",
      },
      keyframes: {
        "hero-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-shimmer": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "orb-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(12px, -8px) scale(1.03)" },
          "66%": { transform: "translate(-8px, 6px) scale(0.98)" },
        },
        "light-sweep": {
          "0%": { transform: "translateX(-30%) skewX(-8deg)", opacity: "0" },
          "15%": { opacity: "1" },
          "50%": { transform: "translateX(130%) skewX(-8deg)", opacity: "0.6" },
          "100%": { transform: "translateX(130%) skewX(-8deg)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #e8d5a3 0%, #c9a962 45%, #a8894a 100%)",
        "radial-gold":
          "radial-gradient(ellipse at center, rgba(201,169,98,0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
