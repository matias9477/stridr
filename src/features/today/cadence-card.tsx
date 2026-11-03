import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { baseCardStatus } from "@/src/features/stats/card-status";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { formatSteps, timeLabel } from "@/src/lib/format";
import { type Bar, BarChart, type BarTone } from "@/src/ui/bar-chart";
import { CardStateBody, type CardStatus, READY, Skeleton } from "@/src/ui/card-state";
import { Panel } from "@/src/ui/panel";
import { T } from "@/src/ui/typography";

const AXIS = ["00:00", "06:00", "12:00", "18:00", "23:59"];

/**
 * "Temporal cadence" — today's steps hour by hour. Hours at ≥ half the busiest
 * hour render solid, other active hours in the base tone (the Trends pair),
 * empty or future hours as stubs.
 */
export function CadenceCard({ stats, now }: { stats: StepStats; now: Date }) {
  const { t } = useTranslation();
  const hourly = stats.hourly;
  const max = Math.max(0, ...hourly.map((v) => v ?? 0));
  const status: CardStatus =
    baseCardStatus(stats, { healthOnly: true }) ??
    (max === 0 ? { kind: "empty", message: t("today.cadence.empty") } : READY);

  const currentHour = now.getHours();
  const bars: Bar[] = hourly.map((steps, hour) => {
    let tone: BarTone = "none";
    if (hour <= currentHour && steps !== null && steps > 0) {
      tone = steps >= max / 2 ? "peak" : "base";
    }
    const time = `${String(hour).padStart(2, "0")}:00`;
    return {
      key: String(hour),
      value: steps !== null && steps > 0 ? steps : null,
      tone,
      accessibilityLabel:
        steps === null || steps === 0
          ? t("today.cadence.barEmptyA11y", { time })
          : t("today.cadence.barA11y", { time, steps: formatSteps(steps) }),
    };
  });

  return (
    <Panel surface="sunken" className="gap-2">
      <View className="flex-row items-baseline gap-2">
        <T variant="label" numberOfLines={1}>
          {t("today.cadence.title")}
        </T>
        <T variant="micro" tone="tertiary" numberOfLines={1} className="flex-1">
          {t("today.cadence.subtitle")}
        </T>
        <T variant="micro" tone="tertiary" numberOfLines={1}>
          {t("today.cadence.current", { time: timeLabel(now) })}
        </T>
      </View>
      {status.kind === "loading" ? (
        // Same plot box, baseline and axis as the ready chart (the axis is static copy, so
        // it renders for real) — bypassing CardStateBody's min-height wrapper keeps it exact.
        <>
          <View className="pt-1" accessible accessibilityLabel={t("common.loading")}>
            <Skeleton className="h-12 w-full" />
            <View className="mt-0.5 h-px bg-surface-raised" />
          </View>
          <Axis />
        </>
      ) : (
        <CardStateBody status={status} minHeightClass="min-h-16">
          <View className="pt-1">
            <BarChart bars={bars} max={max} heightClass="h-12" gapClass="gap-1" />
            <View className="mt-0.5 h-px bg-surface-raised" />
          </View>
          <Axis />
        </CardStateBody>
      )}
    </Panel>
  );
}

function Axis() {
  return (
    <View className="flex-row justify-between pt-1">
      {AXIS.map((label) => (
        <T key={label} variant="micro" tone="tertiary">
          {label}
        </T>
      ))}
    </View>
  );
}
