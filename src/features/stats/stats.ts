import { type GoalChange, goalForDay } from "@/src/features/goal/goal-rules";
import { addDaysToKey, type DayKey, dayRange, startOfWeekKey } from "@/src/lib/day";

/**
 * Step statistics — pure functions over daily totals (spec §6, §9).
 * Every rule that decides a number lives here and is pinned by
 * __tests__/stats.test.ts. The UI never re-derives these.
 *
 * Core invariant: a day with no HealthKit samples and no manual entries has
 * total = null ("no data") and is EXCLUDED from averages, peaks and records.
 * It is never treated as a zero-step day.
 */

export const STATS_RULES = {
  /** "7-day average" = the last 7 COMPLETED days. Today is partial and would drag it down. */
  averageWindowDays: 7,
  /** Trend compares the last 30 completed days with the 30 before them. */
  trendWindowDays: 30,
  /** Each trend period needs this many valid days, otherwise no trend is shown. */
  minValidDaysForTrend: 15,
  /** The previous week needs this many valid days before a week-over-week % is shown. */
  minValidDaysForWeekCompare: 4,
  /** Consecutive no-data days a streak survives (forgot the phone). One more breaks it. */
  maxSkippableGapDays: 2,
  /** Goal pace assumes steps accumulate between these local hours. */
  paceStartHour: 7,
  paceEndHour: 22,
} as const;

export interface DailyTotal {
  day: DayKey;
  /** HealthKit aggregated total; null = no samples that day. */
  healthSteps: number | null;
  /** Sum of manual entries (0 when none). */
  manualSteps: number;
  /** healthSteps + manualSteps; null when the day has no data at all. */
  total: number | null;
  goal: number | null;
  /** Null when there's no goal or no data — unknown is not "missed". */
  goalMet: boolean | null;
}

export interface BuildInput {
  health: Readonly<Record<DayKey, number>>;
  manual: Readonly<Record<DayKey, number>>;
  /** Sorted by effectiveFrom ascending. */
  goals: readonly GoalChange[];
  today: DayKey;
}

/** First day with any data (HealthKit or manual), or today when there is none. */
export function historyStart(input: Pick<BuildInput, "health" | "manual" | "today">): DayKey {
  let first = input.today;
  for (const key of Object.keys(input.health)) if (key < first) first = key;
  for (const key of Object.keys(input.manual)) if (key < first) first = key;
  return first;
}

/** One entry per calendar day from the first day with data through today, oldest first. */
export function buildDailyTotals(input: BuildInput): DailyTotal[] {
  return dayRange(historyStart(input), input.today).map((day) => {
    const healthSteps = input.health[day] ?? null;
    const manualSteps = input.manual[day] ?? 0;
    const total =
      healthSteps === null && manualSteps === 0 ? null : (healthSteps ?? 0) + manualSteps;
    const goal = goalForDay(input.goals, day);
    const goalMet = goal === null || total === null ? null : total >= goal;
    return { day, healthSteps, manualSteps, total, goal, goalMet };
  });
}

export type DayIndex = ReadonlyMap<DayKey, DailyTotal>;

export function indexDays(days: readonly DailyTotal[]): DayIndex {
  return new Map(days.map((d) => [d.day, d]));
}

/** Totals for an inclusive window; days outside history come back as no-data. */
export function windowTotals(index: DayIndex, from: DayKey, to: DayKey): (number | null)[] {
  return dayRange(from, to).map((day) => index.get(day)?.total ?? null);
}

export interface AverageResult {
  average: number | null;
  validDays: number;
}

/** Mean over valid (non-null) days only, rounded to whole steps. */
export function averageOf(totals: readonly (number | null)[]): AverageResult {
  let sum = 0;
  let validDays = 0;
  for (const total of totals) {
    if (total === null) continue;
    sum += total;
    validDays++;
  }
  return { average: validDays === 0 ? null : Math.round(sum / validDays), validDays };
}

export function sumOf(totals: readonly (number | null)[]): { total: number; validDays: number } {
  let total = 0;
  let validDays = 0;
  for (const value of totals) {
    if (value === null) continue;
    total += value;
    validDays++;
  }
  return { total, validDays };
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[mid] as number)
    : Math.round(((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2);
}

/** Percent change, null when the base is missing or zero (a % of 0 is meaningless). */
export function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/** Highest valid day; ties go to the most recent day. */
export function peakDay(days: readonly DailyTotal[]): DailyTotal | null {
  let best: DailyTotal | null = null;
  for (const day of days) {
    if (day.total === null) continue;
    if (best === null || (best.total as number) <= day.total) best = day;
  }
  return best;
}

export interface SevenDayAverage extends AverageResult {
  /** The previous 7 completed days — the "baseline" shown under the number. */
  baseline: number | null;
  changePct: number | null;
}

export function sevenDayAverage(index: DayIndex, today: DayKey): SevenDayAverage {
  const n = STATS_RULES.averageWindowDays;
  const current = averageOf(windowTotals(index, addDaysToKey(today, -n), addDaysToKey(today, -1)));
  const previous = averageOf(
    windowTotals(index, addDaysToKey(today, -2 * n), addDaysToKey(today, -n - 1)),
  );
  return {
    ...current,
    baseline: previous.average,
    changePct: percentChange(current.average, previous.average),
  };
}

/** Median of the last 7 completed days' valid totals — the goal suggestion in Settings. */
export function sevenDayMedian(index: DayIndex, today: DayKey): number | null {
  const n = STATS_RULES.averageWindowDays;
  const totals = windowTotals(index, addDaysToKey(today, -n), addDaysToKey(today, -1));
  return median(totals.filter((t): t is number => t !== null));
}

export interface WeekSummary {
  from: DayKey;
  to: DayKey;
  total: number;
  validDays: number;
  /** Last week's total over the same completed days (Mon → yesterday's weekday). */
  previousTotal: number | null;
  /**
   * Completed days of this week vs the same days of last week. Today is left
   * out of both sides: its partial total against a finished day would read as
   * "behind" every morning. Null on Mondays (nothing completed yet).
   */
  changePct: number | null;
}

/** Monday through today (spec §6.4). */
export function weekSummary(index: DayIndex, today: DayKey): WeekSummary {
  const from = startOfWeekKey(today);
  const current = sumOf(windowTotals(index, from, today));
  const yesterday = addDaysToKey(today, -1);
  const prevFrom = addDaysToKey(from, -7);
  const fullPrevious = sumOf(windowTotals(index, prevFrom, addDaysToKey(from, -1)));
  const enough =
    from <= yesterday && fullPrevious.validDays >= STATS_RULES.minValidDaysForWeekCompare;
  const completed = sumOf(windowTotals(index, from, yesterday));
  const previous = sumOf(windowTotals(index, prevFrom, addDaysToKey(yesterday, -7)));
  return {
    from,
    to: today,
    total: current.total,
    validDays: current.validDays,
    previousTotal: enough ? previous.total : null,
    changePct: enough ? percentChange(completed.total, previous.total) : null,
  };
}

export interface Trend {
  currentAverage: number;
  previousAverage: number;
  /** Steps/day, current − previous. */
  difference: number;
  /** Null when the previous average is 0 (spec §6.8). */
  percent: number | null;
}

/** Null when either period lacks enough valid days (spec §6.8). */
export function thirtyDayTrend(index: DayIndex, today: DayKey): Trend | null {
  const n = STATS_RULES.trendWindowDays;
  const current = averageOf(windowTotals(index, addDaysToKey(today, -n), addDaysToKey(today, -1)));
  const previous = averageOf(
    windowTotals(index, addDaysToKey(today, -2 * n), addDaysToKey(today, -n - 1)),
  );
  if (
    current.average === null ||
    previous.average === null ||
    current.validDays < STATS_RULES.minValidDaysForTrend ||
    previous.validDays < STATS_RULES.minValidDaysForTrend
  ) {
    return null;
  }
  return {
    currentAverage: current.average,
    previousAverage: previous.average,
    difference: current.average - previous.average,
    percent: percentChange(current.average, previous.average),
  };
}

export interface Streaks {
  current: number;
  longest: number;
  /** Whether today already counts (goal reached). Before that, today neither extends nor breaks. */
  todayCounted: boolean;
}

/**
 * Goal streaks (spec §6.7). Rules:
 * - a completed day with total ≥ goal extends the streak; below goal breaks it;
 * - a day with no goal ends the streak (nothing to meet);
 * - a no-data day is skipped — up to maxSkippableGapDays in a row; a longer gap breaks it;
 * - today extends the streak once the goal is reached and never breaks it before midnight.
 * `days` must be chronological and end with today.
 */
export function goalStreaks(days: readonly DailyTotal[], today: DayKey): Streaks {
  let current = 0;
  let longest = 0;
  let gap = 0;
  let todayCounted = false;
  for (const day of days) {
    if (day.day === today) {
      if (day.goalMet === true) {
        current++;
        longest = Math.max(longest, current);
        todayCounted = true;
      }
      break;
    }
    if (day.goal === null) {
      current = 0;
      gap = 0;
      continue;
    }
    if (day.total === null) {
      gap++;
      if (gap > STATS_RULES.maxSkippableGapDays) current = 0;
      continue;
    }
    gap = 0;
    if (day.goalMet) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return { current, longest, todayCounted };
}

export interface TodayProgress {
  total: number | null;
  goal: number | null;
  /** total / goal × 100, uncapped (148% is a real number). */
  percent: number | null;
  remaining: number | null;
  goalMet: boolean;
  /** Steps ahead (+) or behind (−) an even pace over the pace window; null outside it / without a goal. */
  paceDelta: number | null;
  /** Hero bar geometry (0–1): the bar scales to max(goal, total) so the goal tick moves left once exceeded. */
  fill: number;
  goalMarker: number | null;
}

export function todayProgress(day: DailyTotal | undefined, now: Date): TodayProgress {
  const total = day?.total ?? null;
  const goal = day?.goal ?? null;
  if (goal === null) {
    return {
      total,
      goal,
      percent: null,
      remaining: null,
      goalMet: false,
      paceDelta: null,
      fill: 0,
      goalMarker: null,
    };
  }
  const steps = total ?? 0;
  const scale = Math.max(goal, steps);
  const hours = now.getHours() + now.getMinutes() / 60;
  const { paceStartHour, paceEndHour } = STATS_RULES;
  const fraction = Math.min(
    1,
    Math.max(0, (hours - paceStartHour) / (paceEndHour - paceStartHour)),
  );
  return {
    total,
    goal,
    percent: (steps / goal) * 100,
    remaining: Math.max(0, goal - steps),
    goalMet: steps >= goal,
    paceDelta: fraction === 0 ? null : Math.round(steps - goal * fraction),
    fill: scale === 0 ? 0 : steps / scale,
    goalMarker: goal / scale,
  };
}

// --- chart ---

export type ChartRange = "week" | "month" | "quarter" | "all";

export const RANGE_DAYS: Record<Exclude<ChartRange, "all">, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

/** Above this many days the chart switches to weekly bars (spec §6.2 — efficient all-time). */
export const MAX_DAILY_BARS = 120;

export function rangeDays(
  days: readonly DailyTotal[],
  range: ChartRange,
  today: DayKey,
): DailyTotal[] {
  if (range === "all") return [...days];
  const from = addDaysToKey(today, -(RANGE_DAYS[range] - 1));
  const index = indexDays(days);
  // Pad before history start so a 7D chart always has 7 slots.
  return dayRange(from, today).map(
    (day) =>
      index.get(day) ?? {
        day,
        healthSteps: null,
        manualSteps: 0,
        total: null,
        goal: null,
        goalMet: null,
      },
  );
}

export interface ChartBar {
  key: string;
  from: DayKey;
  to: DayKey;
  /** Daily total, or the weekly average per valid day when aggregated. Null = no data. */
  value: number | null;
  aggregated: boolean;
  containsToday: boolean;
  isPeak: boolean;
}

export function chartBars(days: readonly DailyTotal[], today: DayKey): ChartBar[] {
  let bars: ChartBar[];
  if (days.length <= MAX_DAILY_BARS) {
    bars = days.map((d) => ({
      key: d.day,
      from: d.day,
      to: d.day,
      value: d.total,
      aggregated: false,
      containsToday: d.day === today,
      isPeak: false,
    }));
  } else {
    const weeks = new Map<DayKey, DailyTotal[]>();
    for (const d of days) {
      const week = startOfWeekKey(d.day);
      const bucket = weeks.get(week);
      if (bucket) bucket.push(d);
      else weeks.set(week, [d]);
    }
    bars = [...weeks.entries()].map(([week, bucket]) => ({
      key: week,
      from: bucket[0]?.day ?? week,
      to: bucket[bucket.length - 1]?.day ?? week,
      value: averageOf(bucket.map((d) => d.total)).average,
      aggregated: true,
      containsToday: bucket.some((d) => d.day === today),
      isPeak: false,
    }));
  }
  let peak: ChartBar | null = null;
  for (const bar of bars) {
    if (bar.value !== null && (peak === null || (peak.value as number) <= bar.value)) peak = bar;
  }
  if (peak) peak.isPeak = true;
  return bars;
}
