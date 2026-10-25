import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { usePreferencesStore } from "@/src/stores/preferences";
import { ActionButton } from "@/src/ui/action-button";
import { Panel } from "@/src/ui/panel";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";

/**
 * Stride in use for distance estimates and where it came from. "Calibrate"
 * opens Settings → stride (the walk-a-known-distance flow is v1.1, spec §4).
 */
export function StrideCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const c = useThemeColors();
  const { strideMeters, strideSource } = useEstimationSettings();
  const heightCm = usePreferencesStore((s) => s.heightCm);
  const cm = Math.round(strideMeters * 100);

  const subtitle =
    strideSource === "manual"
      ? t("today.stride.manual")
      : strideSource === "height"
        ? t("today.stride.height", { height: heightCm })
        : t("today.stride.default");

  return (
    <Panel className="flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded bg-surface-high">
          <MaterialCommunityIcons name="shoe-print" size={18} color={c.textPrimary} />
        </View>
        <View className="min-w-0 flex-1">
          <T variant="label" numberOfLines={1}>
            {t("today.stride.title", { cm })}
          </T>
          <T variant="bodySm" tone="tertiary" numberOfLines={1}>
            {subtitle}
          </T>
        </View>
      </View>
      <ActionButton
        label={t("today.stride.calibrate")}
        size="sm"
        variant="secondary"
        onPress={() => router.navigate("/settings")}
      />
    </Panel>
  );
}
