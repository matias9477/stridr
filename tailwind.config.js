/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontSize: {
        // iOS text styles for the legacy primitives (ListRow, Field…).
        xs: ["13px", { lineHeight: "18px" }],
        sm: ["15px", { lineHeight: "20px" }],
        base: ["17px", { lineHeight: "22px" }],
        // Monochrome Cadence type scale (DESIGN.md → typography). Use through
        // src/ui/typography.tsx, which pairs each size with its font + tracking.
        micro: ["9px", { lineHeight: "12px" }],
        label: ["11px", { lineHeight: "14px" }],
        "body-sm": ["12px", { lineHeight: "16px" }],
        "body-md": ["14px", { lineHeight: "20px" }],
        "body-lg": ["16px", { lineHeight: "24px" }],
        "headline-sm": ["16px", { lineHeight: "22px" }],
        stat: ["26px", { lineHeight: "32px" }],
        display: ["56px", { lineHeight: "60px" }],
        // Share card hero — the card is a fixed 360×640 poster, never a screen.
        poster: ["76px", { lineHeight: "80px" }],
      },
      // RN ignores fontWeight for custom fonts — each weight is its own family.
      fontFamily: {
        mono: ["SpaceMono_400Regular"],
        "mono-bold": ["SpaceMono_700Bold"],
        sans: ["Geist_400Regular"],
        "sans-medium": ["Geist_500Medium"],
        "sans-semibold": ["Geist_600SemiBold"],
      },
      // em values from DESIGN.md resolved against each size (RN wants points).
      letterSpacing: {
        micro: "1.4px",
        label: "1.3px",
        stat: "-0.5px",
        display: "-1.7px",
        poster: "-2.3px",
      },
      colors: {
        // Semantic tokens only — values live as CSS variables in global.css
        // and at runtime in src/ui/theme-colors.ts. Keep all three in sync.
        surface: {
          page: token("surface-page"),
          card: token("surface-card"),
          sunken: token("surface-sunken"),
          raised: token("surface-raised"),
          high: token("surface-high"),
          highest: token("surface-highest"),
        },
        text: {
          primary: token("text-primary"),
          body: token("text-body"),
          secondary: token("text-secondary"),
          tertiary: token("text-tertiary"),
          quiet: token("text-quiet"),
        },
        border: {
          hairline: token("border-hairline"),
        },
        accent: {
          fg: token("accent-fg"),
          on: token("accent-on"),
        },
        danger: {
          fg: token("danger-fg"),
        },
      },
    },
  },
  plugins: [],
};
