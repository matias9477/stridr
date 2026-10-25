import { STATS_RULES } from "@/src/features/stats/stats";

export const NUDGE_RULES = {
  /** Local hour of the single daily nudge. */
  hour: 18,
} as const;

export interface PaceNudgePlan {
  fireAt: Date;
  /** Steps to the goal as of `now` — the copy is baked at schedule time. */
  remaining: number;
}

/**
 * Today's nudge, or null when there shouldn't be one (spec pace-nudges §1):
 * no goal, no data, already past the nudge time, or already at the pace mark
 * the nudge checks for (steps only grow, so that can't un-happen).
 */
export function planPaceNudge(input: {
  now: Date;
  total: number | null;
  goal: number | null;
}): PaceNudgePlan | null {
  const { now, total, goal } = input;
  if (goal === null || goal <= 0 || total === null) return null;

  const fireAt = new Date(now);
  fireAt.setHours(NUDGE_RULES.hour, 0, 0, 0);
  if (fireAt.getTime() <= now.getTime()) return null;

  const { paceStartHour, paceEndHour } = STATS_RULES;
  const paceMark = goal * ((NUDGE_RULES.hour - paceStartHour) / (paceEndHour - paceStartHour));
  if (total >= paceMark) return null;

  return { fireAt, remaining: Math.max(0, goal - total) };
}
