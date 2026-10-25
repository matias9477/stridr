import { useEffect, useState } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { DURATION } from "./motion";
import { useThemeColors } from "./theme-colors";

interface FieldProps extends TextInputProps {
  label: string;
  error?: string | undefined;
}

/** Floated label: shrinks to 75% and rises into the top padding of the box. */
const FLOAT_SCALE = 0.75;
const FLOAT_Y = -14;

/**
 * Floating-label text input — pairs with react-hook-form's Controller.
 * The label sits inside the box like a placeholder; on focus or once there's a
 * value it floats up and stays as the field's title. `placeholder` becomes a
 * hint shown only while focused and empty. No stacked title above the box:
 * long forms stay compact.
 */
export function Field({
  label,
  error,
  placeholder,
  onFocus,
  onBlur,
  onChangeText,
  ...inputProps
}: FieldProps) {
  const c = useThemeColors();
  const reduceMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);
  // Tracks typing for uncontrolled use; controlled `value` wins when given.
  const [typed, setTyped] = useState(inputProps.defaultValue ?? "");
  const hasValue = (inputProps.value ?? typed).length > 0;
  const floated = focused || hasValue;

  const progress = useSharedValue(floated ? 1 : 0);
  useEffect(() => {
    progress.set(withTiming(floated ? 1 : 0, { duration: reduceMotion ? 0 : DURATION.label }));
  }, [floated, reduceMotion, progress]);

  const activeColor = error ? c.dangerFg : focused ? c.textSecondary : c.textTertiary;
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.get(), [0, 1], [c.textTertiary, activeColor]),
    transform: [
      { translateY: interpolate(progress.get(), [0, 1], [0, FLOAT_Y]) },
      { scale: interpolate(progress.get(), [0, 1], [1, FLOAT_SCALE]) },
    ],
  }));

  const borderClass = error
    ? "border-danger-fg"
    : focused
      ? "border-text-secondary"
      : "border-border-hairline";

  return (
    <View className="mb-3">
      <View className={`min-h-14 rounded-xl border bg-surface-card ${borderClass}`}>
        <Animated.Text
          // Decorative twin of accessibilityLabel below; taps fall through to the input.
          pointerEvents="none"
          accessible={false}
          numberOfLines={1}
          className="absolute left-4 right-4 top-4 text-base"
          style={[{ transformOrigin: "left center" }, labelStyle]}
        >
          {label}
        </Animated.Text>
        <TextInput
          accessibilityLabel={label}
          placeholder={focused && !hasValue ? placeholder : undefined}
          placeholderTextColor={c.textTertiary}
          className="px-4 pb-2 pt-6 text-base text-text-primary"
          textAlignVertical="top"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onChangeText={(text) => {
            setTyped(text);
            onChangeText?.(text);
          }}
          {...inputProps}
        />
      </View>
      {error ? <Text className="mt-1 px-4 text-sm text-danger-fg">{error}</Text> : null}
    </View>
  );
}
