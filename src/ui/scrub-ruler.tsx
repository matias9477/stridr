import { useEffect, useRef, useState } from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  type ScrollViewInstance,
  View,
} from "react-native";
import { haptics } from "@/src/features/haptics/haptics";
import { T } from "./typography";

/** One unit of the ruler in points — must match the tick column's `w-3`. */
const TICK = 12;

interface ScrubRulerProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  /** Every Nth unit gets a tall tick and a label. */
  labelEvery: number;
  formatLabel: (value: number) => string;
  accessibilityLabel: string;
  /** Spoken value, e.g. "178 centimeters". */
  accessibilityValue: string;
}

/**
 * Horizontal tape measure under a fixed center needle: one tick per unit,
 * snapping per unit. External value changes (the ± buttons) scroll the tape;
 * scrolling reports the unit under the needle. VoiceOver uses it as an
 * adjustable (swipe up/down). Finger scrubbing ticks a haptic per unit like a
 * picker detent; programmatic scrolls stay silent (the ± press already buzzed). Remount it (`key`) when the unit system changes.
 */
export function ScrubRuler({
  min,
  max,
  value,
  onChange,
  labelEvery,
  formatLabel,
  accessibilityLabel,
  accessibilityValue,
}: ScrubRulerProps) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [width, setWidth] = useState(0);
  // The last value the tape itself reported/showed — echoing it back must not re-scroll.
  const shown = useRef(value);
  const scrubbing = useRef(false);

  useEffect(() => {
    if (shown.current === value) return;
    shown.current = value;
    scrubbing.current = false;
    scrollRef.current?.scrollTo({ x: (value - min) * TICK, animated: true });
  }, [value, min]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const raw = Math.round(e.nativeEvent.contentOffset.x / TICK) + min;
    const next = Math.min(max, Math.max(min, raw));
    if (next === shown.current) return;
    shown.current = next;
    if (scrubbing.current) haptics.tick();
    onChange(next);
  };

  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: accessibilityValue }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e) => {
        const step = e.nativeEvent.actionName === "increment" ? 1 : -1;
        onChange(Math.min(max, Math.max(min, value + step)));
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      className="h-20"
    >
      {width > 0 ? (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={TICK}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={onScroll}
          onScrollBeginDrag={() => {
            scrubbing.current = true;
          }}
          contentOffset={{ x: (value - min) * TICK, y: 0 }}
          // Half the track of padding on each side so the first/last tick can sit under the needle.
          contentContainerStyle={{ paddingHorizontal: (width - TICK) / 2 }}
        >
          {ticks.map((tick) => {
            const major = tick % labelEvery === 0;
            return (
              <View key={tick} className="w-3 items-center pt-3">
                <View className={major ? "h-8 w-0.5 bg-text-primary" : "h-4 w-px bg-text-quiet"} />
                {major ? (
                  <T
                    variant="micro"
                    tone="tertiary"
                    numberOfLines={1}
                    className="mt-2 w-12 text-center"
                  >
                    {formatLabel(tick)}
                  </T>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      ) : null}
      <View pointerEvents="none" className="absolute inset-0 items-center">
        <View className="h-2 w-2 rounded-full bg-text-primary" />
        <View className="h-14 w-0.5 bg-text-primary" />
      </View>
    </View>
  );
}
