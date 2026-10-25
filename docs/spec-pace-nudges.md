# Spec: Pace nudges

Status: agreed 2026-10-25 (interview between Matias and Claude, from the Stitch onboarding step "Gentle nudges, never nagware."). Free. iOS only. Local notifications only — no push, no server, no analytics.

Workflow: commit this spec first (`chore: add pace-nudges spec`), then implement in the order in §Implementation order. The spec is the authority — deviations get written back here before they land.

## 1. Pace nudge

### Semantics
- **At most one nudge per day**, at **18:00 local** (`NUDGE_RULES.hour`), and only when today is behind the target's pace at that time.
- "Behind pace at 18:00" = today's total < goal × the pace fraction at 18:00 (pace window 07:00–22:00, `STATS_RULES`, so 11/15 ≈ 73 %). Steps only grow during a day, so once the total reaches that mark the nudge is cancelled for good.
- **No goal → no nudge.** No data today (`total = null`) → no nudge (unknown is not "behind", spec steps-core decision 3).
- Off by default. On only after the user enables it (onboarding step 3 or Settings) **and** iOS grants permission. Permission revoked in iOS Settings → nothing is scheduled; the preference is left as is.
- Copy is baked at schedule time (remaining steps as of the last refresh) — never claims real time ("About 2,400 steps to go").
- Silent (no sound), no badge. Tapping opens the app (Today).

### Side effects
1. On every stats change (launch, foreground, HealthKit observer incl. background delivery, manual edits), on language change, and on the toggle: reconcile — schedule/replace the single `pace-nudge` request for today 18:00, or cancel it.
2. Requests carry `data: { type: "paceNudge", day }`; the fixed identifier makes rescheduling a replace and cancellation scoped.
3. Disabling cancels the pending request.

### Data model
No SQLite changes. Preferences store: `paceNudgesEnabled: boolean` (default `false`).

### Module
`src/features/notifications/`:
- `notifications-service.ts` — the only importer of `expo-notifications` (lazy-required; degrades to no-ops when the native module isn't in the binary). `getNotificationPermission()`, `requestNotificationPermission()`, `schedulePaceNudge({ fireAt, title, body, day })`, `cancelPaceNudge()`.
- `nudge.ts` — pure `planPaceNudge({ now, total, goal }) → { fireAt, remaining } | null` + `NUDGE_RULES`; Jest-tested.
- `nudge-sync.tsx` — `NudgeSync`, mounted once in `app/_layout.tsx`.

### UI
- **Onboarding step 3** (replaces "See the pattern"): title, body, a preview of the notification and its rules. "Enable smart notifications →" asks for permission and turns nudges on when granted; "Maybe later" skips. Both advance. Already on → "Next".
- **Settings → Display card**: "Pace nudges" switch under Haptics. Turning it on asks for permission; denied → alert with "Open Settings".
- **DeveloperSection**: "Send test nudge (5 s)".

## Cross-cutting obligations
- i18n keys in BOTH `en.json` and `es.json`, same change; a language change reschedules (NudgeSync depends on `t`).
- New native module → new dev-client build (`npm run ios`).
- Jest tests for `planPaceNudge`.

## Implementation order
1. Install `expo-notifications` + config plugin; service.
2. `nudge.ts` + tests.
3. `NudgeSync` + preference.
4. Onboarding step 3, Settings switch, dev sender.

## Out of scope
- Hourly / idle reminders (TODO.md v1.1 Hourly tab), configurable nudge time, streak-at-risk alerts, push notifications.
