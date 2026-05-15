import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        aviation: {
          night: "#07111F",
          panel: "#0F172A",
          hud: "#38BDF8",
          cyan: "#22D3EE",
          amber: "#F59E0B",
          danger: "#EF4444",
          success: "#22C55E",
          text: "#F8FAFC",
          muted: "#94A3B8"
        }
      },
      boxShadow: {
        hud: "0 0 24px rgba(34, 211, 238, 0.18)",
        runway: "0 0 18px rgba(56, 189, 248, 0.48)"
      },
      backgroundImage: {
        "radar-grid":
          "linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
