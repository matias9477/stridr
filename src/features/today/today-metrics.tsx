import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { distanceForSteps } from "@/src/features/activity/estimate";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { baseCardStatus } from "@/src/features/stats/card-status";
import { STATS_RULES } from "@/src/features/stats/stats";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import {
  formatCompact,
  formatDistance,
  formatMinutes,
  formatSignedPercent,
  formatSteps,
} from "@/src/lib/format";
import { usePreferencesStore } from "@/src/stores/preferences";
import { type CardStatus, READY } from "@/src/ui/card-state";
import { StatTile } from "@/src/ui/stat-tile";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";

/** The 2×2 bento under the hero: 7-day average, distance, active time, peak hour. */
export function TodayMetrics({ stats }: { stats: StepStats }) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <AverageTile stats={stats} />
        <DistanceTile stats={stats} />
      </View>
      <View className="flex-row gap-3">
        <ActiveTimeTile stats={stats} />
        <PeakIntervalTile stats={stats} />
      </View>
    </View>
  );
}

function Icon({ name }: { name: keyof typeof MaterialIcons.glyphMap }) {
  const c = useThemeColors();
  return <MaterialIcons name={name} size={14} color={c.textTertiary} />;
}

function AverageTile({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const { average, changePct, baseline, baselineDays } = stats.sevenDay;
  const status: CardStatus =
    baseCardStatus(stats) ??
    (average === null ? { kind: "empty", message: t("today.metrics.averageEmpty") } : READY);
  return (
    <StatTile
      surface="sunken"
      label={t("today.metrics.average")}
      accessory={
        changePct !== null ? (
          <T variant="micro" tone="primary">
            {formatSignedPercent(changePct)}
          </T>
        ) : undefined
      }
      value={average === null ? "—" : formatSteps(average)}
      caption={
        baseline !== null
          ? baselineDays < STATS_RULES.averageWindowDays
            ? t("today.metrics.baselinePartial", {
                value: formatCompact(baseline),
                days: baselineDays,
              })
            : t("today.metrics.baseline", { value: formatCompact(baseline) })
          : t("today.metrics.averageDays", { count: stats.sevenDay.validDays })
      }
      status={status}
    />
  );
}

function DistanceTile({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const unit = usePreferencesStore((s) => s.distanceUnit);
  const { strideMeters } = useEstimationSettings();
  const total = stats.todayTotal?.total ?? null;
  const status: CardStatus =
    baseCardStatus(stats) ??
    (total === null ? { kind: "empty", message: t("today.metrics.noStepsYet") } : READY);
  return (
    <StatTile
      surface="sunken"
      label={t("today.metrics.distance")}
      icon={<Icon name="straighten" />}
      value={total === null ? "—" : formatDistance(distanceForSteps(total, strideMeters), unit)}
      unit={unit === "km" ? "KM" : "MI"}
      caption={t("today.metrics.stride", { value: Math.round(strideMeters * 100) })}
      status={status}
    />
  );
}

function ActiveTimeTile({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const activity = stats.activity[stats.today];
  const status: CardStatus =
    baseCardStatus(stats, { healthOnly: true }) ??
    (activity === undefined ? { kind: "empty", message: t("today.metrics.activeEmpty") } : READY);
  return (
    <StatTile
      surface="sunken"
      label={t("today.metrics.activeTime")}
      icon={<Icon name="timer" />}
      value={activity ? formatMinutes(activity.activeMinutes) : "—"}
      caption={
        activity?.cadence != null
          ? t("today.metrics.cadence", { value: activity.cadence })
          : undefined
      }
      status={status}
    />
  );
}

function PeakIntervalTile({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const peak = stats.peakHour;
  const status: CardStatus =
    baseCardStatus(stats, { healthOnly: true }) ??
    (peak === null ? { kind: "empty", message: t("today.metrics.peakEmpty") } : READY);
  return (
    <StatTile
      surface="sunken"
      label={t("today.metrics.peak")}
      icon={<Icon name="bolt" />}
      value={peak ? `${String(peak.hour).padStart(2, "0")}:00` : "—"}
      caption={
        peak ? t("today.metrics.peakCaption", { steps: formatSteps(peak.steps) }) : undefined
      }
      status={status}
    />
  );
}
