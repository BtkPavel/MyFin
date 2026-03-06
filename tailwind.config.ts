import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        fin: {
          bg: "#FAFAF9",
          surface: "#FFFFFF",
          ink: "#1C1917",
          muted: "#78716C",
          subtle: "#A8A29E",
          primary: "#0F766E",
          "primary-light": "#CCFBF1",
          income: "#059669",
          expense: "#B91C1C",
          border: "#E7E5E4",
        },
      },
      borderRadius: {
        "fin-sm": "8px",
        "fin-md": "12px",
        "fin-lg": "16px",
        "fin-xl": "24px",
      },
      boxShadow: {
        "fin-sm": "0 1px 2px rgba(28, 25, 23, 0.04)",
        "fin-md": "0 4px 6px -1px rgba(28, 25, 23, 0.06), 0 2px 4px -2px rgba(28, 25, 23, 0.04)",
        "fin-lg": "0 10px 15px -3px rgba(28, 25, 23, 0.06), 0 4px 6px -4px rgba(28, 25, 23, 0.04)",
      },
      transitionDuration: {
        "250": "250ms",
      },
    },
  },
  plugins: [],
};
export default config;
