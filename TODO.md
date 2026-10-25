# TODO

Living roadmap. Anything under **Critical path to v1.0** has to land before v1.0 ships; **v1.1+** is the post-launch backlog. Update as part of normal commits (`docs(todo): ...`). Completed work moves to **Shipped** rewritten as 1–3 sentences of outcome prose — what it does and why — not commit subjects. Unresolved product decisions get their own `## Open:` section naming the conflict, with checkboxes to resolve it. Order feature phases **easiest → hardest**, and do the Pro/monetization pivot early so later features ship already gated correctly.

## Shipped (for reference)

- Scaffolded with create-mt-app: Expo Router, NativeWind tokens, Drizzle+expo-sqlite with generated migrations, Zod+RHF forms, i18n (en/es), expo-widgets widget, RevenueCat purchases module with custom paywall, AdMob banner slot (test ads in dev, disabled until unit ids are configured), skippable onboarding, review prompts, dark mode.

## Critical path to v1.0

### Product
- [ ] Write `docs/spec-<first-feature-batch>.md` (copy `docs/spec-template.md`) and implement in its stated order
- [ ] Replace the onboarding TODO copy in `src/i18n/en.json` + `es.json` (both files, key parity)
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

- (deferred features go here, each with the reason it was deferred)

## Open: (unresolved decisions)

- (name the conflict, list checkboxes to resolve it before the affected work lands)

## Known issues / tech debt

- Items here carry removal instructions written the moment the scaffolding is added (e.g. "remove X before v1.0 ships").
- Home's empty state is the create-mt-app `StartHere` placeholder (dev builds only). When you build Home: delete `src/ui/start-here.tsx` and the `__DEV__ ? <StartHere /> :` branch in `app/(tabs)/(home)/index.tsx`, leaving `EmptyState` (with real copy in `home.empty`) as the empty state.
- `plugins/with-scene-lifecycle.js` ports SDK 58's UIScene life cycle to SDK 57 — without it, apps built with Xcode 27 crash at launch ("UIScene life cycle is required"). **Remove it (file + `app.json` plugins entry) when upgrading to Expo SDK 58**, which ships this natively.

## Tone of voice

See DESIGN.md → Voice & tone. Never ship copy that violates the never-use list — applies to notifications, empty states, errors, and settings descriptions.
