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
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffd",
          300: "#7cc5fb",
          400: "#36a7f6",
          500: "#0c8ce7",
          600: "#006fc5",
          700: "#0158a0",
          800: "#064b84",
          900: "#0b3f6e",
          950: "#072849",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae2",
          300: "#b0b9c8",
          400: "#8593a9",
          500: "#66768f",
          600: "#515f76",
          700: "#434d60",
          800: "#3a4251",
          900: "#333946",
          950: "#22262f",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)",
        card: "0 1px 3px rgba(15,23,42,0.06), 0 12px 32px rgba(12,140,231,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
