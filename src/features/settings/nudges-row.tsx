import { useTranslation } from "react-i18next";
import { Switch } from "react-native";
import { useEnableNudges } from "@/src/features/notifications/use-enable-nudges";
import { usePreferencesStore } from "@/src/stores/preferences";
import { useThemeColors } from "@/src/ui/theme-colors";
import { SettingsRow } from "./settings-row";

/**
 * Pace nudges, inside the target card: they measure you against the target,
 * so they live next to it. With the goal off the switch stays visible but
 * disabled (the preference is kept) — NudgeSync schedules nothing without a goal.
 */
export function NudgesRow({ hasGoal }: { hasGoal: boolean }) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const enabled = usePreferencesStore((s) => s.paceNudgesEnabled);
  const setEnabled = usePreferencesStore((s) => s.setPaceNudgesEnabled);
  const nudges = useEnableNudges();

  return (
    <SettingsRow
      title={t("settings.nudges")}
      subtitle={hasGoal ? t("settings.nudgesCaption") : t("settings.nudgesNeedsGoal")}
      right={
        <Switch
          value={enabled && hasGoal}
          disabled={nudges.busy || !hasGoal}
          // Off is instant (NudgeSync cancels); on goes through the iOS permission.
          onValueChange={(next) => (next ? void nudges.enable() : setEnabled(false))}
          trackColor={{ true: c.accentFg, false: c.surfaceHigh }}
          thumbColor={enabled && hasGoal ? c.accentOn : undefined}
          accessibilityLabel={t("settings.nudges")}
        />
      }
    />
  );
}
