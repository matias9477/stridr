import { View } from "react-native";
import { T } from "@/src/ui/typography";

/**
 * The app icon's mark rebuilt from Views so it stays crisp at any export size
 * and follows the theme. Geometry is measured off assets/images/icon.png
 * (1024 units, cropped to the mark). Bar tones are opacity steps of
 * accent-fg: grey-on-black in dark, the same ramp inverted in light.
 */
const MARK = {
  width: 690,
  height: 552,
  barWidth: 62,
  /** Bars as [left, top, opacity] in mark units; all share the same bottom. */
  bars: [
    [6, 337, 0.2],
    [101, 214, 0.4],
    [198, 97, 0.67],
    [295, 0, 1],
    [392, 117, 1],
    [489, 226, 0.53],
    [588, 354, 0.27],
  ],
  barBottom: 473,
  baseline: { left: 0, right: 622, top: 537, thickness: 10 },
  dot: { left: 674, top: 534, size: 16 },
} as const;

/**
 * Mark geometry is proportional to `height`, so it's computed — the one place
 * a primitive positions in raw points (like BarChart's percent offsets).
 */
export function BrandMark({ height }: { height: number }) {
  const u = height / MARK.height;
  return (
    <View style={{ width: MARK.width * u, height }}>
      {MARK.bars.map(([left, top, opacity]) => (
        <View
          key={left}
          className="absolute rounded-full bg-accent-fg"
          style={{
            left: left * u,
            top: top * u,
            width: MARK.barWidth * u,
            height: (MARK.barBottom - top) * u,
            opacity,
          }}
        />
      ))}
      <View
        className="absolute rounded-full bg-accent-fg"
        style={{
          left: MARK.baseline.left * u,
          top: MARK.baseline.top * u,
          width: (MARK.baseline.right - MARK.baseline.left) * u,
          height: Math.max(1, MARK.baseline.thickness * u),
        }}
      />
      <View
        className="absolute rounded-full bg-accent-fg"
        style={{
          left: MARK.dot.left * u,
          top: MARK.dot.top * u,
          width: MARK.dot.size * u,
          height: MARK.dot.size * u,
        }}
      />
    </View>
  );
}

/** Mark + lowercase wordmark, side by side. The brand never translates. */
export function BrandLockup({ allowFontScaling = true }: { allowFontScaling?: boolean }) {
  return (
    <View className="flex-row items-center gap-2" accessible accessibilityLabel="stridr">
      <BrandMark height={20} />
      <T variant="headline" allowFontScaling={allowFontScaling}>
        stridr
      </T>
    </View>
  );
}
