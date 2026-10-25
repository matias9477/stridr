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

  // Spec §6.6: say when the record only covers part of the user's history.
  const basis = stats.limitedFrom
    ? t("stats.milestones.limitedSince", { date: dayLabel(stats.limitedFrom, "MMM d, yyyy") })
    : t("stats.milestones.since", { date: dayLabel(stats.historyFrom, "MMM d, yyyy") });

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
                  {dayLabel(record.day, "MMMM d, yyyy")} · {basis}
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
    (goal === null ? { kind: "empty", message: t("stats.milestones.streakNoGoal") } : READY);
  return (
    <StatTile
      surface="sunken"
      size="headline"
      label={t("stats.milestones.streak")}
      accessory={<MaterialIcons name="bolt" size={14} color={c.textPrimary} />}
      value={t("stats.milestones.days", { count: current })}
      caption={
        goal !== null
          ? t("stats.milestones.streakCaption", { goal: formatSteps(goal), best: longest })
          : undefined
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
  const up = (trend?.difference ?? 0) >= 0;
  return (
    <StatTile
      surface="sunken"
      size="headline"
      label={t("stats.milestones.trend")}
      accessory={
        <MaterialIcons
          name={up ? "trending-up" : "trending-down"}
          size={14}
          color={c.textPrimary}
        />
      }
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
