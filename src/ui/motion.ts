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
  /** Stagger step between list items on first appearance. */
  stagger: 60,
  /** One half of a slow idle "breathe" loop — placeholders/decoration only, Reduce Motion off. */
  breathe: 1400,
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
