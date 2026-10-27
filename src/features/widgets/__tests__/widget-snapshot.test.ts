import type { DailyTotal } from "@/src/features/stats/stats";
import { addDaysToKey, type DayKey } from "@/src/lib/day";
import { buildLockedWidgetProps, buildWidgetTimeline, normalizeSeries } from "../widget-snapshot";

const TODAY: DayKey = "2026-10-21";
// Echo keys + params so assertions don't depend on copy.
const t = (key: string, opts?: Record<string, unknown>) =>
  opts ? `${key} ${JSON.stringify(opts)}` : key;

function day(offset: number, total: number | null, goal: number | null = 10000): DailyTotal {
  return {
    day: addDaysToKey(TODAY, offset),
    healthSteps: total,
    manualSteps: 0,
    total,
    goal,
    goalMet: total === null || goal === null ? null : total >= goal,
  };
}

// 14:00 on TODAY: half way through the 07:00–22:00 pace window is 7/15.
const NOW = new Date(2026, 9, 21, 14, 0);

function input(
  total: number | null,
  goal: number | null = 10000,
  weekView: "monday" | "sunday" | "rolling" = "monday",
) {
  const days = [-6, -5, -4, -3, -2, -1].map((o) => day(o, 4000 + o * -500, goal));
  const today = day(0, total, goal);
  const hourly: (number | null)[] = Array.from({ length: 24 }, () => null);
  hourly[8] = 400;
  hourly[18] = 800;
  return {
    stats: {
      todayTotal: today,
      currentGoal: goal,
      days: [...days, today],
      today: TODAY,
      weekView,
      access: "requested" as const,
      hourly,
      activity: { [TODAY]: { activeMinutes: 42, cadence: 110 } },
      sevenDay: { average: 6000, validDays: 6, baseline: null, changePct: null },
    },
    unit: "km" as const,
    strideMeters: 0.7,
    now: NOW,
    t,
  };
}

describe("normalizeSeries", () => {
  it("scales to the max and marks missing or zero as -1", () => {
    expect(normalizeSeries([null, 0, 50, 100])).toEqual([-1, -1, 0.5, 1]);
  });
});

describe("buildWidgetTimeline", () => {
  it("fills every family's fields for today", () => {
    const { now } = buildWidgetTimeline(input(8400));
    expect(now.hasData).toBe(true);
    expect(now.progress).toBeCloseTo(0.84);
    expect(now.timeText).toBe("14:00");
    // 06:00–22:00 inclusive; 18:00 is the busiest hour.
    expect(now.hourly).toHaveLength(17);
    expect(now.hourly[18 - 6]).toBe(1);
    expect(now.hourly[8 - 6]).toBe(0.5);
    expect(now.metrics.map((m) => m.icon)).toEqual(["ruler", "stopwatch", "speedometer"]);
    expect(now.metrics[2]?.value).toBe("~110");
    expect(now.goalStatus).toContain("WIDGET.OFGOAL");
    expect(now.inlineText).toContain("WIDGET.INLINEPACE");
  });

  it("keeps the compact count exact below 10K", () => {
    expect(buildWidgetTimeline(input(6143)).now.stepsCompact).toMatch(/^6.?143$/);
    expect(buildWidgetTimeline(input(14832)).now.stepsCompact).toBe("14.8k");
  });

  it("reports pace against the time of day", () => {
    // 8,400 at 14:00 vs 10,000 × 7/15 ≈ 4,667 expected → ahead.
    expect(buildWidgetTimeline(input(8400)).now.paceText).toContain("WIDGET.AHEAD");
    expect(buildWidgetTimeline(input(2000)).now.paceText).toContain("WIDGET.BEHIND");
    expect(buildWidgetTimeline(input(2000)).now.paceAhead).toBe(false);
  });

  it("draws the week on the goal's scale and flags days that met it", () => {
    // TODAY is a Wednesday: third of a Monday week, the days after it empty.
    const { now } = buildWidgetTimeline(input(12000));
    expect(now.weekBars).toHaveLength(7);
    expect(now.weekToday).toBe(2);
    expect(now.weekBars[2]).toBe(1);
    expect(now.weekBars.slice(3)).toEqual([-1, -1, -1, -1]);
    expect(now.weekGoal).toBeCloseTo(10000 / 12000);
    expect(now.weekMet[2]).toBe(true);
    expect(now.weekMet[0]).toBe(false);
    expect(buildWidgetTimeline(input(12000, 10000, "sunday")).now.weekToday).toBe(3);
    expect(buildWidgetTimeline(input(12000, 10000, "rolling")).now.weekToday).toBe(6);
    expect(now.goalStatus).toContain("WIDGET.REACHED");
  });

  it("drops goal fields without a goal", () => {
    const { now } = buildWidgetTimeline(input(5000, null));
    expect(now.progress).toBe(-1);
    expect(now.goalShort).toBe("");
    expect(now.percentText).toBe("");
    expect(now.paceText).toBe("");
    expect(now.weekGoal).toBe(-1);
    expect(now.inlineText).toContain("WIDGET.INLINE ");
  });

  it("starts the midnight entry empty in the same calendar week", () => {
    const { now, midnight } = buildWidgetTimeline(input(8400));
    expect(midnight.weekToday).toBe(3);
    expect(midnight.weekBars).toEqual(now.weekBars);
    expect(midnight.dayLetters).toEqual(now.dayLetters);
  });

  it("starts the midnight entry empty with the rolling week shifted", () => {
    const { now, midnight } = buildWidgetTimeline(input(8400, 10000, "rolling"));
    expect(midnight.hasData).toBe(false);
    expect(midnight.progress).toBe(0);
    expect(midnight.paceText).toBe("");
    expect(midnight.weekBars).toEqual([...now.weekBars.slice(1), -1]);
    expect(midnight.hourly.every((v) => v === -1)).toBe(true);
    expect(midnight.metrics[0]?.value).toBe("—");
  });
});

describe("buildLockedWidgetProps", () => {
  const locked = buildLockedWidgetProps(t);

  it("opens the widgets paywall", () => {
    expect(locked.url).toBe("stridr://paywall?variant=widgets");
  });

  it("carries no step data", () => {
    expect(locked.hasData).toBe(false);
    expect(locked.steps).toBe("—");
    expect(locked.progress).toBe(-1);
    expect(locked.hourly.every((v) => v === -1)).toBe(true);
    expect(locked.weekBars.every((v) => v === -1)).toBe(true);
    expect(locked.metrics).toEqual([]);
  });

  it("shows the Pro line in every empty slot, same shape as a live snapshot", () => {
    expect(locked.locked).toBe(true);
    expect(locked.lockedTitle).toBe("WIDGET.LOCKEDTITLE");
    expect(locked.lockedCta).toBe("WIDGET.LOCKEDCTA");
    expect(locked.inlineText).toBe("WIDGET.LOCKEDTITLE · WIDGET.LOCKEDTAP");
    expect(locked.emptyText).toBe(locked.inlineText);
    const live = buildWidgetTimeline(input(6000)).now;
    expect(Object.keys(locked).sort()).toEqual(Object.keys(live).sort());
    expect(locked.hourly).toHaveLength(live.hourly.length);
  });
});

it("live snapshots open the app", () => {
  const live = buildWidgetTimeline(input(6000));
  expect(live.now.url).toBe("stridr://");
  expect(live.now.locked).toBe(false);
  expect(live.midnight.locked).toBe(false);
});
