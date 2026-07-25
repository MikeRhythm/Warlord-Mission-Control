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
        rhythm: {
          obsidian: "#0A0C10",
          charcoal: "#12161F",
          goldenrod: "#DAA520",
          silver: "#A0AEC0",
        },
      },
    },
  },
  plugins: [],
};

export default config;