# TODO

Living roadmap. Anything under **Critical path to v1.0** has to land before v1.0 ships; **v1.1+** is the post-launch backlog. Update as part of normal commits (`docs(todo): ...`). Completed work moves to **Shipped** rewritten as 1–3 sentences of outcome prose — what it does and why — not commit subjects. Unresolved product decisions get their own `## Open:` section naming the conflict, with checkboxes to resolve it. Order feature phases **easiest → hardest**, and do the Pro/monetization pivot early so later features ship already gated correctly.

## Shipped (for reference)

- Scaffolded with create-mt-app: Expo Router, NativeWind tokens, Drizzle+expo-sqlite with generated migrations, Zod+RHF forms, i18n (en/es), expo-widgets widget, RevenueCat purchases module with custom paywall, AdMob banner slot (test ads in dev, disabled until unit ids are configured), skippable onboarding, review prompts, dark mode.
- Steps core (docs/spec-steps-core.md): HealthKit step totals (statistics-collection queries, so iPhone + Watch never double count), manual steps and estimated walks in SQLite, goal history, and every statistic (7-day average, week total, peak, record, streaks, 30-day trend) as tested pure functions. Today / Stats / Settings tabs built from the Stitch "Monochrome Cadence" designs with per-card loading/empty/error states, Space Mono + Geist, light and dark palettes. Home-screen widgets (2×2, 4×2, 4×4 with 24h cadence and the Today bento) and lock-screen widgets (circular gauge, rectangular, inline above the clock) fed by one app-pushed timeline with HealthKit background delivery; CSV export.

## Critical path to v1.0

### Product
- [ ] Review the defaults chosen for the product spec's open questions (docs/spec-steps-core.md → Decisions)
- [ ] First device run (`npm run ios`): grant Health access, check totals against the Health app, confirm background delivery refreshes the widget without opening the app
- [ ] Pace nudges on device (needs a new dev-client build for expo-notifications): enable in onboarding step 3, check the 18:00 alert fires when behind pace and is cancelled once the pace mark is reached (DeveloperSection → test nudge for the banner)
- [ ] Fill DESIGN.md → Voice & tone and App Store visual direction

### App-store readiness
- [ ] Final icon + splash (replace the placeholder solid-color assets in `assets/images/`)
- [ ] `npx eas init` run; EAS project id recorded in CLAUDE.md → App identity
- [ ] RevenueCat: app created, products, entitlement `pro`, `default` offering; keys in `.env` + EAS env
- [ ] AdMob: apps + banner ad units created; real app ids replace Google's samples in app.json (`react-native-google-mobile-ads` plugin, needs a rebuild); unit ids in `.env` + EAS env — **or** delete the ads module per CLAUDE.md → Ads if this app won't run ads
- [ ] Privacy policy: `content/privacy/stridr.mdx` in ~/Projects/my-portfolio, published (URL already wired in Settings)
- [ ] store.config.json copy finalized (en-US + es-ES); `eas metadata:lint` then `eas metadata:push`
- [ ] 4 screenshots per DESIGN.md headlines (stage states with the __DEV__ DeveloperSection; upload manually in App Store Connect — EAS metadata does not cover screenshots)
- [ ] After first release: record the App Store ID in CLAUDE.md → App identity AND `src/lib/review-prompt.ts`

## v1.1+ backlog

- Hourly tab (Stitch `hourly_cadence`): idle-stretch detection, hourly reminders, intraday timeline. Deferred — not in the product spec MVP; Today's cadence card covers the intraday view.
- Stride calibration walk (spec §4 "future version").
- Light-mode shape language: "DESIGN_light mode.md" specifies 0px corners and Space Grotesk headings; the app currently shares the dark design's shapes/fonts and only swaps colors.

## Open: (unresolved decisions)

- Pro split: nothing is gated yet and the paywall copy is generic. Decide what Pro unlocks (candidates: All-time range, widgets, CSV export) before wiring `useIsPro()` gates.
  - [ ] pick the Pro features  - [ ] gate them  - [ ] paywall copy in both locales
  - [ ] onboarding step 4 becomes the paywall (replaces the old "Read-only. On-device." slide, which now repeats step 1)
- Ads: the AdMob slot sits at the bottom of Today. Keep (and set unit ids) or delete per CLAUDE.md → Ads.

## Known issues / tech debt

- Items here carry removal instructions written the moment the scaffolding is added (e.g. "remove X before v1.0 ships").

## Tone of voice

See DESIGN.md → Voice & tone. Never ship copy that violates the never-use list — applies to notifications, empty states, errors, and settings descriptions.
