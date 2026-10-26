import { z } from "zod";
import i18n from "@/src/i18n";
import { type DayKey, isDayKey } from "@/src/lib/day";
import { type CustomRange, MAX_CUSTOM_DAYS } from "../stats";

/**
 * The custom-range editor's input (docs/spec-custom-range.md). The form keeps
 * both modes' fields so switching modes doesn't lose what was typed; the output
 * is the `CustomRange` for the chosen mode only. Bounds are today and the
 * history start, so the schema is built per render, not at module load.
 */
export function customRangeSchema(today: DayKey, historyFrom: DayKey) {
  return z
    .object({
      kind: z.enum(["last", "between"]),
      days: z.string(),
      from: z.string(),
      to: z.string(),
    })
    .superRefine((v, ctx) => {
      if (v.kind === "last") {
        const days = Number(v.days.replace(/[^\d]/g, "") || Number.NaN);
        if (!Number.isInteger(days) || days < 1) {
          ctx.addIssue({
            code: "custom",
            path: ["days"],
            message: i18n.t("validation.daysRequired"),
          });
        } else if (days > MAX_CUSTOM_DAYS) {
          ctx.addIssue({
            code: "custom",
            path: ["days"],
            message: i18n.t("validation.daysTooMany"),
          });
        }
        return;
      }
      if (!isDayKey(v.from)) {
        ctx.addIssue({ code: "custom", path: ["from"], message: i18n.t("validation.dayInvalid") });
      } else if (v.from < historyFrom) {
        ctx.addIssue({
          code: "custom",
          path: ["from"],
          message: i18n.t("validation.beforeHistory"),
        });
      }
      if (!isDayKey(v.to)) {
        ctx.addIssue({ code: "custom", path: ["to"], message: i18n.t("validation.dayInvalid") });
      } else if (v.to > today) {
        ctx.addIssue({ code: "custom", path: ["to"], message: i18n.t("validation.dayInFuture") });
      } else if (isDayKey(v.from) && v.from > v.to) {
        ctx.addIssue({ code: "custom", path: ["to"], message: i18n.t("validation.rangeOrder") });
      }
    })
    .transform(
      (v): CustomRange =>
        v.kind === "last"
          ? { kind: "last", days: Number(v.days.replace(/[^\d]/g, "")) }
          : { kind: "between", from: v.from, to: v.to },
    );
}

export type CustomRangeIn = z.input<ReturnType<typeof customRangeSchema>>;
