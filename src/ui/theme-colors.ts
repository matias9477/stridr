import { useColorScheme } from "nativewind";

/**
 * Runtime palette — the hex twin of the CSS variables in global.css.
 * Keep both files in sync (and the widget THEME). Use useThemeColors() only
 * for imperative color props (navigation options, placeholderTextColor, icon
 * color); everything else styles via className tokens.
 *
 * Monochrome by design (DESIGN.md): hierarchy comes from contrast tiers, never
 * hue. Don't add a chromatic accent.
 */
export interface ThemeColors {
  /** App background (Level 0). */
  surfacePage: string;
  /** Cards and tiles (Level 1). */
  surfaceCard: string;
  /** Recessed panels: segmented-control track, inset strips. */
  surfaceSunken: string;
  /** Chips, icon wells, row dividers on cards. */
  surfaceRaised: string;
  /** Inactive bars, progress track, secondary buttons. */
  surfaceHigh: string;
  /** Pressed / current-but-partial states. */
  surfaceHighest: string;
  /** Live numbers, primary values, active states. */
  textPrimary: string;
  /** Body copy. */
  textBody: string;
  /** Units, comparison data. */
  textSecondary: string;
  /** Micro-labels, captions, inactive icons. */
  textTertiary: string;
  /** Disabled text, separators, no-data marks. */
  textQuiet: string;
  /** 1px dividers. */
  borderHairline: string;
  /** Primary action fill / emphasis (pure white on dark, black on light). */
  accentFg: string;
  /** Content on accentFg. */
  accentOn: string;
  /** Errors. */
  dangerFg: string;
}

export const themePalette: Record<"light" | "dark", ThemeColors> = {
  light: {
    surfacePage: "#f9f9f9",
    surfaceCard: "#ffffff",
    surfaceSunken: "#f3f3f3",
    surfaceRaised: "#eeeeee",
    surfaceHigh: "#e8e8e8",
    surfaceHighest: "#e2e2e2",
    textPrimary: "#000000",
    textBody: "#1a1c1c",
    textSecondary: "#5f5e5e",
    textTertiary: "#7e7576",
    textQuiet: "#cfc4c5",
    borderHairline: "#e5e5e5",
    accentFg: "#000000",
    accentOn: "#ffffff",
    dangerFg: "#ba1a1a",
  },
  dark: {
    surfacePage: "#131313",
    surfaceCard: "#1b1b1b",
    surfaceSunken: "#0e0e0e",
    surfaceRaised: "#1f1f1f",
    surfaceHigh: "#2a2a2a",
    surfaceHighest: "#353535",
    textPrimary: "#ffffff",
    textBody: "#e2e2e2",
    textSecondary: "#c7c6c6",
    textTertiary: "#8e9192",
    textQuiet: "#444748",
    borderHairline: "#2a2a2a",
    accentFg: "#ffffff",
    accentOn: "#131313",
    dangerFg: "#ffb4ab",
  },
};

export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  return themePalette[colorScheme === "dark" ? "dark" : "light"];
}
