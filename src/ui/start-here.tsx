import Ionicons from "@expo/vector-icons/Ionicons";
import { type ComponentProps, useEffect } from "react";
import { Platform, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { DURATION, SPRING } from "./motion";
import { useThemeColors } from "./theme-colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

const GUIDES: { icon: IconName; label: string }[] = [
  { icon: "book-outline", label: "CLAUDE.md" },
  { icon: "color-palette-outline", label: "DESIGN.md" },
  { icon: "map-outline", label: "TODO.md" },
];

const MONO = Platform.select({ ios: "Menlo", default: "monospace" });

/**
 * PLACEHOLDER from create-mt-app — the "edit page.tsx to get started" screen.
 * Home shows it as its empty state in dev builds only. When you build Home,
 * delete this file and its branch in app/(tabs)/(home)/index.tsx; EmptyState
 * (src/ui/state-views.tsx) is the real empty state. English-only on purpose:
 * it never ships.
 */
export function StartHere() {
  const c = useThemeColors();
  const reduceMotion = useReducedMotion();

  // Entrance: the tile pops in with a small twist (one-shot, stays with Reduce Motion).
  const pop = useSharedValue(0);
  // Idle: the sparkles breathe. A loop, so it's skipped under Reduce Motion.
  const breathe = useSharedValue(0);

  useEffect(() => {
    pop.set(withSpring(1, SPRING.pop));
    if (reduceMotion) return;
    const half = { duration: DURATION.breathe, easing: Easing.inOut(Easing.sin) };
    breathe.set(
      withDelay(
        DURATION.enter,
        withRepeat(withSequence(withTiming(1, half), withTiming(0, half)), -1),
      ),
    );
  }, [pop, breathe, reduceMotion]);

  const tileStyle = useAnimatedStyle(() => ({
    opacity: Math.min(pop.get() * 2, 1),
    transform: [{ scale: 0.6 + pop.get() * 0.4 }, { rotate: `${(1 - pop.get()) * -12}deg` }],
  }));
  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.get() * 0.12 }, { rotate: `${breathe.get() * 8}deg` }],
  }));

  return (
    <View className="flex-1 items-center px-8 pt-20">
      <Animated.View
        className="h-24 w-24 items-center justify-center rounded-3xl bg-accent-fg"
        style={tileStyle}
      >
        <Animated.View style={sparkleStyle}>
          <Ionicons name="sparkles" size={44} color={c.accentOn} />
        </Animated.View>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.duration(DURATION.enter).delay(DURATION.stagger * 2)}
        className="mt-6 text-sm text-text-tertiary"
      >
        Get started by editing
      </Animated.Text>
      <Animated.View
        entering={FadeInDown.duration(DURATION.enter).delay(DURATION.stagger * 3)}
        className="mt-2 rounded-lg bg-surface-sunken px-3 py-1.5"
      >
        <Text className="text-sm text-text-primary" style={{ fontFamily: MONO }}>
          app/(tabs)/(home)/index.tsx
        </Text>
      </Animated.View>

      <View className="mt-12 flex-row">
        {GUIDES.map((guide, i) => (
          <Animated.View
            key={guide.label}
            entering={FadeInDown.duration(DURATION.enter).delay(DURATION.stagger * (4 + i))}
            className="w-28 items-center"
          >
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-surface-card">
              <Ionicons name={guide.icon} size={24} color={c.textSecondary} />
            </View>
            <Text className="mt-2 text-xs text-text-tertiary">{guide.label}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
