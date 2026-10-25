import type { DailyTotal } from "@/src/features/stats/stats";
import { addDaysToKey, type DayKey } from "@/src/lib/day";
import { buildWidgetTimeline, normalizeSeries } from "../widget-snapshot";

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

function input(total: number | null, goal: number | null = 10000) {
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
    expect(now.metrics[2]?.value).toBe("110");
    expect(now.goalStatus).toContain("WIDGET.OFGOAL");
    expect(now.inlineText).toContain("WIDGET.INLINEPACE");
  });

  it("reports pace against the time of day", () => {
    // 8,400 at 14:00 vs 10,000 × 7/15 ≈ 4,667 expected → ahead.
    expect(buildWidgetTimeline(input(8400)).now.paceText).toContain("WIDGET.AHEAD");
    expect(buildWidgetTimeline(input(2000)).now.paceText).toContain("WIDGET.BEHIND");
    expect(buildWidgetTimeline(input(2000)).now.paceAhead).toBe(false);
  });

  it("draws the week on the goal's scale and flags days that met it", () => {
    const { now } = buildWidgetTimeline(input(12000));
    expect(now.weekBars).toHaveLength(7);
    expect(now.weekBars[6]).toBe(1);
    expect(now.weekGoal).toBeCloseTo(10000 / 12000);
    expect(now.weekMet[6]).toBe(true);
    expect(now.weekMet[0]).toBe(false);
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

  it("starts the midnight entry empty with the week shifted", () => {
    const { now, midnight } = buildWidgetTimeline(input(8400));
    expect(midnight.hasData).toBe(false);
    expect(midnight.progress).toBe(0);
    expect(midnight.paceText).toBe("");
    expect(midnight.weekBars).toEqual([...now.weekBars.slice(1), -1]);
    expect(midnight.hourly.every((v) => v === -1)).toBe(true);
    expect(midnight.metrics[0]?.value).toBe("—");
  });
});
