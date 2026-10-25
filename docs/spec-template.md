# Spec: <feature batch name>

Status: agreed <YYYY-MM-DD> (interview between Matias and Claude). <Free / Pro-gated — decide up front>. <Global exclusions, e.g. "Siri Shortcuts are out of scope">.

Workflow: commit this spec first (`chore: add <name> spec`), then implement in the order in §Implementation order, using the planned commit series below. The spec is the authority — deviations get written back here before they land.

## 1. <Feature>

### Semantics
Prose rules. State invariants as absolutes ("No failed state. Ever." / "Progress is always computed, never stored").

### Side effects
Numbered and exhaustive — every table touched, every reschedule, every widget sync, every file written or cleaned up (including the cancel-out path).

### Data model
The exact `src/db/schema.ts` additions. Note backwards compatibility explicitly: which existing consumers keep working unchanged and why. Then `npm run db:generate`.

### Module
`src/features/<feature>/`: `schema.ts` (zod), `queries.ts` (hook + mutation signatures), `<feature>-form.tsx` — write the actual function signatures.

### UI
Routes, screens, behaviors. Every data-backed component lists its loading / error / empty states. Multi-step flows state their cancel path.

## Cross-cutting obligations

Every feature inherits these — restate them so the implementation session can't miss one:
- i18n keys in BOTH `src/i18n/en.json` and `es.json`, same change
- semantic tokens only; no pixels; states per DESIGN.md
- widget payload changes mirrored in `widgets/` and `WidgetSync`
- Jest tests for the pure logic (schema, lib, services)
- planned commit series: `feat(<scope>): ...`, `feat(<scope>): ...`

## Implementation order

1. <step> — <rationale, e.g. "creates the navigation surface the rest plugs into">
2. ...

## Out of scope

Considered and cut (list them so they aren't re-litigated mid-build):
- ...
