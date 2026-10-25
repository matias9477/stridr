import { asc } from "drizzle-orm";
import { db } from "@/src/db/client";
import { isLiveQueryLoading, useLiveQuery } from "@/src/db/live";
import { goalChanges } from "@/src/db/schema";
import { newUuid } from "@/src/db/uuid";
import { todayKey } from "@/src/lib/day";
import { snapGoal } from "./goal-rules";

/** The only module allowed to touch the goal_changes table. */

/** Sorted ascending — the shape goalForDay() expects. */
export function useGoalChanges() {
  const result = useLiveQuery(
    db
      .select({ effectiveFrom: goalChanges.effectiveFrom, steps: goalChanges.steps })
      .from(goalChanges)
      .orderBy(asc(goalChanges.effectiveFrom)),
  );
  return { ...result, isLoading: isLiveQueryLoading(result) };
}

/**
 * Sets (or with null, turns off) the goal from today on. Re-setting on the
 * same day overwrites today's row instead of piling up history.
 */
export async function setGoalFromToday(steps: number | null): Promise<void> {
  const value = steps === null ? null : snapGoal(steps);
  const day = todayKey();
  await db
    .insert(goalChanges)
    .values({ uuid: newUuid(), effectiveFrom: day, steps: value })
    .onConflictDoUpdate({
      target: goalChanges.effectiveFrom,
      set: { steps: value, updatedAt: new Date().toISOString() },
    });
}

/** Dev-only (DeveloperSection). */
export async function deleteGoalHistory(): Promise<void> {
  await db.delete(goalChanges);
}
