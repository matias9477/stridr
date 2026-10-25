import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ActivityLog } from "@/src/features/activity/activity-log";
import { Milestones } from "@/src/features/stats/milestones";
import type { ChartRange } from "@/src/features/stats/stats";
import { StatsFooter } from "@/src/features/stats/stats-footer";
import { SummaryTiles } from "@/src/features/stats/summary-tiles";
import { useStepStats } from "@/src/features/stats/use-step-stats";
import { VolumeChartCard } from "@/src/features/stats/volume-chart-card";
import { useNow } from "@/src/lib/use-now";
import { AppHeader } from "@/src/ui/app-header";
import { Screen } from "@/src/ui/screen";
import { Segmented } from "@/src/ui/segmented";

export default function StatsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const stats = useStepStats();
  const now = useNow();
  const [range, setRange] = useState<ChartRange>("week");

  return (
    <Screen>
      <AppHeader
        section={t("tabs.stats")}
        action={{
          icon: "person",
          label: t("tabs.settings"),
          onPress: () => router.navigate("/settings"),
        }}
      />
      <View className="gap-6">
        <Segmented<ChartRange>
          accessibilityLabel={t("stats.range.a11y")}
          value={range}
          onChange={setRange}
          options={[
            { value: "week", label: t("stats.range.week") },
            { value: "month", label: t("stats.range.month") },
            { value: "quarter", label: t("stats.range.quarter") },
            { value: "all", label: t("stats.range.all") },
          ]}
        />
        <VolumeChartCard stats={stats} range={range} />
        <SummaryTiles stats={stats} range={range} />
        <Milestones stats={stats} />
        <ActivityLog stats={stats} />
        <StatsFooter stats={stats} now={now} />
      </View>
    </Screen>
  );
}
