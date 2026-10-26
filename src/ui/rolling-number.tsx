import { useEffect, useRef } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { haptics } from "@/src/features/haptics/haptics";
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
  /**
   * Detent ticks as the digits roll — for values the user is changing (a
   * stepper), never for passive data updates. Silent on mount.
   */
  haptic?: boolean;
}

/**
 * Odometer counter: each digit is a 0–9 strip clipped to one line that rolls
 * to its place — up from 0 when it first appears, then digit by digit when the
 * value changes. Separators and letters render static. Digits are keyed from
 * the right, so 999 → 1,000 rolls the units as units. Space Mono is
 * monospaced, so the width never jumps mid-roll. Reduce Motion lands
 * instantly.
 */
export function RollingNumber({
  value,
  variant,
  tone,
  accessibilityLabel,
  haptic = false,
}: RollingNumberProps) {
  useRollHaptic(value, haptic);
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

/** Max detent ticks per change — a 9-position roll shouldn't buzz like a motor. */
const MAX_TICKS = 6;

/**
 * Ticks once per digit position crossed by the digit that travels furthest,
 * timed to its ease-out curve so the clicks slow down as the strip settles.
 * Digits pair up from the right, the same way the strips are keyed.
 */
function useRollHaptic(value: string, enabled: boolean) {
  const reduceMotion = useReducedMotion();
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (!enabled || from === value) return;
    if (reduceMotion) {
      haptics.tick();
      return;
    }

    const next = [...value];
    const prev = [...from];
    let distance = 0;
    let delay = 0;
    next.forEach((char, i) => {
      const digit = DIGITS.indexOf(char as (typeof DIGITS)[number]);
      if (digit === -1) return;
      const before = DIGITS.indexOf(prev[prev.length - next.length + i] as (typeof DIGITS)[number]);
      const travel = Math.abs(digit - Math.max(before, 0));
      if (travel > distance) {
        distance = travel;
        delay = i * DURATION.rollStagger;
      }
    });
    if (distance === 0) return;

    const ticks = Math.min(distance, MAX_TICKS);
    const timers = Array.from({ length: ticks }, (_, k) => {
      // Inverse of easeOutCubic: when the strip reaches the (k+1)th crossing.
      const progress = 1 - (1 - (k + 1) / ticks) ** (1 / 3);
      return setTimeout(haptics.tick, delay + progress * DURATION.roll);
    });
    return () => timers.forEach(clearTimeout);
  }, [value, enabled, reduceMotion]);
}
