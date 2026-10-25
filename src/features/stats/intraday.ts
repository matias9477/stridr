import type { MinuteSteps } from "@/src/features/health/healthkit-service";
import { type DayKey, toDayKey } from "@/src/lib/day";

/**
 * Intraday derivations from per-minute HealthKit totals (pure). Manual
 * entries have no time of day, so these describe recorded activity only.
 */

/**
 * A minute counts as "active" at ≥ 60 steps — a slow but purposeful walk.
 * Below that is shuffling around the house.
 */
export const ACTIVE_MINUTE_THRESHOLD = 60;

export interface DayActivity {
  activeMinutes: number;
  /** Mean steps/min across active minutes; null with none. */
  cadence: number | null;
}

export function activityByDay(minutes: readonly MinuteSteps[]): Record<DayKey, DayActivity> {
  const acc: Record<DayKey, { minutes: number; steps: number }> = {};
  for (const m of minutes) {
    if (m.steps < ACTIVE_MINUTE_THRESHOLD) continue;
    const key = toDayKey(new Date(m.start));
    const entry = acc[key] ?? { minutes: 0, steps: 0 };
    entry.minutes++;
    entry.steps += m.steps;
    acc[key] = entry;
  }
  const out: Record<DayKey, DayActivity> = {};
  for (const [key, { minutes: count, steps }] of Object.entries(acc)) {
    out[key] = { activeMinutes: count, cadence: Math.round(steps / count) };
  }
  return out;
}

/** 24 hourly totals for one day; null = no samples that hour. */
export function hourlySteps(minutes: readonly MinuteSteps[], day: DayKey): (number | null)[] {
  const hours: (number | null)[] = Array.from({ length: 24 }, () => null);
  for (const m of minutes) {
    const date = new Date(m.start);
    if (toDayKey(date) !== day) continue;
    const h = date.getHours();
    hours[h] = (hours[h] ?? 0) + m.steps;
  }
  return hours.map((v) => (v === null ? null : Math.round(v)));
}

export interface PeakHour {
  hour: number;
  steps: number;
}

export function peakHour(hourly: readonly (number | null)[]): PeakHour | null {
  let best: PeakHour | null = null;
  hourly.forEach((steps, hour) => {
    if (steps !== null && steps > 0 && (best === null || steps >= best.steps))
      best = { hour, steps };
  });
  return best;
}
