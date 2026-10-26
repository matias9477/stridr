import type { TFunction } from "i18next";
import type { DayKey } from "@/src/lib/day";
import { dayLabel } from "@/src/lib/format";
import { type CustomRange, customRangeBounds } from "../stats";

/** Range chip text: "Custom" until one is saved, then "13D" or a numeric span like "3/4–4/2". */
export function customChipLabel(custom: CustomRange | null, t: TFunction): string {
  if (custom === null) return t("stats.range.custom");
  if (custom.kind === "last") return t("stats.custom.chipDays", { count: custom.days });
  // The pattern is translated: month-first in English, day-first in Spanish.
  const pattern = t("stats.custom.chipDate");
  const from = dayLabel(custom.from, pattern);
  return custom.from === custom.to ? from : `${from}–${dayLabel(custom.to, pattern)}`;
}

/** Tile caption naming the span: "Mar 4 – today" or "Mar 4 – Apr 2". */
export function customSpanLabel(custom: CustomRange, today: DayKey, t: TFunction): string {
  const { from, to } = customRangeBounds(custom, today);
  const pattern = from.slice(0, 4) === to.slice(0, 4) ? "MMM d" : "MMM d, yyyy";
  return to === today
    ? t("stats.summary.rangeSpan", { date: dayLabel(from, pattern) })
    : t("stats.summary.betweenSpan", { from: dayLabel(from, pattern), to: dayLabel(to, pattern) });
}
