import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";
export type LanguagePreference = "en" | "es" | "system";

interface PreferencesState {
  themePreference: ThemePreference;
  setThemePreference: (value: ThemePreference) => void;
  languagePreference: LanguagePreference;
  setLanguagePreference: (value: LanguagePreference) => void;
  onboardingDone: boolean;
  setOnboardingDone: (value: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (value: boolean) => void;
}

/**
 * The only persisted Zustand store. Entity data lives in SQLite (drizzle live
 * queries) — never mirror it here. Consume with selectors:
 *   const theme = usePreferencesStore((s) => s.themePreference);
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      themePreference: "system",
      setThemePreference: (value) => set({ themePreference: value }),
      languagePreference: "system",
      setLanguagePreference: (value) => set({ languagePreference: value }),
      onboardingDone: false,
      setOnboardingDone: (value) => set({ onboardingDone: value }),
      hapticsEnabled: true,
      setHapticsEnabled: (value) => set({ hapticsEnabled: value }),
    }),
    { name: "preferences", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Gate rendering on rehydration so the first frame doesn't flash defaults. */
export function usePreferencesHydrated(): boolean {
  const [hydrated, setHydrated] = useState(usePreferencesStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = usePreferencesStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);
  return hydrated;
}
