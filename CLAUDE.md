# CLAUDE.md

@AGENTS.md

## Project

Stridr — an Expo (latest SDK) iOS/Android app. Local-first: SQLite via Drizzle is the source of truth for entity data. Scaffolded by create-mt-app; the conventions below are deliberate — follow them instead of inventing new patterns. Visual rules (tokens, spacing, typography, voice & tone, component inventory) live in **DESIGN.md**; the living roadmap in **TODO.md**.

### App identity

- Bundle id / Android package: `com.matiasturra.stridr` · App Group: `group.com.matiasturra.stridr`
- Apple Team ID: `7VJ997Q842` · Expo owner: `matias.turra`
- EAS project id: TODO (run `npx eas init`, record it here)
- App Store ID: TODO after first release — record it here AND in `src/lib/review-prompt.ts` (review prompts and the write-review URL need it)

## Commands

- `npm start` — Metro dev server
- `npm run ios` / `npm run android` — full native build + run. Required for the widget and RevenueCat (they do NOT work in Expo Go).
- `npm run prebuild:ios` — regenerate the ios/ dir from scratch (it's gitignored prebuild output)
- `npm test` — Jest; single test: `npx jest path/to/file.test.ts` (or `-t "test name"`)
- `npm run lint:fix` — Biome lint + format (there is no ESLint/Prettier — don't add them)
- `npm run db:generate` — generate a Drizzle migration after editing `src/db/schema.ts`
- `db:studio` / `db:push` — **do not use**: incompatible with expo-sqlite
- `npm run release` — version bump → EAS build → TestFlight submit (expo-release)

## Shipping workflow

This is the process layer that gets apps shipped — treat it with the same weight as the code rules.

- **Spec first.** A feature (or batch) starts as `docs/spec-<name>.md`, copied from `docs/spec-template.md`, written as the output of an interview and dated ("agreed YYYY-MM-DD"), stating free-vs-Pro and out-of-scope up front. Commit the spec (`chore: add <name> spec`), then implement in its stated order with its planned commit series. The spec is the domain authority; deviations get written back into it.
- **Roadmap in TODO.md.** Phases ordered **easiest → hardest** so they get knocked out one at a time, with the **monetization pivot early** so later features ship already gated correctly. Shipped work is rewritten as outcome prose; unresolved product decisions get `## Open:` sections naming the conflict; tech debt carries removal instructions written when the scaffolding is added. Update TODO.md as part of normal commits (`docs(todo): ...`).
- **Scaffold the seam, don't implement.** Default question for any proposal: "is this needed for v1.0?" If not, leave the seam (an empty module, an installed-but-unwired SDK, a single theme on theme infra) and a TODO entry — a full build up front is how apps never ship. Intentionally empty modules are directories with a documented fill plan, not stubs.
- **Releasing.** `npm run release` (expo-release, pinned `#v1.0.0` from GitHub) verifies app.json/package.json version parity, bumps both + iOS buildNumber, builds, optionally submits to TestFlight, commits `chore(release): vX.Y.Z`, and reverts the bump on failure. `release.config.json` (gitignored — personal Apple ID) holds `appleId` + `cleanSessions`. Store listing copy lives in `store.config.json` and is pushed **separately**: `eas metadata:lint` then `eas metadata:push` — `npm run release` does not touch it. **Screenshots are never covered by EAS metadata** — stage states with the `__DEV__` DeveloperSection in Settings, screenshot manually, upload in App Store Connect per the headlines in DESIGN.md.
- **App Review.** If a build gets an "Information Needed" rejection, follow `~/.claude/guides/app-store-rejection-reply.md` (cross-app playbook: answer in the Resolution Center, all items in one message, grep the codebase before asking the developer, disclose dormant SDKs like unwired RevenueCat in one line).
- **No analytics, no crash reporting — by design.** Zero third-party tracking is a product position sold in the store listing ("your data stays on your device, no accounts, no tracking") and it avoids the ATT prompt. Never add Sentry/PostHog/Firebase "to be helpful". Errors are console logs + the ErrorBoundary.

## Architecture

### Data layer

- `src/db/schema.ts` is the **single source of truth**. After changing it, run `npm run db:generate`; migrations land in `drizzle/` and are applied at boot by `useMigrations()` in `app/_layout.tsx` (loading/error gates included). Never hand-write CREATE TABLE statements and never edit generated SQL.
- Reads are drizzle **live queries** (`useLiveQuery` via `src/db/live.ts`) — they re-run automatically after writes. Use `isLiveQueryLoading()` for spinners.
- Every table gets a `uuid` column (`src/db/uuid.ts`) as the stable cross-device key; the int PK is device-local.
- All DB access goes through the owning feature's `queries.ts`. Screens and components never import `src/db/client.ts` directly.

### Feature modules (`src/features/<feature>/`)

Each feature owns, by consistent filename:

- `schema.ts` — Zod input schema + inferred types. Error messages are **lazy i18n thunks**: `{ error: () => i18n.t("validation.key") }` (Zod 4 `error` key) so they follow language changes.
- `queries.ts` — live-query read hooks (`useX`) + plain async mutations (`createX/updateX/deleteX`). The only module touching that feature's tables.
- `<feature>-form.tsx` — react-hook-form + `zodResolver`, typed `useForm<FormIn, unknown, FormOut>` with `z.input<>`/`z.output<>`.
- Extra presentational pieces in kebab-case files.

Cross-cutting invisible providers are `*-sync.tsx` files exporting a PascalCase component that returns `null` (`ThemeSync`, `LanguageSync`, `HapticsSync`, `WidgetSync`), mounted once in `app/_layout.tsx`.

### Routing / UI

- `app/` is expo-router (typed routes on). Route files stay **thin** — logic lives in `src/features/*`, shared primitives in `src/ui/`.
- **Navigation is native, liquid glass on iOS 26** (pattern from game7). `app/(tabs)/_layout.tsx` uses `NativeTabs` (`expo-router/unstable-native-tabs`) with SF Symbol icons — never the JS `Tabs`. Each tab is a folder (`(home)/`, `settings/`) whose `_layout.tsx` renders `TabStack` (`src/ui/tab-stack.tsx`: native Stack, standard inline title — no large titles — transparent header on iOS). Header actions are `Stack.Toolbar` + `Stack.Toolbar.Button icon="<sf symbol>"` declared in the page, not custom `headerRight` views. **Never give the tab bar or an iOS header a backgroundColor** — a solid fill turns the glass off. Scroll views and lists set `contentInsetAdjustmentBehavior="automatic"` (`Screen` does) so content clears the floating bars without hardcoded padding.
- **Screens are compositions, never monoliths.** A screen is multiple reused components, not one 700-line file. Extract past ~150 lines; reuse an existing primitive or feature component before writing a new one (inventory in DESIGN.md).
- Styling is **NativeWind v4 semantic tokens only** — no hex in components, no `StyleSheet.create`, no raw pixel values in `style={{}}` (spacing comes from the Tailwind scale; the few allowed exceptions are listed in DESIGN.md). Imperative color props (navigation options, `placeholderTextColor`, icon colors) come from `useThemeColors()`.
- The palette lives in THREE synced places: `global.css`, `src/ui/theme-colors.ts`, and the THEME constant inside each widget file.
- **Dark mode and en/es ship from day one** in every app — retrofitting them is a migration; having them from the start is free. Dark mode: persisted `themePreference` → `ThemeSync` → nativewind `setColorScheme` → `ThemeRoot`. Don't read `Appearance` directly, and don't hardcode strings.
- **Safe areas**: every full-screen surface and modal respects safe-area insets (`Screen` handles it; custom overlays use `SafeAreaView`/`useSafeAreaInsets`). Nothing may render under the clock or home indicator.

### UX rules (apply to every new screen/flow)

- **Data states**: any component rendering async/db-backed data implements all three of loading, error (with retry where it makes sense), and empty (saying what to do next). A blank region is a bug. Render them with `LoadingState` / `ErrorState` / `EmptyState` from `src/ui/state-views.tsx` (Home and the detail screen are the reference).
- **Long lists**: collections inside scrolling screens go through `src/ui/expandable-list.tsx` (view more/less) or pagination — screens must not scroll forever because one section is huge.
- **Cancellability**: every multi-step workflow offers cancel/back to the previous state at ANY point — one tap, not ten back-presses. Modals are dismissible; destructive exits from dirty forms get a confirm.
- **Destructive actions**: irreversible operations get a confirm, and where feasible an undo path (e.g. an "un-mark" affordance) so a mistap is recoverable without support email.
- **Error boundary**: `src/ui/error-boundary.tsx` wraps the navigator in `app/_layout.tsx` — an unexpected render throw shows a themed retry screen instead of blanking the tree. Keep it mounted.
- **Onboarding** (`app/onboarding.tsx`): paged intro, **skippable at all times**, ends with a call-to-action that creates the user's first items. Gated by the persisted `onboardingDone` flag in `(tabs)/_layout.tsx`; revisitable from Settings. Keep it to 3–4 slides of basic information.
- **Accounts**: this template has none, but if account creation is ever added, a **delete account** flow (Settings row → confirm → server-side deletion, see shotbook's `delete-account` edge function for the model) must ship in the same release. App Store review requires it, and so do we.

### Settings screen (`app/(tabs)/settings/index.tsx`)

Standard sections every app keeps: Appearance (theme), Language, Feel (haptics toggle), Pro (paywall entry + restore purchases), About — **Leave a review**, **Privacy policy**, replay onboarding — and the **app version** read from app.json via `Constants.expoConfig?.version` (never hardcode it).

`src/features/dev/developer-section.tsx` renders at the bottom in `__DEV__` builds only: preview-state tools (reset onboarding, empty the data) for staging App Store screenshots and testing flows. English-only copy — it never ships. Add new dev tools there, gated in that one place.

### Reviews (`src/lib/review-prompt.ts`)

- **After a happy moment** (milestone reached, Nth item created, workflow completed) call `maybeRequestReview()` — never on launch, never mid-task. Apple allows ~3 prompts/365 days; we additionally cap to one attempt per session.
- The Settings row uses `requestReviewExplicitly()` (user-initiated: ignores the session cap, falls back to the App Store write-review page).
- Set `APP_STORE_ID` in `review-prompt.ts` after the first release.

### Privacy policy

Every app has a published privacy policy before release:

1. Write `content/privacy/stridr.mdx` in the portfolio repo (`~/Projects/my-portfolio`) — copy the frontmatter shape from an existing one (`shotbook.mdx`: app, developer, effectiveDate, lastUpdated, contactEmail, summary).
2. Publish the portfolio; the policy is served at `https://www.matiasturra.dev/privacy/stridr`.
3. That URL is already wired into Settings (`PRIVACY_POLICY_URL`) — and goes into App Store Connect metadata.

### iOS widget (`widgets/`)

- Uses **expo-widgets + @expo/ui/swift-ui** (TSX with a `"widget"` directive), NOT @bacons/apple-targets.
- The `"widget"` directive serializes only the component function body into the widget process — every constant it uses must be declared *inside* the function.
- Data flows one way: `WidgetSync` (mounted in the root layout) maps live-query data to props and calls `Widget.updateSnapshot()`. Strings are pre-translated on the JS side — the widget receives display text, never i18n keys.
- Widget sync must never break the app — keep it wrapped in try/catch.
- Widget name, families, and configuration parameters live in app.json under the `expo-widgets` plugin; changing their *shape* needs a new native build (`npm run ios`), only values are runtime-settable.
- Deep links use `widgetURL("stridr://...")`, matching the app `scheme`.

### Motion (Reanimated)

`react-native-reanimated` (v4, with `react-native-worklets`) is the only animation library — no `Animated` from `react-native`, no Lottie for UI feedback. Its babel plugin is auto-configured by `babel-preset-expo`; don't add it to `babel.config.js`.

- **Tokens, not numbers**: durations and springs come from `src/ui/motion.ts` (`DURATION.*`, `SPRING.*`). A new kind of motion = a new token, same as colors.
- **Prefer declarative over hand-rolled.** In order: layout animations (`layout={LinearTransition.duration(DURATION.layout)}`, `entering={FadeInDown.duration(DURATION.enter)}`, `exiting={FadeOut.duration(DURATION.exit)}`), then `useSharedValue` + `useAnimatedStyle` + `withTiming/withSpring/withSequence/withDelay/withRepeat`. Lists use `Animated.FlatList` + `itemLayoutAnimation` so rows glide when one is added or removed.
- **Shared values**: read/write with `.get()` / `.set()` (React Compiler-safe — it's on in this app); never read a shared value during render. Drive them from `useEffect` on a prop change, or from gesture/press handlers.
- **Animate transform and opacity only** (`scale`, `translateX/Y`, `opacity`). For widths, animate a `scaleX` or a measured `translateX` (`onLayout` once), not `width`. Color changes go through `interpolateColor` with token colors from `useThemeColors()`.
- **One-shot moments fire on transitions, never on mount**: keep a `useRef` of the previous value and only animate when it flips false→true (see game7's `MomentFlash`/`ProgressBar` pattern). Opening a screen on an already-reached state must be still.
- **Exits are faster than entrances** (`DURATION.exit` < `DURATION.enter`); stagger list entrances with `.delay(i * DURATION.stagger)` and cap it (first ~8 items).
- **Keep a fixed footprint**: animated content that swaps (counters, badges) renders an invisible "ghost" copy to reserve size, so the layout around it never jumps.
- **Reduce Motion is mandatory** for anything looping or ambient: `useReducedMotion()` → hold a static state (or render `null` for pure decoration). One-shot entrances can stay; infinite `withRepeat` cannot.
- Press feel: wrap pressables in `Animated.View` + `usePressScale()` (`src/ui/use-press-scale.ts`) — `Button` already does. Don't stack it on top of `active:opacity-*` for the same element beyond what `Button` does.
- Reusable effects become primitives in `src/ui/` (`use-press-scale.ts`, future `rolling-number.tsx`, `use-blink.ts`), not copy-pasted per screen. Restraint: motion marks state changes and moments; it is never decoration on idle screens.

### Haptics (Pulsar)

`react-native-pulsar` (Software Mansion) is the haptics engine — **not** `expo-haptics`. It's a native module: adding it (or updating it) needs a new dev-client build (`npm run ios`).

- **Only `src/features/haptics/haptics.ts` imports `react-native-pulsar`.** It lazy-requires the module after probing `TurboModuleRegistry.get("RNPulsar")`, because Pulsar's entry throws at import time when the native module isn't in the binary (old dev client, Expo Go, web). Never `import { Presets } from "react-native-pulsar"` anywhere else.
- **Call intents, never presets**: components call `haptics.press()`, `haptics.tick()`, `haptics.toggleOn/Off()`, `haptics.destructive()`, `haptics.success()`, `haptics.warning()`, `haptics.celebrate()`. Need a new feel? Add a named intent (domain words: `streakKept`, `goalReached`) mapped to a preset there. Keep the vocabulary small.
- **Rich presets** (`Presets.bloom()`, `Presets.cleave()` …) are for real moments only; touches use `Presets.System.*`. Every rich preset an intent uses goes in `PRELOAD` (PascalCase names) so its first play lands on the beat. Audition presets in the free Pulsar app on a physical device.
- **Touch haptics live next to the touch**: fire on `onPressIn` for presses (it should coincide with the scale-down), on the commit for choices (`tick` on picker select / pager page change), and `destructive` on the *confirm* of a destructive alert — not on the button that opens it.
- **Moment haptics derive from state, in one place**: a null-rendering component mounted once in `app/_layout.tsx` uses `useMomentHaptic(active, haptics.x, delayMs)` (fires on false→true only, silent while data is `null`/loading and on mount). Tab screens stay mounted, so firing from screens double-buzzes. Use `delay` to land the buzz on the animation's visual peak.
- **Tone**: warm on wins, at most one soft signal on failure, never a punishing or repeated buzz. No haptic on scroll, on every keystroke, or on passive data updates.
- **User control**: the persisted `hapticsEnabled` preference (Settings → Feel) is applied by `HapticsSync` via `Settings.enableHaptics()` — one global switch, so call sites never check it.
- **Simulator**: haptics don't play there; DeveloperSection has an "Audible simulation" switch (`Settings.enableSound`) and a sampler row per intent. It's off by default — never leave it on.
- Tests: jest maps `react-native-pulsar` to `react-native-pulsar/jest-mock` (no-op `jest.fn()`s), so modules that import haptics stay testable.

### i18n

- i18next + expo-localization; **en and es from day one**, kept in key parity (`src/i18n/{en,es}.json`) — every new string lands in both files in the same change.
- `import "@/src/i18n"` must stay the first import of `app/_layout.tsx`.
- Components use `useTranslation()`; non-React modules import the `i18n` default and call `i18n.t()`.
- Adding a language: add the JSON file, extend `SUPPORTED_LANGUAGES` in `src/i18n/index.ts`, the options in settings, `CFBundleLocalizations` in app.json, and `store.config.json`.

### Notifications (when you add them — none scaffolded)

Rules learned the hard way in `since` (`src/utils/notifications.ts` there is the reference implementation):

- Guard for Expo Go first (`Constants.appOwnership === "expo"`) and degrade silently — notifications need a dev-client build.
- Every notification carries a typed `data` payload (`type`, ids) — that's what makes scoped cancellation and orphan-cleanup sweeps possible. Sweeps return counts.
- **Reconcile on launch**: re-register pending notifications at startup (iOS drops them) and clean up orphans for entities deleted while the app was closed. No BGTaskScheduler — lazy sweeps on launch/foreground are the source of truth.
- **Copy is baked at schedule time**, so a language change must reschedule everything pending (`LanguageSync` is where that hook belongs).
- Only request the permission when a feature actually schedules something — a launch-time prompt with no feature behind it is an App Review risk.
- Test senders live beside the real schedulers, consumed only by the DeveloperSection.

### Purchases / Paywall (RevenueCat)

- `src/features/purchases/`: `purchases-service.ts` is the only module importing `react-native-purchases`; `purchases-store.ts` holds `isReady/isPro/customerInfo`; gate features with the `useIsPro()` selector, never the whole store.
- Keys come from `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` in `.env`. The Pro entitlement id is `PRO_ENTITLEMENT_ID` in `types.ts` and must match the RevenueCat dashboard.
- `app/paywall.tsx` is a custom paywall (modal route) over `getCurrentOffering()`. User-cancelled purchases are not errors (`isUserCancelled`).

One-time RevenueCat setup for a new app:

1. Dashboard: create the app (iOS + Android), products in App Store Connect / Play Console, an entitlement named `pro`, attach products to it, and a `default` offering with the packages the paywall shows.
2. Copy the platform API keys into `.env` (and EAS env for builds).
3. Test on a dev-client build with a sandbox App Store account (`npm run ios`; RevenueCat logs are DEBUG in `__DEV__`).

Hiding a feature behind the paywall (the standard recipe):

1. Gate the feature at its entry point with `useIsPro()`; when false, `router.push("/paywall?variant=<feature>")` (add the `variant` search param + per-variant copy under `paywall.*` in both locale files).
2. Purchase success path: `purchasePackage` → `refresh()` → `router.back()`. Always offer restore. Keep the App Store terms footer.
3. Free tier stays useful: gate depth (unlimited entries, widget, exports), not the core loop.

### Ads (AdMob)

- `src/features/ads/`: `ads-service.ts` is the only module touching the SDK's init API (`initializeAds()` is called once from `app/_layout.tsx`); `ad-banner.tsx` exports `AdBanner`, the mountable slot — it renders nothing for Pro users (`useIsPro()`) and when ads are unconfigured, so mount it unconditionally (Home has it at the bottom, above the tab bar).
- **The env key is the on-switch**: ad unit ids come from `EXPO_PUBLIC_ADMOB_BANNER_IOS` / `EXPO_PUBLIC_ADMOB_BANNER_ANDROID` in `.env` (+ EAS env for builds). A platform without a key has ads silently disabled — the scaffold ships with both empty, so no ads until AdMob is set up. Shipping iOS-only ads (the usual case) = set only the iOS key.
- **Dev builds always serve Google's test unit** (`TestIds.ADAPTIVE_BANNER`) — clicking real ads on a development device risks an AdMob account ban. Real units only ever load in release builds.
- app.json ships **Google's sample AdMob app ids** in the `react-native-google-mobile-ads` plugin so native builds don't crash at startup before setup. Replace them with the real app ids (AdMob → App settings, `ca-app-pub-…~…`) when the AdMob apps are created — app ids bake into the native build, so changing them requires a rebuild (`npm run ios`). App id (`~`) goes in app.json; ad **unit** ids (`/`) go in `.env` — don't mix them up.
- **Non-personalized requests only** (`requestNonPersonalizedAdsOnly: true`) — no ATT prompt, consistent with the no-tracking store position. Switching to personalized ads would require the ATT flow and privacy-label changes; don't do it casually.
- Ads vs Pro: the banner is the free tier's trade-off and Pro removes it — mention "remove ads" in the paywall copy when ads are live.
- If this app won't run ads: delete `src/features/ads/`, the `<AdBanner />` mount in Home, the plugin entry in app.json, and `npm uninstall react-native-google-mobile-ads`.

## Conventions

- **File naming: kebab-case, no exceptions** (`review-prompt.ts`, `items-form.tsx`, `theme-sync.tsx`, `purchases-store.ts`, `items-widget.tsx`). Component and hook *names* inside stay PascalCase/camelCase; only file names are kebab. Why: macOS is case-insensitive but git and Linux CI are not, so a case-only rename can pass locally and break the build elsewhere — all-lowercase names can't hit that.
- TypeScript strict incl. `noUncheckedIndexedAccess`; single path alias `@/*` → repo root (imports read `@/src/...`, `@/widgets/...`).
- Lint/format: Biome only (`biome.json`: 100 cols, double quotes). Run `npm run lint:fix` before committing.
- Tests cover **pure logic only** (zod schemas, `src/lib`, services) in colocated `__tests__/` folders — no component snapshot tests.
- Logs are prefixed `[feature/function]`: `console.error("[purchases/restore] failed", error)`.
- Comments explain *why* (rationale, workarounds, sync requirements), not what.
- Conventional commits with a feature scope: `feat(items): ...`, `fix(settings): ...`.
- `/ios` and `/android` are gitignored prebuild output — never edit them by hand; native config changes go through app.json plugins.
- Env: only `EXPO_PUBLIC_*` vars are readable in app code; `.env` is gitignored, `.env.example` documents the keys.
- New domain logic = a new feature module with the `schema/queries/form` layout above. Don't put business logic in route files.
