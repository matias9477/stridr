import { useEffect } from "react";
import { AppState } from "react-native";
import { nextMidnight } from "@/src/lib/day";
import { useHealthStore } from "./health-store";
import { subscribeToStepChanges } from "./healthkit-service";

/** Observer callbacks can arrive in bursts as a watch syncs; batch them. */
const OBSERVER_DEBOUNCE_MS = 1500;

/**
 * Invisible provider: keeps the HealthKit mirror fresh (spec §3.1) — on
 * launch, whenever the app returns to the foreground, when HealthKit reports
 * new step samples, and at local midnight so "today" rolls over while the app
 * stays open. Mounted once in app/_layout.tsx.
 */
export function HealthSync(): null {
  const access = useHealthStore((s) => s.access);

  useEffect(() => {
    const { initialize, refresh } = useHealthStore.getState();
    void initialize();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (access !== "requested") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = subscribeToStepChanges(() => {
      clearTimeout(timer);
      timer = setTimeout(() => void useHealthStore.getState().refresh(), OBSERVER_DEBOUNCE_MS);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [access]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      // +1s so the refresh lands safely on the new day.
      const delay = nextMidnight().getTime() - Date.now() + 1000;
      timer = setTimeout(() => {
        void useHealthStore.getState().refresh();
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  return null;
}
