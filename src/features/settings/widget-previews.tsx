import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { useIsPro } from "@/src/features/purchases/purchases-store";
import type { StepStats } from "@/src/features/stats/use-step-stats";
import { buildWidgetTimeline } from "@/src/features/widgets/widget-snapshot";
import { usePreferencesStore } from "@/src/stores/preferences";
import { Chip } from "@/src/ui/chip";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { RowIcon, SettingsCard, SettingsRow } from "./settings-row";

/**
 * Live previews of the lock-screen (accessoryRectangular) and home-screen
 * (systemSmall) widgets. Built from the same snapshot WidgetSync pushes, so
 * the strings match; the layout mirrors widgets/steps-widget.tsx — keep the
 * two visually in step. Free users see them dimmed under an unlock row —
 * their own numbers, as a preview of what Pro puts on the home screen.
 */
export function WidgetPreviews({ stats }: { stats: StepStats }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const unit = usePreferencesStore((s) => s.distanceUnit);
  const { strideMeters } = useEstimationSettings();
  const router = useRouter();
  const isPro = useIsPro();
  const w = buildWidgetTimeline({ stats, unit, strideMeters, now: new Date(), t }).now;
  const hasGoal = w.progress >= 0;
  const fill = `${Math.min(1, Math.max(0, w.progress)) * 100}%` as const;

  const bar = (track: string) => (
    <View className={`h-1.5 w-full overflow-hidden rounded-full ${track}`}>
      <View className="h-full bg-accent-fg" style={{ width: fill }} />
    </View>
  );

  return (
    <SettingsCard
      label={t("settings.widgets.title")}
      right={<Chip variant="ghost" label="iOS 17+" />}
    >
      <View className={`mt-2 flex-row gap-2 ${isPro ? "" : "opacity-40"}`}>
        <View
          className="flex-1 items-center rounded-lg bg-surface-raised p-2"
          accessible
          accessibilityLabel={t("settings.widgets.lockA11y")}
        >
          <T variant="micro" tone="tertiary" className="mb-2 self-start">
            {t("settings.widgets.lock")}
          </T>
          {/* Same height as the home square so the two cards line up. */}
          <View className="h-32 w-full justify-center">
            <View className="gap-1.5 rounded-xl bg-surface-high p-2.5">
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="directions-walk" size={14} color={c.textPrimary} />
                <T variant="micro" tone="primary">
                  {w.percentText}
                </T>
                <View className="flex-1" />
                <T variant="headline">{w.stepsCompact}</T>
              </View>
              {hasGoal ? bar("bg-surface-raised") : null}
            </View>
          </View>
          <T variant="micro" tone="tertiary" className="mt-2 normal-case">
            {t("settings.widgets.rectangular")}
          </T>
        </View>

        <View
          className="flex-1 items-center rounded-lg bg-surface-raised p-2"
          accessible
          accessibilityLabel={t("settings.widgets.homeA11y")}
        >
          <T variant="micro" tone="tertiary" className="mb-2 self-start">
            {t("settings.widgets.home")}
          </T>
          {/* Fixed square: aspect-ratio + max-width let Yoga size the height off the unclamped width. */}
          <View className="h-32 w-32 justify-between rounded-2xl bg-surface-page p-2.5">
            <View className="flex-row items-start justify-between">
              <View>
                <T variant="micro">STRIDR</T>
                <T variant="micro" tone="primary">
                  {w.stepsLabel}
                </T>
              </View>
              <T variant="micro">{w.timeText}</T>
            </View>
            <View>
              <T variant="headline" numberOfLines={1} adjustsFontSizeToFit>
                {w.steps}
              </T>
              <T variant="micro" tone="primary" numberOfLines={1}>
                {w.hasData ? w.paceText : w.emptyText}
              </T>
            </View>
            {hasGoal ? (
              <View className="gap-1">
                <View className="flex-row justify-between">
                  <T variant="micro">{w.goalShort}</T>
                  <T variant="micro" tone="primary">
                    {w.percentText}
                  </T>
                </View>
                {bar("bg-surface-raised")}
              </View>
            ) : null}
          </View>
          <T variant="micro" tone="tertiary" className="mt-2 normal-case">
            {t("settings.widgets.small")}
          </T>
        </View>
      </View>
      {isPro ? null : (
        <SettingsRow
          title={t("settings.widgets.unlock")}
          subtitle={t("settings.widgets.unlockCaption")}
          right={<RowIcon />}
          onPress={() => router.push("/paywall?variant=widgets")}
        />
      )}
    </SettingsCard>
  );
}
