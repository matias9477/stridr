# Spec: Pro split (paywall + gates)

Status: agreed 2026-10-27 (interview between Matias and Claude). **Pro is a single lifetime unlock** (non-consumable, one RevenueCat package in the `default` offering, entitlement `pro`). No subscriptions, no ads, no trial. RevenueCat dashboard / App Store Connect setup is **not done yet**: `MOCK_PRO` stays on (docs/spec-custom-range.md §0) and a `__DEV__` "Simulate free tier" switch exercises every locked state. Out of scope: hosted RevenueCat paywall templates (`react-native-purchases-ui`), promo codes, Android store setup.

Workflow: commit this spec first (`chore: add pro-split spec`), then implement in §Implementation order. The spec is the authority — deviations get written back here before they land.

## 0. What Pro unlocks (from TODO.md → Pro split)

| Pro | Free |
|---|---|
| Stats ranges 90D, All, Custom | Today, Stats 7D/30D, manual activities, pace nudges, share card |
| Home + lock screen widgets | — |
| CSV export (Settings → Data, Stats footer) | — |

Gate depth, never the core loop. A gate never loses data: it only blocks *viewing* until unlocked.

## 1. Purchases module

### Semantics
- `useIsPro()` = `isPro && !devFree`. `devFree` is a non-persisted store flag only the DeveloperSection sets; in release builds it is always false. It works on top of `MOCK_PRO` so locked states are testable before RevenueCat exists.
- The paywall sells **one package**: `offering.lifetime ?? offering.availablePackages[0]`. Its price string comes from the store (`product.priceString`) — never hardcoded.
- User-cancelled purchases are silent. Purchase errors show one inline line ("You were not charged"). Restore shows the result inline.

### Module
`src/features/purchases/`:
- `purchases-store.ts`: `devFree: boolean`, `setDevFree(on: boolean)`; `useIsPro()` reads both.
- `use-pro-offer.ts`: `useProOffer({ onUnlocked })` → `{ status: "loading" | "error" | "ready" | "empty", pkg, priceText, purchasing, restoring, message, purchase(), restore(), retry() }`. Owns offering load (with retry), purchase → `refresh()` → `onUnlocked()`, restore → `onUnlocked()` or an inline "nothing to restore".
- `pro-features.tsx`: `ProFeatures({ highlight?: ProVariant })` — the three unlock rows (ranges, widgets, export), the variant's row emphasized. Shared by the paywall and onboarding.
- `pro-offer-actions.tsx`: `ProOfferActions({ offer })` — the buy button ("Unlock Pro · $X.XX"), loading/error/empty states, restore link, one-time-purchase footnote.
- `types.ts`: `ProVariant = "stats" | "widgets" | "export"`, `parseProVariant(param)` (pure, tested).

### UI
- `app/paywall.tsx` (modal, existing route): reads `variant` search param. Headline + subtitle per variant (`paywall.variants.<v>.title/subtitle`, generic `paywall.title/subtitle` otherwise), `ProFeatures`, `ProOfferActions`. If already Pro, shows the active state and a Done button. Dismissible via the native modal swipe and a Close toolbar button.
- States: loading (spinner + "Loading price…"), error (retry), empty ("Not available right now"), purchasing (button busy, others disabled).

## 2. Gates

### Side effects
1. **Stats** (`app/(tabs)/stats/index.tsx`): 90D / All / Custom chips push `/paywall?variant=stats` when not Pro; the chart stays on the current range. Chips stay visible (they are the upsell).
2. **CSV export**: `useCsvExport` gains `locked` (= `!isPro`); `run()` pushes `/paywall?variant=export` when locked. Settings row trailing tag reads `PRO` instead of `RAW .CSV`; Stats footer label stays, tap routes to the paywall.
3. **Widgets**: `WidgetSync` pushes a locked snapshot when not Pro: `hasData: false`, `emptyText` = "PRO UNLOCKS WIDGETS" (inline: same), no goal/progress, deep link `stridr://paywall?variant=widgets`. `StepsWidgetProps` gains `url: string` (all three widgets use it instead of the hardcoded `"stridr://"`) — props-only change, no app.json shape change, but a native rebuild is needed to pick up the new widget bundle.
4. **Settings → Widget previews**: when not Pro, the previews render dimmed and an "Unlock widgets with Pro" action row under them pushes `/paywall?variant=widgets`.

### Tests
- `buildLockedWidgetTimeline` (pure, in `widget-snapshot.ts`): no step numbers leak, url points at the paywall.
- `parseProVariant`.

## 3. Onboarding step 4

The old "Read-only. On-device." slide (repeated step 1) becomes **Pro**: `OnboardingSlide` with title/body (`onboarding.pro.*`), `ProFeatures` as its panel. Bottom bar: `ProOfferActions`-style primary "Unlock Pro · $X.XX" and a "Continue free" link that finishes onboarding (and still asks for Health if step 1 was swiped past — the old last-slide behaviour). A successful purchase/restore finishes onboarding. Already Pro (incl. mocked): one "Get started" button. Skip stays visible.

## Cross-cutting obligations
- i18n keys in BOTH `en.json` and `es.json`, same change.
- Semantic tokens only; loading/error/empty for the offer.
- Haptics: `success` on unlock (purchase or restore), nothing on cancel.
- No `react-native-purchases` import outside `purchases-service.ts`.
- Planned commits: `chore: add pro-split spec`, `feat(purchases): lifetime paywall with variants`, `feat(stats): gate 90D/All behind Pro`, `feat(export): gate CSV export behind Pro`, `feat(widgets): locked widget state for free users`, `feat(onboarding): Pro as step 4`, `docs(todo): ...`.

## Implementation order
1. Purchases module + paywall — every gate routes into it.
2. Stats, export, widget gates.
3. Onboarding step 4 (reuses the paywall pieces).
4. TODO.md: Pro split moves to Shipped; RevenueCat setup checklist stays on the critical path with the lifetime product.

## Out of scope
- Subscriptions / trials / intro offers.
- Server-side receipt validation beyond RevenueCat.
- A "what you're missing" teaser of real 90D numbers for free users.
