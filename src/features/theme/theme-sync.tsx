import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { usePreferencesStore } from "@/src/stores/preferences";

/**
 * Invisible provider: reconciles the persisted theme preference with
 * nativewind's color scheme. Mounted once in app/_layout.tsx.
 */
export function ThemeSync(): null {
  const themePreference = usePreferencesStore((s) => s.themePreference);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(themePreference);
  }, [themePreference, setColorScheme]);

  return null;
}
