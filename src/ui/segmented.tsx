import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef, useState } from "react";
import { type LayoutRectangle, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { haptics } from "@/src/features/haptics/haptics";
import { SPRING } from "./motion";
import { useThemeColors } from "./theme-colors";
import { T } from "./typography";

interface SegmentedProps<V extends string> {
  /** `locked` draws a corner lock (e.g. a Pro range) without changing the option's size. */
  options: readonly { value: V; label: string; locked?: boolean }[];
  value: V;
  onChange: (value: V) => void;
  /** Tap on the already-selected option (e.g. reopening a chip's editor). Ignored when absent. */
  onReselect?: (value: V) => void;
  /** fill = stretches (range toggle); compact = hugs content (unit switch). */
  layout?: "fill" | "compact";
  accessibilityLabel: string;
  /** Read by VoiceOver on locked options ("Requires Pro"). */
  lockedHint?: string;
}

/**
 * Inverted-selection segmented control (DESIGN.md → Segmented Controllers). The
 * selection pill slides to the new option instead of jumping: translateX to the
 * option's measured x, scaleX from the first option's width (compact options
 * differ in width) — transform-only. The labels flip to the inverted tone when
 * the pill lands, so the new label never sits inverted on the bare track.
 * At rest the selected option also paints its own fill: release builds were seen
 * dropping the measured pill, which left an inverted label on a bare track. The
 * hairline frame keeps the track visible on sunken Settings/Today cards, whose
 * fill matches the track's.
 */
export function Segmented<V extends string>({
  options,
  value,
  onChange,
  onReselect,
  layout = "fill",
  accessibilityLabel,
  lockedHint,
}: SegmentedProps<V>) {
  const c = useThemeColors();
  const reduceMotion = useReducedMotion();
  const [layouts, setLayouts] = useState<Partial<Record<V, LayoutRectangle>>>({});
  const [inverted, setInverted] = useState(value);
  const x = useSharedValue(0);
  const scale = useSharedValue(1);
  const placed = useRef(false);

  const first = options[0];
  const base = first ? layouts[first.value] : undefined;
  const target = layouts[value];

  useEffect(() => {
    if (!target || !base) return;
    const nextScale = target.width / base.width;
    // Mount (and Reduce Motion) place the pill without a slide — opening a screen is still.
    if (!placed.current || reduceMotion) {
      placed.current = true;
      x.set(target.x - base.x);
      scale.set(nextScale);
      setInverted(value);
      return;
    }
    scale.set(withSpring(nextScale, SPRING.settle));
    x.set(
      withSpring(target.x - base.x, SPRING.settle, (finished) => {
        if (finished) scheduleOnRN(setInverted, value);
      }),
    );
  }, [target, base, value, reduceMotion, x, scale]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { scaleX: scale.get() }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      className={`flex-row rounded-lg border border-border-hairline bg-surface-sunken p-1 ${layout === "fill" ? "w-full" : "self-start"}`}
    >
      {base && target ? (
        <Animated.View
          pointerEvents="none"
          className="absolute rounded bg-accent-fg"
          // Measured geometry (onLayout), not spacing: the pill starts on the first option.
          style={[
            {
              left: base.x,
              top: base.y,
              width: base.width,
              height: base.height,
              transformOrigin: "left",
            },
            pillStyle,
          ]}
        />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        const onPill = option.value === inverted && selected;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityHint={option.locked ? lockedHint : undefined}
            onLayout={(e) => {
              const next = e.nativeEvent.layout;
              setLayouts((prev) => {
                const cur = prev[option.value];
                return cur && cur.x === next.x && cur.width === next.width
                  ? prev
                  : { ...prev, [option.value]: next };
              });
            }}
            onPress={() => {
              if (selected) {
                if (!onReselect) return;
                haptics.tick();
                onReselect(option.value);
                return;
              }
              haptics.tick();
              onChange(option.value);
            }}
            className={`items-center rounded py-1.5 ${layout === "fill" ? "flex-1" : "px-4"} ${
              // Unmeasured or at rest, the selected option fills itself; mid-slide only the pill does.
              onPill || (selected && !(base && target))
                ? "bg-accent-fg"
                : selected
                  ? ""
                  : "active:opacity-60"
            }`}
          >
            <T
              variant="label"
              tone={onPill || (selected && !(base && target)) ? "on-accent" : "tertiary"}
            >
              {option.label}
            </T>
            {option.locked ? (
              // Absolute in the chip's corner: locking never shifts the labels.
              <View pointerEvents="none" className="absolute right-1 top-1">
                <MaterialIcons name="lock" size={8} color={c.textTertiary} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
