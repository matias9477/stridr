import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import {
  CADENCE_LIMITS,
  ESTIMATION_DEFAULTS,
  HEIGHT_LIMITS_CM,
  STRIDE_LIMITS_CM,
} from "@/src/features/activity/estimate";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { type DistanceUnit, usePreferencesStore } from "@/src/stores/preferences";
import { Segmented } from "@/src/ui/segmented";
import { SettingsCard, SettingsRow, ValueTag } from "./settings-row";

/**
 * Prompts for a whole number in [min, max]. Alert.prompt is iOS-only, which
 * matches the app (iOS-only MVP, spec §13).
 */
function promptNumber(
  title: string,
  message: string,
  current: number | null,
  limits: { min: number; max: number },
  invalidText: string,
  onValue: (value: number) => void,
) {
  Alert.prompt(
    title,
    message,
    (text) => {
      const value = Math.round(Number(text.replace(",", ".")));
      if (!Number.isFinite(value) || value < limits.min || value > limits.max) {
        Alert.alert(invalidText);
        return;
      }
      onValue(value);
    },
    "plain-text",
    current === null ? "" : String(current),
    "number-pad",
  );
}

/** Biomechanics & metrics: stride (manual / from height / default), distance unit, walking cadence. */
export function MetricsCard() {
  const { t } = useTranslation();
  const settings = useEstimationSettings();
  const heightCm = usePreferencesStore((s) => s.heightCm);
  const strideCm = usePreferencesStore((s) => s.strideCm);
  const cadenceSpm = usePreferencesStore((s) => s.cadenceSpm);
  const setHeightCm = usePreferencesStore((s) => s.setHeightCm);
  const setStrideCm = usePreferencesStore((s) => s.setStrideCm);
  const setCadenceSpm = usePreferencesStore((s) => s.setCadenceSpm);
  const distanceUnit = usePreferencesStore((s) => s.distanceUnit);
  const setDistanceUnit = usePreferencesStore((s) => s.setDistanceUnit);

  const strideSubtitle =
    settings.strideSource === "manual"
      ? t("settings.metrics.strideManual")
      : settings.strideSource === "height"
        ? t("settings.metrics.strideHeight")
        : t("settings.metrics.strideDefault");

  function editStride() {
    const invalid = t("settings.metrics.invalid");
    Alert.alert(t("settings.metrics.strideTitle"), t("settings.metrics.strideBody"), [
      {
        text: t("settings.metrics.setHeight"),
        onPress: () =>
          promptNumber(
            t("settings.metrics.heightTitle"),
            t("settings.metrics.heightBody", HEIGHT_LIMITS_CM),
            heightCm,
            HEIGHT_LIMITS_CM,
            invalid,
            (value) => {
              setHeightCm(value);
              // Height only drives stride when no manual stride overrides it.
              setStrideCm(null);
            },
          ),
      },
      {
        text: t("settings.metrics.setStride"),
        onPress: () =>
          promptNumber(
            t("settings.metrics.strideTitle"),
            t("settings.metrics.strideInputBody", STRIDE_LIMITS_CM),
            strideCm ?? Math.round(settings.strideMeters * 100),
            STRIDE_LIMITS_CM,
            invalid,
            setStrideCm,
          ),
      },
      {
        text: t("settings.metrics.useDefault"),
        onPress: () => {
          setStrideCm(null);
          setHeightCm(null);
        },
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  }

  function editCadence() {
    promptNumber(
      t("settings.metrics.cadenceTitle"),
      t("settings.metrics.cadenceBody", {
        ...CADENCE_LIMITS,
        default: ESTIMATION_DEFAULTS.cadenceSpm,
      }),
      cadenceSpm ?? ESTIMATION_DEFAULTS.cadenceSpm,
      CADENCE_LIMITS,
      t("settings.metrics.invalid"),
      (value) => setCadenceSpm(value === ESTIMATION_DEFAULTS.cadenceSpm ? null : value),
    );
  }

  return (
    <SettingsCard label={t("settings.metrics.title")}>
      <SettingsRow
        title={t("settings.metrics.stride")}
        subtitle={strideSubtitle}
        right={<ValueTag label={`${Math.round(settings.strideMeters * 100)} CM`} />}
        onPress={editStride}
        accessibilityHint={t("settings.metrics.editHint")}
      />
      <SettingsRow
        title={t("settings.metrics.cadence")}
        subtitle={t("settings.metrics.cadenceCaption")}
        right={<ValueTag label={`${settings.cadenceSpm} SPM`} />}
        onPress={editCadence}
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
