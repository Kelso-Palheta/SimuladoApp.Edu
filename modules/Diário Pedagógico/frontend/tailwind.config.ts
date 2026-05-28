import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-soft": "var(--bg-soft)",
        "bg-card": "var(--bg-card)",
        fg: "var(--fg)",
        "fg-muted": "var(--fg-muted)",
        border: "var(--border)",
        accent: {
          400: "var(--c-accent-400)",
          500: "var(--c-accent-500)",
          600: "var(--c-accent-600)",
        },
        success: "var(--c-success)",
        warning: "var(--c-warning)",
        danger: "var(--c-danger)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        s: "var(--radius-s)",
        m: "var(--radius-m)",
        l: "var(--radius-l)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        s: "var(--shadow-s)",
        m: "var(--shadow-m)",
        l: "var(--shadow-l)",
        glow: "var(--shadow-glow)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
