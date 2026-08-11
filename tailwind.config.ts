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
        shimmer: "shimmer 4s linear infinite",
        marquee: "marquee 36s linear infinite",
      },
      keyframes: {
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
