import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { type DistanceUnit, usePreferencesStore } from "@/src/stores/preferences";
import { Segmented } from "@/src/ui/segmented";
import { SettingsCard, SettingsRow, ValueTag } from "./settings-row";

/** Biomechanics & metrics: stride (manual / from height / default), distance unit, walking cadence. */
export function MetricsCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useEstimationSettings();
  const distanceUnit = usePreferencesStore((s) => s.distanceUnit);
  const setDistanceUnit = usePreferencesStore((s) => s.setDistanceUnit);

  const strideSubtitle =
    settings.strideSource === "manual"
      ? t("settings.metrics.strideManual")
      : settings.strideSource === "height"
        ? t("settings.metrics.strideHeight")
        : t("settings.metrics.strideDefault");

  return (
    <SettingsCard label={t("settings.metrics.title")}>
      <SettingsRow
        title={t("settings.metrics.stride")}
        subtitle={strideSubtitle}
        right={<ValueTag label={`${Math.round(settings.strideMeters * 100)} CM`} />}
        onPress={() => router.push("/stride")}
        accessibilityHint={t("settings.metrics.editHint")}
      />
      <SettingsRow
        title={t("settings.metrics.cadence")}
        subtitle={t("settings.metrics.cadenceCaption")}
        right={<ValueTag label={`${settings.cadenceSpm} SPM`} />}
        onPress={() => router.push("/cadence")}
        accessibilityHint={t("settings.metrics.editHint")}
      />
      <SettingsRow
        title={t("settings.metrics.unit")}
        subtitle={t("settings.metrics.unitCaption")}
        right={
          <Segmented<DistanceUnit>
            layout="compact"
            accessibilityLabel={t("settings.metrics.unit")}
            value={distanceUnit}
            onChange={setDistanceUnit}
            options={[
              { value: "km", label: "KM" },
              { value: "mi", label: t("settings.metrics.miles") },
            ]}
          />
        }
      />
    </SettingsCard>
  );
}
