import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SPRING } from "./motion";

/**
 * Physical press feel: scales the target down on press-in and springs back on
 * release. Spread `handlers` onto a Pressable and `style` onto the wrapping
 * Animated.View. Runs on the UI thread — no re-renders per frame.
 */
export function usePressScale(pressedScale = 0.96) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const handlers = {
    onPressIn: () => scale.set(withSpring(pressedScale, SPRING.pressIn)),
    onPressOut: () => scale.set(withSpring(1, SPRING.pressOut)),
  };

  return { style, handlers };
}
