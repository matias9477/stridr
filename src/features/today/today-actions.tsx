import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Share, View } from "react-native";
import { todayProgress } from "@/src/features/stats/stats";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { formatGoalPercent, formatSteps } from "@/src/lib/format";
import { ActionButton, IconButton } from "@/src/ui/action-button";

/** Log a walk (primary) + share today's numbers (system share sheet, text only). */
export function TodayActions({ stats, now }: { stats: StepStats; now: Date }) {
  const { t } = useTranslation();
  const router = useRouter();
  const progress = todayProgress(stats.todayTotal, now);

  function share() {
    if (progress.total === null) return;
    const steps = formatSteps(progress.total);
    const message =
      progress.goal !== null && progress.percent !== null
        ? t("today.share.withGoal", {
            steps,
            percent: formatGoalPercent(progress.percent, progress.goalMet, 0),
            goal: formatSteps(progress.goal),
          })
        : t("today.share.plain", { steps });
    Share.share({ message }).catch((error) => console.error("[today/share] failed", error));
  }

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
        onPress={share}
      />
    </View>
  );
}
