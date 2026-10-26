import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { HEIGHT_LIMITS_CM, HEIGHT_TO_STRIDE } from "@/src/features/activity/estimate";
import { usePreferencesStore } from "@/src/stores/preferences";
import { IconButton } from "@/src/ui/action-button";
import { Panel, PanelHeader } from "@/src/ui/panel";
import { ScrubRuler } from "@/src/ui/scrub-ruler";
import { Segmented } from "@/src/ui/segmented";
import { useThemeColors } from "@/src/ui/theme-colors";
import { T } from "@/src/ui/typography";

/** Starting point for the height ruler when none is saved yet. */
export const DEFAULT_HEIGHT_CM = 170;

type HeightUnit = "cm" | "ftin";

const CM_PER_INCH = 2.54;
const HEIGHT_LIMITS_IN = {
  min: Math.ceil(HEIGHT_LIMITS_CM.min / CM_PER_INCH),
  max: Math.floor(HEIGHT_LIMITS_CM.max / CM_PER_INCH),
};

const feetInches = (inches: number) => `${Math.floor(inches / 12)}′${inches % 12}″`;

/**
 * Height picker (onboarding and the recalibrate modal): a tape-measure scrubber plus ± fine steps,
 * in cm or ft/in (display only — height is always stored in cm). The stride
 * preview is the rounded value estimates will actually use (estimate.ts).
 */
export function StrideCalibration({
  heightCm,
  onChange,
}: {
  heightCm: number;
  onChange: (cm: number) => void;
}) {
  const { t } = useTranslation();
  const c = useThemeColors();
  const distanceUnit = usePreferencesStore((s) => s.distanceUnit);
  const [unit, setUnit] = useState<HeightUnit>(distanceUnit === "mi" ? "ftin" : "cm");

  const metric = unit === "cm";
  const limits = metric ? HEIGHT_LIMITS_CM : HEIGHT_LIMITS_IN;
  const value = metric ? heightCm : Math.round(heightCm / CM_PER_INCH);
  const setValue = (next: number) => {
    const clamped = Math.min(limits.max, Math.max(limits.min, next));
    onChange(metric ? clamped : Math.round(clamped * CM_PER_INCH));
  };

  const strideCm = Math.round(heightCm * HEIGHT_TO_STRIDE);
  const display = metric ? String(value) : feetInches(value);

  return (
    <Panel className="gap-4">
      <PanelHeader
        label={t("onboarding.calibrate.height")}
        right={
          <Segmented<HeightUnit>
            layout="compact"
            accessibilityLabel={t("onboarding.calibrate.unit")}
            value={unit}
            onChange={setUnit}
            options={[
              { value: "cm", label: "CM" },
              { value: "ftin", label: "FT / IN" },
            ]}
          />
        }
      />

      <View className="items-center" importantForAccessibility="no-hide-descendants">
        <View className="flex-row items-baseline gap-1">
          <T variant="display">{display}</T>
          {metric ? (
            <T variant="label" tone="secondary">
              CM
            </T>
          ) : null}
        </View>
      </View>

      <ScrubRuler
        key={unit}
        min={limits.min}
        max={limits.max}
        value={value}
        onChange={setValue}
        labelEvery={metric ? 5 : 6}
        formatLabel={metric ? String : feetInches}
        accessibilityLabel={t("onboarding.calibrate.height")}
        accessibilityValue={
          metric
            ? t("onboarding.calibrate.cmA11y", { value })
            : t("onboarding.calibrate.ftInA11y", {
                feet: Math.floor(value / 12),
                inches: value % 12,
              })
        }
      />

      <View className="flex-row items-center justify-between">
        <IconButton
          icon="remove"
          onPress={() => setValue(value - 1)}
          disabled={value <= limits.min}
          accessibilityLabel={t("onboarding.calibrate.decrease")}
        />
        <T variant="micro" tone="tertiary">
          {t("onboarding.calibrate.fine")}
        </T>
        <IconButton
          icon="add"
          onPress={() => setValue(value + 1)}
          disabled={value >= limits.max}
          accessibilityLabel={t("onboarding.calibrate.increase")}
        />
      </View>

      <View className="gap-2 rounded bg-surface-raised p-3" accessible>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <MaterialCommunityIcons name="shoe-print" size={14} color={c.textTertiary} />
            <T variant="micro" tone="tertiary">
              {t("onboarding.calibrate.stride")}
            </T>
          </View>
          <T variant="headline">
            {metric ? `${strideCm} CM` : `${(strideCm / CM_PER_INCH).toFixed(1)} IN`}
          </T>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="h-1.5 w-1.5 rounded-full bg-text-tertiary" />
          <T variant="micro" tone="quiet">
            {t("onboarding.calibrate.formula", { ratio: HEIGHT_TO_STRIDE })}
          </T>
        </View>
      </View>
    </Panel>
  );
}
