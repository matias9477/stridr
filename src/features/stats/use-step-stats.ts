import { useMemo } from "react";
import { useManualStepsByDay } from "@/src/features/activity/queries";
import { useGoalChanges } from "@/src/features/goal/queries";
import { useHealthStore } from "@/src/features/health/health-store";
import { type DayKey, weekStartOf } from "@/src/lib/day";
import { usePreferencesStore } from "@/src/stores/preferences";
import { activityByDay, hourlySteps, peakHour } from "./intraday";
import {
  buildDailyTotals,
  goalStreaks,
  historyStart,
  indexDays,
  peakDay,
  sevenDayAverage,
  sevenDayMedian,
  thirtyDayTrend,
  weekSummary,
} from "./stats";

/**
 * The one hook screens read step data from: HealthKit mirror + manual
 * entries + goal history, combined and derived. Recomputes whenever any
 * input changes (spec §9 — no separately stored, stale statistics).
 */
export function useStepStats() {
  const health = useHealthStore();
  const manual = useManualStepsByDay();
  const goals = useGoalChanges();
  const today = health.today;
  const weekView = usePreferencesStore((s) => s.weekView);
  const weekStart = weekStartOf(weekView);

  const manualByDay = useMemo(() => {
    const out: Record<DayKey, number> = {};
    for (const row of manual.data) out[row.day] = Number(row.steps);
    return out;
  }, [manual.data]);

  const derived = useMemo(() => {
    const input = { health: health.daily, manual: manualByDay, goals: goals.data, today };
    const days = buildDailyTotals(input);
    const index = indexDays(days);
    const historyFrom = historyStart(input);
    const hourly = hourlySteps(health.minutes, today);
    return {
      days,
      index,
      todayTotal: index.get(today),
      currentGoal: index.get(today)?.goal ?? null,
      historyFrom,
      hasAnyData: days.some((d) => d.total !== null),
      sevenDay: sevenDayAverage(index, today),
      sevenDayMedian: sevenDayMedian(index, today),
      week: weekSummary(index, today, weekStart),
      trend: thirtyDayTrend(index, today),
      streaks: goalStreaks(days, today),
      record: peakDay(days),
      hourly,
      peakHour: peakHour(hourly),
      activity: activityByDay(health.minutes),
    };
  }, [health.daily, health.minutes, manualByDay, goals.data, today, weekStart]);

  const healthLoading =
    health.status === "idle" || (health.status === "loading" && health.lastSyncedAt === null);

  return {
    ...derived,
    today,
    weekView,
    weekStart,
    access: health.access,
    lastSyncedAt: health.lastSyncedAt,
    limitedFrom: health.limitedFrom,
    isLoading: healthLoading || manual.isLoading || goals.isLoading,
    /** HealthKit failures surface here; manual data still renders (partial results beat a blank screen). */
    healthError: health.status === "error" ? health.error : null,
    dbError: manual.error ?? goals.error ?? null,
    retry: health.refresh,
  };
}

export type StepStats = ReturnType<typeof useStepStats>;
