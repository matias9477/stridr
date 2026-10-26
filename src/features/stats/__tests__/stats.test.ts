import { addDaysToKey, type DayKey } from "@/src/lib/day";
import {
  averageOf,
  buildDailyTotals,
  chartBars,
  customRangeBounds,
  type DailyTotal,
  goalStreaks,
  indexDays,
  MAX_BARS,
  median,
  peakDay,
  percentChange,
  rangeDays,
  sevenDayAverage,
  thirtyDayTrend,
  todayProgress,
  weekSummary,
} from "../stats";

// Wednesday.
const TODAY: DayKey = "2026-10-21";
const ago = (n: number) => addDaysToKey(TODAY, -n);

function build(
  health: Record<DayKey, number>,
  opts: { manual?: Record<DayKey, number>; goal?: number | null } = {},
): DailyTotal[] {
  const goals =
    opts.goal === undefined || opts.goal === null
      ? []
      : [{ effectiveFrom: TODAY, steps: opts.goal }];
  return buildDailyTotals({ health, manual: opts.manual ?? {}, goals, today: TODAY });
}

/** n consecutive days ending `endAgo` days before today, all with `steps`. */
function run(n: number, steps: number, endAgo = 1): Record<DayKey, number> {
  const out: Record<DayKey, number> = {};
  for (let i = 0; i < n; i++) out[ago(endAgo + i)] = steps;
  return out;
}

describe("buildDailyTotals", () => {
  it("never turns a day without data into zero", () => {
    const days = build({ [ago(2)]: 5000 });
    expect(days.map((d) => d.total)).toEqual([5000, null, null]);
  });

  it("adds manual steps on top of HealthKit's total", () => {
    const [day] = build({ [TODAY]: 3000 }, { manual: { [TODAY]: 1200 } });
    expect(day).toMatchObject({ healthSteps: 3000, manualSteps: 1200, total: 4200 });
  });

  it("counts a manual-only day as valid", () => {
    const days = build({}, { manual: { [ago(1)]: 800 } });
    expect(days[0]).toMatchObject({ healthSteps: null, total: 800 });
  });

  it("applies the first goal retroactively and marks unknown days as unknown, not missed", () => {
    const days = build({ [ago(2)]: 12000 }, { goal: 10000 });
    expect(days.map((d) => d.goalMet)).toEqual([true, null, null]);
  });

  it("starts at today when there is no data at all", () => {
    expect(build({}).map((d) => d.day)).toEqual([TODAY]);
  });
});

describe("averages", () => {
  it("averages valid days only", () => {
    expect(averageOf([1000, null, 3000])).toEqual({ average: 2000, validDays: 2 });
    expect(averageOf([null, null])).toEqual({ average: null, validDays: 0 });
  });

  it("7-day average uses the last 7 completed days, excluding today", () => {
    const days = build({ ...run(7, 8000), [TODAY]: 100, ...run(7, 4000, 8) });
    const result = sevenDayAverage(indexDays(days), TODAY);
    expect(result).toMatchObject({ average: 8000, validDays: 7, baseline: 4000 });
    expect(result.changePct).toBeCloseTo(100);
  });

  it("median handles odd and even counts", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(3);
    expect(median([])).toBeNull();
  });

  it("percent change refuses a zero base", () => {
    expect(percentChange(500, 0)).toBeNull();
    expect(percentChange(150, 100)).toBe(50);
  });
});

describe("peakDay", () => {
  it("returns the highest valid day, latest on ties", () => {
    const days = build({ [ago(3)]: 9000, [ago(1)]: 9000, [ago(2)]: 4000 });
    expect(peakDay(days)?.day).toBe(ago(1));
  });

  it("is null without data", () => {
    expect(peakDay(build({}))).toBeNull();
  });
});

describe("weekSummary", () => {
  it("sums Monday through today", () => {
    // TODAY is a Wednesday → Mon, Tue, Wed.
    const days = build({ [ago(2)]: 1000, [ago(1)]: 2000, [TODAY]: 3000, [ago(3)]: 99999 });
    const week = weekSummary(indexDays(days), TODAY);
    expect(week).toMatchObject({ from: ago(2), total: 6000, validDays: 3 });
  });

  it("compares with the same span of last week only when last week has enough data", () => {
    const sparse = build({ [ago(9)]: 1000, [TODAY]: 2000 });
    expect(weekSummary(indexDays(sparse), TODAY).changePct).toBeNull();

    // Last week Mon–Sun = ago(3..9) at 1000; this week Mon/Tue at 1000, today partial.
    const full = build({ ...run(7, 1000, 3), ...run(2, 1000, 1), [TODAY]: 300 });
    const week = weekSummary(indexDays(full), TODAY);
    // Completed Mon–Tue vs last Mon–Tue: same pace, so 0% — today's 300 doesn't drag it down.
    expect(week.total).toBe(2300);
    expect(week.previousTotal).toBe(2000);
    expect(week.changePct).toBe(0);
  });

  it("has nothing to compare on a Monday", () => {
    const monday = ago(2);
    const days = build({ ...run(7, 1000, 3), [monday]: 500 });
    expect(weekSummary(indexDays(days), monday).changePct).toBeNull();
  });
});

describe("thirtyDayTrend", () => {
  it("compares two consecutive 30-day periods", () => {
    const days = build({ ...run(30, 11000), ...run(30, 10000, 31) });
    const trend = thirtyDayTrend(indexDays(days), TODAY);
    expect(trend).toMatchObject({
      currentAverage: 11000,
      previousAverage: 10000,
      difference: 1000,
    });
    expect(trend?.percent).toBeCloseTo(10);
  });

  it("needs enough valid days in both periods", () => {
    const days = build({ ...run(30, 11000), ...run(10, 10000, 31) });
    expect(thirtyDayTrend(indexDays(days), TODAY)).toBeNull();
  });

  it("reports no percentage over a zero previous average", () => {
    const days = build({ ...run(30, 5000), ...run(30, 0, 31) });
    const trend = thirtyDayTrend(indexDays(days), TODAY);
    expect(trend?.difference).toBe(5000);
    expect(trend?.percent).toBeNull();
  });
});

describe("goalStreaks", () => {
  it("counts consecutive completed days meeting the goal", () => {
    const days = build({ ...run(5, 12000), [ago(6)]: 100, ...run(3, 12000, 7) }, { goal: 10000 });
    expect(goalStreaks(days, TODAY)).toEqual({ current: 5, longest: 5, todayCounted: false });
  });

  it("today extends the streak once met but never breaks it early", () => {
    const met = build({ ...run(2, 12000), [TODAY]: 10000 }, { goal: 10000 });
    expect(goalStreaks(met, TODAY)).toEqual({ current: 3, longest: 3, todayCounted: true });
    const pending = build({ ...run(2, 12000), [TODAY]: 10 }, { goal: 10000 });
    expect(goalStreaks(pending, TODAY).current).toBe(2);
  });

  it("skips short no-data gaps but breaks on long ones", () => {
    const short = build({ [ago(1)]: 12000, [ago(4)]: 12000 }, { goal: 10000 });
    expect(goalStreaks(short, TODAY).current).toBe(2);
    const long = build({ [ago(1)]: 12000, [ago(5)]: 12000 }, { goal: 10000 });
    expect(goalStreaks(long, TODAY)).toMatchObject({ current: 1, longest: 1 });
  });

  it("does not count without a goal", () => {
    expect(goalStreaks(build(run(5, 20000)), TODAY).current).toBe(0);
  });
});

describe("todayProgress", () => {
  const at = (h: number) => new Date(2026, 9, 21, h, 0);

  it("reports uncapped percent and moves the goal tick once exceeded", () => {
    const [day] = build({ [TODAY]: 15000 }, { goal: 10000 });
    const p = todayProgress(day, at(18));
    expect(p.percent).toBe(150);
    expect(p.remaining).toBe(0);
    expect(p.fill).toBe(1);
    expect(p.goalMarker).toBeCloseTo(10000 / 15000);
  });

  it("computes pace across the waking window", () => {
    const [day] = build({ [TODAY]: 6000 }, { goal: 10000 });
    // 14:30 is halfway between 07:00 and 22:00 → expected 5000.
    expect(todayProgress(day, new Date(2026, 9, 21, 14, 30)).paceDelta).toBe(1000);
    expect(todayProgress(day, at(6)).paceDelta).toBeNull();
  });

  it("has no progress without a goal", () => {
    const [day] = build({ [TODAY]: 5000 });
    expect(todayProgress(day, at(12))).toMatchObject({
      total: 5000,
      percent: null,
      goalMarker: null,
    });
  });
});

describe("chart", () => {
  it("pads short ranges to a fixed number of slots", () => {
    const days = build({ [ago(1)]: 5000 });
    const week = rangeDays(days, "week", TODAY);
    expect(week).toHaveLength(7);
    expect(week[0]?.total).toBeNull();
  });

  it("marks the peak bar and today", () => {
    const bars = chartBars(
      rangeDays(build({ [ago(1)]: 9000, [TODAY]: 3000 }), "week", TODAY, "rolling"),
      TODAY,
    );
    expect(bars.find((b) => b.isPeak)?.from).toBe(ago(1));
    expect(bars.at(-1)?.containsToday).toBe(true);
  });

  it("charts the calendar week with the days ahead empty", () => {
    // TODAY (2026-10-21) is a Wednesday.
    const days = build({ [ago(1)]: 9000, [TODAY]: 3000 });
    const monday = rangeDays(days, "week", TODAY, "monday");
    expect(monday.map((d) => d.day)).toEqual([
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
    ]);
    expect(monday.slice(3).every((d) => d.total === null)).toBe(true);
    expect(rangeDays(days, "week", TODAY, "sunday")[0]?.day).toBe("2026-10-18");
    expect(rangeDays(days, "week", TODAY, "rolling")[0]?.day).toBe("2026-10-15");
  });

  it("charts a custom last-N range ending today", () => {
    const days = build({ [ago(1)]: 9000, [TODAY]: 3000 });
    const last = rangeDays(days, "custom", TODAY, "monday", { kind: "last", days: 13 });
    expect(last).toHaveLength(13);
    expect(last[0]?.day).toBe(ago(12));
    expect(last.at(-1)?.day).toBe(TODAY);
  });

  it("charts a custom between range on its own dates, both inclusive", () => {
    const days = build(run(30, 5000));
    const between = rangeDays(days, "custom", TODAY, "monday", {
      kind: "between",
      from: ago(20),
      to: ago(10),
    });
    expect(between[0]?.day).toBe(ago(20));
    expect(between.at(-1)?.day).toBe(ago(10));
    expect(between).toHaveLength(11);
    expect(between.every((d) => d.total === 5000)).toBe(true);
  });

  it("falls back to the week when custom has nothing saved", () => {
    const days = build({ [TODAY]: 3000 });
    expect(rangeDays(days, "custom", TODAY, "monday", null)).toEqual(
      rangeDays(days, "week", TODAY, "monday"),
    );
  });

  it("rolls a last-N custom range forward and keeps a between range fixed", () => {
    const tomorrow = addDaysToKey(TODAY, 1);
    expect(customRangeBounds({ kind: "last", days: 1 }, TODAY)).toEqual({ from: TODAY, to: TODAY });
    expect(customRangeBounds({ kind: "last", days: 7 }, tomorrow).to).toBe(tomorrow);
    const fixed = { kind: "between", from: ago(5), to: ago(2) } as const;
    expect(customRangeBounds(fixed, tomorrow)).toEqual({ from: ago(5), to: ago(2) });
  });

  it("aggregates long histories into weekly averages", () => {
    const days = build(run(400, 7000, 0));
    const bars = chartBars(days, TODAY);
    expect(bars.length).toBeLessThanOrEqual(Math.ceil(400 / 7) + 1);
    expect(bars.length).toBeLessThan(MAX_BARS);
    expect(bars.every((b) => b.bucket === "week" && b.value === 7000)).toBe(true);
  });

  it("falls back to monthly, then yearly, bars for very long histories", () => {
    // ~9.8 years: 500+ weeks, 118 months.
    const monthly = chartBars(build(run(3580, 7000, 0)), TODAY);
    expect(monthly.length).toBeLessThanOrEqual(MAX_BARS);
    expect(monthly.every((b) => b.bucket === "month" && b.value === 7000)).toBe(true);
    expect(monthly.at(-1)?.containsToday).toBe(true);

    const yearly = chartBars(build(run(4000, 7000, 0)), TODAY);
    expect(yearly.every((b) => b.bucket === "year")).toBe(true);
    expect(yearly.at(-1)?.key).toBe("2026-01-01");
  });
});
