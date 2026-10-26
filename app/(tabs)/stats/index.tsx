import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { ActivityLog } from "@/src/features/activity/activity-log";
import { useIsPro } from "@/src/features/purchases/purchases-store";
import { CustomRangeEditor } from "@/src/features/stats/custom-range/custom-range-form";
import { customChipLabel } from "@/src/features/stats/custom-range/custom-range-label";
import { Milestones } from "@/src/features/stats/milestones";
import { type ChartRange, type CustomRange, rangeLabelKey } from "@/src/features/stats/stats";
import { StatsFooter } from "@/src/features/stats/stats-footer";
import { SummaryTiles } from "@/src/features/stats/summary-tiles";
import { useStepStats } from "@/src/features/stats/use-step-stats";
import { VolumeChartCard } from "@/src/features/stats/volume-chart-card";
import { useNow } from "@/src/lib/use-now";
import { usePreferencesStore } from "@/src/stores/preferences";
import { AppHeader } from "@/src/ui/app-header";
import { DURATION } from "@/src/ui/motion";
import { Screen } from "@/src/ui/screen";
import { Segmented } from "@/src/ui/segmented";

export default function StatsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const stats = useStepStats();
  const now = useNow();
  const isPro = useIsPro();
  const customRange = usePreferencesStore((s) => s.customRange);
  const setCustomRange = usePreferencesStore((s) => s.setCustomRange);
  // `range` only becomes "custom" once one is saved — the chart never charts a draft.
  const [range, setRange] = useState<ChartRange>("week");
  const [editorOpen, setEditorOpen] = useState(false);

  const openCustom = () => {
    if (!isPro) {
      router.push("/paywall?variant=stats");
      return;
    }
    if (customRange) setRange("custom");
    setEditorOpen(true);
  };

  const save = (custom: CustomRange) => {
    setCustomRange(custom);
    setRange("custom");
    setEditorOpen(false);
  };

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
          // While editing, the chip being edited reads as selected even before a first save.
          value={editorOpen ? "custom" : range}
          onChange={(value) => {
            if (value === "custom") {
              openCustom();
              return;
            }
            setRange(value);
            setEditorOpen(false);
          }}
          onReselect={(value) => {
            if (value !== "custom") return;
            if (editorOpen) setEditorOpen(false);
            else openCustom();
          }}
          options={[
            { value: "week", label: t(rangeLabelKey("week", stats.weekView)) },
            { value: "month", label: t("stats.range.month") },
            { value: "quarter", label: t("stats.range.quarter") },
            { value: "all", label: t("stats.range.all") },
            { value: "custom", label: customChipLabel(customRange, t) },
          ]}
        />
        {editorOpen ? (
          <Animated.View
            entering={FadeInDown.duration(DURATION.enter)}
            exiting={FadeOut.duration(DURATION.exit)}
          >
            <CustomRangeEditor
              initial={customRange}
              today={stats.today}
              historyFrom={stats.historyFrom}
              onSave={save}
              onCancel={() => setEditorOpen(false)}
            />
          </Animated.View>
        ) : null}
        <Animated.View layout={LinearTransition.duration(DURATION.layout)} className="gap-6">
          <VolumeChartCard stats={stats} range={range} custom={customRange} />
          <SummaryTiles stats={stats} range={range} custom={customRange} />
          <Milestones stats={stats} />
          <ActivityLog stats={stats} />
          <StatsFooter stats={stats} now={now} />
        </Animated.View>
      </View>
    </Screen>
  );
}
