import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { ManualActivityRow } from "@/src/db/schema";
import type { DailyTotal } from "@/src/features/stats/stats";
import { type DayKey, todayKey } from "@/src/lib/day";

/**
 * Raw CSV export (Settings / Stats → "Export"). Built on-device and handed to
 * the system share sheet — nothing is uploaded anywhere. Two sections in one
 * file: one row per day, then every manual entry, so a spreadsheet can
 * reconcile the totals.
 */

/** RFC 4180 quoting for the few free-text cells. */
function cell(value: string | number | null): string {
  if (value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildCsv(
  days: readonly DailyTotal[],
  entries: readonly ManualActivityRow[],
  today: DayKey,
): string {
  const lines = ["date,healthkit_steps,manual_steps,total_steps,goal,goal_met"];
  for (const d of days) {
    if (d.total === null) continue;
    lines.push(
      [
        d.day,
        d.healthSteps,
        d.manualSteps,
        d.total,
        d.goal,
        // Today isn't over: met is a fact, not-yet-met is unknown (blank), never a miss.
        d.goalMet === null || (d.day === today && !d.goalMet) ? null : d.goalMet ? 1 : 0,
      ]
        .map(cell)
        .join(","),
    );
  }
  lines.push("", "manual_entry_date,kind,steps,estimated_steps,distance_m,duration_s,created_at");
  for (const e of entries) {
    lines.push(
      [e.day, e.kind, e.steps, e.estimatedSteps, e.distanceMeters, e.durationSeconds, e.createdAt]
        .map(cell)
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

/** Throws on failure; callers show the error. */
export async function shareCsv(
  days: readonly DailyTotal[],
  entries: readonly ManualActivityRow[],
): Promise<void> {
  const file = new File(Paths.cache, `stridr-steps-${todayKey()}.csv`);
  if (file.exists) file.delete();
  file.create();
  file.write(buildCsv(days, entries, todayKey()));
  if (!(await Sharing.isAvailableAsync())) throw new Error("sharing unavailable");
  await Sharing.shareAsync(file.uri, {
    mimeType: "text/csv",
    UTI: "public.comma-separated-values-text",
  });
}
