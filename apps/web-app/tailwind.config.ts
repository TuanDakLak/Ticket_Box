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
        background: "#f9fafb",
        foreground: "#1b1c1c",
        primary: {
          DEFAULT: "#0f62fe",
          foreground: "#ffffff",
          hover: "#0353e9",
          light: "#eff6ff",
          muted: "#dbeafe",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        border: "#e5e7eb",
        input: "#e2e8f0",
        ring: "#0f62fe",
        success: "#2DC275",
        warning: "#F59E0B",
        error: "#EF4444",
        surface: {
          DEFAULT: "#ffffff",
          bg: "#f9fafb",
          variant: "#f1f5f9",
        },
        accent: {
          coral: "#ff7a59",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "auth-form": "440px",
        "container-auth": "1440px",
      },
      spacing: {
        gutter: "24px",
        "margin-desktop": "80px",
      },
      boxShadow: {
        card: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        "card-hover": "0px 10px 30px rgba(15, 98, 254, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
