import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useHealthStore } from "@/src/features/health/health-store";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { dayLabel, syncedAgo } from "@/src/lib/format";
import { Chip } from "@/src/ui/chip";
import { PulseDot } from "@/src/ui/pulse-dot";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";

/**
 * "TODAY, OCT 24 · ● Synced 2m ago · HealthKit" + source chip. Doubles as the
 * HealthKit status line: not connected → tap to connect; failed → tap to retry.
 */
export function SyncStrip({ stats, now }: { stats: StepStats; now: Date }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const requestAccess = useHealthStore((s) => s.requestAccess);

  let line: { text: string; onPress?: () => void; live?: boolean };
  if (stats.isLoading) line = { text: t("common.loading") };
  else if (stats.access === "unavailable") line = { text: t("today.sync.unavailable") };
  else if (stats.access === "notRequested")
    line = { text: t("today.sync.connect"), onPress: () => void requestAccess() };
  else if (stats.healthError)
    line = { text: t("today.sync.failed"), onPress: () => void stats.retry() };
  else if (stats.lastSyncedAt !== null)
    line = {
      text: t("today.sync.synced", { ago: syncedAgo(stats.lastSyncedAt, now.getTime()) }),
      live: true,
    };
  else line = { text: t("common.loading") };

  const chip =
    stats.access === "requested"
      ? { label: t("today.sync.chipActive"), icon: "sensors" as const }
      : stats.access === "notRequested"
        ? { label: t("today.sync.chipOff"), icon: "sensors-off" as const }
        : { label: t("today.sync.chipManual"), icon: "edit" as const };

  const lineContent = (
    <View className="mt-0.5 flex-row items-center gap-1.5">
      {line.live ? <PulseDot pulse /> : null}
      <T
        variant="bodySm"
        tone={line.onPress ? "primary" : "tertiary"}
        className={line.onPress ? "underline" : ""}
      >
        {line.text}
      </T>
    </View>
  );

  return (
    <View className="flex-row items-center justify-between pt-1">
      <View className="flex-shrink">
        <T variant="label">{t("today.dateLabel", { date: dayLabel(stats.today, "MMM d") })}</T>
        {line.onPress ? (
          <Pressable
            accessibilityRole="button"
            onPress={line.onPress}
            hitSlop={8}
            className="active:opacity-60"
          >
            {lineContent}
          </Pressable>
        ) : (
          lineContent
        )}
      </View>
      <Chip
        label={chip.label}
        icon={<MaterialIcons name={chip.icon} size={13} color={c.textTertiary} />}
      />
    </View>
  );
}
