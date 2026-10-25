import { z } from "zod";
import i18n from "@/src/i18n";
import { isDayKey, todayKey } from "@/src/lib/day";

/**
 * Zod input schemas for manual activity (spec §3.2). The form works in the
 * user's display unit and minutes; the output is domain values (meters,
 * seconds) ready for queries.ts. Error messages are lazy i18n thunks so they
 * follow language changes.
 */

export const MANUAL_STEPS_MAX = 100_000;
export const WALK_DISTANCE_MAX_METERS = 100_000;
export const WALK_DURATION_MAX_MINUTES = 24 * 60;

const dayField = z
  .string()
  .refine(isDayKey, { error: () => i18n.t("validation.dayInvalid") })
  // Evaluated at validation time, not module load, so midnight rollovers are respected.
  .refine((day) => day <= todayKey(), { error: () => i18n.t("validation.dayInFuture") });

/** Text-input friendly: "" → undefined, "1,5" → 1.5. */
const optionalNumber = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim().replace(",", ".");
  return trimmed === "" ? undefined : Number(trimmed);
}, z.number({ error: () => i18n.t("validation.numberInvalid") }).optional());

const stepsField = z.preprocess(
  (value) =>
    typeof value === "string" ? Number(value.replace(/[^\d]/g, "") || Number.NaN) : value,
  z
    .number({ error: () => i18n.t("validation.stepsRequired") })
    .int({ error: () => i18n.t("validation.stepsRequired") })
    .min(1, { error: () => i18n.t("validation.stepsRequired") })
    .max(MANUAL_STEPS_MAX, { error: () => i18n.t("validation.stepsTooMany") }),
);

export const addStepsInput = z.object({
  day: dayField,
  steps: stepsField,
});

export const logWalkInput = z
  .object({
    day: dayField,
    unit: z.enum(["km", "mi"]),
    distance: optionalNumber.refine((v) => v === undefined || v > 0, {
      error: () => i18n.t("validation.numberInvalid"),
    }),
    durationMinutes: optionalNumber.refine(
      (v) => v === undefined || (v > 0 && v <= WALK_DURATION_MAX_MINUTES),
      { error: () => i18n.t("validation.durationInvalid") },
    ),
    /** Final steps — prefilled with the estimate, editable by the user (spec §3.2B). */
    steps: stepsField,
  })
  .refine((v) => v.distance !== undefined || v.durationMinutes !== undefined, {
    error: () => i18n.t("validation.walkNeedsInput"),
    path: ["distance"],
  })
  .transform(({ distance, durationMinutes, unit, ...rest }) => ({
    ...rest,
    distanceMeters: distance === undefined ? null : distance * (unit === "km" ? 1000 : 1609.344),
    durationSeconds: durationMinutes === undefined ? null : Math.round(durationMinutes * 60),
  }))
  .refine((v) => v.distanceMeters === null || v.distanceMeters <= WALK_DISTANCE_MAX_METERS, {
    error: () => i18n.t("validation.distanceTooLong"),
    path: ["distance"],
  });

export type AddStepsIn = z.input<typeof addStepsInput>;
export type AddStepsOut = z.output<typeof addStepsInput>;
export type LogWalkIn = z.input<typeof logWalkInput>;
export type LogWalkOut = z.output<typeof logWalkInput>;
