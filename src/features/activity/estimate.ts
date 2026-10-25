import type { DistanceUnit } from "@/src/stores/preferences";

/**
 * Step estimation for logged walks (spec §4). Pure — the preferences store
 * resolves the user's assumptions, this module only does arithmetic.
 *
 * Defaults are deliberately conservative: a typical adult walking step is
 * ~0.70–0.80 m, and 100 steps/min is the research threshold for "moderate"
 * walking (most people walk 100–120), so duration-only estimates err low
 * rather than inflate totals.
 */
export const ESTIMATION_DEFAULTS = {
  strideMeters: 0.75,
  cadenceSpm: 100,
} as const;

/** Step length ≈ 41.5% of height — the common walking heuristic. */
export const HEIGHT_TO_STRIDE = 0.415;

export const METERS_PER_KM = 1000;
export const METERS_PER_MILE = 1609.344;

export const STRIDE_LIMITS_CM = { min: 30, max: 150 } as const;
export const HEIGHT_LIMITS_CM = { min: 100, max: 250 } as const;
export const CADENCE_LIMITS = { min: 40, max: 200 } as const;

export type StrideSource = "manual" | "height" | "default";

export interface EstimationSettings {
  strideMeters: number;
  strideSource: StrideSource;
  cadenceSpm: number;
}

export function resolveEstimationSettings(prefs: {
  strideCm: number | null;
  heightCm: number | null;
  cadenceSpm: number | null;
}): EstimationSettings {
  const cadenceSpm = prefs.cadenceSpm ?? ESTIMATION_DEFAULTS.cadenceSpm;
  if (prefs.strideCm !== null) {
    return { strideMeters: prefs.strideCm / 100, strideSource: "manual", cadenceSpm };
  }
  if (prefs.heightCm !== null) {
    return { strideMeters: strideFromHeightCm(prefs.heightCm), strideSource: "height", cadenceSpm };
  }
  return { strideMeters: ESTIMATION_DEFAULTS.strideMeters, strideSource: "default", cadenceSpm };
}

/** Meters, rounded to the centimeter. */
export function strideFromHeightCm(heightCm: number): number {
  return Math.round(heightCm * HEIGHT_TO_STRIDE) / 100;
}

export function toMeters(distance: number, unit: DistanceUnit): number {
  return distance * (unit === "km" ? METERS_PER_KM : METERS_PER_MILE);
}

export function fromMeters(meters: number, unit: DistanceUnit): number {
  return meters / (unit === "km" ? METERS_PER_KM : METERS_PER_MILE);
}

export interface WalkInput {
  distanceMeters?: number | null | undefined;
  durationSeconds?: number | null | undefined;
}

export interface StepEstimate {
  steps: number;
  /** Which input produced the number — distance wins when both are given (spec §4). */
  basis: "distance" | "duration";
}

/** Null when neither input is usable. */
export function estimateSteps(
  input: WalkInput,
  settings: Pick<EstimationSettings, "strideMeters" | "cadenceSpm">,
): StepEstimate | null {
  const { distanceMeters, durationSeconds } = input;
  if (distanceMeters != null && distanceMeters > 0 && settings.strideMeters > 0) {
    return { steps: Math.round(distanceMeters / settings.strideMeters), basis: "distance" };
  }
  if (durationSeconds != null && durationSeconds > 0 && settings.cadenceSpm > 0) {
    return { steps: Math.round((durationSeconds / 60) * settings.cadenceSpm), basis: "duration" };
  }
  return null;
}

/** Distance covered by a number of steps — the "Distance est." tile. */
export function distanceForSteps(steps: number, strideMeters: number): number {
  return steps * strideMeters;
}
