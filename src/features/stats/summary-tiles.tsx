import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { dayLabel, formatCompact, formatSignedPercent, formatSteps } from "@/src/lib/format";
import { type CardStatus, READY } from "@/src/ui/card-state";
import { StatTile } from "@/src/ui/stat-tile";
import { useThemeColors } from "@/src/ui/theme-colors";
import { baseCardStatus } from "./card-status";
import { customChipLabel, customSpanLabel } from "./custom-range/custom-range-label";
import {
  averageOf,
  type ChartRange,
  type CustomRange,
  rangeDays,
  rangeLabelKey,
  sumOf,
} from "./stats";
import type { StepStats } from "./use-step-stats";

// Seven-plus digits (an all-time sum) overflow a half-width tile; millions go compact ("12.3M").
const formatTotal = (total: number) => (total >= 1e6 ? formatCompact(total) : formatSteps(total));

/**
 * Total for the selected range — on Week, the week total (week start → today, spec §6.4)
 * with its vs-last-week delta; 30D/90D/All sum every day in range, today included — + average per valid day over the
 * selected range's completed days — today's partial total would drag it down
 * (and disagree with Today's 7-day average), and the week's days ahead have none.
 */
export function SummaryTiles({
  stats,
  range,
  custom,
}: {
  stats: StepStats;
  range: ChartRange;
  custom: CustomRange | null;
}) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const base = baseCardStatus(stats);
  const week = stats.week;

  const { rangeAverage, rangeTotal, rangeFrom } = useMemo(() => {
    const days = rangeDays(stats.days, range, stats.today, stats.weekView, custom);
    return {
      rangeAverage: averageOf(days.filter((d) => d.day < stats.today).map((d) => d.total)),
      rangeTotal: sumOf(days.map((d) => d.total)),
      rangeFrom: days[0]?.day,
    };
  }, [stats.days, range, stats.today, stats.weekView, custom]);

  const isWeek = range === "week";
  const total = isWeek ? week : rangeTotal;
  const totalStatus: CardStatus =
    base ??
    (total.validDays === 0
      ? {
          kind: "empty",
          message: t(isWeek ? "stats.summary.weekEmpty" : "stats.summary.rangeEmpty"),
        }
      : READY);

  let totalCaption: string | undefined;
  if (isWeek) {
    totalCaption =
      week.changePct !== null
        ? t("stats.summary.weekVsLast", { value: formatSignedPercent(week.changePct) })
        : t(stats.weekStart === "monday" ? "stats.summary.weekSpan" : "stats.summary.weekSpanSun");
  } else if (range === "custom" && custom) {
    totalCaption = customSpanLabel(custom, stats.today, t);
  } else if (rangeFrom) {
    const date = dayLabel(rangeFrom, range === "all" ? "MMM d, yyyy" : "MMM d");
    totalCaption = t(range === "all" ? "stats.summary.since" : "stats.summary.rangeSpan", { date });
  }
  const avgStatus: CardStatus =
    base ??
    (rangeAverage.average === null
      ? { kind: "empty", message: t("stats.summary.avgEmpty") }
      : READY);

  return (
    <View className="flex-row gap-3">
      <StatTile
        surface="sunken"
        label={t(isWeek ? "stats.summary.week" : `stats.summary.total_${range}`)}
        icon={<MaterialIcons name="stacked-bar-chart" size={16} color={c.textTertiary} />}
        value={formatTotal(total.total)}
        caption={totalCaption}
        status={totalStatus}
      />
      <StatTile
        surface="sunken"
        label={t("stats.summary.avg")}
        icon={<MaterialIcons name="speed" size={16} color={c.textTertiary} />}
        value={rangeAverage.average === null ? "—" : formatSteps(rangeAverage.average)}
        caption={t("stats.summary.avgCaption", {
          range: (range === "custom"
            ? customChipLabel(custom, t)
            : t(rangeLabelKey(range, stats.weekView))
          ).toUpperCase(),
          count: rangeAverage.validDays,
        })}
        status={avgStatus}
      />
    </View>
  );
}
