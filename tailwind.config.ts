// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    // Указываем Tailwind сканировать папку `app`, а не `pages`
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;