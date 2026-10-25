import { format as formatDate } from "date-fns";
import { enUS, es } from "date-fns/locale";
import i18n from "@/src/i18n";
import type { DistanceUnit } from "@/src/stores/preferences";
import { type DayKey, fromDayKey } from "./day";

/**
 * Display formatting. Pure aside from reading the active i18n language, so
 * numbers and dates follow the in-app language setting, not just the device.
 */

function locale(): string {
  return i18n.language === "es" ? "es-ES" : "en-US";
}

function dateLocale() {
  return i18n.language === "es" ? es : enUS;
}

/** 14832 → "14,832" (en) / "14.832" (es). */
export function formatSteps(value: number): string {
  return new Intl.NumberFormat(locale(), { maximumFractionDigits: 0 }).format(value);
}

/** 10500 → "10.5K". For tight spots (baselines, goal labels, widget). */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat(locale(), { notation: "compact", maximumFractionDigits: 1 })
    .format(value)
    .toUpperCase();
}

/** 8.4 → "+8.4%", -3 → "−3.0%". */
export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${new Intl.NumberFormat(locale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(value))}%`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${new Intl.NumberFormat(locale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}%`;
}

export function formatSignedSteps(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatSteps(Math.abs(value))}`;
}

/** 134 → "2h 14m", 45 → "45m". */
export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

export function formatDistance(meters: number, unit: DistanceUnit, digits = 1): string {
  const value = unit === "km" ? meters / 1000 : meters / 1609.344;
  return new Intl.NumberFormat(locale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Date-fns pattern in the active language, e.g. dayLabel(key, "EEE, MMM d"). */
export function dayLabel(key: DayKey, pattern: string): string {
  return formatDate(fromDayKey(key), pattern, { locale: dateLocale() });
}

export function timeLabel(date: Date): string {
  return formatDate(date, "HH:mm");
}

/** "2m ago"-style sync age. */
export function syncedAgo(at: number, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - at) / 60_000));
  if (minutes < 1) return i18n.t("time.justNow");
  if (minutes < 60) return i18n.t("time.minutesAgo", { count: minutes });
  return i18n.t("time.hoursAgo", { count: Math.round(minutes / 60) });
}
