import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ods: {
          bg: "#FFFFFF",
          card: "#FFFFFF",
          cardHover: "#F8FAFC",
          border: "rgba(110, 194, 247, 0.3)",
          borderActive: "#6EC2F7",
          primary: "#6EC2F7",     // Sky Blue chính
          primaryHover: "#38BDF8",
          accent: "#0284C7",
          textMain: "#0F172A",
          textMuted: "#64748B",
          surface: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam)", "'Be Vietnam Pro'", "sans-serif"],
        heading: ["var(--font-outfit)", "'Outfit'", "'Be Vietnam Pro'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        ods: "16px",
      },
      boxShadow: {
        skyGlow: "0 8px 30px rgba(110, 194, 247, 0.25)",
        uiverseGlow: "0 10px 30px -5px rgba(110, 194, 247, 0.4)",
        buttonGlow: "0 4px 15px rgba(110, 194, 247, 0.35)",
        lightShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
