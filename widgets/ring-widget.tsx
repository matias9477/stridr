import { Gauge, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  gaugeStyle,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  scaleEffect,
  tint,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { StepsWidgetProps } from "./steps-widget";

/** The ring reads a slice of the Steps snapshot — WidgetSync pushes the same payload to both. */
export type RingWidgetProps = Pick<
  StepsWidgetProps,
  "url" | "hasData" | "stepsCompact" | "percentText" | "progress" | "emptyText"
>;

/**
 * Home-screen twin of the circular lock-screen widget: the walker and "14.8k"
 * inside a goal ring, the percentage under it. A separate widget kind because
 * the Steps widget already owns systemSmall.
 */
const RingWidgetComponent = (props: RingWidgetProps, env: WidgetEnvironment) => {
  "widget";

  // Serialized alone into the widget process — keep in sync with steps-widget THEME.
  const THEME = {
    light: { page: "#f9f9f9", primary: "#000000", tertiary: "#7e7576" },
    dark: { page: "#131313", primary: "#ffffff", tertiary: "#8e9192" },
  };
  // The system circular gauge is lock-screen sized (~58pt); scale it up to fill a 2×2.
  const RING_SCALE = 1.7;
  const theme = env.colorScheme === "light" ? THEME.light : THEME.dark;
  const hasGoal = props.progress >= 0;
  const progress = Math.min(1, Math.max(0, props.progress));
  const mono = (size: number) => font({ size, weight: "bold", design: "monospaced" });

  const center = (
    <VStack spacing={1}>
      <Image systemName="figure.walk" size={12} color={theme.primary} />
      <Text
        modifiers={[
          mono(11),
          monospacedDigit(),
          foregroundStyle(theme.primary),
          minimumScaleFactor(0.6),
          lineLimit(1),
        ]}
      >
        {props.hasData ? props.stepsCompact : "—"}
      </Text>
    </VStack>
  );

  return (
    <VStack
      spacing={0}
      modifiers={[widgetURL(props.url), containerBackground(theme.page, "widget")]}
    >
      <Spacer />
      <Gauge
        value={hasGoal ? progress : 0}
        modifiers={[gaugeStyle("circularCapacity"), tint(theme.primary), scaleEffect(RING_SCALE)]}
        currentValueLabel={center}
      />
      <Spacer />
      <Text modifiers={[mono(10), foregroundStyle(theme.tertiary), lineLimit(1)]}>
        {props.hasData ? props.percentText : props.emptyText}
      </Text>
    </VStack>
  );
};

export default createWidget<RingWidgetProps>("StepsRing", RingWidgetComponent);
