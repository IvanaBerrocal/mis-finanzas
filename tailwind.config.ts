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
        income: "#10b981",
        expense: "#ef4444",
        saving: "#3b82f6",
        investment: "#8b5cf6",
      },
    },
  },
  plugins: [],
};
export default config;
