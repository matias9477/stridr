import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { haptics } from "@/src/features/haptics/haptics";
import { DURATION } from "./motion";
import { T } from "./typography";

/**
 * Bar tones, monochrome (DESIGN.md → Step Histograms):
 * peak = solid primary · strong = high bars · base = ordinary history ·
 * muted = low / partial · none = no data (a stub, never a zero-height bar
 * that reads as "0 steps").
 */
export type BarTone = "peak" | "strong" | "base" | "muted" | "none";

const FILL: Record<BarTone, string> = {
  peak: "bg-accent-fg",
  strong: "bg-text-tertiary",
  base: "bg-surface-highest",
  muted: "bg-surface-high",
  none: "bg-surface-raised",
};

export interface Bar {
  key: string;
  value: number | null;
  tone: BarTone;
  accessibilityLabel: string;
  /** Goal reference for this bar; consecutive equal goals join into one dashed segment. */
  goal?: number | null;
}

interface GoalRun {
  value: number;
  start: number;
  length: number;
}

/** Consecutive bars sharing a goal → one segment each; goal-off bars leave a gap. */
function goalRuns(bars: readonly Bar[]): GoalRun[] {
  const runs: GoalRun[] = [];
  bars.forEach((bar, i) => {
    const goal = bar.goal ?? null;
    if (goal === null) return;
    const last = runs[runs.length - 1];
    if (last && last.value === goal && last.start + last.length === i) last.length++;
    else runs.push({ value: goal, start: i, length: 1 });
  });
  return runs;
}

interface BarChartProps {
  bars: readonly Bar[];
  /** Value mapped to full height. */
  max: number;
  /** Tailwind height class of the plot area. */
  heightClass: string;
  /** Label for the goal line, given the labelled segment's value. Omit to hide the line. */
  goalLabel?: (value: number) => string;
  /** Small inverse tag above one bar ("MAX"). */
  tag?: { key: string; label: string } | null;
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
  /** Tailwind gap between bars; dense charts use gap-px. */
  gapClass?: string;
}

/** Stub height for no-data bars, as a % of the plot. */
const NO_DATA_STUB = 3;
/** Floor for real but tiny values so they stay visible. */
const MIN_VISIBLE = 4;

export function BarChart({
  bars,
  max,
  heightClass,
  goalLabel,
  tag,
  selectedKey,
  onSelect,
  gapClass = "gap-1",
}: BarChartProps) {
  const safeMax = max > 0 ? max : 1;
  const barPct = (value: number | null) =>
    value === null ? NO_DATA_STUB : Math.max(MIN_VISIBLE, Math.min(100, (value / safeMax) * 100));
  const tagIndex = tag ? bars.findIndex((b) => b.key === tag.key) : -1;
  // The goal label sits on the side away from the tag, so a peak near the goal can't cover it.
  const labelLeft = tagIndex >= bars.length / 2;
  const runs = goalLabel ? goalRuns(bars) : [];
  const labelled = labelLeft ? runs[0] : runs[runs.length - 1];

  return (
    <View className={`relative ${heightClass}`}>
      {runs.map((run) => (
        // Percent offsets are layout geometry, not spacing tokens.
        <View
          key={run.start}
          pointerEvents="none"
          className="absolute z-10"
          style={{
            bottom: `${Math.min(100, (run.value / safeMax) * 100)}%`,
            left: `${(run.start / bars.length) * 100}%`,
            width: `${(run.length / bars.length) * 100}%`,
          }}
        >
          <View className="border-t border-dashed border-text-quiet" />
          {run === labelled && goalLabel ? (
            <View
              className={`absolute -top-4 ${labelLeft ? "left-0" : "right-0"} rounded-sm bg-surface-sunken px-1`}
            >
              <T variant="micro" tone="tertiary" numberOfLines={1}>
                {goalLabel(run.value)}
              </T>
            </View>
          ) : null}
        </View>
      ))}
      <View className={`h-full flex-row items-end ${gapClass}`}>
        {bars.map((bar, i) => {
          const pct = barPct(bar.value);
          const selected = selectedKey === bar.key;
          const content = (
            // Keyed only to satisfy the linter; the outer element carries the real key.
            <View key={bar.key} className="h-full justify-end">
              <GrowBar
                pct={pct}
                // Spread over a fixed sweep so a 90-bar chart lands as fast as a 7-bar one.
                delay={bars.length > 1 ? (i / (bars.length - 1)) * DURATION.sweep : 0}
                className={`w-full rounded-sm ${FILL[bar.tone]} ${selected ? "border border-text-primary" : ""}`}
              />
            </View>
          );
          return onSelect ? (
            <Pressable
              key={bar.key}
              className="h-full flex-1"
              accessibilityRole="button"
              accessibilityLabel={bar.accessibilityLabel}
              accessibilityState={{ selected }}
              onPress={() => {
                haptics.tick();
                onSelect(bar.key);
              }}
            >
              {content}
            </Pressable>
          ) : (
            <View
              key={bar.key}
              className="h-full flex-1"
              accessible
              accessibilityLabel={bar.accessibilityLabel}
            >
              {content}
            </View>
          );
        })}
      </View>
      {/* The tag is a label, not data: it gets its own layer above the goal line (the line
          crosses bars on purpose, but not text). RN orders zIndex among siblings only, so it
          can't live inside the bar row. Same slots as the row, so it lands over its bar. */}
      {tag && tagIndex !== -1 ? (
        <View
          pointerEvents="none"
          className={`absolute inset-0 z-20 flex-row items-end ${gapClass}`}
        >
          {bars.map((bar) => (
            <View key={bar.key} className="h-full flex-1 justify-end">
              {bar.key === tag.key ? (
                <>
                  <Animated.View
                    entering={FadeIn.duration(DURATION.enter).delay(DURATION.fill)}
                    className="mb-1 items-center"
                  >
                    <View className="rounded-sm bg-accent-fg px-1.5 py-0.5">
                      <T variant="micro" tone="on-accent">
                        {tag.label}
                      </T>
                    </View>
                  </Animated.View>
                  {/* Percent height is layout geometry: it mirrors the bar beneath. */}
                  <View style={{ height: `${barPct(bar.value)}%` }} />
                </>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * A bar that grows up from the baseline when it first mounts (remount the
 * chart via `key` to replay, e.g. on a range switch). Later value changes
 * resize it in place. scaleY, not height — transform-only (CLAUDE.md → Motion).
 */
function GrowBar({ pct, delay, className }: { pct: number; delay: number; className: string }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    scale.set(
      withDelay(
        delay,
        withTiming(1, { duration: DURATION.fill, easing: Easing.out(Easing.cubic) }),
      ),
    );
    // Re-running after the entrance is a no-op (already at 1), so this plays once per mount.
  }, [delay, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleY: scale.get() }] }));

  return (
    <Animated.View
      className={className}
      style={[{ height: `${pct}%`, transformOrigin: "bottom" }, style]}
    />
  );
}
