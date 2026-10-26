import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CustomRange } from "@/src/features/stats/stats";
import type { WeekView } from "@/src/lib/day";

export type ThemePreference = "light" | "dark" | "system";
export type LanguagePreference = "en" | "es" | "system";
export type DistanceUnit = "km" | "mi";

interface PreferencesState {
  themePreference: ThemePreference;
  setThemePreference: (value: ThemePreference) => void;
  languagePreference: LanguagePreference;
  setLanguagePreference: (value: LanguagePreference) => void;
  onboardingDone: boolean;
  setOnboardingDone: (value: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (value: boolean) => void;
  distanceUnit: DistanceUnit;
  setDistanceUnit: (value: DistanceUnit) => void;
  /** Calendar week from Monday or Sunday, or the last 7 days. */
  weekView: WeekView;
  setWeekView: (value: WeekView) => void;
  /** Optional — when set (and no manual stride), stride is derived from it. */
  heightCm: number | null;
  setHeightCm: (value: number | null) => void;
  /** Manual stride override in cm; wins over height. Null = derive. */
  strideCm: number | null;
  setStrideCm: (value: number | null) => void;
  /** Walking cadence for duration-only estimates. Null = default. */
  cadenceSpm: number | null;
  setCadenceSpm: (value: number | null) => void;
  /** One 18:00 alert when behind the target's pace (spec pace-nudges). Needs iOS permission too. */
  paceNudgesEnabled: boolean;
  setPaceNudgesEnabled: (value: boolean) => void;
  /** The Stats tab's saved custom range (spec custom-range). Null until the first save. */
  customRange: CustomRange | null;
  setCustomRange: (value: CustomRange) => void;
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
      distanceUnit: "km",
      setDistanceUnit: (value) => set({ distanceUnit: value }),
      weekView: "monday",
      setWeekView: (value) => set({ weekView: value }),
      heightCm: null,
      setHeightCm: (value) => set({ heightCm: value }),
      strideCm: null,
      setStrideCm: (value) => set({ strideCm: value }),
      cadenceSpm: null,
      setCadenceSpm: (value) => set({ cadenceSpm: value }),
      paceNudgesEnabled: false,
      setPaceNudgesEnabled: (value) => set({ paceNudgesEnabled: value }),
      customRange: null,
      setCustomRange: (value) => set({ customRange: value }),
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
