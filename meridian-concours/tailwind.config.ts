import type { Config } from "tailwindcss";

/** All values derive from design-system/meridian-concours/MASTER.md. */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        sunken: "var(--color-sunken)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted-foreground)",
        rule: "var(--color-border)",
        "rule-strong": "var(--color-border-strong)",
        accent: "var(--color-accent)",
        "on-accent": "var(--color-on-accent)",
        "accent-inverse": "var(--color-accent-inverse)",
        "ink-inverse": "var(--color-ink-inverse)",
        "on-inverse": "var(--color-on-inverse)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["var(--type-display)", { lineHeight: "0.95", letterSpacing: "-0.035em" }],
        h1: ["var(--type-h1)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h2: ["var(--type-h2)", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        h3: ["1.125rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        body: ["1.0625rem", { lineHeight: "1.65" }],
        small: ["0.9375rem", { lineHeight: "1.5" }],
        label: ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.08em" }],
      },
      spacing: {
        "2xs": "0.25rem", xs: "0.5rem", sm: "0.75rem", md: "1rem",
        lg: "1.5rem", xl: "2.5rem", "2xl": "4rem", "3xl": "7rem", "4xl": "10rem",
      },
      borderRadius: { sm: "2px", md: "3px" },
      boxShadow: {
        raise: "0 1px 2px rgba(20,18,15,.06), 0 8px 24px -12px rgba(20,18,15,.18)",
        plate: "0 24px 64px -32px rgba(20,18,15,.45)",
      },
      maxWidth: { measure: "65ch" },
      transitionTimingFunction: { out: "cubic-bezier(0.16, 1, 0.3, 1)" },
    },
  },
  plugins: [],
};
export default config;
