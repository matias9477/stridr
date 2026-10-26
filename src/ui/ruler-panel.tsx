import type { ReactNode } from "react";
import { View } from "react-native";
import { IconButton } from "./action-button";
import { Panel, PanelHeader } from "./panel";
import { ScrubRuler } from "./scrub-ruler";
import { T } from "./typography";

interface RulerPanelProps {
  label: string;
  /** Trailing header element (unit switch, reset chip). */
  headerRight?: ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Big centered readout; defaults to the raw value. */
  display?: string;
  /** Unit next to the readout ("CM", "SPM"). */
  unit?: string;
  labelEvery: number;
  formatLabel?: (value: number) => string;
  /** Spoken value, e.g. "75 centimeters". */
  accessibilityValue: string;
  decreaseLabel: string;
  increaseLabel: string;
  fineLabel: string;
  /** Rendered under the steppers (a derived preview, a hint). */
  footer?: ReactNode;
}

/**
 * A single number picked on a tape measure: display readout, ScrubRuler, ±
 * fine steps — the onboarding height step's shape, for any bounded integer.
 * Clamps every change into [min, max].
 */
export function RulerPanel({
  label,
  headerRight,
  value,
  min,
  max,
  onChange,
  display,
  unit,
  labelEvery,
  formatLabel = String,
  accessibilityValue,
  decreaseLabel,
  increaseLabel,
  fineLabel,
  footer,
}: RulerPanelProps) {
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <Panel className="gap-4">
      <PanelHeader label={label} right={headerRight} />

      <View className="items-center" importantForAccessibility="no-hide-descendants">
        <View className="flex-row items-baseline gap-1">
          <T variant="display">{display ?? String(value)}</T>
          {unit ? (
            <T variant="label" tone="secondary">
              {unit}
            </T>
          ) : null}
        </View>
      </View>

      <ScrubRuler
        min={min}
        max={max}
        value={value}
        onChange={set}
        labelEvery={labelEvery}
        formatLabel={formatLabel}
        accessibilityLabel={label}
        accessibilityValue={accessibilityValue}
      />

      <View className="flex-row items-center justify-between">
        <IconButton
          icon="remove"
          onPress={() => set(value - 1)}
          disabled={value <= min}
          accessibilityLabel={decreaseLabel}
        />
        <T variant="micro" tone="tertiary">
          {fineLabel}
        </T>
        <IconButton
          icon="add"
          onPress={() => set(value + 1)}
          disabled={value >= max}
          accessibilityLabel={increaseLabel}
        />
      </View>

      {footer}
    </Panel>
  );
}
