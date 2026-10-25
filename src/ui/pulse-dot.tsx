import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { DURATION } from "./motion";

/**
 * The live-status dot from the design (brand mark, "Synced", "Active").
 * Blinks (lit, quick off/on) only while `pulse` is true and Reduce Motion is off — infinite
 * repeats are not allowed under Reduce Motion (CLAUDE.md → Motion).
 */
export function PulseDot({ pulse = false, size = "sm" }: { pulse?: boolean; size?: "sm" | "md" }) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!pulse || reduceMotion) {
      opacity.set(1);
      return;
    }
    opacity.set(
      withRepeat(
        withSequence(
          withDelay(DURATION.blinkHold, withTiming(0.1, { duration: DURATION.blink })),
          withTiming(1, { duration: DURATION.blink }),
        ),
        -1,
      ),
    );
  }, [pulse, reduceMotion, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.View
      accessible={false}
      style={style}
      className={`rounded-full bg-accent-fg ${size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"}`}
    />
  );
}
