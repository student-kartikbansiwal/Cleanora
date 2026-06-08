import type { Config } from "tailwindcss";

// In Tailwind v4, most configuration is done via CSS @theme
// This file is mainly kept for content path configuration
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Colors and design tokens are defined in globals.css @theme
};

export default config;
