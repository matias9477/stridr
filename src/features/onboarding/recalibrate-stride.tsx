import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { usePreferencesStore } from "@/src/stores/preferences";
import { ActionButton } from "@/src/ui/action-button";
import { Screen } from "@/src/ui/screen";
import { T } from "@/src/ui/typography";
import { DEFAULT_HEIGHT_CM, StrideCalibration } from "./stride-calibration";

/**
 * The onboarding calibrate step as a modal (Today → stride → Calibrate). Same
 * save semantics: height is only written on Confirm, and it clears any manual
 * stride; swipe-down or Cancel leaves everything as it was.
 */
export function RecalibrateStride() {
  const { t } = useTranslation();
  const router = useRouter();
  const storedHeightCm = usePreferencesStore((s) => s.heightCm);
  const setHeightCm = usePreferencesStore((s) => s.setHeightCm);
  const setStrideCm = usePreferencesStore((s) => s.setStrideCm);
  const [heightCm, setDraftHeightCm] = useState(storedHeightCm ?? DEFAULT_HEIGHT_CM);

  const onConfirm = () => {
    setHeightCm(heightCm);
    setStrideCm(null);
    router.back();
  };

  return (
    <Screen>
      <T variant="stat" accessibilityRole="header">
        {t("onboarding.calibrate.title")}
      </T>
      <T variant="bodyMd" tone="secondary" className="mb-6 mt-2">
        {t("onboarding.calibrate.body")}
      </T>
      <StrideCalibration heightCm={heightCm} onChange={setDraftHeightCm} />
      <View className="mt-6 gap-3">
        <ActionButton label={t("onboarding.calibrate.confirm")} onPress={onConfirm} />
        <ActionButton
          label={t("common.cancel")}
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    </Screen>
  );
}
