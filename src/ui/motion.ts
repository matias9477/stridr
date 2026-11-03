import type { WithSpringConfig } from "react-native-reanimated";

/**
 * Motion tokens — the only durations/springs components use. Like colors,
 * motion is a design-system contract (see DESIGN.md "Motion & feel"):
 * don't inline magic numbers in withTiming/withSpring/layout animations.
 */
export const DURATION = {
  /** Exits — leaving should be quicker than arriving. */
  exit: 160,
  /** Field label floating up/down on focus — quick, it's feedback to typing. */
  label: 180,
  /** Layout shifts (LinearTransition) when siblings appear/disappear. */
  layout: 220,
  /** Entrances (FadeIn*, ZoomIn). */
  enter: 260,
  /** Progress fills, counters. */
  fill: 520,
  /** Odometer digits rolling to their value (RollingNumber). */
  roll: 900,
  /** Delay between neighbouring odometer digits, left to right. */
  rollStagger: 45,
  /** Total left→right spread of a bar chart's grow-in (each bar takes `fill`). */
  sweep: 320,
  /** Stagger step between list items on first appearance. */
  stagger: 60,
  /** Live-status blink: how long the dot stays lit between blinks (Reduce Motion off only). */
  blinkHold: 900,
  /** Live-status blink: each half of the quick off/on flick. */
  blink: 220,
  /** Loading skeleton breath: each half of the fade out/in (Reduce Motion off only). */
  pulse: 800,
} as const;

export const SPRING = {
  /** Press-in: fast and firm. */
  pressIn: { damping: 18, stiffness: 420 },
  /** Release: a touch of bounce back. */
  pressOut: { damping: 12, stiffness: 260 },
  /** A value "pops" (count change, badge appears). */
  pop: { damping: 10, stiffness: 320 },
  /** Settling rows / sheets without overshoot. */
  settle: { damping: 30, stiffness: 180, overshootClamping: true },
} as const satisfies Record<string, WithSpringConfig>;
