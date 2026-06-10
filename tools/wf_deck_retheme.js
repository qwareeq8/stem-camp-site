export const meta = {
  name: 'stem-deck-retheme',
  description: 'Design a DEEP re-theme of the interactive /deck so it is fully themed like the website (site component vocabulary, colors, icons, type) rather than a field-notebook microsite, while keeping all animation FUNCTIONALITY intact. Output an ordered, animation-safe implementation spec.',
  phases: [
    { title: 'Analyze' },
    { title: 'Synthesize' },
  ],
}

const REPO = '/data/projects/stem-camp-site-publish'
const OUT = `${REPO}/tools/out`
const SRC = `${REPO}/src`

const CONTEXT = `
HARD PATH RULE: read ONLY files under ${REPO}. There is a SECOND, STALE copy at
/data/projects/stem-camp-site that was NOT edited this session -- do NOT read it; its
line numbers and content are wrong for this task. If a tool returns a path outside
${REPO}, discard it.

GOAL: the interactive deck at /#/deck must be FULLY THEMED LIKE THE WEBSITE -- as if the
same designer built it -- not merely sitting on a warm background. The previous pass only
warmed the surface, collapsed the masthead, softened cards, and went upright; the user
says it "is still just the fieldbook but without being a separate thing" and wants it
genuinely re-skinned into the site's design system. You are FREE to remove elements,
change icons, colors, fonts, and restructure the deck's CHROME. The ONE hard limit is
that the ANIMATIONS must keep FUNCTIONING (see ANIMATION-SAFETY).

THE SITE'S DESIGN SYSTEM (the target vocabulary the deck should adopt). Defined in
${SRC}/site/ui.jsx (components) + ${SRC}/site/styles.css (classes). styles.css is a
GLOBAL stylesheet imported in main.jsx, so these classes ALREADY apply inside the deck
(which renders in .deck-host). The deck can therefore use the REAL site classes directly
instead of bespoke inline styles. Key pieces:
- Layout: .page / .container / .page-head (eyebrow + title + sub, with a 1.5px ink bottom
  rule). .section-title = mono 12px uppercase, letter-spacing .14em, --mute, with a
  trailing hairline rule (::after). Components Page / SectionTitle in ui.jsx.
- Cards: .card = --paper2 fill, 1px --rule22 border, 10px radius, padding 18px; optional
  .ticks adds small corner brackets (the site's "ruled paper" corner marks); .card-link
  adds a hover lift + ink border. .card h3 = 20px serif. .card .meta = mono 11px uppercase
  --mute. Component Card({ticks, padLg, to/href}).
- Badges: .badge = mono 10.5px uppercase pill (999px radius), --rule22 border, --paper bg,
  --ink2 text; tones .badge.trees (--trees), .badge.py (--py), .badge.ok, .badge.warn.
  Components Badge / CampBadge.
- Buttons: .btn = mono 12px uppercase, 8px radius; default solid ink; .btn.ghost
  (transparent), .btn.accent (Cherry --primary). Component Btn({variant}).
- Stats: .stat (.num serif 34px + .lab mono uppercase). Tables: .table (mono uppercase th
  with 1.5px ink underline). .progress (track + fill bar). .empty (dashed empty state).
- Color policy: --primary Cherry #9D2235 is the brand/interactive accent (page-eyebrow,
  focus rings, primary buttons). Camp identity uses --trees #2a5736 / --py #1c3257 (and
  the decorative --trees-acc #b04a2f / --py-acc #c77a2b). Type: UPRIGHT Fraunces headings
  (h1-h4 weight 500-600), Inter body, JetBrains Mono labels.
- Nav is sticky, 60px (--nav-h), translucent. Section pages use Page+SectionTitle+Card.
Look at the real site pages for how these compose: ${SRC}/site/pages/Home.jsx,
Teams.jsx, Schedule.jsx, Leaderboard.jsx, and the screenshots ${OUT}/site_home.png,
${OUT}/site_teams.png, ${OUT}/site_schedule.png, ${OUT}/site_leaderboard.png.

THE DECK AS IT IS NOW (already partly integrated; read the CURRENT source under ${REPO}):
- ${SRC}/deck/theme.js: token object T (has paper #FFFFFF, the new surface #FAFAF8,
  paper2/3, ink, mutes, rules, warn/ok, camp colors treesInk/treesAcc/pyInk/pyAcc) +
  CAMP map + font helpers f.display/f.sans/f.mono. The deck is styled ENTIRELY by inline
  styles from these tokens; its classNames (.fu/.corner/.ticker/.focusable/.smallcaps/
  .stage/.nofocus/.accentRule) are UNDEFINED no-ops (no CSS backs them).
- ${SRC}/deck/App.jsx: .stemdeck root.
- ${SRC}/deck/Home.jsx: landing -- a quiet "vol I - N stations" utility strip; a camp
  switcher rendered as two ink-filled "notebook pages"; a hero strip with a big decorative
  SVG HomeMotif (tree / circuit); a mono "filter" bar; a station-card grid (white cards
  with a hard-ish hairline border, a small folded-corner triangle, a coin IconChip, mono
  code, serif title); a dashed "reserve/backup" card grid; a footer rule.
- ${SRC}/deck/Presentation.jsx: in-station -- a sticky top bar (back link + timer dot +
  page counter); a thin progress hairline; SlideFrame with a LEFT RULED INDEX COLUMN
  (vertical "Trees - Tech" text + a phase coin IconChip + page number) and a top hairline
  (code + phase); slide bodies (title / science[renders a DEMO] / materials table / steps
  list / timer ring / compete table / debrief list); a bottom nav (back / slide-dot bar /
  next); a red vertical "Index" side-tab that opens a left drawer.
- ${SRC}/deck/ui/primitives.jsx: bespoke Btn (rounded 2px, ink border), Tag, Corners
  (renders the .corner no-op spans), Field, Readout, Caption.
- ${SRC}/deck/icons.jsx: lucide icon maps + IconChip = a radial-gradient "coin" badge.
Deck screenshots (CURRENT state): landing ${OUT}/site_deck.png + ${OUT}/site_deck_m.png;
in-station ${OUT}/deck_title.png, ${OUT}/deck_science.png (a live RAF demo is visible),
${OUT}/deck_steps.png, ${OUT}/deck_title_m.png, ${OUT}/deck_science_m.png.

WHAT STILL READS AS "A SEPARATE FIELDBOOK" (the gap to close): the bespoke notebook chrome
that has no site counterpart -- folded-corner white cards (vs site .card.ticks paper2),
the left ruled index margin + vertical camp text, the red "Index" side-tab flag, the coin
IconChips (vs the site's plain inline icons), the deck's own Btn/Tag primitives (vs site
.btn/.badge), bespoke slide-section headings (vs .section-title), and the decorative SVG
motif. The deck should instead READ like a site route built from Page/SectionTitle/Card/
Badge/Btn, using Cherry for interactive accents and camp colors for camp identity.

ANIMATION-SAFETY (the ONE hard limit -- animations must keep FUNCTIONING):
- The real motion is requestAnimationFrame loops in ${SRC}/deck/components/demos/* (14)
  and ${SRC}/deck/components/extras/* (50), driven by ${SRC}/deck/ui/hooks.js (useRAF,
  useTimeouts, usePointerDrag). The slide nav keyboard handler, the work-block timer
  countdown (setInterval), the slide-progress width transition, the timer-ring dasharray,
  and the slide/page React state ALSO constitute "the animations/interactions".
- DO NOT change the BEHAVIOR of any of the above: not the RAF math, not hooks.js, not the
  keyboard/timer/state logic, not the inline transition:/animation: values that drive them.
- You MAY freely restyle the CHROME/FRAME around the demos, the cards, the headers, the
  nav, the drawer, the icons, and you MAY change colors/labels. Prefer NOT to edit the
  demo/extra component files at all (re-theme the SHELL: Home/Presentation/primitives/
  icons/theme + deck CSS). If a proposed change recolors a demo, it must keep that demo's
  RAF loop and props-contract intact and is higher-risk -- flag it.
- Gates that must stay green: build; deck:test (64 components / 0 failures); montage (64
  cells / 0 render-errors -- reruns on any theme.js token change); shoot all 9 routes
  desktop+mobile (0 pageerrors). A token RENAME/REMOVE that a demo consumes breaks montage
  -- prefer ADDING tokens or changing only shell-consumed values.

ALLOWED EDIT SURFACE for the resulting spec: ${SRC}/deck/theme.js, App.jsx, Home.jsx,
Presentation.jsx, ui/primitives.jsx, icons.jsx; ${SRC}/site/pages/DeckPage.jsx; and
${SRC}/site/styles.css (you MAY add deck-scoped classes, e.g. .deck-host .xxx, to reuse
or extend the site vocabulary). Demo/extra files: restyle-only-if-logic-preserving, and
only if clearly worth it; default to leaving them alone.

Be concrete and visual: name the exact element, the current treatment, the target site
class/treatment, and whether to reuse a site CSS class, add a deck-scoped class, or inline
to-match. Prefer reusing the real site classes. Ground every change in a file you read.
`

const LENS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['lens', 'observations', 'changes'],
  properties: {
    lens: { type: 'string' },
    observations: { type: 'array', items: { type: 'string' }, description: 'What in this area reads as a separate fieldbook vs the site system, with on-screen + source evidence.' },
    changes: {
      type: 'array',
      description: 'Proposed re-theme edits, each scoped to an allowed file. Order low-risk first.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'file', 'element', 'from', 'to', 'approach', 'risk', 'animationImpact'],
        properties: {
          id: { type: 'string' },
          file: { type: 'string' },
          element: { type: 'string', description: 'The specific deck element.' },
          from: { type: 'string', description: 'Current treatment.' },
          to: { type: 'string', description: 'Target site-system treatment (name the site class/component/token), or "REMOVE".' },
          approach: { type: 'string', enum: ['reuse-site-class', 'add-deck-scoped-class', 'inline-to-match', 'remove-element', 'token-change'] },
          risk: { type: 'string', enum: ['low', 'medium', 'high'] },
          animationImpact: { type: 'string', description: 'Why this is animation-safe (does not change RAF/keyboard/timer/state behavior). MUST be motion-neutral.' },
        },
      },
    },
  },
}

const LENSES = [
  { key: 'landing', prompt: `LENS 1 -- DECK LANDING (Home.jsx). Re-theme the landing to read like a site route built
from Page/SectionTitle/Card/Badge/Btn. Cover: the "vol I - N stations" utility strip; the
camp switcher (ink-filled notebook pages -> site card / CampBadge / tab treatment?); the
hero strip + decorative SVG HomeMotif (keep as themed art, restyle, or REMOVE?); the mono
filter bar (-> site .btn.ghost / .badge chips?); the station-card grid (folded-corner white
cards -> .card.ticks paper2 with .meta + serif h3 + a Cherry/camp accent?); the dashed
backup cards; the footer rule. Decide reuse-site-class vs add-deck-scoped-class vs remove
for each. Read ${SRC}/deck/Home.jsx, ${SRC}/site/ui.jsx, ${SRC}/site/pages/Home.jsx and the
landing screenshots.` },
  { key: 'instation', prompt: `LENS 2 -- IN-STATION (Presentation.jsx). Re-theme the slide view while keeping the DEMO
render area and all motion intact. Cover: the sticky top bar; the progress hairline; the
SlideFrame LEFT RULED INDEX COLUMN + vertical camp text + coin phase chip (simplify/remove
-> a site .section-title / .badge header row?); the per-slide section headings (->
.section-title); the materials/compete TABLES (-> site .table); the steps/debrief numbered
lists; the timer ring + buttons (-> site .btn); the bottom nav (back / slide-dot bar / next
-> site .btn.ghost + a restyled dot/progress); the red "Index" side-tab + drawer (-> a
site-styled control). Be explicit that the DEMO (science slide) body, the keyboard handler,
the timer countdown, and the progress/dasharray transitions are NOT to change behaviorally.
Read ${SRC}/deck/Presentation.jsx, ${SRC}/site/ui.jsx + styles.css and the in-station
screenshots.` },
  { key: 'system', prompt: `LENS 3 -- CROSS-CUTTING SYSTEM (theme.js, ui/primitives.jsx, icons.jsx). Decide the
token + primitive + icon strategy. Should the deck's bespoke Btn/Tag/Corners/Field/Readout/
Caption be replaced by the site .btn/.badge/.card classes (and Corners/.ticks)? Should the
coin IconChip be replaced by the site's plain inline icon usage (or a simpler chip)? What
is the Cherry-primary vs camp-accent policy for the deck (the deck currently leans on camp
accents; the site reserves Cherry for brand/interactive)? Which T tokens to ADD (e.g. map
to --primary) and which to leave (camp colors already match the site)? Font/italic policy
(headings upright; keep step/debrief numerals italic?). Flag montage risk for any token
value change. Read ${SRC}/deck/theme.js, ${SRC}/deck/ui/primitives.jsx, ${SRC}/deck/icons.jsx
and ${SRC}/site/styles.css.` },
  { key: 'anim-safety', prompt: `LENS 4 -- ANIMATION-FUNCTIONALITY BOUNDARY + RISK. You are the guardrail. Produce the
explicit list of code whose BEHAVIOR must not change so the re-theme stays motion-safe:
(1) the demo/extra dirs + that their bodies/RAF loops should not be edited; (2) ${SRC}/deck/
ui/hooks.js useRAF/useTimeouts/usePointerDrag; (3) the keyboard nav handler, the work-block
setInterval timer, and slide/page state in Presentation.jsx (cite the useEffect blocks);
(4) the inline transition:/animation: props that drive the progress bar, timer ring, slide
dots, and card hovers (cite file:line) -- their VALUES stay, though the COLOR a hover sets
may change; (5) which theme.js tokens are consumed inside demos (so a value change ripples
to montage). For each, emit a change entry with to="DO NOT CHANGE BEHAVIOR: ..." approach=
"inline-to-match" risk="low" animationImpact="guard". Also rate the OVERALL risk of the
proposed re-theme and name the 2-3 edits most likely to break a gate. Read the shell files
+ hooks.js and list the demo/extra dirs.` },
]

phase('Analyze')
const lensResults = await parallel(
  LENSES.map((l) => () => agent(`${CONTEXT}\n\n=== YOUR LENS ===\n${l.prompt}`, { label: `lens:${l.key}`, phase: 'Analyze', schema: LENS_SCHEMA }))
)
const lenses = lensResults.filter(Boolean)
const allChanges = lenses.flatMap((r) => (r.changes || []).map((c) => ({ lens: r.lens, ...c })))
log(`lenses: ${lenses.length}; proposed changes: ${allChanges.length}`)

phase('Synthesize')
const SPEC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'doNotTouch', 'removeList', 'spec', 'risks'],
  properties: {
    summary: { type: 'string', description: '3-5 sentences: the re-theme strategy and how deep it goes.' },
    doNotTouch: { type: 'array', items: { type: 'string' }, description: 'Verbatim animation-functionality guard list to honor.' },
    removeList: { type: 'array', items: { type: 'string' }, description: 'Deck elements to delete outright (with file).' },
    spec: {
      type: 'array',
      description: 'Ordered implementation steps, LOWEST-RISK first, deduped across lenses. Each independently shippable + gate-checkable.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['order', 'file', 'element', 'change', 'approach', 'rationale', 'risk'],
        properties: {
          order: { type: 'integer' },
          file: { type: 'string' },
          element: { type: 'string' },
          change: { type: 'string', description: 'Precise edit incl. site class/token names and old->new, ready to implement.' },
          approach: { type: 'string', enum: ['reuse-site-class', 'add-deck-scoped-class', 'inline-to-match', 'remove-element', 'token-change'] },
          rationale: { type: 'string' },
          risk: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
      },
    },
    risks: { type: 'array', items: { type: 'string' }, description: 'Gate-break risks (build/deck:test/montage/shoot) and how to avoid them.' },
  },
}

const synth = await agent(`${CONTEXT}

You are the re-theme LEAD. Below are proposals from four lenses + an animation-safety guard
list. Produce ONE ordered, deduplicated, low-risk-first implementation spec that takes the
deck from "warm fieldbook" to "a route built in the site's design system", WITHOUT changing
any animation BEHAVIOR. Rules:
- Prefer reusing the REAL site CSS classes (.card/.ticks, .badge, .btn, .section-title,
  .table, .progress, .empty) over bespoke inline styles; add deck-scoped classes only when
  a site class needs a deck-specific tweak.
- Drop/fix any change that would alter RAF/keyboard/timer/state behavior. Carry the guard
  list verbatim into doNotTouch and the deletions into removeList.
- Use Cherry --primary for interactive/brand accents and camp colors for camp identity, per
  the site's policy.
- Order: low-risk reuse/recolor first, structural removals next, the riskiest (anything
  near a demo, or a big SlideFrame restructure) last and clearly marked.

LENS OUTPUTS:
${JSON.stringify(lenses, null, 2)}`, { label: 'synthesize', phase: 'Synthesize', schema: SPEC_SCHEMA })

return { lensCount: lenses.length, proposedChanges: allChanges.length, synth }
