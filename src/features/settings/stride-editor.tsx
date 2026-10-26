import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  ESTIMATION_DEFAULTS,
  STRIDE_LIMITS_CM,
  type StrideSource,
} from "@/src/features/activity/estimate";
import { useEstimationSettings } from "@/src/features/activity/use-estimation-settings";
import { DEFAULT_HEIGHT_CM, StrideCalibration } from "@/src/features/onboarding/stride-calibration";
import { usePreferencesStore } from "@/src/stores/preferences";
import { ActionButton } from "@/src/ui/action-button";
import { Panel, PanelHeader } from "@/src/ui/panel";
import { RulerPanel } from "@/src/ui/ruler-panel";
import { Screen } from "@/src/ui/screen";
import { Segmented } from "@/src/ui/segmented";
import { T } from "@/src/ui/typography";

const DEFAULT_STRIDE_CM = Math.round(ESTIMATION_DEFAULTS.strideMeters * 100);

/** A tip under a panel: dot + quiet micro copy, like the calibration formula line. */
function Hint({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-1.5 rounded bg-surface-raised p-3">
      <View className="mt-1 h-1.5 w-1.5 rounded-full bg-text-tertiary" />
      <T variant="bodySm" tone="tertiary" className="flex-1">
        {text}
      </T>
    </View>
  );
}

/**
 * Settings → Step length (modal). One source at a time — from height, manual,
 * or the average default — mirroring how estimate.ts resolves it. Nothing is
 * written until Save; Cancel or swipe-down leaves the stored values as they were.
 */
export function StrideEditor() {
  const { t } = useTranslation();
  const router = useRouter();
  const { strideMeters, strideSource } = useEstimationSettings();
  const storedHeightCm = usePreferencesStore((s) => s.heightCm);
  const setHeightCm = usePreferencesStore((s) => s.setHeightCm);
  const setStrideCm = usePreferencesStore((s) => s.setStrideCm);

  const [source, setSource] = useState<StrideSource>(strideSource);
  const [heightCm, setDraftHeightCm] = useState(storedHeightCm ?? DEFAULT_HEIGHT_CM);
  const [strideCm, setDraftStrideCm] = useState(Math.round(strideMeters * 100));

  const onSave = () => {
    if (source === "height") {
      setHeightCm(heightCm);
      // Height only drives stride when no manual stride overrides it.
      setStrideCm(null);
    } else if (source === "manual") {
      setStrideCm(strideCm);
    } else {
      setStrideCm(null);
      setHeightCm(null);
    }
    router.back();
  };

  return (
    <Screen>
      <T variant="bodyMd" tone="secondary" className="mb-4">
        {t("settings.metrics.strideBody")}
      </T>
      <View className="mb-4">
        <Segmented<StrideSource>
          accessibilityLabel={t("settings.metrics.sourceA11y")}
          value={source}
          onChange={setSource}
          options={[
            { value: "height", label: t("settings.metrics.sourceHeight") },
            { value: "manual", label: t("settings.metrics.sourceManual") },
            { value: "default", label: t("settings.metrics.sourceDefault") },
          ]}
        />
      </View>

      {source === "height" ? (
        <StrideCalibration heightCm={heightCm} onChange={setDraftHeightCm} />
      ) : source === "manual" ? (
        <RulerPanel
          label={t("settings.metrics.stride")}
          value={strideCm}
          min={STRIDE_LIMITS_CM.min}
          max={STRIDE_LIMITS_CM.max}
          onChange={setDraftStrideCm}
          unit="CM"
          labelEvery={10}
          accessibilityValue={t("onboarding.calibrate.cmA11y", { value: strideCm })}
          decreaseLabel={t("onboarding.calibrate.decrease")}
          increaseLabel={t("onboarding.calibrate.increase")}
          fineLabel={t("onboarding.calibrate.fine")}
          footer={<Hint text={t("settings.metrics.manualHint")} />}
        />
      ) : (
        <Panel className="gap-4">
          <PanelHeader label={t("settings.metrics.stride")} />
          <View className="flex-row items-baseline justify-center gap-1 py-2">
            <T variant="display">{String(DEFAULT_STRIDE_CM)}</T>
            <T variant="label" tone="secondary">
              CM
            </T>
          </View>
          <Hint text={t("settings.metrics.defaultHint")} />
        </Panel>
      )}

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
