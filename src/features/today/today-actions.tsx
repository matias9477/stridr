import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { todayProgress } from "@/src/features/stats/stats";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { ActionButton, IconButton } from "@/src/ui/action-button";

/** Log a walk (primary) + share today as an image (opens the share-card preview). */
export function TodayActions({ stats, now }: { stats: StepStats; now: Date }) {
  const { t } = useTranslation();
  const router = useRouter();
  const progress = todayProgress(stats.todayTotal, now);

  return (
    <View className="flex-row items-center gap-3 pt-1">
      <ActionButton
        block
        icon="add"
        label={t("today.logWalk")}
        onPress={() => router.push("/activity/new")}
      />
      <IconButton
        icon="ios-share"
        accessibilityLabel={t("today.share.a11y")}
        disabled={progress.total === null}
        onPress={() => router.push("/share-card")}
      />
    </View>
  );
}
