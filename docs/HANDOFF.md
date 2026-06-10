# STEM Camp site: handoff

Working copy: `/data/projects/stem-camp-site-publish` (the PUBLISH copy; git remote
`qwareeq8/stem-camp-site`). Last updated 2026-06-10. Everything below is LOCAL;
nothing has been pushed. The user pushes; the final push is theirs.

## Operating rules
- Work and read ONLY in this copy. A stale sibling exists at
  `/data/projects/stem-camp-site` (canonical, untouched). Never read or edit it;
  its line numbers do not match and earlier agents produced false positives from it.
- Git: commit locally and gradually in the repo's conventional style
  (`type(scope): Sentence-case summary`), with no AI attribution lines. Never
  push; never touch the remote.
- Never edit deck demo bodies (`src/deck/components/demos/*`, `extras/*`),
  `src/deck/ui/hooks.js`, the keyboard/timer/slide-state logic, any inline
  `transition:`/`animation:` value, or add `@keyframes`. Shell, theme, and layout
  changes are allowed.
- Writing: do not use a spaced hyphen as a dash. Use a real em dash or restructure.

## Gates (must stay green)
```
npm run build                                          # expect no circular-chunk warnings
npm run deck:test                                      # expect 64 / 0
node tools/build_audit.mjs && node tools/montage.mjs   # expect 64 cells / 0 render-errors
SAMPLE=1 node tools/shoot.mjs / /schedule /files /leaderboard /teams /store /achievements /admin /deck
MOBILE=1 SAMPLE=1 node tools/shoot.mjs / /schedule /files /leaderboard /teams /store /achievements /admin /deck
node tools/docgen/check_pdfs.mjs                       # expect 77 documents / 0 findings
```
Both shoots must show 9/9 routes with `pageerrors=0`. The single console error per
route is the expected Supabase-not-configured fallback. The 6 montage console SVG
warnings (negative `<rect>`, NaN transform) are known deck-demo soft findings and
are not regressions.

## Current state
The site is reviewed end to end and green on every gate. The document library is
fully regenerated: all 77 downloads are PDFs printed by the in-repo pipeline in
the site's field-notebook theme. No DOCX, XLSX, or CSV downloads remain.

### What changed this session (2026-06-10)
- Built `tools/docgen/`: stdlib Python extractors (DOCX/XLSX/CSV to a JSON IR),
  a themed HTML renderer, Chromium printing, automated fidelity and pagination
  checks, and a publish step that restamps `src/data/files.json` and regenerates
  `supabase/seed.sql`. The procurement workbook and the buy list are now normal
  printable PDFs (the buy list CSV source moved to `tools/docgen/data/`).
- Ran a 7-dimension adversarially-verified site review (62 raw findings, 54
  confirmed) and fixed every actionable item: page logic (leaderboard bars and
  tie ranks, up-next advance, empty states), admin console hardening (drafts
  survive hydration and tab switches, Files HEAD checks, clearable Setup fields,
  WCAG-clamped accent picker, ARIA tab/radiogroup/dialog patterns), data layer
  (client cache retry, logout errors, overlay-vs-hydrate race, server-stamped
  `updated_at` plus a schema trigger), per-item schema validation, RLS notes,
  Pages workflow (no `enablement`, no cancel-in-progress), CSP meta, engines.
- One review finding intentionally skipped: removing the unused
  `DEMO_ICON`/`PHASE_ICON`/`IconChip` exports from `src/deck/icons.jsx`
  destabilizes the manual chunk graph (Rollup circular-chunk warnings); they
  stay as deck public surface.
- PDF QA: a 15-document visual inspection plus 6 old-vs-new text equivalence
  diffs (all equivalent, nothing lost). Fixed the findings: instructor packet
  cover index, write-in rows keeping their continuation blanks, multi-line
  write-in labels, camp-inked station codes inside tables.

### Deck route behavior (intentional)
`/deck` is a viewport-locked pane: no footer on that route and the page does not
scroll; slides scroll inside the deck card under the deck's own header. To restore
the previous in-flow behavior, revert the `App.jsx` Footer conditional and the
`.deck-page` / `.main-deck` rules in `styles.css`.

## Remaining go-live steps (the user runs git and Supabase)
1. Review and push. Set the Actions secrets `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (optional var `VITE_SUPABASE_TABLE=collections`), set
   Pages Source to GitHub Actions, and run the workflow.
2. Re-run `supabase/schema.sql` (it now adds the `updated_at` trigger), then
   `supabase/seed.sql` (or Save Files from `/admin`) so the live site lists the
   regenerated 77-PDF library. Consider the email-pinned write policy at the
   bottom of `schema.sql`.
3. Walk through the deployed site: sign in, author real content with aliases, and
   check all nine routes on desktop and mobile.

## Tooling (under `tools/`)
- `docgen/`: the document print pipeline; see the README's Document library
  section for the six-step refresh sequence.
- `shoot.mjs`: route screenshots from `dist/`. `SAMPLE=1` injects demo data,
  `MOBILE=1` uses the 390px viewport. Output in `tools/out/site_<route>.png`.
- `shoot_deck_slide.mjs`: in-station deck slides (`CARD`, `STEPS`, `TAG`,
  `MOBILE`, `SCROLL`).
- `gen_files.mjs`: superseded by `docgen/publish.mjs`; kept for provenance.
- Workflow scripts `wf_*.js`: earlier session audits, kept for provenance.
