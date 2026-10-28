import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { dayLabel, formatSignedPercent, formatSignedSteps, formatSteps } from "@/src/lib/format";
import { CardStateBody, type CardStatus, READY } from "@/src/ui/card-state";
import { Chip } from "@/src/ui/chip";
import { Panel, SectionLabel } from "@/src/ui/panel";
import { StatTile } from "@/src/ui/stat-tile";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { baseCardStatus } from "./card-status";
import type { StepStats } from "./use-step-stats";

/** Personal record (spec §6.6), goal streak (§6.7) and the 30-day trend (§6.8). */
export function Milestones({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  return (
    <View className="gap-2">
      <SectionLabel label={t("stats.milestones.title")} right={t("stats.milestones.allTime")} />
      <RecordTile stats={stats} />
      <View className="flex-row gap-3">
        <StreakTile stats={stats} />
        <TrendTile stats={stats} />
      </View>
    </View>
  );
}

function RecordTile({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const record = stats.record;
  const status: CardStatus =
    baseCardStatus(stats) ??
    (record === null ? { kind: "empty", message: t("stats.milestones.recordEmpty") } : READY);

  // Spec decision 2: only flag the basis when access is limited — with full
  // history "since 2019" is clutter; it earns its space explaining a low record.
  const limited = stats.limitedFrom
    ? ` · ${t("stats.milestones.limitedSince", { date: dayLabel(stats.limitedFrom, "MMM d, yyyy") })}`
    : "";

  return (
    <Panel surface="sunken" className="flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center gap-4">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface-raised">
          <MaterialIcons name="military-tech" size={20} color={c.textPrimary} />
        </View>
        <View className="flex-1">
          <T variant="micro" tone="tertiary">
            {t("stats.milestones.record")}
          </T>
          <CardStateBody status={status} minHeightClass="min-h-8">
            {record?.total != null ? (
              <View
                accessible
                accessibilityLabel={t("stats.milestones.recordA11y", {
                  steps: formatSteps(record.total),
                  date: dayLabel(record.day, "MMMM d, yyyy"),
                })}
              >
                <T variant="bodyMdMedium" tone="primary">
                  {t("stats.milestones.recordValue", { steps: formatSteps(record.total) })}
                </T>
                <T variant="micro" tone="tertiary">
                  {dayLabel(record.day, "MMMM d, yyyy")}
                  {limited}
                </T>
              </View>
            ) : null}
          </CardStateBody>
        </View>
      </View>
      {status.kind === "ready" ? <Chip label={t("stats.milestones.ath")} /> : null}
    </Panel>
  );
}

function StreakTile({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const goal = stats.currentGoal;
  const { current, longest } = stats.streaks;
  const status: CardStatus =
    baseCardStatus(stats) ??
    (goal === null
      ? {
          kind: "empty",
          // Goal-off days pause the streak (decision 5) — say it's waiting, not gone.
          message:
            current > 0
              ? t("stats.milestones.streakPaused", { count: current })
              : t("stats.milestones.streakNoGoal"),
        }
      : READY);
  return (
    <StatTile
      surface="sunken"
      size="headline"
      label={t("stats.milestones.streak")}
      accessory={<MaterialIcons name="bolt" size={14} color={c.textPrimary} />}
      value={t("stats.milestones.days", { count: current })}
      caption={
        // No goal value: the streak judges each day by the goal in effect that day.
        goal !== null ? t("stats.milestones.streakCaption", { best: longest }) : undefined
      }
      status={status}
    />
  );
}

function TrendTile({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const trend = stats.trend;
  const status: CardStatus =
    baseCardStatus(stats) ??
    (trend === null ? { kind: "empty", message: t("stats.milestones.trendEmpty") } : READY);
  // A zero change gets a flat arrow — "up" on no change overclaims.
  const diff = Math.round(trend?.difference ?? 0);
  const icon = diff > 0 ? "trending-up" : diff < 0 ? "trending-down" : "trending-flat";
  return (
    <StatTile
      surface="sunken"
      size="headline"
      label={t("stats.milestones.trend")}
      accessory={<MaterialIcons name={icon} size={14} color={c.textPrimary} />}
      value={
        trend === null
          ? "—"
          : trend.percent !== null
            ? formatSignedPercent(trend.percent)
            : formatSignedSteps(trend.difference)
      }
      caption={
        trend
          ? t("stats.milestones.trendCaption", { diff: formatSignedSteps(trend.difference) })
          : undefined
      }
      status={status}
    />
  );
}
