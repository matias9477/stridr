import { useEffect } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { DURATION } from "./motion";
import { T, type TypeRole } from "./typography";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

interface RollingNumberProps {
  /** Already formatted ("8,421", "4.2", "2h 14m"); only the digits roll. */
  value: string;
  variant: TypeRole;
  tone?: Parameters<typeof T>[0]["tone"];
  /** Spoken instead of the digit strips; defaults to `value`. */
  accessibilityLabel?: string;
}

/**
 * Odometer counter: each digit is a 0–9 strip clipped to one line that rolls
 * to its place — up from 0 when it first appears, then digit by digit when the
 * value changes. Separators and letters render static. Digits are keyed from
 * the right, so 999 → 1,000 rolls the units as units. Space Mono is
 * monospaced, so the width never jumps mid-roll. Reduce Motion lands
 * instantly.
 */
export function RollingNumber({ value, variant, tone, accessibilityLabel }: RollingNumberProps) {
  const chars = [...value];
  return (
    <View accessible accessibilityLabel={accessibilityLabel ?? value} className="flex-row">
      {chars.map((char, i) => {
        const fromRight = chars.length - 1 - i;
        const digit = DIGITS.indexOf(char as (typeof DIGITS)[number]);
        return digit === -1 ? (
          <T key={`s${fromRight}`} variant={variant} tone={tone}>
            {char}
          </T>
        ) : (
          <Digit
            key={`d${fromRight}`}
            digit={digit}
            // Leftmost digits start first, like a mechanical counter settling.
            delay={i * DURATION.rollStagger}
            variant={variant}
            tone={tone}
          />
        );
      })}
    </View>
  );
}

function Digit({
  digit,
  delay,
  variant,
  tone,
}: {
  digit: number;
  delay: number;
  variant: TypeRole;
  tone: RollingNumberProps["tone"];
}) {
  const reduceMotion = useReducedMotion();
  const lineHeight = useSharedValue(0);
  // Position in digits (0–9), so a late layout measurement can't strand the strip.
  const position = useSharedValue(0);

  useEffect(() => {
    position.set(
      reduceMotion
        ? digit
        : withDelay(
            delay,
            withTiming(digit, { duration: DURATION.roll, easing: Easing.out(Easing.cubic) }),
          ),
    );
  }, [digit, delay, reduceMotion, position]);

  const strip = useAnimatedStyle(() => ({
    transform: [{ translateY: -position.get() * lineHeight.get() }],
  }));

  return (
    <View className="overflow-hidden">
      {/* Ghost reserves exactly one glyph cell; the strip slides inside it. */}
      <T
        variant={variant}
        className="opacity-0"
        onLayout={(e: LayoutChangeEvent) => lineHeight.set(e.nativeEvent.layout.height)}
      >
        0
      </T>
      <Animated.View className="absolute left-0 right-0 top-0" style={strip}>
        {DIGITS.map((d) => (
          <T key={d} variant={variant} tone={tone}>
            {d}
          </T>
        ))}
      </Animated.View>
    </View>
  );
}
