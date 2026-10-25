import i18n from "@/src/i18n";
import type { CardStatus } from "@/src/ui/card-state";
import type { StepStats } from "./use-step-stats";

/**
 * Shared loading/error gate for every stats-backed card, so all cards agree
 * on what "loading" and "failed" mean. Cards then decide their own "empty".
 *
 * - `healthOnly`: the card is built purely from HealthKit (intraday data has
 *   no manual equivalent), so missing access is that card's empty state.
 */
export function baseCardStatus(
  stats: StepStats,
  opts: { healthOnly?: boolean } = {},
): Exclude<CardStatus, { kind: "ready" }> | null {
  if (stats.isLoading) return { kind: "loading" };
  if (stats.dbError) return { kind: "error" };
  if (opts.healthOnly) {
    if (stats.access === "unavailable") {
      return { kind: "empty", message: i18n.t("cards.healthUnavailable") };
    }
    if (stats.access === "notRequested") {
      return { kind: "empty", message: i18n.t("cards.healthNotConnected") };
    }
  }
  if (stats.healthError) return { kind: "error", onRetry: () => void stats.retry() };
  return null;
}
