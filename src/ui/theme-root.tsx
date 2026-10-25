import { useColorScheme, vars } from "nativewind";
import type { ReactNode } from "react";
import { View } from "react-native";
import { type ThemeColors, themePalette } from "./theme-colors";

function hexToTriplet(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

const VAR_NAMES: Record<keyof ThemeColors, string> = {
  surfacePage: "--color-surface-page",
  surfaceCard: "--color-surface-card",
  surfaceSunken: "--color-surface-sunken",
  textPrimary: "--color-text-primary",
  textSecondary: "--color-text-secondary",
  textTertiary: "--color-text-tertiary",
  borderHairline: "--color-border-hairline",
  accentFg: "--color-accent-fg",
  accentOn: "--color-accent-on",
  dangerFg: "--color-danger-fg",
};

function paletteVars(scheme: "light" | "dark"): Record<string, string> {
  const palette = themePalette[scheme];
  const out: Record<string, string> = {};
  for (const key of Object.keys(VAR_NAMES) as (keyof ThemeColors)[]) {
    out[VAR_NAMES[key]] = hexToTriplet(palette[key]);
  }
  return out;
}

/**
 * Injects the runtime palette as CSS variables so className tokens resolve
 * on native. Mirrors global.css — keep both in sync.
 */
export function ThemeRoot({ children }: { children: ReactNode }) {
  const { colorScheme } = useColorScheme();
  return (
    <View className="flex-1" style={vars(paletteVars(colorScheme === "dark" ? "dark" : "light"))}>
      {children}
    </View>
  );
}
