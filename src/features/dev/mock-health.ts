import type { MinuteSteps } from "@/src/features/health/healthkit-service";
import { addDaysToKey, type DayKey, fromDayKey, toDayKey } from "@/src/lib/day";

/**
 * Fake HealthKit data for the simulator (which has no step samples): a
 * commute/lunch/evening-walk day shape so the intraday cards (temporal
 * cadence, active time, peak interval) and every daily stat have something
 * to draw. Dev-only — consumed by DeveloperSection.
 */

/** Active minutes per hour of a typical day (0 = sedentary). */
const DAY_SHAPE = [0, 0, 0, 0, 0, 0, 6, 22, 14, 4, 3, 8, 16, 6, 4, 10, 18, 28, 32, 9, 3, 1, 0, 0];
const HISTORY_DAYS = 120;
/** "Years" mock: back to early 2017, long enough to force monthly chart bars. */
export const LONG_HISTORY_DAYS = 3570;
const MINUTE_DAYS = 8;

/** Deterministic PRNG so the mock looks the same on every tap. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function dayMinutes(day: DayKey, until: Date | null, rand: () => number): MinuteSteps[] {
  const start = fromDayKey(day).getTime();
  const out: MinuteSteps[] = [];
  DAY_SHAPE.forEach((active, hour) => {
    const minutes = Math.round(active * (0.6 + rand() * 0.8));
    for (let i = 0; i < Math.min(minutes, 60); i++) {
      const at = start + (hour * 60 + Math.floor((i * 60) / Math.max(minutes, 1))) * 60_000;
      if (until && at > until.getTime()) return;
      out.push({ start: at, steps: Math.round(70 + rand() * 50) });
    }
    // A little ambient shuffling outside the walks.
    if (hour >= 7 && hour <= 21) {
      const at = start + (hour * 60 + 45) * 60_000;
      if (!until || at <= until.getTime()) out.push({ start: at, steps: Math.round(rand() * 40) });
    }
  });
  return out;
}

/**
 * Older days get a seasonal swing (summer peaks, winter dips) and a slow
 * multi-year climb — flat noise averages out to identical monthly/yearly bars,
 * which would hide whether long-range charts render shape at all.
 */
function historicDay(daysAgo: number, rand: () => number): number {
  const season = Math.sin((daysAgo / 365.25) * 2 * Math.PI) * 1800;
  const drift = -Math.min(daysAgo, 3600) * 0.9;
  return Math.max(800, Math.round(8500 + season + drift + (rand() - 0.5) * 6000));
}

export function mockHealthData(
  now: Date = new Date(),
  historyDays: number = HISTORY_DAYS,
): {
  daily: Record<DayKey, number>;
  minutes: MinuteSteps[];
} {
  const rand = rng(42);
  const today = toDayKey(now);
  const daily: Record<DayKey, number> = {};
  const minutes: MinuteSteps[] = [];
  for (let i = historyDays - 1; i >= 0; i--) {
    const day = addDaysToKey(today, -i);
    // Leave occasional holes so "no data" bars and streak gaps stay visible.
    if (i > 0 && i % 13 === 6) continue;
    if (i < MINUTE_DAYS) {
      const dayMins = dayMinutes(day, i === 0 ? now : null, rand);
      minutes.push(...dayMins);
      daily[day] = dayMins.reduce((sum, m) => sum + m.steps, 0);
    } else {
      daily[day] =
        historyDays === HISTORY_DAYS ? Math.round(5500 + rand() * 7500) : historicDay(i, rand);
    }
  }
  return { daily, minutes };
}
