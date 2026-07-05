import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "ecg-travel": {
          "0%": { strokeDashoffset: "118" },
          "100%": { strokeDashoffset: "-118" },
        },
      },
      animation: {
        "ecg-travel": "ecg-travel 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
