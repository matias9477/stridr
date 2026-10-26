# Spec: Share card

Status: agreed 2026-10-26 (interview between Matias and Claude). Free for everyone — every shared card is distribution. Today only; Instagram Story format only; image only (no caption text). No Instagram SDK / Facebook App ID — the system share sheet is the only exit.

Workflow: commit this spec first (`chore: add share-card spec`), then implement in the order in §Implementation order. The spec is the authority — deviations get written back here before they land.

## 1. Share card

### Semantics
- The Today share button opens a **preview modal** of a designed card; its one **Share** button captures the card as a **1080×1920 PNG** (9:16, Instagram Story) and hands the file to the system share sheet. The text-only share is removed.
- The card is a dedicated component, never a screenshot of the Today screen. It **follows the user's theme** (dark/light) using the same palette as `theme-colors.ts` — monochrome, no accent color (DESIGN.md "Monochrome Cadence").
- **Hero: today's step count.** Huge Space Mono Bold; must fit any realistic value (e.g. 104,281) — shrink-to-fit via `adjustsFontSizeToFit`/a width-based size step, never wrap or clip.
- Layout, top → bottom:
  1. **Date label** — micro mono caps, locale-formatted ("SUN · 26 OCT"). No clock time.
  2. **Hero number** + "STEPS" label.
  3. **Goal line** under the number — "112% of 8,000" / "Goal reached"; omitted when no goal is set.
  4. **Second layer** (see below).
  5. **Stat row** — up to three mono stats with micro caps labels: **distance · active time · streak**. A missing stat is dropped and the row collapses (no goal → no streak; no HealthKit activity → no active time). Never a "—".
  6. **Brand lockup** — the logo mark (five rounded bars, drawn as `View`s at the splash-icon proportions, not the PNG) left of lowercase **"stridr"** in Space Mono Bold, centered, above the bottom safe zone. Nothing else: no URL, no tagline. Mark greys stay as-is on dark; inverted ramp on light so contrast holds.
- **Second layer — 24-hour bars** (when `hourly` has any non-null hour):
  - Always the full 00–23 axis, so every card has the same rhythm. Past/current hours: real bars, normalised to the day's max hour. Future hours: dim fixed-height stubs.
  - A 2×2 **"now" dot** (DESIGN.md active-tab motif) above the current hour.
  - **Ruler detailing**: hairline baseline with tick marks, micro mono hour labels at 00 · 06 · 12 · 18, and a hairline frame inset from the card edges.
  - If manual steps exist today (total − sum of hourly > 0), a small mono label "+4,000 logged" sits beside the axis — manual walks have no time of day, so they can't be placed in an hour. Bars stay HealthKit-only; the label keeps it honest.
- **Fallback second layer — 7-day bars** (when every hour is `null`: no HealthKit access or manual-only): last 7 days' totals, today highlighted, same ruler styling with weekday initials. No card ever shows an empty axis.
- **Instagram safe zones**: nothing essential in the top ~250px and bottom ~250px of the 1920px canvas (Instagram overlays its UI there). The date label and the lockup sit just inside those margins.
- Share stays disabled when today's total is `null` (unchanged from current behavior).

### Side effects
1. On Share: capture the visible card → temp PNG in the cache directory → `Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png" })`.
2. The temp file is deleted after `shareAsync` resolves (success or dismiss), and on capture failure. A failed capture shows an alert and logs `[share-card/capture]`.
3. No DB writes, no widget sync, no notifications, no preferences.

### Data model
None. Everything derives from `useStepStats()` (`todayTotal`, `hourly`, `index`, `streaks`, `activity`) plus `useEstimationSettings()` / `distanceUnit` for distance — same derivations as `TodayMetrics`.

### Module
New native dependency: `react-native-view-shot` (needs a new dev-client build, `npm run ios`).

`src/features/share-card/`:
- `share-card-model.ts` — pure, Jest-tested:
  - `buildShareCard({ stats, now, strideMeters, unit }) → ShareCardModel` — hero, goal line, `second: { kind: "hourly", bars, nowHour, loggedExtra } | { kind: "week", bars, todayIndex }`, `stats: ShareStat[]` (already collapsed).
  - `hourlyBars(hourly, nowHour) → { height: number /* 0–1 */, future: boolean }[]` (24 entries).
  - `loggedExtra(total, hourly) → number | null` (null when ≤ 0).
- `share-card.tsx` — `ShareCard` presentational component, laid out at a fixed logical 360×640 (9:16) so capture at 1080×1920 is an exact 3× on every device. Composed from: `share-card-bars.tsx` (hourly + week variants, ruler), `share-card-stats.tsx`, `brand-lockup.tsx` (mark + wordmark; reusable later for other branded surfaces).
- `share-card-capture.ts` — the only importer of `react-native-view-shot`: `captureShareCard(ref) → Promise<string>` (`captureRef(ref, { width: 1080, height: 1920, format: "png", result: "tmpfile" })`) and `shareCardImage(uri)` (share + cleanup).

### UI
- **Entry**: `TodayActions` share `IconButton` → `router.push("/share-card")`. Keeps its disabled state.
- **Route** `app/share-card.tsx` (thin), registered in `app/_layout.tsx` with `presentation: "modal"`. Accepts an optional `day` search param (seam; v1 always today — see Out of scope).
- **Preview**: the card scaled to fit the sheet width (wrapper transform; the captured view itself is never transformed), a **Share** `Button`, and a close toolbar button. Dismissible by swipe — the cancel path is one gesture.
- **States**: loading → `LoadingState` (stats still loading); error → `ErrorState` with retry (`stats.retry`); empty → `EmptyState` ("No steps yet today") — unreachable from the disabled button but required.
- **Motion** (one-shot entrance, opening the modal is the transition): bars grow from the baseline left→right over `DURATION.sweep` with each bar taking `DURATION.fill` (same as `bar-chart.tsx`); the hero rolls in via `RollingNumber`. **Share is disabled until both settle** so the capture never grabs a half-drawn frame. Reduce Motion → static card, Share enabled immediately.
- **Haptics**: only `Button`'s existing `press` on press-in. No haptic after sharing — `shareAsync` resolves on dismiss whether or not anything was posted.

## Cross-cutting obligations
- i18n keys in BOTH `en.json` and `es.json`, same change: `shareCard.*` (title, share, steps label, goal line, goal reached, logged extra, stat labels, capture error, empty). Delete `today.share.withGoal` / `today.share.plain` (keep `today.share.a11y`).
- Semantic tokens only; colors in the captured view come from `useThemeColors()` / NativeWind tokens. The 360×640 canvas size and ruler hairlines are the only fixed dimensions — add them to DESIGN.md's allowed exceptions.
- Fonts: the card must not render before Space Mono/Geist are loaded (already guaranteed by the root boot gate) — otherwise the PNG bakes in system fonts.
- Jest tests for `share-card-model.ts` (hourly normalisation incl. all-null and single-hour days, future stubs, logged extra, stat collapse, week fallback, goal line with/without goal).
- New native module → new dev-client build (`npm run ios`). Verify on a 2× simulator/device that the PNG is still crisp at 1080 wide.
- DESIGN.md: add `ShareCard` / `BrandLockup` to the component inventory.
- Planned commit series:
  - `chore: add share-card spec`
  - `feat(share-card): card model with hourly and weekly bars`
  - `feat(share-card): brand lockup and card layout`
  - `feat(share-card): preview modal with capture and share`
  - `feat(today): share opens the card preview` (removes text share + strings)
  - `docs(todo): share card shipped`

## Implementation order

1. `share-card-model.ts` + tests — pins every edge case (no goal, no HealthKit, manual extra, mid-day) before any pixels.
2. `BrandLockup` + `ShareCard` layout, rendered in the DeveloperSection for both themes and both languages to iterate visually.
3. Install `react-native-view-shot`, `share-card-capture.ts`, the `app/share-card.tsx` modal with states and the settle-gated Share.
4. Rewire `TodayActions`, delete the text share and its strings.
5. Motion polish + Reduce Motion pass; DESIGN.md and TODO.md updates.

## Out of scope

Considered and cut (list them so they aren't re-litigated mid-build):
- **Past days** (share from Stats) — needs hourly minutes for arbitrary dates; the `day` param on the route is the seam.
- **Feed formats** (1080×1350, 1080×1080) and a format toggle.
- **Direct-to-Instagram-Stories** (`instagram-stories://`, Facebook App ID, `LSApplicationQueriesSchemes`).
- **Caption text** alongside the image.
- **Per-share customisation** (choose stats, hide wordmark, alternate styles) — possible future Pro perk.
- **Background gradients/glows/grain** — would need Skia or SVG; flat + ruler detailing is the look.
- **Save to Photos button** — the share sheet's "Save Image" covers it with no Photos permission.
- **Clock time on the card** — the "now" dot on the axis carries mid-day context.
- **Placing manual walks into hours** (time-of-day field on manual activity).
