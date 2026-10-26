# Spec: Steps core (MVP)

Status: drafted 2026-10-25 from the product spec "Step Tracker — Product Specification, Draft v1" + the Stitch designs (`today_step_dashboard`, `trends_history`, `targets_settings`). **Open questions §14 were resolved by Claude with defaults — review the "Decisions" section and push back on any.** Free for now — the Pro split is an `## Open:` item in TODO.md. iOS only. No account, no backend, no analytics.

Workflow: this spec is the domain authority; deviations get written back here before they land.

## Decisions (product spec §14)

1. **Manual entries vs. later HealthKit data.** Manual entries are *user-confirmed supplemental* activity, added on top of HealthKit's aggregated daily total. No automatic de-duplication (HealthKit can't tell us what a device missed). Defenses: a confirm dialog on every new entry ("only add activity your iPhone/Watch didn't record"), the entry is labelled MANUAL in the log next to the day's recorded total, and it can be edited/deleted at any time. Manual steps are never written to HealthKit.
2. **Limited history.** Records and "since" labels say what history they're based on: `since <first day with data>`, or `limited access since <date>` when iOS 27's per-app lower bound (`getEarliestAuthorizedSampleDates`) is set.
3. **Valid day.** A day is valid when it has any HealthKit samples **or** any manual entry. A valid day with HealthKit samples summing to 0 is a real 0. A day with neither is *no data* (`total = null`): excluded from averages, peaks, records, trend; drawn as a stub bar, never as 0.
4. **Estimation defaults.** Stride 0.75 m; walking cadence 100 steps/min (conservative — errs low). Height → stride at 41.5 % of height. Precedence: manual stride > height > default. Distance wins over duration when both are given. Assumptions are stored on each walk so preference changes don't rewrite history. Adjustable in Settings → Biomechanics.
5. **Streaks.** A completed day ≥ goal extends; < goal breaks; a day with no goal ends the streak. No-data days are skipped (neither extend nor break) up to **2 in a row**; a 3rd breaks it. Today extends the streak once the goal is met and never breaks it before midnight.
6. **Widget refresh.** The app pushes a 2-entry WidgetKit timeline (now + local midnight with an empty day) whenever stats change: launch, foreground, HealthKit observer, manual edits, and HealthKit **background delivery** (hourly, `configureBackgroundTypes`) which wakes the app to refresh. No BGTaskScheduler. iOS decides the actual redraw; copy never promises real time.

Other rules fixed here (all in `src/features/stats/stats.ts`, `STATS_RULES`, pinned by tests):
- **7-day average** = last 7 *completed* days (today excluded — it's partial). Baseline = the 7 before.
- **Weekly total** = week start → today. Week start is a Settings preference (Week chart: Mon – Sun default, Sun – Sat, or Last 7 days, which keeps Monday for totals and weekly bars; added 2026-10-26). Week-over-week % compares the same span of last week, only when last week has ≥ 4 valid days.
- **Trend** = last 30 completed days vs the 30 before; shown only with ≥ 15 valid days in each; no % when the previous average is 0.
- **Goals** are a history (`goal_changes`): a change applies from its day on; the *first* goal also applies to all earlier days so new users get immediate streaks.
- **Pace** ("x ahead of pace") assumes even accumulation 07:00–22:00.
- **Active minute** = a minute with ≥ 60 steps (intraday cards; HealthKit-only, manual entries have no time of day).
- **Chart** ranges Week/30D/90D/All. Week is the calendar week containing today (days ahead empty), or the rolling last 7 days ("7D") with that preference; the large widget's week chart follows the same setting. The chart draws at most 120 bars: past that, days fold into weekly, then monthly, then yearly average-per-day bars (finest that fits — a history since 2017 charts ~118 months; changed 2026-10-26 after weekly bars went 0pt wide on multi-year data). Stats stay daily.
- **Stats tab "Daily avg"** is the average over the *selected range* (Today keeps the fixed 7-day average).

## Data model

- `manual_activity` — kind (`steps`|`walk`), local `day`, final `steps`, `estimated_steps`, `distance_meters`, `duration_seconds`, `stride_meters`/`cadence_spm` used.
- `goal_changes` — `effective_from` (unique day), `steps` (null = goal off).
- HealthKit totals are **not** stored. `health-store.ts` mirrors query results in memory: full history once per day + trailing 8-day window on every refresh; per-minute data for the last 8 days.
- Preferences (persisted Zustand): `distanceUnit`, `heightCm`, `strideCm`, `cadenceSpm`.

## Modules

- `src/features/health/` — `healthkit-service.ts` (only importer of `@kingstinct/react-native-healthkit`, lazy-required), `health-store.ts`, `health-sync.tsx`.
- `src/features/stats/` — pure `stats.ts` + `intraday.ts`, `use-step-stats.ts` (the one hook screens read), cards.
- `src/features/activity/` — schema/queries/estimate/form + activity log.
- `src/features/goal/` — goal rules + queries.
- `src/features/today/`, `src/features/settings/`, `src/features/export/` (CSV via share sheet).

## UI

Tabs: **Today**, **Stats**, **Settings** (native tabs; tab roots hide the native header and draw the in-content `AppHeader`). Every data card has loading / empty / error in place (`src/ui/card-state.tsx`). Onboarding step 1 shows the read-only Health contract (reads only HKStepCount; lists what is never accessed) and its CTA requests access, then advances; the last slide re-asks only if step 1 was swiped past. Step 2 calibrates stride from height (tape-measure ruler, cm or ft/in display, stored in cm); "Confirm height" saves it and clears any manual stride, swiping past keeps the default; scrubbing ticks a haptic per unit like a picker. Add Activity is a modal (`/activity/new`) — swipe to cancel; edit/delete at `/activity/[id]` with a delete confirm.

## Out of scope (MVP)

Per product spec §13, plus: the Hourly tab from the Stitch export, stride calibration walk, per-weekday goals, Android.
