import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { dayLabel, formatCompact, formatSteps } from "@/src/lib/format";
import { type Bar, BarChart, type BarTone } from "@/src/ui/bar-chart";
import { CardStateBody, type CardStatus, READY, Skeleton } from "@/src/ui/card-state";
import { Chip } from "@/src/ui/chip";
import { Panel } from "@/src/ui/panel";
import { RollingNumber } from "@/src/ui/rolling-number";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { baseCardStatus } from "./card-status";
import {
  type ChartBar,
  type ChartBucket,
  type ChartRange,
  chartBars,
  peakDay,
  rangeDays,
} from "./stats";
import type { StepStats } from "./use-step-stats";

const BUCKET_LABEL: Record<ChartBucket, string> = {
  day: "stats.chart.daily",
  week: "stats.chart.weekly",
  month: "stats.chart.monthly",
  year: "stats.chart.yearly",
};

const BEST_LABEL: Record<ChartBucket, string> = {
  day: "stats.chart.peak",
  week: "stats.chart.bestWeek",
  month: "stats.chart.bestMonth",
  year: "stats.chart.bestYear",
};

/**
 * Bar chart of daily totals for the selected range (spec §6.2–6.3): peak
 * value in the header, MAX tag on the peak bar, dashed goal reference, and a
 * tap-to-inspect ribbon. Long ranges fold into week/month/year bars (stats.chartBars).
 */
export function VolumeChartCard({ stats, range }: { stats: StepStats; range: ChartRange }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { days, bars, peak } = useMemo(() => {
    const days = rangeDays(stats.days, range, stats.today, stats.weekView);
    return { days, bars: chartBars(days, stats.today, stats.weekStart), peak: peakDay(days) };
  }, [stats.days, range, stats.today, stats.weekView, stats.weekStart]);

  const status: CardStatus =
    baseCardStatus(stats) ??
    (peak === null ? { kind: "empty", message: t("stats.chart.empty") } : READY);

  const max = Math.max(stats.currentGoal ?? 0, ...bars.map((b) => b.value ?? 0));
  const bucket = bars[0]?.bucket ?? "day";
  const selected = bars.find((b) => b.key === selectedKey) ?? bars.find((b) => b.isPeak) ?? null;
  const first = days[0]?.day;
  const last = days[days.length - 1]?.day;

  const describe = (bar: ChartBar) => {
    switch (bar.bucket) {
      case "day":
        return dayLabel(bar.from, "EEE, MMM d");
      case "week":
        return t("stats.chart.weekOf", { date: dayLabel(bar.from, "MMM d") });
      case "month":
        return dayLabel(bar.from, "MMM yyyy");
      case "year":
        return dayLabel(bar.from, "yyyy");
    }
  };

  const chartData: Bar[] = bars.map((bar) => {
    let tone: BarTone = "none";
    if (bar.value !== null) {
      tone = bar.isPeak ? "peak" : bar.containsToday ? "muted" : "base";
    }
    return {
      key: bar.key,
      value: bar.value,
      tone,
      accessibilityLabel:
        bar.value === null
          ? t("stats.chart.barEmptyA11y", { date: describe(bar) })
          : t("stats.chart.barA11y", { date: describe(bar), steps: formatSteps(bar.value) }),
    };
  });

  return (
    <Panel surface="sunken" className="gap-4">
      <View className="flex-row items-center justify-between">
        <View>
          <T variant="micro" tone="tertiary">
            {t("stats.chart.title")}
          </T>
          <View className="mt-0.5 flex-row items-baseline gap-1">
            <RollingNumber
              variant="stat"
              value={peak?.total != null ? formatSteps(peak.total) : "—"}
            />
            <T variant="micro" tone="tertiary">
              {t("stats.chart.peakUnit")}
            </T>
          </View>
        </View>
        {first && last ? (
          <Chip
            variant="high"
            dot="pulse"
            label={
              first === last
                ? dayLabel(first, "MMM d")
                : `${dayLabel(first, "MMM d")} – ${dayLabel(last, first.slice(0, 7) === last.slice(0, 7) ? "d" : "MMM d")}`
            }
          />
        ) : null}
      </View>

      <CardStateBody
        status={status}
        minHeightClass="min-h-40"
        centered
        loading={<Skeleton className="h-40 w-full" />}
      >
        <View className="pt-4">
          <BarChart
            // A new range regrows the bars instead of morphing week bars into month bars.
            key={range}
            bars={chartData}
            max={max}
            heightClass="h-40"
            gapClass={bars.length > 45 ? "gap-px" : bars.length > 14 ? "gap-0.5" : "gap-2"}
            goal={
              stats.currentGoal !== null
                ? {
                    value: stats.currentGoal,
                    label: t("stats.chart.goal", { value: formatCompact(stats.currentGoal) }),
                  }
                : null
            }
            tag={range === "week" && peak ? { key: peak.day, label: t("stats.chart.max") } : null}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
          {range === "week" ? (
            <View className="mt-2 flex-row gap-2">
              {bars.map((bar) => (
                <T
                  key={bar.key}
                  variant="micro"
                  tone={bar.isPeak || bar.containsToday ? "primary" : "tertiary"}
                  className="flex-1 text-center"
                >
                  {dayLabel(bar.from, "EEEEE")}
                </T>
              ))}
            </View>
          ) : (
            <View className="mt-2 flex-row justify-between">
              <T variant="micro" tone="tertiary">
                {first ? dayLabel(first, "MMM d, yy") : ""}
              </T>
              <T variant="micro" tone="tertiary">
                {t(BUCKET_LABEL[bucket])}
              </T>
              <T variant="micro" tone="tertiary">
                {last ? dayLabel(last, "MMM d") : ""}
              </T>
            </View>
          )}
        </View>

        {selected ? (
          <View className="mt-4 flex-row items-center justify-between rounded-lg bg-surface-raised p-2">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="touch-app" size={16} color={c.textTertiary} />
              <T variant="label" tone="tertiary">
                {describe(selected)}
              </T>
            </View>
            <View className="flex-row items-baseline gap-1">
              <RollingNumber
                variant="label"
                value={selected.value === null ? "—" : formatSteps(selected.value)}
              />
              <T variant="micro" tone="tertiary">
                {selected.value === null
                  ? t("stats.chart.noData")
                  : selected.isPeak
                    ? // Folded bars peak on the best bucket's average, not the best day in the header.
                      t(BEST_LABEL[selected.bucket])
                    : selected.bucket === "day"
                      ? t(selected.containsToday ? "stats.chart.today" : "stats.chart.steps")
                      : t("stats.chart.perDay")}
              </T>
            </View>
          </View>
        ) : null}
      </CardStateBody>
    </Panel>
  );
}
