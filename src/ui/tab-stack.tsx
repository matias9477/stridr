import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useThemeColors } from "./theme-colors";

/**
 * The native stack inside each tab: a standard inline title in the iOS 26
 * liquid-glass bar (no large titles — they push content too far down).
 * Don't give the header a backgroundColor on iOS — any solid fill turns the
 * glass off. Scroll views underneath must set
 * contentInsetAdjustmentBehavior="automatic" (Screen does) so content starts
 * below the title and clears the floating tab bar.
 */
export function TabStack({ title }: { title: string }) {
  const c = useThemeColors();
  const ios = Platform.OS === "ios";

  return (
    <Stack
      screenOptions={{
        headerTransparent: ios,
        headerShadowVisible: false,
        headerTintColor: c.textPrimary,
        headerTitleStyle: { color: c.textPrimary },
        ...(ios ? {} : { headerStyle: { backgroundColor: c.surfacePage } }),
        contentStyle: { backgroundColor: c.surfacePage },
      }}
    >
      <Stack.Screen name="index" options={{ title }} />
    </Stack>
  );
}
