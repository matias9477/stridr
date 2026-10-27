/** RevenueCat entitlement id that gates all Pro features. Must match the dashboard. */
export const PRO_ENTITLEMENT_ID = "pro";

/** Which gate opened the paywall — picks its headline and the highlighted feature row. */
export type ProVariant = "stats" | "widgets";

const PRO_VARIANTS: readonly ProVariant[] = ["stats", "widgets"];

/** `/paywall?variant=…` comes from deep links too (widgets), so anything unknown is generic. */
export function parseProVariant(param: unknown): ProVariant | null {
  const value = Array.isArray(param) ? param[0] : param;
  return PRO_VARIANTS.includes(value as ProVariant) ? (value as ProVariant) : null;
}
