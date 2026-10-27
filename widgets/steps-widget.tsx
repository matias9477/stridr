import {
  AccessoryWidgetBackground,
  Gauge,
  HStack,
  Image,
  ProgressView,
  Rectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  gaugeStyle,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  padding,
  shapes,
  tint,
  widgetURL,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

/** One labelled number: the medium widget's footer row and the large widget's tiles. */
export type WidgetMetric = {
  /** SF Symbol for the large widget's tile. */
  icon: string;
  label: string;
  /** "10.8", "2h 14m", "114" */
  value: string;
  /** "KM", "", "SPM" — after the value in the medium widget. */
  unit: string;
  /** "KILOMETERS", "MOVING TIME" — under the value in the large widget. */
  caption: string;
};

/**
 * Display-ready snapshot pushed by WidgetSync. Every string is pre-translated
 * and pre-formatted on the JS side — the widget never sees raw data or i18n keys.
 */
export type StepsWidgetProps = {
  /** Tap target: "stridr://", or the paywall while the widget is locked (free tier). */
  url: string;
  /** False before HealthKit access / any data: show `emptyText`. */
  hasData: boolean;
  /** "14,832" */
  steps: string;
  /** "6,143" below 10K, "14.8k" above — lock screen, ring, bar. */
  stepsCompact: string;
  /** "STEPS" — small widget header. */
  stepsLabel: string;
  /** "TODAY'S TOTAL" */
  totalLabel: string;
  /** "14:42" — when this snapshot was taken (the data is not live). */
  timeText: string;
  /** "UPDATED 14:42" */
  updatedText: string;
  /** "+2.4K AHEAD" / "−800 BEHIND", "" before the pace window or without a goal. */
  paceText: string;
  paceAhead: boolean;
  /** 0–1 goal progress; -1 = no goal. */
  progress: number;
  /** "148%" or "" without a goal. */
  percentText: string;
  /** "GOAL 10K" */
  goalShort: string;
  /** "GOAL 10,000" */
  goalFull: string;
  /** "148% REACHED" / "84% OF GOAL" */
  goalStatus: string;
  /** 06:00–22:00 by hour, 0–1 of the busiest; -1 = no steps that hour. */
  hourly: number[];
  /** This calendar week (or the last 7 days) on one scale with the goal; -1 = no data (or not yet). */
  weekBars: number[];
  /** Which of `weekBars` met the goal. */
  weekMet: boolean[];
  /** Goal line height on the `weekBars` scale; -1 = no goal. */
  weekGoal: number;
  /** "10K" beside the goal line. */
  weekGoalText: string;
  /** Index of today in `weekBars`. */
  weekToday: number;
  /** Weekday initials matching `weekBars`. */
  dayLetters: string[];
  /** "THIS WEEK" / "LAST 7 DAYS" */
  weekLabel: string;
  /** "AVG 12,410 / DAY" */
  weekAvgText: string;
  /** Distance, active time, cadence. */
  metrics: WidgetMetric[];
  /** Lock screen above the clock: "14,832 STEPS · +2.4K AHEAD". */
  inlineText: string;
  emptyText: string;
};

const StepsWidgetComponent = (props: StepsWidgetProps, env: WidgetEnvironment) => {
  "widget";

  // The "widget" directive serializes only this function body to run in the
  // widget process — nothing outside it exists there, so all constants live
  // inside. THEME mirrors src/ui/theme-colors.ts (Monochrome Cadence); keep in sync.
  const THEME = {
    light: {
      page: "#f9f9f9",
      card: "#ffffff",
      primary: "#000000",
      secondary: "#5f5e5e",
      tertiary: "#7e7576",
      track: "#e8e8e8",
      bar: "#cfc4c5",
    },
    dark: {
      page: "#131313",
      card: "#1b1b1b",
      primary: "#ffffff",
      secondary: "#c7c6c6",
      tertiary: "#8e9192",
      track: "#2a2a2a",
      bar: "#444748",
    },
  };
  // An hour at ≥60% of the busiest counts as a walk and draws solid.
  const HOT_HOUR = 0.6;
  const theme = env.colorScheme === "light" ? THEME.light : THEME.dark;
  const family = env.widgetFamily ?? "systemSmall";
  const url = widgetURL(props.url);
  const hasGoal = props.progress >= 0;
  const progress = Math.min(1, Math.max(0, props.progress));
  const mono = (size: number, weight: "regular" | "bold" = "bold") =>
    font({ size, weight, design: "monospaced" });

  // ── Lock screen ────────────────────────────────────────────────────────
  // Accessory families render tinted/monochrome: no custom colors or fills.

  if (family === "accessoryInline") {
    return (
      <HStack modifiers={[url]}>
        <Image systemName="figure.walk" />
        <Text modifiers={[monospacedDigit()]}>
          {props.hasData ? props.inlineText : props.emptyText}
        </Text>
      </HStack>
    );
  }

  if (family === "accessoryCircular") {
    const center = (
      <VStack spacing={1}>
        <Image systemName="figure.walk" size={12} />
        <Text modifiers={[mono(11), monospacedDigit(), minimumScaleFactor(0.6), lineLimit(1)]}>
          {props.hasData ? props.stepsCompact : "—"}
        </Text>
      </VStack>
    );
    if (!hasGoal) {
      return (
        <ZStack modifiers={[url, containerBackground("clear", "widget")]}>
          <AccessoryWidgetBackground />
          {center}
        </ZStack>
      );
    }
    return (
      <Gauge
        value={progress}
        modifiers={[url, gaugeStyle("circularCapacity"), containerBackground("clear", "widget")]}
        // circularCapacity draws the current-value label inside the ring.
        currentValueLabel={center}
      />
    );
  }

  if (family === "accessoryRectangular") {
    return (
      <VStack
        alignment="leading"
        spacing={6}
        modifiers={[url, containerBackground("clear", "widget")]}
      >
        {/* Walker + percentage left, "14.8k" right — no app name, it's on the lock screen. */}
        <HStack spacing={6}>
          <Image systemName="figure.walk" size={16} />
          {props.percentText !== "" ? (
            <Text modifiers={[mono(12), monospacedDigit(), lineLimit(1)]}>{props.percentText}</Text>
          ) : null}
          <Spacer />
          <Text modifiers={[mono(15), monospacedDigit(), lineLimit(1), minimumScaleFactor(0.7)]}>
            {props.hasData ? props.stepsCompact : "—"}
          </Text>
        </HStack>
        {hasGoal ? (
          <Gauge value={progress} modifiers={[gaugeStyle("linearCapacity")]} />
        ) : (
          <Text modifiers={[mono(10, "regular"), lineLimit(1)]}>
            {props.hasData ? props.stepsLabel : props.emptyText}
          </Text>
        )}
      </VStack>
    );
  }

  // ── Home screen ────────────────────────────────────────────────────────

  const micro = (text: string, color: string = theme.tertiary, size = 9) => (
    <Text modifiers={[mono(size), foregroundStyle(color), lineLimit(1)]}>{text}</Text>
  );
  const dot = (color: string) => (
    <Text modifiers={[font({ size: 7 }), foregroundStyle(color)]}>●</Text>
  );
  const bigNumber = (size: number) => (
    <Text
      modifiers={[
        mono(size),
        monospacedDigit(),
        foregroundStyle(theme.primary),
        lineLimit(1),
        minimumScaleFactor(0.6),
      ]}
    >
      {props.hasData ? props.steps : "—"}
    </Text>
  );
  const progressBar = hasGoal ? (
    <ProgressView value={progress} modifiers={[tint(theme.primary)]} />
  ) : null;
  // Pace line, or the empty-state hint in the same slot.
  const paceLine = (arrow: boolean) =>
    !props.hasData ? (
      micro(props.emptyText)
    ) : props.paceText === "" ? null : (
      <HStack spacing={5}>
        {arrow ? (
          <Image
            systemName={props.paceAhead ? "arrow.up" : "arrow.down"}
            size={10}
            color={theme.primary}
          />
        ) : null}
        {micro(props.paceText, theme.primary, 10)}
      </HStack>
    );

  if (family === "systemSmall") {
    return (
      <VStack
        alignment="leading"
        spacing={4}
        modifiers={[url, containerBackground(theme.page, "widget")]}
      >
        <HStack alignment="top">
          <VStack alignment="leading" spacing={2}>
            {micro("STRIDR")}
            {micro(props.stepsLabel, theme.primary, 12)}
          </VStack>
          <Spacer />
          <HStack spacing={4}>
            {dot(theme.tertiary)}
            {micro(props.timeText)}
          </HStack>
        </HStack>
        <Spacer />
        {bigNumber(32)}
        {paceLine(false)}
        <Spacer />
        {hasGoal ? (
          <VStack spacing={6}>
            <HStack>
              {micro(props.goalShort)}
              <Spacer />
              {micro(props.percentText, theme.primary, 10)}
            </HStack>
            {progressBar}
          </VStack>
        ) : null}
      </VStack>
    );
  }

  const barChart = (
    values: number[],
    opts: { height: number; width: number; spacing: number; solid: (i: number) => boolean },
  ) => (
    <HStack alignment="bottom" spacing={opts.spacing}>
      {values.map((value, i) => (
        <Rectangle
          key={String(i)}
          modifiers={[
            frame({
              width: opts.width,
              height: value < 0 ? 2 : Math.max(3, value * opts.height),
            }),
            foregroundStyle(value < 0 ? theme.track : opts.solid(i) ? theme.primary : theme.bar),
          ]}
        />
      ))}
    </HStack>
  );

  if (family === "systemMedium") {
    // Wide column = left side "today", right side "how the day went".
    const column = (metric: WidgetMetric | undefined) => (
      <VStack
        alignment="leading"
        spacing={2}
        modifiers={[frame({ maxWidth: 10000, alignment: "leading" })]}
      >
        {micro(metric?.label ?? "", theme.tertiary, 8)}
        <Text
          modifiers={[
            mono(11),
            monospacedDigit(),
            foregroundStyle(theme.primary),
            lineLimit(1),
            minimumScaleFactor(0.7),
          ]}
        >
          {metric
            ? (metric.unit && metric.value !== "—"
                ? `${metric.value} ${metric.unit}`
                : metric.value
              ).toUpperCase()
            : "—"}
        </Text>
      </VStack>
    );
    return (
      <VStack spacing={10} modifiers={[url, containerBackground(theme.page, "widget")]}>
        <HStack spacing={5}>
          {micro("STRIDR", theme.primary, 12)}
          <Spacer />
          {micro(props.updatedText)}
          {dot(theme.primary)}
        </HStack>
        <HStack alignment="bottom" spacing={16}>
          <VStack
            alignment="leading"
            spacing={5}
            modifiers={[frame({ maxWidth: 10000, alignment: "leading" })]}
          >
            {micro(props.totalLabel)}
            {bigNumber(30)}
            {paceLine(true)}
            <Spacer />
            {progressBar}
          </VStack>
          <VStack alignment="leading" spacing={6}>
            <HStack>
              {micro("06:00")}
              <Spacer />
              {micro("12:00")}
              <Spacer />
              {micro("18:00")}
              <Spacer />
              {micro("22:00")}
            </HStack>
            {barChart(props.hourly, {
              height: 44,
              width: 6,
              spacing: 3,
              solid: (i) => (props.hourly[i] ?? 0) >= HOT_HOUR,
            })}
            <HStack spacing={6}>
              {column(props.metrics[0])}
              {column(props.metrics[1])}
              {column(props.metrics[2])}
            </HStack>
          </VStack>
        </HStack>
      </VStack>
    );
  }

  // systemLarge (4×4): hero + goal chip, the week against the goal line, three tiles.
  const BAR_H = 70;
  const BAR_W = 24;
  const BAR_GAP = 12;
  const card = (radius: number) =>
    background(theme.card, shapes.roundedRectangle({ cornerRadius: radius }));

  const tile = (metric: WidgetMetric | undefined) => (
    <VStack
      alignment="leading"
      spacing={4}
      modifiers={[frame({ maxWidth: 10000, alignment: "leading" }), padding({ all: 10 }), card(6)]}
    >
      <HStack spacing={4}>
        <Image
          systemName={(metric?.icon ?? "circle") as "circle"}
          size={10}
          color={theme.tertiary}
        />
        {micro(metric?.label ?? "", theme.tertiary, 8)}
      </HStack>
      <Text
        modifiers={[
          mono(17),
          monospacedDigit(),
          foregroundStyle(theme.primary),
          lineLimit(1),
          minimumScaleFactor(0.6),
        ]}
      >
        {metric?.value ?? "—"}
      </Text>
      {micro(metric?.caption ?? "", theme.tertiary, 7)}
    </VStack>
  );

  return (
    <VStack
      alignment="leading"
      spacing={10}
      modifiers={[url, containerBackground(theme.page, "widget")]}
    >
      <HStack spacing={6}>
        <Rectangle modifiers={[frame({ width: 9, height: 9 }), foregroundStyle(theme.primary)]} />
        {micro("STRIDR", theme.primary, 12)}
        <Spacer />
        <HStack spacing={5} modifiers={[padding({ horizontal: 6, vertical: 4 }), card(4)]}>
          {micro(props.updatedText)}
          {dot(theme.primary)}
        </HStack>
      </HStack>

      <HStack alignment="top">
        <VStack alignment="leading" spacing={0}>
          {micro(props.totalLabel)}
          {bigNumber(46)}
          {props.hasData ? null : micro(props.emptyText)}
        </VStack>
        <Spacer />
        {props.goalStatus !== "" || props.goalFull !== "" ? (
          <VStack alignment="trailing" spacing={6}>
            {props.goalStatus !== "" ? (
              <Text
                modifiers={[
                  mono(10),
                  foregroundStyle(theme.primary),
                  padding({ horizontal: 8, vertical: 5 }),
                  card(4),
                ]}
              >
                {props.goalStatus}
              </Text>
            ) : null}
            {micro(props.goalFull)}
          </VStack>
        ) : null}
      </HStack>

      <VStack alignment="leading" spacing={8} modifiers={[padding({ all: 12 }), card(8)]}>
        <HStack>
          {micro(props.weekLabel, theme.secondary)}
          <Spacer />
          {micro(props.weekAvgText)}
        </HStack>
        <HStack alignment="bottom" spacing={6}>
          <ZStack alignment="bottomLeading">
            {barChart(props.weekBars, {
              height: BAR_H,
              width: BAR_W,
              spacing: BAR_GAP,
              solid: (i) => props.weekMet[i] === true,
            })}
            {props.weekGoal >= 0 ? (
              <Rectangle
                modifiers={[
                  frame({ width: 7 * BAR_W + 6 * BAR_GAP, height: 1 }),
                  foregroundStyle(theme.tertiary),
                  padding({ bottom: props.weekGoal * BAR_H }),
                ]}
              />
            ) : null}
          </ZStack>
          {props.weekGoal >= 0 ? (
            <Text
              modifiers={[
                mono(8),
                foregroundStyle(theme.tertiary),
                padding({ bottom: Math.max(0, props.weekGoal * BAR_H - 5) }),
              ]}
            >
              {props.weekGoalText}
            </Text>
          ) : null}
        </HStack>
        <HStack spacing={BAR_GAP}>
          {props.dayLetters.map((letter, i) => (
            <Text
              key={String(i)}
              modifiers={[
                frame({ width: BAR_W }),
                mono(9),
                foregroundStyle(i === props.weekToday ? theme.primary : theme.tertiary),
              ]}
            >
              {letter}
            </Text>
          ))}
        </HStack>
      </VStack>

      <HStack spacing={8}>
        {tile(props.metrics[0])}
        {tile(props.metrics[1])}
        {tile(props.metrics[2])}
      </HStack>
    </VStack>
  );
};

export default createWidget<StepsWidgetProps>("Steps", StepsWidgetComponent);
