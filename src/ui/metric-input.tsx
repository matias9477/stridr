import { useRef, useState } from "react";
import {
  Pressable,
  TextInput,
  type TextInputInstance,
  type TextInputProps,
  View,
} from "react-native";
import { useThemeColors } from "./theme-colors";
import { T } from "./typography";

interface MetricInputProps extends TextInputProps {
  /** Micro label on top, like a StatTile's. */
  label: string;
  /** Trailing unit next to the value ("km", "min", "steps"). */
  unit?: string;
  error?: string | undefined;
}

/**
 * Numeric entry in the Cadence tile shape: micro label over a large Space Mono
 * value, so typing a number looks like the stat it becomes. The whole tile
 * focuses the input. Focus/error show as a hairline border — no fills.
 */
export function MetricInput({
  label,
  unit,
  error,
  onFocus,
  onBlur,
  ...inputProps
}: MetricInputProps) {
  const c = useThemeColors();
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  const border = error
    ? "border-danger-fg"
    : focused
      ? "border-text-secondary"
      : "border-transparent";

  return (
    <View className="flex-1">
      <Pressable
        accessible={false}
        onPress={() => inputRef.current?.focus()}
        className={`rounded-lg border bg-surface-card p-4 ${border}`}
      >
        <T variant="micro" tone={error ? "danger" : "tertiary"}>
          {label}
        </T>
        <View className="mt-3 flex-row items-baseline gap-1">
          <TextInput
            ref={inputRef}
            accessibilityLabel={unit ? `${label} (${unit})` : label}
            placeholderTextColor={c.textQuiet}
            maxFontSizeMultiplier={1.25}
            className="min-w-0 flex-1 p-0 font-mono-bold text-stat tracking-stat text-text-primary"
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...inputProps}
          />
          {unit ? (
            <T variant="labelPlain" tone="secondary">
              {unit}
            </T>
          ) : null}
        </View>
      </Pressable>
      {error ? (
        <T variant="bodySm" tone="danger" className="mt-1 px-1">
          {error}
        </T>
      ) : null}
    </View>
  );
}
