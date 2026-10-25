import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { formatSteps, timeLabel } from "@/src/lib/format";
import { Panel, PanelHeader } from "@/src/ui/panel";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";
import { NUDGE_RULES } from "./nudge";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const RULES: { key: string; icon: IconName }[] = [
  { key: "once", icon: "clock-outline" },
  { key: "behind", icon: "trending-down" },
  { key: "silent", icon: "volume-off" },
  { key: "off", icon: "toggle-switch-off-outline" },
];

/**
 * Onboarding step 3: what a pace nudge looks like and the rules it keeps,
 * before iOS asks for permission (spec pace-nudges §UI).
 */
export function NudgePreview() {
  const { t } = useTranslation();
  const c = useThemeColors();
  const nudgeAt = new Date();
  nudgeAt.setHours(NUDGE_RULES.hour, 0, 0, 0);
  const time = timeLabel(nudgeAt);

  return (
    <View className="gap-3">
      <Panel className="gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-6 w-6 items-center justify-center rounded bg-accent-fg">
              <MaterialCommunityIcons name="shoe-print" size={14} color={c.accentOn} />
            </View>
            <T variant="micro">Stridr</T>
          </View>
          <T variant="micro" tone="tertiary">
            {time}
          </T>
        </View>
        <View>
          <T variant="bodyMdMedium" tone="primary">
            {t("nudges.notification.title")}
          </T>
          <T variant="bodySm" tone="secondary">
            {t("nudges.notification.body", { remaining: formatSteps(2400) })}
          </T>
        </View>
      </Panel>

      <Panel className="gap-3">
        <PanelHeader
          label={t("nudges.rules")}
          right={<MaterialCommunityIcons name="bell-outline" size={16} color={c.textTertiary} />}
        />
        {RULES.map((rule) => (
          <View key={rule.key} className="flex-row items-center gap-3">
            <MaterialCommunityIcons name={rule.icon} size={16} color={c.textPrimary} />
            <T variant="bodySm" tone="secondary" className="flex-1">
              {t(`nudges.rule.${rule.key}`, { time })}
            </T>
          </View>
        ))}
      </Panel>
    </View>
  );
}
