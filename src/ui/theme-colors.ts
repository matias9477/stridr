import { useColorScheme } from "nativewind";

/**
 * Runtime palette — the hex twin of the CSS variables in global.css.
 * Keep both files in sync. Use useThemeColors() only for imperative color
 * props (navigation options, placeholderTextColor, icon color); everything
 * else styles via className tokens.
 */
export interface ThemeColors {
  surfacePage: string;
  surfaceCard: string;
  surfaceSunken: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  borderHairline: string;
  accentFg: string;
  accentOn: string;
  dangerFg: string;
}

export const themePalette: Record<"light" | "dark", ThemeColors> = {
  light: {
    surfacePage: "#f5f5f5",
    surfaceCard: "#ffffff",
    surfaceSunken: "#ebebeb",
    textPrimary: "#171717",
    textSecondary: "#525252",
    textTertiary: "#8c8c8c",
    borderHairline: "#e0e0e0",
    accentFg: "#fcba03",
    accentOn: "#171717",
    dangerFg: "#dc2626",
  },
  dark: {
    surfacePage: "#121212",
    surfaceCard: "#1e1e1e",
    surfaceSunken: "#0c0c0c",
    textPrimary: "#f5f5f5",
    textSecondary: "#a3a3a3",
    textTertiary: "#737373",
    borderHairline: "#373737",
    accentFg: "#fcba03",
    accentOn: "#171717",
    dangerFg: "#f87171",
  },
};

export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  return themePalette[colorScheme === "dark" ? "dark" : "light"];
}
