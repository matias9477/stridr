import { desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/src/db/client";
import { isLiveQueryLoading, useLiveQuery } from "@/src/db/live";
import { type ManualActivityRow, manualActivity } from "@/src/db/schema";
import { newUuid } from "@/src/db/uuid";
import type { DayKey } from "@/src/lib/day";
import type { EstimationSettings } from "./estimate";
import type { AddStepsOut, LogWalkOut } from "./schema";

/**
 * The only module allowed to touch the manual_activity table.
 * Reads are live-query hooks; mutations are plain async functions
 * (live queries re-run automatically after writes, so totals and stats
 * update immediately — spec §6.9).
 */

/** Manual steps summed per local day — the input to every statistic. */
export function useManualStepsByDay() {
  const result = useLiveQuery(
    db
      .select({ day: manualActivity.day, steps: sql<number>`sum(${manualActivity.steps})` })
      .from(manualActivity)
      .groupBy(manualActivity.day),
  );
  return { ...result, isLoading: isLiveQueryLoading(result) };
}

/** Newest first. Unbounded on purpose: the log groups and pages them (ExpandableList). */
export function useManualEntries() {
  const result = useLiveQuery(
    db
      .select()
      .from(manualActivity)
      .orderBy(desc(manualActivity.day), desc(manualActivity.createdAt)),
  );
  return { ...result, isLoading: isLiveQueryLoading(result) };
}

export function useManualEntry(id: number) {
  const result = useLiveQuery(db.select().from(manualActivity).where(eq(manualActivity.id, id)), [
    id,
  ]);
  return {
    ...result,
    row: result.data[0] as ManualActivityRow | undefined,
    isLoading: isLiveQueryLoading(result),
  };
}

export async function createManualSteps(input: AddStepsOut): Promise<void> {
  await db.insert(manualActivity).values({
    uuid: newUuid(),
    kind: "steps",
    day: input.day,
    steps: input.steps,
  });
}

export async function createWalk(
  input: LogWalkOut,
  estimatedSteps: number | null,
  settings: EstimationSettings,
): Promise<void> {
  await db.insert(manualActivity).values({
    uuid: newUuid(),
    kind: "walk",
    day: input.day,
    steps: input.steps,
    estimatedSteps,
    distanceMeters: input.distanceMeters,
    durationSeconds: input.durationSeconds,
    strideMeters: settings.strideMeters,
    cadenceSpm: settings.cadenceSpm,
  });
}

export async function updateManualSteps(id: number, input: AddStepsOut): Promise<void> {
  await db
    .update(manualActivity)
    .set({ day: input.day, steps: input.steps, updatedAt: new Date().toISOString() })
    .where(eq(manualActivity.id, id));
}

export async function updateWalk(
  id: number,
  input: LogWalkOut,
  estimatedSteps: number | null,
  settings: EstimationSettings,
): Promise<void> {
  await db
    .update(manualActivity)
    .set({
      day: input.day,
      steps: input.steps,
      estimatedSteps,
      distanceMeters: input.distanceMeters,
      durationSeconds: input.durationSeconds,
      strideMeters: settings.strideMeters,
      cadenceSpm: settings.cadenceSpm,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(manualActivity.id, id));
}

export async function deleteManualEntry(id: number): Promise<void> {
  await db.delete(manualActivity).where(eq(manualActivity.id, id));
}

/** Plain read for non-React callers (CSV export). */
export async function getAllManualEntries(): Promise<ManualActivityRow[]> {
  return db.select().from(manualActivity).orderBy(manualActivity.day);
}

// --- dev-only helpers (DeveloperSection) ---

/** WHERE keeps live queries notified — see deleteGoalHistory in goal/queries.ts. */
export async function deleteAllManualEntries(): Promise<void> {
  await db.delete(manualActivity).where(isNotNull(manualActivity.id));
}

export async function seedManualEntries(days: DayKey[]): Promise<void> {
  if (days.length === 0) return;
  await db.insert(manualActivity).values(
    days.map((day) => ({
      uuid: newUuid(),
      kind: "steps" as const,
      day,
      steps: 4000 + Math.round(Math.random() * 9000),
    })),
  );
}
