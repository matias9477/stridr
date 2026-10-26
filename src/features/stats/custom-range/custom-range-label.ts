import type { TFunction } from "i18next";
import type { DayKey } from "@/src/lib/day";
import { dayLabel } from "@/src/lib/format";
import { type CustomRange, customRangeBounds } from "../stats";

/**
 * Range chip text: "13D" for last N days, otherwise "Custom" — a date span doesn't
 * fit a fifth of the switch, and the chart's header chip already shows the dates.
 */
export function customChipLabel(custom: CustomRange | null, t: TFunction): string {
  return custom?.kind === "last"
    ? t("stats.custom.chipDays", { count: custom.days })
    : t("stats.range.custom");
}

/** Tile caption naming the span: "Mar 4 – today" or "Mar 4 – Apr 2". */
export function customSpanLabel(custom: CustomRange, today: DayKey, t: TFunction): string {
  const { from, to } = customRangeBounds(custom, today);
  const pattern = from.slice(0, 4) === to.slice(0, 4) ? "MMM d" : "MMM d, yyyy";
  return to === today
    ? t("stats.summary.rangeSpan", { date: dayLabel(from, pattern) })
    : t("stats.summary.betweenSpan", { from: dayLabel(from, pattern), to: dayLabel(to, pattern) });
}
