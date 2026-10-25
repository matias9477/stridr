import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Single source of truth for the local database.
 * After editing: `npm run db:generate`, then reload the app — migrations
 * are applied at boot by useMigrations() in app/_layout.tsx.
 *
 * HealthKit step totals are deliberately NOT stored here (spec §9): HealthKit
 * stays the source of truth for recorded activity and is re-queried, so no
 * table can go stale. Only what the user creates lives in SQLite.
 */

/** Shared columns mixed into every table. */
const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
};

export const MANUAL_ACTIVITY_KINDS = ["steps", "walk"] as const;
export type ManualActivityKind = (typeof MANUAL_ACTIVITY_KINDS)[number];

/**
 * Supplemental activity the user confirmed HealthKit did not record (spec
 * §3.2–3.3). Added on top of HealthKit's aggregated daily total; never
 * written back to HealthKit.
 */
export const manualActivity = sqliteTable(
  "manual_activity",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Stable cross-device key (expo-crypto UUID) — never reuse the int id outside the device. */
    uuid: text("uuid").notNull().unique(),
    kind: text("kind", { enum: MANUAL_ACTIVITY_KINDS }).notNull(),
    /** Local calendar day the activity counts toward ("YYYY-MM-DD", see src/lib/day.ts). */
    day: text("day").notNull(),
    /** Final step count that counts toward the day — entered, or the (possibly edited) estimate. */
    steps: integer("steps").notNull(),
    /** What the estimator produced for a walk; null for plain step entries. Kept so edits can show the original estimate. */
    estimatedSteps: integer("estimated_steps"),
    distanceMeters: real("distance_meters"),
    durationSeconds: integer("duration_seconds"),
    /** Estimation assumptions at save time, so later preference changes don't silently rewrite history. */
    strideMeters: real("stride_meters"),
    cadenceSpm: real("cadence_spm"),
    ...timestamps,
  },
  (t) => [index("manual_activity_day_idx").on(t.day)],
);

export type ManualActivityRow = typeof manualActivity.$inferSelect;
export type NewManualActivity = typeof manualActivity.$inferInsert;

/**
 * Daily step goal history. The goal for a day is the latest row whose
 * effectiveFrom <= that day; the earliest row also covers every day before it
 * (src/features/goal/goal-rules.ts). Changing the goal therefore never rewrites
 * past days' goal completion except for the very first goal.
 */
export const goalChanges = sqliteTable("goal_changes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid").notNull().unique(),
  /** First local day this goal applies to — one row per day (re-setting on the same day updates it). */
  effectiveFrom: text("effective_from").notNull().unique(),
  /** Null = goal turned off from this day. */
  steps: integer("steps"),
  ...timestamps,
});

export type GoalChangeRow = typeof goalChanges.$inferSelect;
