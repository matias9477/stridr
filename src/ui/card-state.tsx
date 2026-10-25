import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useThemeColors } from "./theme-colors";
import { T } from "./typography";

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

/** Static placeholder bar — no shimmer: motion is for state changes, not idling (DESIGN/CLAUDE.md). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <View className={`rounded-sm bg-surface-high ${className}`} />;
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
}: {
  status: CardStatus;
  children: ReactNode;
  minHeightClass?: string;
  /** Custom skeleton for the card's shape. */
  loading?: ReactNode;
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
    <View className={`justify-center ${minHeightClass}`}>
      <CardStateMessage status={status} />
    </View>
  );
}
