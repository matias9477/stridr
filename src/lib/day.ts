import { addDays, differenceInCalendarDays, format, isValid, parse, startOfWeek } from "date-fns";

/**
 * A calendar day in the user's local time zone, as "YYYY-MM-DD".
 *
 * Every daily calculation in the app keys on this (spec §9): HealthKit buckets
 * are anchored at local midnight and mapped through toDayKey, manual entries
 * store it directly. Keys sort lexicographically in date order, so plain
 * string comparison (<, >) is a date comparison.
 */
export type DayKey = string;

const KEY_FORMAT = "yyyy-MM-dd";

export function toDayKey(date: Date): DayKey {
  return format(date, KEY_FORMAT);
}

/** Local midnight of the day. */
export function fromDayKey(key: DayKey): Date {
  const date = parse(key, KEY_FORMAT, new Date(2000, 0, 1));
  if (!isValid(date)) throw new Error(`[lib/day] invalid day key: ${key}`);
  return date;
}

export function isDayKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parse(value, KEY_FORMAT, new Date()));
}

export function todayKey(now: Date = new Date()): DayKey {
  return toDayKey(now);
}

/** Calendar arithmetic (DST-safe — goes through local dates, never ms offsets). */
export function addDaysToKey(key: DayKey, days: number): DayKey {
  return toDayKey(addDays(fromDayKey(key), days));
}

/** Whole calendar days from a to b (b - a). */
export function daysBetween(a: DayKey, b: DayKey): number {
  return differenceInCalendarDays(fromDayKey(b), fromDayKey(a));
}

/** Inclusive list of day keys from `from` to `to`. Empty when from > to. */
export function dayRange(from: DayKey, to: DayKey): DayKey[] {
  const out: DayKey[] = [];
  let cursor = from;
  while (cursor <= to) {
    out.push(cursor);
    cursor = addDaysToKey(cursor, 1);
  }
  return out;
}

/** Monday of the week containing `key` (weeks run Monday–Sunday, spec §6.4). */
export function startOfWeekKey(key: DayKey): DayKey {
  return toDayKey(startOfWeek(fromDayKey(key), { weekStartsOn: 1 }));
}

/** Local midnight that ends the given day. */
export function nextMidnight(now: Date = new Date()): Date {
  return addDays(fromDayKey(toDayKey(now)), 1);
}
