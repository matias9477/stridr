# Spec: Custom range

Status: agreed 2026-10-26 (interview between Matias and Claude). **Pro** — a fifth Stats range chip, gated with 90D/All (TODO.md Pro split). Until RevenueCat is set up the app **mocks Pro on** (§0), so the gate is wired but never blocks during development. Stats tab only: Today, the widgets and the share card keep their fixed windows.

Workflow: commit this spec first (`chore: add custom-range spec`), then implement in the order in §Implementation order. The spec is the authority — deviations get written back here before they land.

## 0. Mock Pro until RevenueCat

### Semantics
- A single constant `MOCK_PRO = true` in `src/features/purchases/types.ts` (next to `PRO_ENTITLEMENT_ID`). While it is true, `usePurchasesStore` starts with `isPro: true` and `initialize`/`refresh`/`restore` never set it to false — every `useIsPro()` gate is open in every build (dev, TestFlight).
- It is explicit, not derived from "no API key": adding the keys before the products and offering exist must not silently lock features.
- Settings → Pro shows the active state while mocked (it already reads `useIsPro()`).

### Side effects
1. `types.ts`: `MOCK_PRO` + a comment pointing at the TODO entry.
2. `purchases-store.ts`: initial state and the three setters OR in `MOCK_PRO`.
3. TODO.md: tech-debt entry under the RevenueCat setup item — "remove `MOCK_PRO` (types.ts) and its three uses in purchases-store.ts once the `default` offering resolves on a sandbox account".

## 1. Custom range

### Semantics
- `ChartRange` gains `"custom"`. A saved custom range is one of:
  - **Last X days** — the X days ending today, today included; rolls forward every day. 1 ≤ X ≤ 3650.
  - **Between dates** — fixed `from`…`to` day keys, both inclusive; `from ≤ to`, `to ≤ today`, `from ≥` history start. A single day (`from === to`) is allowed.
- The saved custom range **persists across launches** (preferences). The Stats screen still opens on Week every time; the selected chip is not persisted.
- The chart **waits for Save**: editing never redraws the chart. Only Save applies a range.
- Everything that follows `range` today follows custom the same way: the chart (folding rules unchanged — a long custom span folds into week/month/year bars past 120), the header date chip, the range total tile, and the daily average (completed days only, as for the other ranges). Week-only details (MAX tag, weekday letters, today arrow, vs-last-week) stay Week-only.
- Days before history start inside a "Last X" window are empty slots, exactly like 30D/90D today.

### Chip and editor behavior
- Chip label: `13D` for a saved Last X; **"Custom"** otherwise (nothing saved, or Between dates — a date span broke the fifth-of-the-switch width, and the chart header chip already shows the dates; changed 2026-10-26).
- Tapping Custom **always opens the editor**, a panel that expands between the range switch and the chart (`FadeInDown` entering / `FadeOut` exiting, siblings glide with `LinearTransition`):
  - Saved range exists → the chart switches to it immediately and the editor opens prefilled with it.
  - Nothing saved → the chart stays on the previous chip; the editor opens with defaults (Last 14 days / Between: 30 days ago … today).
  - Custom already selected and editor open → tapping it again collapses it (same as Cancel). `Segmented` needs to report a re-tap of the selected option for this (`onReselect`).
  - While the editor is open the Custom chip reads as selected, even before a first save; the chart keeps the previous range until Save.
- Editor contents: a mode `Segmented` (**Last X days** | **Between dates**), then
  - Last X: a `MetricInput` ("LAST", unit "days", number pad).
  - Between: two rows, **From** and **To**, each a `DateField` (`src/ui/date-field`) bounded to history start … today; From's upper bound is To and To's lower bound is From. iOS: the SwiftUI compact `DatePicker`. Both platforms show the date in a Space Mono chip — on iOS the native compact picker sits over it at 0.02 opacity (SwiftUI's compact button ignores custom fonts) so a tap still opens the system calendar. Android: the chip expands the Material calendar inline (Compose has no compact button); it converts through UTC midnights because Material reports days that way.
  - **Cancel** and **Save** as `ActionButton`s (Space Mono, like every action).
  - The editor sits half a column gap from the switch and the chart (`-my-3` against the `gap-6` column) — it belongs to the switch.
- **Save**: validates, persists, selects Custom, collapses, dismisses the keyboard. Disabled while invalid; the invalid field shows its inline error.
- **Cancel**: discards the draft and collapses. If nothing was ever saved, the selection returns to the chip that was active before Custom was tapped.
- Tapping another chip while the editor is open discards the draft and collapses it.
- Free users (once `MOCK_PRO` is gone): the Custom chip goes to `router.push("/paywall?variant=stats")` instead of opening the editor — the same gate as 90D/All.

### Data model
No SQLite changes. Preferences store (`src/stores/preferences.ts`):

```ts
export type CustomRange =
  | { kind: "last"; days: number }
  | { kind: "between"; from: DayKey; to: DayKey };

customRange: CustomRange | null; // default null
setCustomRange: (value: CustomRange) => void;
```

Backwards compatible: zustand persist merges the missing key as `null` for existing installs.

### Module
- `src/features/stats/stats.ts` (pure, tested):
  - `ChartRange = "week" | "month" | "quarter" | "all" | "custom"`.
  - `customRangeBounds(custom: CustomRange, today: DayKey): { from: DayKey; to: DayKey }`.
  - `rangeDays(days, range, today, weekView, custom: CustomRange | null)` — `"custom"` charts `customRangeBounds`; a `"custom"` with `null` custom never happens (the chip only selects after Save) but falls back to Week.
- `src/features/stats/custom-range/`:
  - `schema.ts` — zod discriminated union on `kind`, lazy i18n error thunks; `days` int 1–3650; `from ≤ to ≤ today`, `from ≥ historyFrom` (built by `customRangeSchema(today, historyFrom)`).
  - `custom-range-form.tsx` — `CustomRangeEditor({ initial, today, historyFrom, onSave, onCancel })`, react-hook-form + zodResolver.
  - `custom-range-label.ts` — `customChipLabel(custom, locale)` (pure, tested).
- Range-dependent labels (`rangeLabelKey` users: the average caption) take the custom chip label when `range === "custom"`.

### UI
- `app/(tabs)/stats/index.tsx` owns `range`, `previousRange` and `editorOpen`; stays thin — the editor is the form component above.
- Summary total tile on Custom: label "Range total" / "Total del rango", caption the span (`Mar 4 – today` for Last X, `Mar 4 – Apr 2` for Between).
- States: the editor has no async data (history start comes from `useStepStats`, already loaded — while stats load, the Custom chip still works and the date bounds fall back to today). Chart and tiles reuse their existing loading/error/empty states; "No steps in this range." covers an empty custom window.
- Keyboard: the number pad must not cover Save — the screen scroll view keeps taps (`keyboardShouldPersistTaps="handled"`) and Save sits directly under the input.

## Cross-cutting obligations
- i18n keys in BOTH `src/i18n/en.json` and `es.json`, same change (chip "Custom"/"Personalizado", mode labels, From/To, Save/Cancel reuse common keys if present, errors, "Range total").
- Semantic tokens only; editor is a `Panel surface="sunken"` like the cards around it.
- Motion tokens from `src/ui/motion.ts`; haptics: `tick` on mode switch, Buttons already press.
- Jest: `customRangeBounds`, `rangeDays` with custom, `customChipLabel`, the schema.
- Planned commits:
  1. `chore: add custom-range spec`
  2. `feat(purchases): mock Pro until RevenueCat is set up`
  3. `feat(stats): custom range model`
  4. `feat(stats): custom range editor`
  5. `feat(stats): custom chip in the range switch`
  6. `docs(todo): custom range shipped`

## Implementation order
1. Mock Pro — unblocks testing every gated path, including this one.
2. Model (`CustomRange`, preference, `customRangeBounds`, `rangeDays`, label) + tests — pure, and everything else reads it.
3. Editor component — buildable in isolation against the model.
4. Wire the chip, editor slot, chart/tile/average plumbing on the Stats screen.
5. TODO.md: Shipped entry; add Custom to the "gate the 90D / All chips" task.

## Out of scope
- Persisting the selected chip / reopening Stats on Custom.
- Live chart preview while editing.
- Multiple saved custom ranges / presets.
- An inline two-tap calendar.
- Custom ranges on Today, widgets, share card or CSV export.
- Comparing a custom range to the previous equal-length period (a "vs previous" caption).
