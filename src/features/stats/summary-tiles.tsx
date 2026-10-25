import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { formatSignedPercent, formatSteps } from "@/src/lib/format";
import { type CardStatus, READY } from "@/src/ui/card-state";
import { StatTile } from "@/src/ui/stat-tile";
import { useThemeColors } from "@/src/ui/theme-colors";
import { baseCardStatus } from "./card-status";
import { averageOf, type ChartRange, rangeDays } from "./stats";
import type { StepStats } from "./use-step-stats";

const RANGE_SHORT: Record<ChartRange, string> = {
  week: "7D",
  month: "30D",
  quarter: "90D",
  all: "ALL",
};

/**
 * Week total (Mon → today, spec §6.4) + average per valid day over the selected
 * range's completed days — today's partial total would drag it down (and
 * disagree with Today's 7-day average).
 */
export function SummaryTiles({ stats, range }: { stats: StepStats; range: ChartRange }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const base = baseCardStatus(stats);
  const week = stats.week;

  const rangeAverage = useMemo(
    () =>
      averageOf(
        rangeDays(stats.days, range, stats.today)
          .filter((d) => d.day !== stats.today)
          .map((d) => d.total),
      ),
    [stats.days, range, stats.today],
  );

  const weekStatus: CardStatus =
    base ??
    (week.validDays === 0 ? { kind: "empty", message: t("stats.summary.weekEmpty") } : READY);
  const avgStatus: CardStatus =
    base ??
    (rangeAverage.average === null
      ? { kind: "empty", message: t("stats.summary.avgEmpty") }
      : READY);

  return (
    <View className="flex-row gap-3">
      <StatTile
        surface="sunken"
        label={t("stats.summary.week")}
        icon={<MaterialIcons name="stacked-bar-chart" size={16} color={c.textTertiary} />}
        value={formatSteps(week.total)}
        caption={
          week.changePct !== null
            ? t("stats.summary.weekVsLast", { value: formatSignedPercent(week.changePct) })
            : t("stats.summary.weekSpan")
        }
        status={weekStatus}
      />
      <StatTile
        surface="sunken"
        label={t("stats.summary.avg")}
        icon={<MaterialIcons name="speed" size={16} color={c.textTertiary} />}
        value={rangeAverage.average === null ? "—" : formatSteps(rangeAverage.average)}
        caption={t("stats.summary.avgCaption", {
          range: RANGE_SHORT[range],
          count: rangeAverage.validDays,
        })}
        status={avgStatus}
      />
    </View>
  );
}
