import { Stack } from "expo-router";
import { Platform } from "react-native";
import { type ThemeColors, useThemeColors } from "./theme-colors";
import { FONT } from "./typography";

/** Back button label in Space Mono. Trade-off: iOS shows it statically (no space-aware shortening). */
export const headerBackTitleStyle = { fontFamily: FONT.mono };

/**
 * Native header titles don't go through NativeWind, so they'd fall back to the
 * system font — mirror the `headline` type role (Space Mono bold, 16px) here.
 */
export const headerTitleStyle = (c: ThemeColors) => ({
  color: c.textPrimary,
  fontFamily: FONT.monoBold,
  fontSize: 16,
});

/**
 * The native stack inside each tab: a standard inline title in the iOS 26
 * liquid-glass bar (no large titles — they push content too far down).
 * Don't give the header a backgroundColor on iOS — any solid fill turns the
 * glass off. Scroll views underneath must set
 * contentInsetAdjustmentBehavior="automatic" (Screen does) so content starts
 * below the title and clears the floating tab bar.
 * `headerShown={false}` for screens that draw the in-content AppHeader instead
 * (the Cadence design) — pushed screens keep the native header.
 */
export function TabStack({ title, headerShown = true }: { title: string; headerShown?: boolean }) {
  const c = useThemeColors();
  const ios = Platform.OS === "ios";

  return (
    <Stack
      screenOptions={{
        headerTransparent: ios,
        headerShadowVisible: false,
        headerTintColor: c.textPrimary,
        headerTitleStyle: headerTitleStyle(c),
        headerBackTitleStyle,
        ...(ios ? {} : { headerStyle: { backgroundColor: c.surfacePage } }),
        contentStyle: { backgroundColor: c.surfacePage },
      }}
    >
      <Stack.Screen name="index" options={{ title, headerShown }} />
    </Stack>
  );
}
