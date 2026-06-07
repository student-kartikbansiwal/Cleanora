import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00A86B",
          50: "#E6FFF5",
          100: "#CCFFE9",
          200: "#99FFD4",
          300: "#66FFB9",
          400: "#33FF9E",
          500: "#00A86B",
          600: "#008A57",
          700: "#006C44",
          800: "#004E30",
          900: "#00301D",
          foreground: "#FFFFFF",
        },
        navy: {
          DEFAULT: "#0F172A",
          50: "#E2E8F0",
          100: "#CBD5E1",
          200: "#94A3B8",
          300: "#64748B",
          400: "#475569",
          500: "#334155",
          600: "#1E293B",
          700: "#0F172A",
          800: "#0A1120",
          900: "#050A14",
        },
        background: "#F8FAFC",
        foreground: "#0F172A",
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#00A86B",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#E6FFF5",
          foreground: "#00A86B",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "#0F172A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-up": "fadeUp 0.5s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "bounce-slow": "bounce 2s infinite",
        shimmer: "shimmer 2s linear infinite",
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 168, 107, 0.4)" },
          "100%": { boxShadow: "0 0 20px rgba(0, 168, 107, 0.8)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-pattern":
          "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        shimmer:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 168, 107, 0.3)",
        "glow-lg": "0 0 40px rgba(0, 168, 107, 0.4)",
        card: "0 4px 24px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 48px rgba(0, 0, 0, 0.16)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
