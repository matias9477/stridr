# TODO

Living roadmap. Anything under **Critical path to v1.0** has to land before v1.0 ships; **v1.1+** is the post-launch backlog. Update as part of normal commits (`docs(todo): ...`). Completed work moves to **Shipped** rewritten as 1–3 sentences of outcome prose — what it does and why — not commit subjects. Unresolved product decisions get their own `## Open:` section naming the conflict, with checkboxes to resolve it. Order feature phases **easiest → hardest**, and do the Pro/monetization pivot early so later features ship already gated correctly.

## Shipped (for reference)

- Scaffolded with create-mt-app: Expo Router, NativeWind tokens, Drizzle+expo-sqlite with generated migrations, Zod+RHF forms, i18n (en/es), expo-widgets widget, RevenueCat purchases module with custom paywall, skippable onboarding, review prompts, dark mode.
- Steps core (docs/spec-steps-core.md): HealthKit step totals (statistics-collection queries, so iPhone + Watch never double count), manual steps and estimated walks in SQLite, goal history, and every statistic (7-day average, week total, peak, record, streaks, 30-day trend) as tested pure functions. Today / Stats / Settings tabs built from the Stitch "Monochrome Cadence" designs with per-card loading/empty/error states, Space Mono + Geist, light and dark palettes. Home-screen widgets (2×2, 4×2, 4×4 with 24h cadence and the Today bento) and lock-screen widgets (circular gauge, rectangular, inline above the clock) fed by one app-pushed timeline with HealthKit background delivery; CSV export.

## Critical path to v1.0

### Product
- [ ] Review the defaults chosen for the product spec's open questions (docs/spec-steps-core.md → Decisions)
- [ ] First device run (`npm run ios`): grant Health access, check totals against the Health app, confirm background delivery refreshes the widget without opening the app
- [ ] Pace nudges on device (needs a new dev-client build for expo-notifications): enable in onboarding step 3, check the 18:00 alert fires when behind pace and is cancelled once the pace mark is reached (DeveloperSection → test nudge for the banner)
- [ ] Fill DESIGN.md → Voice & tone and App Store visual direction

### App-store readiness
- [ ] Final icon + splash (replace the placeholder solid-color assets in `assets/images/`)
- [ ] RevenueCat: app created, products, entitlement `pro`, `default` offering; keys in `.env` + EAS env
- [ ] Privacy policy: drafted in ~/Projects/my-portfolio `content/privacy/stridr.mdx` — review, commit and publish (URL already wired in Settings); add the URL to App Store Connect
- [ ] store.config.json copy finalized (en-US + es-ES); `eas metadata:lint` then `eas metadata:push`
- [ ] 4 screenshots per DESIGN.md headlines (stage states with the __DEV__ DeveloperSection; upload manually in App Store Connect — EAS metadata does not cover screenshots)
- [ ] After first release: record the App Store ID in CLAUDE.md → App identity AND `src/lib/review-prompt.ts`

## v1.1+ backlog

- Hourly tab (Stitch `hourly_cadence`): idle-stretch detection, hourly reminders, intraday timeline. Deferred — not in the product spec MVP; Today's cadence card covers the intraday view.
- Stride calibration walk (spec §4 "future version").
- Light-mode shape language: "DESIGN_light mode.md" specifies 0px corners and Space Grotesk headings; the app currently shares the dark design's shapes/fonts and only swaps colors.

## Open: (unresolved decisions)

- Pro split — decided: Pro unlocks the **90-day and All-time** Stats ranges (`ChartRange` `"quarter"` / `"all"`), the **widgets** and **CSV export**. Free keeps Today, Stats week/month, manual activities and pace nudges. No ads (decided 2026-10-25; AdMob removed). The gating ships together with onboarding step 4 (the paywall).
  - [ ] gate the 90D / All chips in the Stats range switch with `useIsPro()` → `router.push("/paywall?variant=stats")`
  - [ ] gate the widgets: free users get a locked state pointing to the paywall instead of their numbers (WidgetSync pushes an "Upgrade to Pro" snapshot), and a `variant=widgets` paywall entry from Settings → Widget previews
  - [ ] gate CSV export (Settings → Data) → `router.push("/paywall?variant=export")`
  - [ ] paywall copy for the three variants in en + es
  - [ ] onboarding step 4 becomes the paywall (replaces the old "Read-only. On-device." slide, which now repeats step 1)

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
