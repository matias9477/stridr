import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { DURATION } from "./motion";
import { useThemeColors } from "./theme-colors";
import { T, type TypeRole } from "./typography";

/**
 * Per-card data states (CLAUDE.md → Data states): every card that renders
 * async data shows loading, error, or empty IN PLACE, keeping its footprint so
 * the grid never jumps. A blank card is a bug.
 */
export type CardStatus =
  | { kind: "ready" }
  | { kind: "loading" }
  | { kind: "empty"; message: string }
  | { kind: "error"; onRetry?: (() => void) | undefined };

export const READY: CardStatus = { kind: "ready" };

/**
 * Placeholder block that breathes while data loads — the pulse says "working",
 * so it's a state signal, not idle decoration. Every skeleton mounts in the
 * same frame, so they pulse in step. Reduce Motion holds it still. Children
 * are invisible sizers (see `SkeletonText`, `HeroSkeleton`'s chip).
 */
export function Skeleton({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      opacity.set(1);
      return;
    }
    const ease = { duration: DURATION.pulse, easing: Easing.inOut(Easing.ease) };
    opacity.set(withRepeat(withSequence(withTiming(0.4, ease), withTiming(1, ease)), -1));
  }, [reduceMotion, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.View
      accessible={false}
      className={`rounded-sm bg-surface-high ${className}`}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

/**
 * A skeleton bar the exact size of a line of `variant` text: an invisible
 * `ghost` string reserves the real line box (font, tracking, Dynamic Type),
 * so swapping in the data can't move anything. Pass a ghost shaped like the
 * real value ("0,000", a translated label with placeholder digits). Works
 * inside `items-baseline` rows — the ghost carries the baseline.
 */
export function SkeletonText({ variant, ghost }: { variant: TypeRole; ghost: string }) {
  return (
    <View className="flex-row" accessible={false}>
      <View>
        <T variant={variant} className="opacity-0">
          {ghost}
        </T>
        {/* Inset to roughly cap height: a full line box reads as a slab, not text.
            Percent offsets are layout geometry, not spacing tokens. */}
        <Skeleton className="absolute inset-x-0 top-[15%] bottom-[15%]" />
      </View>
    </View>
  );
}

/** Inline empty/error message for compact tiles. */
export function CardStateMessage({
  status,
}: {
  status: Exclude<CardStatus, { kind: "ready" | "loading" }>;
}) {
  const { t } = useTranslation();
  const c = useThemeColors();
  if (status.kind === "empty") {
    return (
      <T variant="bodySm" tone="tertiary">
        {status.message}
      </T>
    );
  }
  const content = (
    <View className="flex-row items-center gap-1.5">
      <MaterialIcons name="error-outline" size={13} color={c.dangerFg} />
      <T variant="micro" tone="danger">
        {status.onRetry ? t("cards.errorRetry") : t("cards.error")}
      </T>
    </View>
  );
  return status.onRetry ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("cards.errorRetry")}
      onPress={status.onRetry}
      hitSlop={8}
      className="active:opacity-60"
    >
      {content}
    </Pressable>
  ) : (
    content
  );
}

/** Renders children only when ready; otherwise the state, with a min height so cards don't collapse. */
export function CardStateBody({
  status,
  children,
  minHeightClass = "min-h-12",
  loading,
  centered = false,
}: {
  status: CardStatus;
  children: ReactNode;
  minHeightClass?: string;
  /** Custom skeleton for the card's shape. */
  loading?: ReactNode;
  /** Center the empty/error message — for tall plot areas where a left-aligned line looks stranded. */
  centered?: boolean;
}) {
  if (status.kind === "ready") return <>{children}</>;
  if (status.kind === "loading") {
    return (
      <View className={`justify-center gap-2 ${minHeightClass}`} accessibilityLabel="loading">
        {loading ?? (
          <>
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-2 w-1/3" />
          </>
        )}
      </View>
    );
  }
  return (
    <View className={`justify-center ${centered ? "items-center" : ""} ${minHeightClass}`}>
      <CardStateMessage status={status} />
    </View>
  );
}
