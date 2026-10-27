import { HStack, Image, ProgressView, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  monospacedDigit,
  tint,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";
import type { StepsWidgetProps } from "./steps-widget";

/** The bar reads a slice of the Steps snapshot — WidgetSync pushes the same payload to all widgets. */
export type BarWidgetProps = Pick<
  StepsWidgetProps,
  | "url"
  | "hasData"
  | "stepsCompact"
  | "percentText"
  | "progress"
  | "goalShort"
  | "paceText"
  | "emptyText"
>;

/**
 * Home-screen twin of the rectangular lock-screen widget, 4×2: percentage and
 * "14.8k" on top, and the walker travelling along the goal bar. A separate
 * widget kind because the Steps widget already owns systemMedium.
 */
const BarWidgetComponent = (props: BarWidgetProps, env: WidgetEnvironment) => {
  "widget";

  // Serialized alone into the widget process — keep in sync with steps-widget THEME.
  const THEME = {
    light: { page: "#f9f9f9", primary: "#000000", tertiary: "#7e7576" },
    dark: { page: "#131313", primary: "#ffffff", tertiary: "#8e9192" },
  };
  // Widgets can't measure, so the walker's x comes from equal flexible slots:
  // `ahead` slots before it and the rest after — 2% steps along the bar.
  const SLOTS = 50;
  const WALKER = 18;
  const theme = env.colorScheme === "light" ? THEME.light : THEME.dark;
  const hasGoal = props.progress >= 0;
  const progress = hasGoal ? Math.min(1, Math.max(0, props.progress)) : 0;
  const ahead = Math.round(progress * SLOTS);
  const mono = (size: number) => font({ size, weight: "bold", design: "monospaced" });
  // Sibling spacers split the free width evenly, which makes them proportional slots.
  const slot = (key: string) => <Spacer key={key} minLength={0} />;
  const micro = (text: string, color: string) => (
    <Text modifiers={[mono(10), foregroundStyle(color), lineLimit(1)]}>{text}</Text>
  );

  return (
    <VStack
      alignment="leading"
      spacing={6}
      modifiers={[widgetURL(props.url), containerBackground(theme.page, "widget")]}
    >
      <HStack>
        {micro(props.hasData ? props.percentText : "", theme.tertiary)}
        <Spacer />
        <Text
          modifiers={[mono(22), monospacedDigit(), foregroundStyle(theme.primary), lineLimit(1)]}
        >
          {props.hasData ? props.stepsCompact : "—"}
        </Text>
      </HStack>
      <Spacer />
      <HStack spacing={0} alignment="bottom">
        {Array.from({ length: ahead }, (_, i) => slot(`a${i}`))}
        <Image
          systemName="figure.walk"
          size={WALKER}
          color={theme.primary}
          modifiers={[frame({ width: WALKER })]}
        />
        {Array.from({ length: SLOTS - ahead }, (_, i) => slot(`b${i}`))}
      </HStack>
      <ProgressView value={progress} modifiers={[tint(theme.primary)]} />
      <HStack>
        {micro(props.hasData ? props.goalShort : props.emptyText, theme.tertiary)}
        <Spacer />
        {props.hasData ? micro(props.paceText, theme.primary) : null}
      </HStack>
    </VStack>
  );
};

export default createWidget<BarWidgetProps>("StepsBar", BarWidgetComponent);
