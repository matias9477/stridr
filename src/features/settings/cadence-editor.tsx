import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { CADENCE_LIMITS, ESTIMATION_DEFAULTS } from "@/src/features/activity/estimate";
import { haptics } from "@/src/features/haptics/haptics";
import { formatSteps } from "@/src/lib/format";
import { usePreferencesStore } from "@/src/stores/preferences";
import { ActionButton } from "@/src/ui/action-button";
import { Chip } from "@/src/ui/chip";
import { RulerPanel } from "@/src/ui/ruler-panel";
import { Screen } from "@/src/ui/screen";
import { T } from "@/src/ui/typography";

/** Reference walk for the preview line — a typical logged walk. */
const PREVIEW_MINUTES = 30;
/** Research bands: ≥100 spm is moderate walking, ≥130 is brisk (see estimate.ts). */
const MODERATE_SPM = 100;
const BRISK_SPM = 130;

function paceKey(spm: number) {
  if (spm >= BRISK_SPM) return "settings.metrics.paceBrisk";
  if (spm >= MODERATE_SPM) return "settings.metrics.paceModerate";
  return "settings.metrics.paceEasy";
}

/**
 * Settings → Walking cadence (modal): steps per minute used for duration-only
 * walks. Shows the pace band and what a 30-minute walk becomes, so the number
 * means something. Saving the default stores null (follows future default changes).
 */
export function CadenceEditor() {
  const { t } = useTranslation();
  const router = useRouter();
  const stored = usePreferencesStore((s) => s.cadenceSpm);
  const setCadenceSpm = usePreferencesStore((s) => s.setCadenceSpm);
  const [spm, setSpm] = useState(stored ?? ESTIMATION_DEFAULTS.cadenceSpm);
  const isDefault = spm === ESTIMATION_DEFAULTS.cadenceSpm;

  const onSave = () => {
    setCadenceSpm(isDefault ? null : spm);
    router.back();
  };

  const reset = isDefault ? null : (
    <Pressable
      accessibilityRole="button"
      onPressIn={() => haptics.press()}
      onPress={() => setSpm(ESTIMATION_DEFAULTS.cadenceSpm)}
      hitSlop={8}
      className="active:opacity-60"
    >
      <Chip label={t("settings.metrics.resetDefault", { value: ESTIMATION_DEFAULTS.cadenceSpm })} />
    </Pressable>
  );

  return (
    <Screen>
      <T variant="bodyMd" tone="secondary" className="mb-4">
        {t("settings.metrics.cadenceBody")}
      </T>

      <RulerPanel
        label={t("settings.metrics.cadence")}
        headerRight={reset}
        value={spm}
        min={CADENCE_LIMITS.min}
        max={CADENCE_LIMITS.max}
        onChange={setSpm}
        unit="SPM"
        labelEvery={10}
        accessibilityValue={t("settings.metrics.spmA11y", { value: spm })}
        decreaseLabel={t("onboarding.calibrate.decrease")}
        increaseLabel={t("onboarding.calibrate.increase")}
        fineLabel={t("onboarding.calibrate.fine")}
        footer={
          <View className="gap-2 rounded bg-surface-raised p-3" accessible>
            <View className="flex-row items-center justify-between">
              <T variant="micro" tone="tertiary">
                {t("settings.metrics.preview", { minutes: PREVIEW_MINUTES })}
              </T>
              <T variant="headline">{formatSteps(spm * PREVIEW_MINUTES)}</T>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-text-tertiary" />
              <T variant="micro" tone="quiet">
                {t(paceKey(spm))}
              </T>
            </View>
          </View>
        }
      />

      <T variant="bodySm" tone="tertiary" className="mt-4 px-1">
        {t("settings.metrics.cadenceHint")}
      </T>

      <View className="mt-6 gap-3">
        <ActionButton label={t("common.save")} onPress={onSave} />
        <ActionButton
          label={t("common.cancel")}
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
