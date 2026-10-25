import { useMemo } from "react";
import { usePreferencesStore } from "@/src/stores/preferences";
import { type EstimationSettings, resolveEstimationSettings } from "./estimate";

/** The user's effective stride/cadence assumptions (manual > height > default). */
export function useEstimationSettings(): EstimationSettings {
  const strideCm = usePreferencesStore((s) => s.strideCm);
  const heightCm = usePreferencesStore((s) => s.heightCm);
  const cadenceSpm = usePreferencesStore((s) => s.cadenceSpm);
  return useMemo(
    () => resolveEstimationSettings({ strideCm, heightCm, cadenceSpm }),
    [strideCm, heightCm, cadenceSpm],
  );
}
