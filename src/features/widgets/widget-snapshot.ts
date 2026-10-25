import { distanceForSteps } from "@/src/features/activity/estimate";
import { rangeDays, todayProgress } from "@/src/features/stats/stats";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { addDaysToKey } from "@/src/lib/day";
import {
  dayLabel,
  formatCompact,
  formatDistance,
  formatMinutes,
  formatPercent,
  formatSteps,
  timeLabel,
} from "@/src/lib/format";
import type { DistanceUnit } from "@/src/stores/preferences";
import type { StepsWidgetProps, WidgetMetric } from "@/widgets/steps-widget";

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Hours the medium widget charts (06:00–22:00) — the waking day, not the empty night. */
export const WIDGET_HOURS = { from: 6, to: 22 } as const;

/** 0–1 of the series' max; -1 marks "no data" so the widget can draw a stub. */
export function normalizeSeries(values: readonly (number | null)[]): number[] {
  const max = Math.max(1, ...values.map((v) => v ?? 0));
  return values.map((v) => (v === null || v <= 0 ? -1 : v / max));
}

export interface WidgetSnapshotInput {
  stats: Pick<
    StepStats,
    "todayTotal" | "currentGoal" | "days" | "today" | "access" | "hourly" | "activity" | "sevenDay"
  >;
  unit: DistanceUnit;
  strideMeters: number;
  now: Date;
  t: Translate;
}

/**
 * Two timeline entries for the Steps widget: "now", and local midnight with
 * an empty day so no family ever shows yesterday's total as today's.
 * Strings are pre-translated and pre-formatted here — the widget never sees
 * raw data or i18n keys.
 */
export function buildWidgetTimeline({ stats, unit, strideMeters, now, t }: WidgetSnapshotInput): {
  now: StepsWidgetProps;
  midnight: StepsWidgetProps;
} {
  const upper = (s: string) => s.toUpperCase();
  const total = stats.todayTotal?.total ?? null;
  const goal = stats.currentGoal;
  const tomorrow = addDaysToKey(stats.today, 1);
  const progress = todayProgress(stats.todayTotal, now);
  const time = timeLabel(now);

  const paceText =
    total === null || progress.paceDelta === null
      ? ""
      : upper(
          t(progress.paceDelta >= 0 ? "widget.ahead" : "widget.behind", {
            steps: formatCompact(Math.abs(progress.paceDelta)),
          }),
        );
  const percentText =
    total === null || goal === null ? "" : formatPercent(progress.percent ?? 0, 0);

  // Week bars share one scale with the goal line so "over the line" reads at a glance.
  const week = rangeDays(stats.days, "week", stats.today);
  const weekScale = Math.max(1, goal ?? 0, ...week.map((d) => d.total ?? 0));
  const weekBars = week.map((d) => (d.total === null || d.total <= 0 ? -1 : d.total / weekScale));
  const weekMet = week.map((d) => goal !== null && d.total !== null && d.total >= goal);

  const activity = stats.activity[stats.today];
  const metrics = (today: boolean): WidgetMetric[] => [
    {
      icon: "ruler",
      label: upper(t("today.metrics.distance")),
      value:
        today && total !== null ? formatDistance(distanceForSteps(total, strideMeters), unit) : "—",
      unit: unit === "km" ? "KM" : "MI",
      caption: upper(t(unit === "km" ? "widget.kilometers" : "widget.miles")),
    },
    {
      icon: "stopwatch",
      label: upper(t("widget.active")),
      value: today && activity ? formatMinutes(activity.activeMinutes) : "—",
      unit: "",
      caption: upper(t("widget.movingTime")),
    },
    {
      icon: "speedometer",
      label: upper(t("widget.cadence")),
      value: today && activity?.cadence != null ? String(activity.cadence) : "—",
      unit: upper(t("widget.spm")),
      caption: upper(t("widget.perMin")),
    },
  ];

  const current: StepsWidgetProps = {
    hasData: total !== null,
    steps: total === null ? "—" : formatSteps(total),
    // Lock screen reads "14.8k" — lowercase is quieter next to the clock.
    stepsCompact: total === null ? "—" : formatCompact(total).toLowerCase(),
    stepsLabel: upper(t("widget.steps")),
    totalLabel: upper(t("widget.total")),
    timeText: time,
    updatedText: upper(t("widget.updated", { time })),
    paceText,
    paceAhead: (progress.paceDelta ?? 0) >= 0,
    progress: goal === null ? -1 : (total ?? 0) / goal,
    percentText,
    goalShort: goal === null ? "" : upper(t("widget.goal", { goal: formatCompact(goal) })),
    goalFull: goal === null ? "" : upper(t("widget.goal", { goal: formatSteps(goal) })),
    goalStatus:
      percentText === ""
        ? ""
        : upper(t(progress.goalMet ? "widget.reached" : "widget.ofGoal", { percent: percentText })),
    hourly: normalizeSeries(stats.hourly.slice(WIDGET_HOURS.from, WIDGET_HOURS.to + 1)),
    weekBars,
    weekMet,
    weekGoal: goal === null ? -1 : goal / weekScale,
    weekGoalText: goal === null ? "" : formatCompact(goal),
    dayLetters: week.map((d) => dayLabel(d.day, "EEEEE")),
    weekLabel: upper(t("widget.week")),
    weekAvgText:
      stats.sevenDay.average === null
        ? ""
        : upper(t("widget.avg", { steps: formatSteps(stats.sevenDay.average) })),
    metrics: metrics(true),
    inlineText:
      total === null
        ? ""
        : upper(
            paceText === ""
              ? t("widget.inline", { steps: formatSteps(total) })
              : t("widget.inlinePace", { steps: formatSteps(total), pace: paceText }),
          ),
    emptyText: upper(stats.access === "notRequested" ? t("widget.connect") : t("widget.empty")),
  };

  const midnight: StepsWidgetProps = {
    ...current,
    hasData: false,
    steps: "—",
    stepsCompact: "—",
    paceText: "",
    paceAhead: true,
    progress: goal === null ? -1 : 0,
    percentText: "",
    goalStatus: "",
    hourly: current.hourly.map(() => -1),
    // Shift the week left by one and add an empty "today".
    weekBars: [...weekBars.slice(1), -1],
    weekMet: [...weekMet.slice(1), false],
    dayLetters: [...current.dayLetters.slice(1), dayLabel(tomorrow, "EEEEE")],
    metrics: metrics(false),
    inlineText: "",
    emptyText: upper(t("widget.newDay")),
  };

  return { now: current, midnight };
}
