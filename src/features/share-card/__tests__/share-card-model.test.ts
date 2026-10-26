import { buildDailyTotals, indexDays } from "@/src/features/stats/stats";
import { addDaysToKey, type DayKey } from "@/src/lib/day";
import { buildShareCard, hourSlots, type ShareCardInput, weekSlots } from "../share-card-model";

const TODAY: DayKey = "2026-10-26";
const ago = (n: number) => addDaysToKey(TODAY, -n);
const NO_HOURS: (number | null)[] = Array.from({ length: 24 }, () => null);

function hours(values: Record<number, number>): (number | null)[] {
  return NO_HOURS.map((v, h) => values[h] ?? v);
}

function input(
  opts: {
    health?: Record<DayKey, number>;
    manual?: Record<DayKey, number>;
    goal?: number;
    hourly?: (number | null)[];
    nowHour?: number;
    activeMinutes?: number;
    streak?: number;
  } = {},
): ShareCardInput {
  const goals = opts.goal === undefined ? [] : [{ effectiveFrom: ago(10), steps: opts.goal }];
  const days = buildDailyTotals({
    health: opts.health ?? {},
    manual: opts.manual ?? {},
    goals,
    today: TODAY,
  });
  return {
    day: TODAY,
    index: indexDays(days),
    hourly: opts.hourly ?? NO_HOURS,
    nowHour: opts.nowHour ?? 23,
    activity:
      opts.activeMinutes === undefined
        ? undefined
        : { activeMinutes: opts.activeMinutes, cadence: 100 },
    streaks: { current: opts.streak ?? 0, longest: opts.streak ?? 0, todayCounted: false },
    strideMeters: 0.75,
  };
}

describe("hourSlots", () => {
  it("normalises to the busiest hour and stubs the future", () => {
    const slots = hourSlots(hours({ 8: 500, 9: 1000 }), 10);
    expect(slots).toHaveLength(24);
    expect(slots[8]).toEqual({ kind: "bar", height: 0.5 });
    expect(slots[9]).toEqual({ kind: "bar", height: 1 });
    expect(slots[10]).toEqual({ kind: "empty" });
    expect(slots[11]).toEqual({ kind: "future" });
    expect(slots[23]).toEqual({ kind: "future" });
  });

  it("treats zero and missing hours alike, and survives an all-empty day", () => {
    expect(hourSlots(hours({ 3: 0 }), 23).every((s) => s.kind === "empty")).toBe(true);
  });

  it("gives a single-hour day one full bar", () => {
    const slots = hourSlots(hours({ 14: 42 }), 23);
    expect(slots.filter((s) => s.kind === "bar")).toEqual([{ kind: "bar", height: 1 }]);
  });
});

describe("weekSlots", () => {
  it("covers the last 7 days ending today, with gaps as null", () => {
    const days = buildDailyTotals({
      health: { [ago(6)]: 4000, [TODAY]: 8000 },
      manual: {},
      goals: [],
      today: TODAY,
    });
    const slots = weekSlots(indexDays(days), TODAY);
    expect(slots.map((s) => s.day)).toEqual([6, 5, 4, 3, 2, 1, 0].map(ago));
    expect(slots[0]?.height).toBe(0.5);
    expect(slots[1]?.height).toBeNull();
    expect(slots[6]).toEqual({ day: TODAY, height: 1, isToday: true });
  });
});

describe("buildShareCard", () => {
  it("is null without data today", () => {
    expect(buildShareCard(input())).toBeNull();
  });

  it("uses hourly bars when HealthKit has any hour", () => {
    const card = buildShareCard(input({ health: { [TODAY]: 6000 }, hourly: hours({ 9: 6000 }) }));
    expect(card?.second.kind).toBe("hourly");
  });

  it("labels manual steps the hourly bars can't place", () => {
    const card = buildShareCard(
      input({
        health: { [TODAY]: 6000 },
        manual: { [TODAY]: 4000 },
        hourly: hours({ 9: 6000 }),
      }),
    );
    expect(card?.total).toBe(10000);
    expect(card?.second).toMatchObject({ kind: "hourly", loggedExtra: 4000 });
  });

  it("falls back to the week when there's no hourly data", () => {
    const card = buildShareCard(input({ manual: { [TODAY]: 4000 } }));
    expect(card?.second.kind).toBe("week");
  });

  it("computes the goal line, uncapped", () => {
    const card = buildShareCard(
      input({ health: { [TODAY]: 12000 }, goal: 8000, hourly: hours({ 9: 12000 }) }),
    );
    expect(card).toMatchObject({ goal: 8000, percent: 150, goalMet: true });
  });

  it("has no goal line without a goal", () => {
    const card = buildShareCard(input({ health: { [TODAY]: 5000 } }));
    expect(card).toMatchObject({ goal: null, percent: null, goalMet: false });
  });

  it("collapses the stat row to the stats that exist", () => {
    const bare = buildShareCard(input({ health: { [TODAY]: 1000 }, streak: 3 }));
    // No goal → the streak is dropped even if one is passed; no activity → no active time.
    expect(bare?.stats).toEqual([{ kind: "distance", meters: 750 }]);

    const full = buildShareCard(
      input({ health: { [TODAY]: 1000 }, goal: 800, activeMinutes: 42, streak: 3 }),
    );
    expect(full?.stats.map((s) => s.kind)).toEqual(["distance", "active", "streak"]);
  });

  it("drops a zero streak", () => {
    const card = buildShareCard(input({ health: { [TODAY]: 1000 }, goal: 8000, streak: 0 }));
    expect(card?.stats.map((s) => s.kind)).toEqual(["distance"]);
  });
});
