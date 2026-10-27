# TODO

Living roadmap. Anything under **Critical path to v1.0** has to land before v1.0 ships; **v1.1+** is the post-launch backlog. Update as part of normal commits (`docs(todo): ...`). Completed work moves to **Shipped** rewritten as 1–3 sentences of outcome prose — what it does and why — not commit subjects. Unresolved product decisions get their own `## Open:` section naming the conflict, with checkboxes to resolve it. Order feature phases **easiest → hardest**, and do the Pro/monetization pivot early so later features ship already gated correctly.

## Shipped (for reference)

- Scaffolded with create-mt-app: Expo Router, NativeWind tokens, Drizzle+expo-sqlite with generated migrations, Zod+RHF forms, i18n (en/es), expo-widgets widget, RevenueCat purchases module with custom paywall, skippable onboarding, review prompts, dark mode.
- Privacy policy published at https://www.matiasturra.dev/privacy/stridr: step count only, on-device, RevenueCat for Pro, no ads or analytics.
- Steps core (docs/spec-steps-core.md): HealthKit step totals (statistics-collection queries, so iPhone + Watch never double count), manual steps and estimated walks in SQLite, goal history, and every statistic (7-day average, week total, peak, record, streaks, 30-day trend) as tested pure functions. Today / Stats / Settings tabs built from the Stitch "Monochrome Cadence" designs with per-card loading/empty/error states, Space Mono + Geist, light and dark palettes. Home-screen widgets (2×2, 4×2, 4×4 with 24h cadence and the Today bento) and lock-screen widgets (circular gauge, rectangular, inline above the clock) fed by one app-pushed timeline with HealthKit background delivery; CSV export.
- Share card (docs/spec-share-card.md): Today's share button opens a preview of a designed 1080×1920 Story image — the step count as hero, today's hourly bars on a ruler (last 7 days when there's no hourly data), distance / active time / streak, and the stridr lockup — then shares the PNG through the system sheet. Free, follows the theme, replaces the old text-only share.
- Custom Stats range (docs/spec-custom-range.md): a fifth range chip that expands an editor between the switch and the chart — last N days (rolls forward daily) or two fixed dates via the native date picker — applied on Save and remembered across launches; the chip reads "13D" or "3/4–4/2". The chart, range total and daily average follow it. Pro.
- Pro split (docs/spec-pro-split.md): Stridr Pro is a single lifetime unlock. It opens the 90D / All / Custom Stats ranges, and the widgets; free keeps Today, 7D/30D, manual activities, nudges, the share card and CSV export (your own data is never paywalled). Gates route to `/paywall?variant=stats|widgets` (per-gate headline, store price, restore). Free users' widgets show "Pro unlocks widgets" and deep-link to the paywall, and onboarding step 4 is the Pro offer with "Continue free". The `MOCK_PRO` dev bypass is gone, so gates lock for real; DeveloperSection → "Simulate free tier" stages the locked states on a build that owns Pro.

## Critical path to v1.0

### Product
- [ ] Review the defaults chosen for the product spec's open questions (docs/spec-steps-core.md → Decisions)
- [ ] First device run (`npm run ios`): grant Health access, check totals against the Health app, confirm background delivery refreshes the widget without opening the app
- [ ] Pace nudges on device (needs a new dev-client build for expo-notifications): enable in onboarding step 3, check the 18:00 alert fires when behind pace and is cancelled once the pace mark is reached (DeveloperSection → test nudge for the banner)
- [ ] Share card on device (new dev-client build for react-native-view-shot): check the PNG is 1080×1920 and crisp, fonts are Space Mono (not system), both themes and es; post one to Instagram Stories to confirm nothing sits under its UI
- [ ] Fill DESIGN.md → Voice & tone and App Store visual direction

### App-store readiness
- [ ] Final icon + splash (replace the placeholder solid-color assets in `assets/images/`)
- [ ] RevenueCat (project created 2026-10-27): Paid Apps agreement active; non-consumable `com.matiasturra.stridr.pro.lifetime` in App Store Connect (en + es localizations); In-App Purchase key uploaded to RevenueCat; product attached to entitlement `pro`; `default` offering (Current) with a Lifetime package; `EXPO_PUBLIC_REVENUECAT_IOS_KEY` in `.env` + EAS env
- [ ] Device run after the RevenueCat setup (`npm run ios` — the widget bundle changed too): sandbox purchase, restore on a fresh install, locked widgets with "Simulate free tier"
- [ ] Privacy policy URL (`https://www.matiasturra.dev/privacy/stridr`, live since 2026-10-25) entered in App Store Connect
- [ ] store.config.json copy finalized (en-US + es-ES); `eas metadata:lint` then `eas metadata:push`
- [ ] 4 screenshots per DESIGN.md headlines (stage states with the __DEV__ DeveloperSection; upload manually in App Store Connect — EAS metadata does not cover screenshots)
- [ ] After first release: record the App Store ID in CLAUDE.md → App identity AND `src/lib/review-prompt.ts`

## v1.1+ backlog

- Hourly tab (Stitch `hourly_cadence`): idle-stretch detection, hourly reminders, intraday timeline. Deferred — not in the product spec MVP; Today's cadence card covers the intraday view.
- Share card for past days (from Stats) — needs hourly minutes for arbitrary dates; `buildShareCard({ day })` already takes the day.
- Stride calibration walk (spec §4 "future version").
- Light-mode shape language: "DESIGN_light mode.md" specifies 0px corners and Space Grotesk headings; the app currently shares the dark design's shapes/fonts and only swaps colors.

## Open: (unresolved decisions)

_None right now._

## Known issues / tech debt

- Items here carry removal instructions written the moment the scaffolding is added (e.g. "remove X before v1.0 ships").
- Stats accuracy, minor (audit 2026-10-25; the serious ones are fixed):
  - Activity log recomputes past days' distance with today's step length; spec decision 4 says preference changes don't rewrite history. Store the step length per day (or show a logged walk's own distance).
  - Default step length is 0.75 m (spec's conservative choice for walk→steps); for steps→distance the adult average is ~0.70 m, so distance reads a bit high. Revisit with the spec.
  - Stats chart goal line uses today's goal across the whole history (bars and streaks already use each day's own goal).
  - "Active mins" only exist for the last 8 days (`RECENT_WINDOW_DAYS`); older log rows just omit them.
  - Today's 7-day average caption shows "Prev. 7 days X" even when only some of those days have data.
  - Trend arrow points up when the difference is exactly 0.
  - CSV export marks today's partial row as `goal_met=0`.
  - DST days: the repeated hour merges into one hourly bar (fall back) or one hour is empty (spring forward).
  - Time-zone travel re-buckets HealthKit history while manual entries keep their stored day (same as Apple Health).
  - One huge manual entry (≤100k, no daily cap) can become the all-time record.
  - The weekly "All" chart's current-week bar includes today's partial day (shown muted).

## Tone of voice

See DESIGN.md → Voice & tone. Never ship copy that violates the never-use list — applies to notifications, empty states, errors, and settings descriptions.
