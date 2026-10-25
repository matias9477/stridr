import { create } from "zustand";
import { addDaysToKey, type DayKey, fromDayKey, todayKey } from "@/src/lib/day";
import {
  enableBackgroundStepDelivery,
  getHealthAccess,
  getLimitedHistoryStart,
  HEALTHKIT_EPOCH,
  type HealthAccess,
  type MinuteSteps,
  queryDailySteps,
  queryMinuteSteps,
  requestHealthAccess,
} from "./healthkit-service";

/**
 * In-memory mirror of HealthKit query results — NOT persisted. HealthKit is
 * the source of truth (spec §9); this store only holds the latest answer so
 * every screen renders from one fetch. Refreshed by HealthSync.
 *
 * Full history loads once per calendar day; later refreshes re-query only the
 * trailing window, because HealthKit back-fills late data (Apple Watch syncs
 * can land hours later) but never rewrites last year.
 */

/** Days re-queried on incremental refreshes (and the span of per-minute data). */
export const RECENT_WINDOW_DAYS = 8;

type LoadStatus = "idle" | "loading" | "ready" | "error";

interface HealthState {
  /** Null until the first check. */
  access: HealthAccess | null;
  /** Steps per local day. A missing key means "no data", never zero. */
  daily: Record<DayKey, number>;
  /** Per-minute steps for the last RECENT_WINDOW_DAYS — intraday chart, active time. */
  minutes: MinuteSteps[];
  /** iOS 27 limited-access lower bound (spec §6.6). */
  limitedFrom: DayKey | null;
  status: LoadStatus;
  error: string | null;
  lastSyncedAt: number | null;
  /** The local day the data was computed for — drives midnight rollover. */
  today: DayKey;
  initialize: () => Promise<void>;
  requestAccess: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Dev-only: pin fake data (simulators have no steps); `null` returns to HealthKit. */
  setMockData: (mock: { daily: Record<DayKey, number>; minutes: MinuteSteps[] } | null) => void;
}

let historyLoadedFor: DayKey | null = null;
let inFlight: Promise<void> | null = null;
let rerunRequested = false;
let backgroundDeliveryEnabled = false;
/** While set, refreshes keep the mock instead of re-querying HealthKit. */
let mocked = false;

export const useHealthStore = create<HealthState>()((set, get) => {
  async function load(): Promise<void> {
    const today = todayKey();
    if (mocked) {
      set({ today });
      return;
    }
    const access = await getHealthAccess();
    set({ access, today });
    if (access !== "requested") {
      set({ daily: {}, minutes: [], status: "ready", error: null });
      return;
    }
    if (!backgroundDeliveryEnabled) {
      backgroundDeliveryEnabled = true;
      void enableBackgroundStepDelivery();
    }

    const tomorrow = fromDayKey(addDaysToKey(today, 1));
    const windowStartKey = addDaysToKey(today, -(RECENT_WINDOW_DAYS - 1));
    const windowStart = fromDayKey(windowStartKey);
    const full = historyLoadedFor !== today;

    const [daily, minutes, limitedFrom] = await Promise.all([
      queryDailySteps(full ? HEALTHKIT_EPOCH : windowStart, tomorrow),
      queryMinuteSteps(windowStart, tomorrow),
      full ? getLimitedHistoryStart() : Promise.resolve(get().limitedFrom),
    ]);

    let merged = daily;
    if (!full) {
      // Drop the window's old keys first: a day can go from data to no data
      // (samples deleted in the Health app).
      merged = { ...get().daily };
      for (const key of Object.keys(merged)) {
        if (key >= windowStartKey) delete merged[key];
      }
      Object.assign(merged, daily);
    }
    historyLoadedFor = today;
    set({
      daily: merged,
      minutes,
      limitedFrom,
      status: "ready",
      error: null,
      lastSyncedAt: Date.now(),
    });
  }

  async function run(): Promise<void> {
    if (get().status !== "ready") set({ status: "loading" });
    try {
      await load();
    } catch (error) {
      console.error("[health/refresh] failed", error);
      set({ status: "error", error: error instanceof Error ? error.message : String(error) });
    }
  }

  return {
    access: null,
    daily: {},
    minutes: [],
    limitedFrom: null,
    status: "idle",
    error: null,
    lastSyncedAt: null,
    today: todayKey(),

    initialize: () => get().refresh(),

    requestAccess: async () => {
      await requestHealthAccess();
      historyLoadedFor = null;
      await get().refresh();
    },

    setMockData: (mock) => {
      if (!__DEV__) return;
      mocked = mock !== null;
      historyLoadedFor = null;
      if (mock) {
        set({
          ...mock,
          access: "requested",
          limitedFrom: null,
          status: "ready",
          error: null,
          lastSyncedAt: Date.now(),
          today: todayKey(),
        });
      } else {
        void get().refresh();
      }
    },

    // Coalesces bursts (observer + foreground firing together) into at most
    // one queued re-run.
    refresh: async () => {
      if (inFlight) {
        rerunRequested = true;
        return inFlight;
      }
      inFlight = (async () => {
        do {
          rerunRequested = false;
          await run();
        } while (rerunRequested);
      })().finally(() => {
        inFlight = null;
      });
      return inFlight;
    },
  };
});
