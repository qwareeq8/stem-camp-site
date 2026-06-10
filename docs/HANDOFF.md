# STEM Camp site: handoff

Working copy: `/data/projects/stem-camp-site-publish` (the PUBLISH copy; git remote
`qwareeq8/stem-camp-site`). Last updated 2026-06-02. Everything below is LOCAL;
nothing has been pushed.

## Operating rules
- Work and read ONLY in this copy. A stale sibling exists at
  `/data/projects/stem-camp-site` (canonical, untouched). Never read or edit it;
  its line numbers do not match and earlier agents produced false positives from it.
- Never run git from this workstation. The user pushes, so Claude is not added as a
  contributor.
- Never edit deck demo bodies (`src/deck/components/demos/*`, `extras/*`),
  `src/deck/ui/hooks.js`, the keyboard/timer/slide-state logic, any inline
  `transition:`/`animation:` value, or add `@keyframes`. Shell, theme, and layout
  changes are allowed.
- Writing: do not use a spaced hyphen as a dash. Use a real em dash or restructure.

## Gates (must stay green)
```
npm run build
npm run deck:test                                      # expect 64 / 0
node tools/build_audit.mjs && node tools/montage.mjs   # expect 64 cells / 0 render-errors
SAMPLE=1 node tools/shoot.mjs / /schedule /files /leaderboard /teams /store /achievements /admin /deck
MOBILE=1 SAMPLE=1 node tools/shoot.mjs / /schedule /files /leaderboard /teams /store /achievements /admin /deck
```
Both shoots must show 9/9 routes with `pageerrors=0`. The single console error per
route is the expected Supabase-not-configured fallback. The 6 montage console SVG
warnings (negative `<rect>`, NaN transform) are known deck-demo soft findings and
are not regressions.

## Current state
The site is built, audited end to end across web (1280px) and mobile (390px), all
77 documents inspected, polished, and green on every gate. No known HIGH or MED
issue remains open.

### What changed this session
- Applied 5 deferred LOW-polish fixes (schedule break-row hierarchy, Files GET pill
  parity, admin login card alignment, admin neutral info notice, admin eye-toggle
  height).
- Ran a thorough two-track audit (website visual plus document content) via
  workflows, then fixed every actionable finding: home see-more link affordance,
  schedule code-badge placement, leaderboard bars now proportional to the leader
  plus a compact mobile bar, teams emblem de-boxed, deck mobile section-title,
  deck Competition total on one line, Files placeholder contrast, achievements card
  baseline, admin subtitle wrap, deck Kit-list mobile alignment.
- Reworked the deck route into a viewport-locked pane so the deck pins under the nav
  and slides scroll inside the deck card instead of sliding under the sticky nav
  (the earlier "content under the nav" finding). Moved the Index drawer below the
  nav so its heading and close button are not occluded.
- Code-standards pass: corrected three stale comments (Leaderboard, Teams, Admin) and
  removed an unused `ink` prop (deck `Presentation`/`App`).
- Final QA pass: fixed a mobile regression where a station's top context band hid
  under the deck header (the pane now resets its scroll to top on each slide), bumped
  the deck progress dots to a 28px tap target, and fixed an orphaned separator in the
  deck title meta row.

### Audit outcome
- Documents: 77 files, all present, all 32 station codes paired (handout plus guide),
  types/sizes accurate, no orphans, all links resolve to 200. Full content audit
  clean: zero HIGH or MED. One LOW content note only (the TTT-01 instructor guide
  timeline does not visibly sum to its stated 80 minutes; cosmetic, not a defect).
- Visual: every route and deck slide verified web and mobile. Zero HIGH. Two items
  left by design: the desktop science-slide demo is a fixed-width SVG roughly centered
  in a wider text column, and the admin not-configured screen shows two complementary
  messages (one explains the disabled button, one reassures that the public site still
  opens).

### Deck route behavior (intentional)
`/deck` is a viewport-locked pane: there is no footer on that route and the page does
not scroll. The deck pins below the nav and its slides scroll inside the deck card,
under the deck's own header (BACK / INDEX / NN of NN). Short slides hug their content.
To restore the previous in-flow behavior, revert the `App.jsx` Footer conditional and
the `.deck-page` / `.main-deck` rules in `styles.css`.

## Remaining go-live steps (the user runs git and Supabase)
1. Push to GitHub. Set the Actions secrets `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (optional var `VITE_SUPABASE_TABLE=collections`), set
   Pages Source to GitHub Actions, and re-run the workflow.
2. Re-run `supabase/seed.sql` (or Save Files from `/admin`) so the live site shows all
   77 documents. The live database still holds the older 7-file seed until then.
   Publishing makes every instructor guide publicly downloadable, which is intended.
3. Walk through the deployed site: sign in, author real content with aliases, and
   check all nine routes on desktop and mobile.

## Tooling (under `tools/`)
- `shoot.mjs`: route screenshots from `dist/`. `SAMPLE=1` injects demo data, `MOBILE=1`
  uses the 390px viewport. Output in `tools/out/site_<route>.png`.
- `shoot_deck_slide.mjs`: in-station deck slides. `CARD`, `STEPS`, `TAG`, `MOBILE`,
  `SCROLL`. For CARD=1 the slide order is STEPS 0 title, 1 science, 3 kit, 4 steps,
  5 timer, 6 compete, 7 debrief.
- Workflow scripts: `wf_apply_fixes.js`, `wf_code_review.js`, `wf_final_qa.js` (this
  session), plus `wf_visual_audit.js`, `wf_verify_fixes.js`, `wf_deck_*.js` (earlier).
