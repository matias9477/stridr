/** RevenueCat entitlement id that gates all Pro features. Must match the dashboard. */
export const PRO_ENTITLEMENT_ID = "pro";

/**
 * Pro is on for everyone until RevenueCat is set up (docs/spec-custom-range.md §0), so every
 * `useIsPro()` gate can be wired without locking development builds. Explicit, not "no API key":
 * keys may land before the offering exists. Remove with its uses in purchases-store.ts (TODO.md).
 */
export const MOCK_PRO = true;

/** Which gate opened the paywall — picks its headline and the highlighted feature row. */
export type ProVariant = "stats" | "widgets" | "export";

const PRO_VARIANTS: readonly ProVariant[] = ["stats", "widgets", "export"];

/** `/paywall?variant=…` comes from deep links too (widgets), so anything unknown is generic. */
export function parseProVariant(param: unknown): ProVariant | null {
  const value = Array.isArray(param) ? param[0] : param;
  return PRO_VARIANTS.includes(value as ProVariant) ? (value as ProVariant) : null;
}
