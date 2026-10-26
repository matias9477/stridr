import { distanceForSteps } from "@/src/features/activity/estimate";
import type { DayActivity } from "@/src/features/stats/intraday";
import type { DayIndex, Streaks } from "@/src/features/stats/stats";
import { addDaysToKey, type DayKey } from "@/src/lib/day";

/**
 * What the share card shows (docs/spec-share-card.md), derived purely from
 * the stats the Today screen already computes. Numbers only — the component
 * formats and translates, so this stays testable without i18n.
 */

/** One slot on the 24-hour axis. `height` is 0–1 of the day's busiest hour. */
export type HourSlot =
  | { kind: "bar"; height: number }
  /** Past hour with no HealthKit samples. */
  | { kind: "empty" }
  /** Hasn't happened yet — a dim stub keeps the axis full. */
  | { kind: "future" };

export interface WeekSlot {
  day: DayKey;
  /** 0–1 of the week's best day; null = no data that day. */
  height: number | null;
  isToday: boolean;
}

export type SecondLayer =
  | { kind: "hourly"; slots: HourSlot[]; nowHour: number; loggedExtra: number | null }
  | { kind: "week"; slots: WeekSlot[] };

export type ShareStat =
  | { kind: "distance"; meters: number }
  | { kind: "active"; minutes: number }
  | { kind: "streak"; days: number };

export interface ShareCardModel {
  day: DayKey;
  total: number;
  goal: number | null;
  /** total / goal × 100, uncapped; null without a goal. */
  percent: number | null;
  goalMet: boolean;
  second: SecondLayer;
  /** Only the stats that exist, in display order — the row collapses around missing ones. */
  stats: ShareStat[];
}

export interface ShareCardInput {
  day: DayKey;
  index: DayIndex;
  /** 24 hourly totals for `day` (HealthKit only). */
  hourly: readonly (number | null)[];
  /** Current local hour when `day` is today; 23 for a finished day. */
  nowHour: number;
  activity: DayActivity | undefined;
  streaks: Streaks;
  strideMeters: number;
}

export const WEEK_DAYS = 7;

/** Null when the day has no data — the share button is disabled then. */
export function buildShareCard(input: ShareCardInput): ShareCardModel | null {
  const today = input.index.get(input.day);
  const total = today?.total ?? null;
  if (today === undefined || total === null) return null;

  const goal = today.goal;
  const hasHourly = input.hourly.some((h) => h !== null);

  return {
    day: input.day,
    total,
    goal,
    percent: goal !== null && goal > 0 ? (total / goal) * 100 : null,
    goalMet: today.goalMet === true,
    second: hasHourly
      ? {
          kind: "hourly",
          slots: hourSlots(input.hourly, input.nowHour),
          nowHour: input.nowHour,
          loggedExtra: today.manualSteps > 0 ? today.manualSteps : null,
        }
      : { kind: "week", slots: weekSlots(input.index, input.day) },
    stats: shareStats(input, total, goal),
  };
}

export function hourSlots(hourly: readonly (number | null)[], nowHour: number): HourSlot[] {
  const max = Math.max(0, ...hourly.map((h) => h ?? 0));
  return Array.from({ length: 24 }, (_, hour): HourSlot => {
    if (hour > nowHour) return { kind: "future" };
    const steps = hourly[hour] ?? null;
    if (steps === null || steps === 0 || max === 0) return { kind: "empty" };
    return { kind: "bar", height: steps / max };
  });
}

/** The last 7 days ending on `day`, oldest first. */
export function weekSlots(index: DayIndex, day: DayKey): WeekSlot[] {
  const keys = Array.from({ length: WEEK_DAYS }, (_, i) => addDaysToKey(day, i - (WEEK_DAYS - 1)));
  const totals = keys.map((k) => index.get(k)?.total ?? null);
  const max = Math.max(0, ...totals.map((t) => t ?? 0));
  return keys.map((k, i) => {
    const total = totals[i] ?? null;
    return {
      day: k,
      height: total === null ? null : max > 0 ? total / max : 0,
      isToday: k === day,
    };
  });
}

function shareStats(input: ShareCardInput, total: number, goal: number | null): ShareStat[] {
  const out: ShareStat[] = [
    { kind: "distance", meters: distanceForSteps(total, input.strideMeters) },
  ];
  if (input.activity && input.activity.activeMinutes > 0) {
    out.push({ kind: "active", minutes: input.activity.activeMinutes });
  }
  // No goal → nothing to streak; a 0-day streak isn't a brag.
  if (goal !== null && input.streaks.current > 0) {
    out.push({ kind: "streak", days: input.streaks.current });
  }
  return out;
}
