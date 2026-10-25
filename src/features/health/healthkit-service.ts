import { Platform, TurboModuleRegistry } from "react-native";
import { type DayKey, fromDayKey, toDayKey } from "@/src/lib/day";

/**
 * The only module that imports @kingstinct/react-native-healthkit.
 *
 * It's lazy-required: the package creates its Nitro hybrid objects at import
 * time and throws when the native module isn't in the binary (Expo Go, an
 * old dev client, Android, web). Every function here degrades to "unavailable"
 * instead of crashing.
 *
 * All step totals come from HKStatisticsCollectionQuery with cumulativeSum —
 * HealthKit merges overlapping sources (iPhone + Apple Watch) itself, so we
 * never sum raw samples (spec §3.1, §3.3).
 */

type HealthKitModule = typeof import("@kingstinct/react-native-healthkit");

const STEP = "HKQuantityTypeIdentifierStepCount" as const;

/** HealthKit launched in September 2014 — nothing can be older than this. */
export const HEALTHKIT_EPOCH = new Date(2014, 8, 1);

let cached: HealthKitModule | null | undefined;

function healthKit(): HealthKitModule | null {
  if (cached !== undefined) return cached;
  // Probe Nitro before requiring: a failed require still reaches LogBox as a
  // red ERROR in dev (Expo Go has no NitroModules), even though we catch it.
  if (Platform.OS !== "ios" || !TurboModuleRegistry.get("NitroModules")) {
    cached = null;
    return cached;
  }
  try {
    cached = require("@kingstinct/react-native-healthkit") as HealthKitModule;
  } catch (error) {
    console.warn("[health/healthKit] native module missing — rebuild the dev client", error);
    cached = null;
  }
  return cached;
}

export type HealthAccess =
  /** No HealthKit on this device/binary — manual entries only. */
  | "unavailable"
  /** Never asked: show the connect CTA. */
  | "notRequested"
  /**
   * Asked. iOS never reveals whether READ access was granted (privacy), so
   * this is as certain as it gets — denied looks exactly like "no data".
   */
  | "requested";

export async function getHealthAccess(): Promise<HealthAccess> {
  const hk = healthKit();
  if (!hk) return "unavailable";
  try {
    if (!(await hk.isHealthDataAvailableAsync())) return "unavailable";
    const status = await hk.getRequestStatusForAuthorization({ toRead: [STEP] });
    return status === hk.AuthorizationRequestStatus.shouldRequest ? "notRequested" : "requested";
  } catch (error) {
    console.error("[health/getHealthAccess] failed", error);
    return "unavailable";
  }
}

/** Shows the system sheet (only the first time — iOS ignores repeats). Read-only: we never write. */
export async function requestHealthAccess(): Promise<HealthAccess> {
  const hk = healthKit();
  if (!hk) return "unavailable";
  try {
    await hk.requestAuthorization({ toRead: [STEP] });
  } catch (error) {
    console.error("[health/requestHealthAccess] failed", error);
  }
  return getHealthAccess();
}

/**
 * Daily step totals per local calendar day in [from, to). Days without any
 * HealthKit samples are ABSENT from the result — missing data is never 0.
 */
export async function queryDailySteps(from: Date, to: Date): Promise<Record<DayKey, number>> {
  const hk = healthKit();
  if (!hk) return {};
  const anchor = fromDayKey(toDayKey(from));
  const buckets = await hk.queryStatisticsCollectionForQuantity(
    STEP,
    ["cumulativeSum"],
    anchor,
    { day: 1 },
    { filter: { date: { startDate: anchor, endDate: to } }, unit: "count" },
  );
  const out: Record<DayKey, number> = {};
  for (const bucket of buckets) {
    const sum = bucket.sumQuantity?.quantity;
    if (bucket.startDate === undefined || sum === undefined) continue;
    out[toDayKey(bucket.startDate)] = Math.round(sum);
  }
  return out;
}

export interface MinuteSteps {
  /** Epoch ms of the minute's start. */
  start: number;
  steps: number;
}

/** Per-minute step totals in [from, to); only minutes with samples are returned. */
export async function queryMinuteSteps(from: Date, to: Date): Promise<MinuteSteps[]> {
  const hk = healthKit();
  if (!hk) return [];
  const buckets = await hk.queryStatisticsCollectionForQuantity(
    STEP,
    ["cumulativeSum"],
    from,
    { minute: 1 },
    { filter: { date: { startDate: from, endDate: to } }, unit: "count" },
  );
  const out: MinuteSteps[] = [];
  for (const bucket of buckets) {
    const sum = bucket.sumQuantity?.quantity;
    if (bucket.startDate === undefined || sum === undefined) continue;
    out.push({ start: bucket.startDate.getTime(), steps: sum });
  }
  return out;
}

/**
 * iOS 27+ lets users grant read access only from a date onward. Returns that
 * lower bound so "personal record" can say it's based on limited history
 * (spec §6.6). Null on older iOS or when access isn't limited.
 */
export async function getLimitedHistoryStart(): Promise<DayKey | null> {
  const hk = healthKit();
  if (!hk) return null;
  try {
    const dates = await hk.getEarliestAuthorizedSampleDates([STEP]);
    const date = dates[STEP];
    return date ? toDayKey(date) : null;
  } catch (error) {
    console.warn("[health/getLimitedHistoryStart] failed", error);
    return null;
  }
}

/** HKObserverQuery on step count. Returns an unsubscribe function (no-op when unavailable). */
export function subscribeToStepChanges(onChange: () => void): () => void {
  const hk = healthKit();
  if (!hk) return () => {};
  try {
    const subscription = hk.subscribeToChanges(STEP, (args) => {
      if (args.errorMessage) {
        console.warn("[health/subscribeToStepChanges] observer error", args.errorMessage);
        return;
      }
      onChange();
    });
    return () => subscription.remove();
  } catch (error) {
    console.error("[health/subscribeToStepChanges] failed", error);
    return () => {};
  }
}

/**
 * Registers step observers natively at launch so iOS can wake the app (at
 * most hourly) when new steps land — the only way the home-screen widget
 * refreshes without the user opening the app (spec §7). Best effort.
 */
export async function enableBackgroundStepDelivery(): Promise<void> {
  const hk = healthKit();
  if (!hk) return;
  try {
    await hk.configureBackgroundTypes([STEP], hk.UpdateFrequency.hourly);
  } catch (error) {
    console.warn("[health/enableBackgroundStepDelivery] failed", error);
  }
}
