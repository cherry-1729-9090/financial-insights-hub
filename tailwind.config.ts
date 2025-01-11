import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F3F0FA",
        foreground: "#2E2E2E",
        primary: {
          DEFAULT: "#5C2ABB",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#13A5B9",
          foreground: "#2E2E2E",
        },
        accent: {
          DEFAULT: "#8B61EB",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FEC108",
          foreground: "#2E2E2E",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#F3F0FA",
          foreground: "#2E2E2E",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2E2E2E",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2E2E2E",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#2E2E2E',
            a: {
              color: '#5C2ABB',
              '&:hover': {
                color: '#8B61EB',
              },
            },
            strong: {
              color: 'inherit',
            },
            li: {
              marginTop: '0.25em',
              marginBottom: '0.25em',
            },
            h1: {
              color: '#2E2E2E',
            },
            h2: {
              color: '#2E2E2E',
            },
            h3: {
              color: '#2E2E2E',
            },
            h4: {
              color: '#2E2E2E',
            },
          },
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;