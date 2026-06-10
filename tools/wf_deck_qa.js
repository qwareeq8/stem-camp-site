export const meta = {
  name: 'stem-deck-qa',
  description: 'Per-element QA on every route (desktop+mobile): review each on-screen element, adversarially verify findings, and confirm the now-integrated /deck reads as a site section with all animations/structure intact. No regressions.',
  phases: [
    { title: 'QA' },
    { title: 'Verify' },
    { title: 'Synthesize' },
  ],
}

const OUT = '/data/projects/stem-camp-site-publish/tools/out'
const SRC = '/data/projects/stem-camp-site-publish/src'

const CONTEXT = `
PROJECT: "STEM Camp Field Notebook" -- a Vite + React public site for two Temple
University middle-school engineering camps (From Trees to Tech; PY-STEM). Warm
"field notebook" design: --paper #FAFAF8 page bg, --paper2 #F2F1EE card fill,
--paper3 #E7E6E2, --ink #222, --ink2/--mute #5A564F, --mute2 #8A8D8F, --rule12 /
--rule22 hairlines, Temple Cherry --primary #9D2235, camp accents trees green
#2a5736 / PY navy #1c3257. Serif display Fraunces (UPRIGHT), sans Inter (body),
mono JetBrains Mono (labels). Cards = --paper2 fill + 1px --rule22 + 10px radius.

WHAT JUST CHANGED (the deck integration under test): the interactive /deck was
re-skinned to read as a SECTION OF THE SITE, not a private microsite, WITHOUT
changing any animation. Specifically:
- SURFACE: the deck shell (root, in-station sticky header, bottom nav, index
  drawer, the Mission-label notch) was repainted from pure white #FFFFFF to the
  warm site bg #FAFAF8 via a new theme token T.surface. Station/backup CARDS stay
  white so they lift off the warm bg (like the site's card grids). The 64 demo
  visuals were intentionally left on white and are unchanged.
- CHROME: the deck's OWN publication masthead ("Field Notebook / Middle School STEM
  Edition 2026") was REMOVED so the site's "Field deck" page header is the single
  header. The deck keeps only a quiet right-aligned utility strip ("vol I - 16
  stations" + arrow-key hint). The deck's inner bordered page-frame (left/right
  rules, maxWidth 1100) was removed; the .deck-host frame is the only frame now.
- CARDS: station cards moved from a hard 1px black border + ~0 radius to a soft 1px
  --rule22 border + a 6px radius on three corners (top-right stays square so the
  folded-corner motif still sits flush). Backup cards gained a 6px radius.
- TYPE: deck headings (camp labels, station titles, all slide/section titles) went
  UPRIGHT to match the site; only the slanted step/debrief figure-NUMERALS remain
  italic as an intentional accent.
- ANIMATIONS: untouched on purpose. The real motion is requestAnimationFrame loops
  inside the demo/extra components; the slide-progress bar, timer ring, slide-dot
  nav, and index drawer all still work. Nothing about motion should look broken.

YOUR JOB: strict, evidence-based PER-ELEMENT QA. For the route you are given, walk
EVERY visible element (page eyebrow/title/subtitle, the site nav + brand, any
toolbar/filter/search, EACH distinct card or row type, tables, buttons, links,
badges/pills, progress bars, icons, empty states, footer) on BOTH desktop and
mobile, and check each for: renders correctly; readable contrast; correct
alignment/spacing to the grid; clear affordance (clickable things look clickable);
adapts well at 390px (no overflow, no horizontal scroll, no cramped/illegible text,
tap targets >= ~28px); no overlap or broken wrapping; consistent with the design
system above. Flag only REAL, visible problems. A clean element needs no finding.

NOTE: the /admin screenshot is the sign-in gate only (auth-gated console) -- judge
only the sign-in screen, do not call it "empty". The single console error per route
is the expected Supabase-not-configured hydration fallback -- NOT a defect.
`

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['route', 'overall', 'findings'],
  properties: {
    route: { type: 'string' },
    overall: { type: 'string', description: 'One-sentence verdict on this route in its current state.' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['element', 'title', 'severity', 'dimension', 'device', 'evidence', 'fix'],
        properties: {
          element: { type: 'string', description: 'The specific on-screen element, e.g. "station card folded corner", "nav MENU button", "leaderboard progress bar".' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          dimension: { type: 'string', enum: ['render-bug', 'wasted-space', 'clarity', 'mobile', 'affordance', 'accessibility', 'consistency', 'integration', 'animation'] },
          device: { type: 'string', enum: ['desktop', 'mobile', 'both'] },
          evidence: { type: 'string', description: 'Exactly what is visible and where on screen.' },
          fix: { type: 'string', description: 'Concrete on-brand fix naming the file/token/CSS.' },
        },
      },
    },
  },
}

const VERIFIED_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['route', 'verified'],
  properties: {
    route: { type: 'string' },
    verified: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['element', 'title', 'severity', 'dimension', 'device', 'evidence', 'fix', 'real', 'verifyNote'],
        properties: {
          element: { type: 'string' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          dimension: { type: 'string' },
          device: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' },
          real: { type: 'boolean', description: 'true ONLY if genuinely visible in the screenshot. Default false if not clearly seen.' },
          verifyNote: { type: 'string', description: 'Why confirmed or refuted from a second look.' },
        },
      },
    },
  },
}

const ROUTES = [
  { route: '/', name: 'home', src: ['site/pages/Home.jsx'] },
  { route: '/schedule', name: 'schedule', src: ['site/pages/Schedule.jsx'] },
  { route: '/files', name: 'files', src: ['site/pages/Files.jsx'] },
  { route: '/leaderboard', name: 'leaderboard', src: ['site/pages/Leaderboard.jsx'] },
  { route: '/teams', name: 'teams', src: ['site/pages/Teams.jsx'] },
  { route: '/store', name: 'store', src: ['site/pages/Store.jsx'] },
  { route: '/achievements', name: 'achievements', src: ['site/pages/Achievements.jsx'] },
  { route: '/admin', name: 'admin', src: ['site/pages/Admin.jsx'] },
  { route: '/deck', name: 'deck', deck: true, src: ['site/pages/DeckPage.jsx', 'deck/Home.jsx', 'deck/Presentation.jsx', 'deck/theme.js', 'deck/App.jsx'] },
]

function reviewPrompt(item) {
  const srcList = item.src.map((s) => `${SRC}/${s}`).join('\n  ')
  const deckExtra = item.deck ? `

THIS IS THE INTEGRATED /deck ROUTE -- the focus of this QA. Route shots only show
the deck LANDING; ALSO read these in-station slide captures (final state):
  Desktop title slide:   ${OUT}/deck_title.png
  Desktop science slide (live RAF demo visible): ${OUT}/deck_science.png
  Desktop build-steps slide: ${OUT}/deck_steps.png
  Mobile title slide:    ${OUT}/deck_title_m.png
  Mobile science slide:  ${OUT}/deck_science_m.png
Additionally CONFIRM the integration outcome and catch any regression:
  1. SURFACE: deck landing + in-station surfaces read warm (#FAFAF8), continuous with
     the site -- NO pure-white plate. White station/demo cards lift off the warm bg.
  2. ONE HEADER: only the site "Field deck" header (no second "Field Notebook"
     masthead). The quiet "vol I - 16 stations" + arrow-hint utility strip is fine.
  3. CARDS: station cards have a soft hairline border + slight rounding, and the
     folded-corner motif (top-right) still sits flush (not rounded off, not overhanging).
  4. TYPE: headings upright; only the big slanted step/debrief numerals are italic.
  5. ANIMATIONS/STRUCTURE INTACT: the science-slide DEMO renders (not blank/broken),
     the slide-progress bar, slide-dot nav, Back/Next, the Index side-tab, and the
     timer controls are all present and not visually broken. Flag dimension="animation"
     ONLY if something looks structurally broken in a still -- do not assume motion you
     cannot see. The integration must not have removed or broken any deck feature.
  6. Note any spot the warm repaint missed (a stray white panel) or any contrast loss
     from white-on-warm now being warm-on-warm.` : ''
  return `${CONTEXT}

You are doing PER-ELEMENT QA of the "${item.route}" route. Read BOTH screenshots and the source.

Desktop screenshot: ${OUT}/site_${item.name}.png
Mobile screenshot:  ${OUT}/site_${item.name}_m.png
Source file(s):
  ${srcList}
Design system CSS: ${SRC}/site/styles.css (read parts relevant to your findings)
Shared UI primitives: ${SRC}/site/ui.jsx${deckExtra}

Use the Read tool to open the images and source. Enumerate the route's elements and
check each per the lenses above. Return up to 8 findings, highest signal first; fewer
(even zero) if the route is clean. Be concrete: name the element and the exact pixel
evidence.`
}

function verifyPrompt(item, findings) {
  return `${CONTEXT}

ADVERSARIAL VERIFICATION for "${item.route}". A first reviewer produced the findings
below. Re-open the screenshots and decide, for EACH finding, whether the problem is
genuinely visible. Default real=false if you cannot clearly see it (screenshot
misreads are common). Keep severity honest: a minor polish issue is LOW. For any
dimension="integration" or "animation" finding, be especially strict -- only confirm
if a still-frame clearly shows it; never assume broken motion.

Desktop: ${OUT}/site_${item.name}.png
Mobile:  ${OUT}/site_${item.name}_m.png${item.deck ? `
In-station (deck only): ${OUT}/deck_title.png , ${OUT}/deck_science.png , ${OUT}/deck_steps.png , ${OUT}/deck_title_m.png , ${OUT}/deck_science_m.png` : ''}

FINDINGS TO CHECK:
${JSON.stringify(findings, null, 2)}

Use Read to re-open the PNGs. Return the same findings annotated with real (boolean)
and verifyNote. Preserve element/title/dimension/device/fix; you may correct severity.`
}

phase('QA')
const perRoute = await pipeline(
  ROUTES,
  (item) => agent(reviewPrompt(item), { label: `qa:${item.name}`, phase: 'QA', schema: FINDINGS_SCHEMA }),
  (review, item) => agent(verifyPrompt(item, review.findings), { label: `verify:${item.name}`, phase: 'Verify', schema: VERIFIED_SCHEMA }),
)

const confirmed = []
for (const r of perRoute.filter(Boolean)) {
  for (const f of (r.verified || [])) {
    if (f.real) confirmed.push({ route: r.route, ...f })
  }
}
log(`confirmed findings: ${confirmed.length} across ${ROUTES.length} routes`)

phase('Synthesize')
const SYNTH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'deckIntegration', 'blocking', 'polish', 'recommend'],
  properties: {
    summary: { type: 'string', description: '2-4 sentence overall QA verdict for the whole site in its current state.' },
    deckIntegration: {
      type: 'object',
      additionalProperties: false,
      required: ['readsAsSection', 'animationsIntact', 'note'],
      properties: {
        readsAsSection: { type: 'boolean', description: 'true if /deck now reads as a section of the site (surface/chrome/cards/type cohesive).' },
        animationsIntact: { type: 'boolean', description: 'true if no deck feature/animation appears removed or structurally broken in the stills.' },
        note: { type: 'string', description: 'One-paragraph judgment on the deck integration, citing the strongest evidence.' },
      },
    },
    blocking: {
      type: 'array',
      description: 'HIGH/MEDIUM confirmed issues worth fixing before sign-off. Empty if none.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['route', 'element', 'title', 'severity', 'change'],
        properties: {
          route: { type: 'string' },
          element: { type: 'string' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          change: { type: 'string' },
        },
      },
    },
    polish: { type: 'array', description: 'LOW nice-to-haves, deduped.', items: { type: 'string' } },
    recommend: { type: 'string', description: 'Ship-as-is, or fix-then-ship, with one sentence why.' },
  },
}

const synth = await agent(
  `${CONTEXT}

You are the QA synthesis lead. Below are CONFIRMED per-element findings (after
adversarial verification) across all 9 routes. Deduplicate cross-route issues (a
shared-component problem becomes ONE entry naming all routes). Separately render a
verdict on the DECK INTEGRATION: does /deck now read as a section of the site, and
do all animations/structure appear intact? Then give a BLOCKING list (HIGH/MEDIUM
only), a short LOW polish list, and a ship recommendation. Keep every change on-brand
and expressible in the existing token/component vocabulary.

CONFIRMED FINDINGS:
${JSON.stringify(confirmed, null, 2)}`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA },
)

return { confirmedCount: confirmed.length, perRoute, synth }
