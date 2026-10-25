import type { DayKey } from "@/src/lib/day";

/**
 * Goal-per-day resolution (pure). A goal change applies from its
 * effectiveFrom day onward, so raising the goal today doesn't retroactively
 * break last month's streak. The FIRST goal ever set also covers all earlier
 * days: a new user with years of HealthKit history gets meaningful streaks
 * and goal markers immediately instead of "no goal" everywhere.
 */

export const GOAL_LIMITS = { min: 1000, max: 50_000, step: 500, suggested: 10_000 } as const;

export interface GoalChange {
  effectiveFrom: DayKey;
  /** Null = goal turned off from this day. */
  steps: number | null;
}

/** `changes` must be sorted by effectiveFrom ascending. */
export function goalForDay(changes: readonly GoalChange[], day: DayKey): number | null {
  if (changes.length === 0) return null;
  let goal: number | null = changes[0]?.steps ?? null;
  for (const change of changes) {
    if (change.effectiveFrom > day) break;
    goal = change.steps;
  }
  return goal;
}

/** Clamp and snap a stepper value to the goal grid. */
export function snapGoal(value: number): number {
  const snapped = Math.round(value / GOAL_LIMITS.step) * GOAL_LIMITS.step;
  return Math.min(GOAL_LIMITS.max, Math.max(GOAL_LIMITS.min, snapped));
}
