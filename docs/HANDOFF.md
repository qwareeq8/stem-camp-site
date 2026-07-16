# STEM Camp Field Notebook handoff

Working copy: `/data/projects/stem-camp-site-publish`

Last reviewed: July 15, 2026

This file describes the current publish repository. The older June 10 handoff
was superseded by more than 100 later commits and is not valid implementation
evidence.

## Scope and source boundaries

- Work only in this publish repository for site changes.
- The consolidated curriculum archive is read-only.
- The current ignored document IR contains reviewed edits that are not all
  represented in the archive. Full extraction and full publish are guarded.
- Demo/Extra component bodies, deck timing, keyboard behavior, and animations
  remain protected. This pass changed deck data, shell semantics, routing, and
  metadata, but did not rewrite a protected visual body.
- No database SQL, credential change, or backup operation was run.

## Current content model

There are three explicit provenance layers:

1. Original reviewed May 2026 kit.
2. Post-review source and printable corrections.
3. 2026 live-event record and post-kit additions.

The reviewed scoring rule is best 9 of 12 primary activities, each out of 100.
The historical site preserves the live override: ordinary entries are out of
100, the lowest quarter of non-CRANK entries is canceled, and CRANK is up to 300
and always counts. The public `2026_Live_Scoring_Addendum.pdf` explains the
difference. PYS-00 Card Tower, PYS-02R, CRANK, and PYB-05 are labeled as live
operational additions or keys where appropriate.

The schedule is labeled as the actual 2026 itinerary, not the original plan.
Expired dates no longer appear as "Up next" on Home.

## Implemented in the July 15 pass

### Admin and data safety

- Added explicit hydration states and retry UI per collection.
- Blocked Admin writes when live hydration is loading, failed, or invalid.
- Added revision-captured drafts and atomic `updated_at` concurrency checks.
- Protected first inserts and rejected stale whole-collection overwrites.
- Applied the same protections to the raw JSON editor.
- Added semantic validation for score ranges, duplicates, required text,
  schedule score keys, achievement recipients, and file metadata.
- Required positive byte metadata for every file row; a newly typed path is
  HEAD-checked and remains unsavable when the file is missing or unreadable.
- Added CRANK to the ordinary score-entry workflow and PYS-02R as a distinct
  rematch score key while retaining PYS-02 resource links.
- Added a fail-closed team-deletion guard for roster, score, ticket, and award
  references at both the form and central write boundaries, including Raw JSON
  and bulk-preview saves.
- Kept missing legacy award-recipient IDs visible on the public page instead of
  silently dropping them.
- Fixed schedule block inheritance when an Admin changes a day's camp.
- Added a stable Supabase Auth user-id allowlist schema and migration template.
- Prevented raw JSON edits from changing runtime Supabase connection settings,
  preserved edits made during in-flight saves, and blocked collection switches
  while raw-data operations are running.
- Made the Advanced "Clear browser previews" action reveal the last validated
  published snapshots instead of silently replacing them with starting data.
- Allowed an empty roster team only for counselors, matching the form's
  supported unassigned-counselor state, and normalized whitespace around CRANK.
- Made Admin authentication memory-only, restored the lock on reload/tab close,
  warned before leaving a dirty draft, and documented the award closeout order.

### Website and deck shell

- Fixed post-camp Home state and tied competition ranks.
- Fixed Files editor Printable/print handling and legacy select values.
- Replaced 108 per-file size requests with stamped byte metadata.
- Corrected deck heading order, nested main semantics, touch targets, and
  password-toggle labels.
- Replaced the malformed camp-selector tab semantics with an `aria-pressed`
  button group and hid the timer's decorative SVG from assistive technology.
- Updated custom-domain canonical, Open Graph, Twitter, and social-card assets.
- Unrouted scientifically or operationally inaccurate protected visuals for
  triangulation, pulleys, recovery, slinky timing, pinholes, hovercrafts,
  BookBot routing, and the neuron analogy; accurate text remains in place.
- Aligned PYS-01 magnet handling and Trees tick-check guidance with current
  safety sources; removed unused PYS-02 test weights.
- Retired the destructive deck split command and updated the manifest to 66
  components.

### Materials and provenance

- Corrected all four PYS-12 ramp cards with generator-validated board-fit math.
- Added the missing TTB-03 urban-heat route map and field log.
- Removed internal procurement-status text from the public TTB-04 guide through
  a durable correction layer and targeted publish path.
- Corrected PYS-01 swallowed-magnet guidance in both the station handout and
  combined packet, and removed unused PYS-02 test weights from both guide forms.
- Made PYS-03 hot glue explicitly low-temperature and staff-operated in the
  handout, guide, packet, and prep material.
- Made PYS-04 wrist-pulse collection optional, wrist-only, stop-symptom aware,
  and explicitly non-medical; corrected its two-trial averaging log.
- Added PYS-06 eye protection and the exact `2 × L × N` full-round-trip distance
  calculation across the handout, deck, station cards, and staff material.
- Normalized PYS-09 glide and target scoring and made its hot-glue controls and
  supply quantities explicit.
- Rebuilt PYS-11 around one shared A1-adjacent DEPOT mat, orthogonal moves,
  verified per-card shortest routes, card-normalized efficiency, and a
  staff-only answer key.
- Reframed PYB-02 as a limited engineering analogy: myelin insulates one axon,
  a synapse joins different cells, and the bridge is not a literal example of
  either. Its fallback domino track and rulers are now explicitly shared.
- Replaced the PYS-04 recovery inference prompt with a repeatable-measurement
  question and normalized the PYS-11 efficiency label against each card's
  verified optimum.
- Rebuilt the TTT-03 cumulative drop lane, TTT-07 writable bloom network,
  TTT-08 Ambler-relative field route with mandatory prewalk gates, and TTT-09
  build-polish language.
- Reframed TTT-08's key as an adaptive evidence tool. Species names now require
  a staff-verified numbered field tag, visible label, route key, or explicitly
  verified Arboretum Explorer record.
- Updated the active TTT-07 facilitation copy for spring-through-fall
  hummingbirds and Eastern Redbud, and updated every active Trees day-of scoring
  reference to label the reviewed-kit baseline and historical live override.
- Made the PY-STEM generator mirror staff run sheets and answer keys into the
  ignored operator pack, and corrected the Day-2 checklist to 14 to 16 discs.
- Added the live scoring addendum without modifying the reviewed source kit.
- The library now has 108 PDFs: 77 source-backed and 31 repo-native static
  printables/addenda.
- The PDF gate now checks shipped `public/files` by default and covers all 108.

### Operations and verification

- `supabase/seed.sql` is now a non-overwriting bootstrap, not a sync tool.
- Scoped files, schedule, and prizes SQL was regenerated.
- Full document publishing now stages and preflights all outputs before it
  touches the served library; the incomplete legacy file-catalog generator is
  retired.
- Upgraded Vite, the React plugin, and the direct esbuild tool dependency to
  their supported current line; `npm audit` now reports zero vulnerabilities.
- Moved deck splitting to Vite 8's Rolldown groups and added a build-time route
  boundary guard. Ordinary routes preload no deck chunk; the five deck chunks
  load only after the interactive deck route is opened.
- CI now runs content, Admin-store, deck, and build gates before deployment.
- CI now also runs the focused repo-native materials checks.
- Added deterministic content checks for schema/data invariants, score rules,
  schedule keys, document mappings, file bytes, deck count, custom-domain
  metadata, the corrected safety/science language, and the field printables.

## Verification contract

Run from the repository root:

```bash
npm run content:test
npm run admin-store:test
npm run deck:test
npm run materials:test
npm run build
node tools/docgen/check_pdfs.mjs
node tools/admin_preview.mjs
node tools/a11y_audit.mjs
node tools/build_audit.mjs && node tools/montage.mjs
```

Expected:

- Content tests: 23 passed.
- Admin store tests: 9 passed.
- Focused materials checks: passed.
- Deck smoke: 66 components, 0 failures.
- Production build: success.
- PDF gate: 108 shipped documents, 0 findings.
- Admin preview: 11 editors, 0 crashes/page errors.
- Accessibility audit: 18 routes, 0 hard failures.
- Montage: 66 cells, 0 render errors. Six known animated SVG warnings remain.

Use `tools/shoot.mjs` and `tools/a11y_audit.mjs` for browser review after a
production build. Both desktop and mobile routes must have no page errors or
horizontal overflow.

## Database work deferred to the operator

For the existing live project, review and run these scripts in this order:

1. `supabase/schema.sql`. It is data-preserving and refreshes the trigger,
   least-privilege grants, RLS, and stable-ID allowlist objects.
2. `supabase/harden_admin.sql`, after replacing its admin-email placeholder.
   Review carefully: it deliberately removes every other allowlist row.
3. `supabase/sync_files.sql`.
4. `supabase/sync_schedule.sql`.
5. `supabase/sync_prizes.sql`.

Do not use `supabase/seed.sql` to update an existing collection. It now refuses
to overwrite existing rows, but the scoped files above communicate intent and
limit the affected data.

## Known residuals

- The original reward kit and score sheets still state the reviewed best-9-of-12
  policy by design. The addendum distinguishes the later live override.
- The ignored IR must be reconciled into versioned corrections before any full
  source re-extraction. A complete publish is safe only through the guarded
  staged preflight using the reviewed current IR; never regenerate the IR from
  the archive immediately beforehand.
- The protected deck index drawer is still pointer-modal rather than a complete
  keyboard dialog. Escape closes it while focus remains inside the deck, but
  focus is not moved into the drawer, trapped there, or restored after close.
  Those protected behaviors were not changed without explicit authorization.
- Reduced-motion behavior in `useRAF` and several noisy SVG accessible names
  remain inside protected deck bodies. Six animated-SVG warnings are soft
  findings, not render failures.
- Very short browser heights can require scrolling to reach bottom controls.
- The client blocks known referenced-team deletions, but the JSONB collections
  have no cross-row database transaction constraint; a second client changing a
  related collection during the narrow preflight/write interval remains a
  theoretical race.
- The pre-existing untracked `tools/undefined/` directory contains duplicate
  generated bundles and is not part of this implementation.
- Live database contents were not read, so live scores and podium outcomes were
  not asserted or changed.
- The repository is configured for `campnotebook.org`, but external DNS/TLS
  reachability could not be independently confirmed from this workstation.
