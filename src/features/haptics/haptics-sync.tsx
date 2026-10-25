import { useEffect } from "react";
import { usePreferencesStore } from "@/src/stores/preferences";
import { configureHaptics } from "./haptics";

/** Pushes the persisted haptics toggle into the Pulsar engine (and preloads once). */
export function HapticsSync() {
  const hapticsEnabled = usePreferencesStore((s) => s.hapticsEnabled);

  useEffect(() => {
    configureHaptics(hapticsEnabled);
  }, [hapticsEnabled]);

  return null;
}
