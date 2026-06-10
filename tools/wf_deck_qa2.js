export const meta = {
  name: 'stem-deck-qa-final',
  description: 'Final per-element QA across all routes after the DEEP deck re-theme + site fixes: confirm /deck now reads as a route of the site design system, animations are functional, the site findings are resolved, and nothing regressed. Adversarial verify + synthesize.',
  phases: [
    { title: 'QA' },
    { title: 'Verify' },
    { title: 'Synthesize' },
  ],
}

const REPO = '/data/projects/stem-camp-site-publish'
const OUT = `${REPO}/tools/out`
const SRC = `${REPO}/src`

const CONTEXT = `
HARD PATH RULE: read ONLY files under ${REPO}. A SECOND, STALE copy exists at
/data/projects/stem-camp-site that was NOT edited -- do NOT read it (its content and
line numbers are wrong). Judge from the screenshots in ${OUT} and source under ${REPO}.

PROJECT: "STEM Camp Field Notebook" -- a Vite + React public site for two Temple
University middle-school engineering camps (From Trees to Tech; PY-STEM). Warm
"field notebook" system: --paper #FAFAF8 bg, --paper2 #F2F1EE card fill, --paper3,
--ink #222, --ink2/--mute #5A564F, --rule12/--rule22 hairlines, Temple Cherry
--primary #9D2235, camp accents trees #2a5736 / PY navy #1c3257 (plus warm accents
trees rust #b04a2f / PY amber #A85F12). Serif display Fraunces (UPRIGHT), Inter body,
JetBrains Mono labels. Cards = .card (--paper2 + 1px --rule22 + 10px radius) with
optional .ticks corner brackets; .badge pills; .btn / .btn.ghost; .section-title (mono
uppercase label + trailing hairline); .table; .progress.

WHAT JUST CHANGED (under test):
A) DEEP /deck RE-THEME -- the interactive deck was re-skinned to read as a ROUTE OF THE
   SITE built from the site's components, not a separate fieldbook, WITHOUT changing any
   animation behavior. Expected on the rendered deck now:
   - Landing: camp chooser is two site .card tiles (Trees/PY-STEM .badge + serif name +
     sub; the ACTIVE tile has a Cherry top accent bar). A .section-title shows the camp
     framing + station count. Category filter is site .btn / .btn.ghost chips. Station
     cards are .card.ticks (paper2, rounded, corner brackets) with an accent mono code,
     a flat (non-glossy) category icon, a serif title, and a .meta footer. Reserve cards
     are quieter .card. NO folded-corner cards, NO big SVG motif, NO bespoke notebook
     masthead, NO footer hint rule.
   - In-station: a top bar with .btn.ghost "Back" + "Index" buttons (NO red vertical
     Index side-tab anymore) + a slide counter; a Cherry progress hairline; each slide
     has a .section-title eyebrow (no glossy coin icon), an upright Fraunces title, the
     Mission as a .card.ticks, Kit list & Competition as site .table in a .table-wrap,
     steps/debrief as small mono-indexed rows with hairline dividers (NO big italic
     numerals), the work-block timer ring in Cherry with .badge status + site .btn
     controls, and a bottom nav of .btn.ghost Back/Next with Cherry slide dots. The left
     ruled index margin + vertical camp text is GONE.
   - Color policy: Cherry --primary for interactive chrome (progress, active dot, timer,
     drawer active state); camp colors for camp identity (badges, accent codes/titles).
   - Type: all headings upright Fraunces; numeric indices are small mono (no italics).
   - There is NO "Full screen" button (the deck is inline like any route).
B) ANIMATIONS must still be FUNCTIONAL: the RAF science demos render and animate, the
   slide nav (arrow keys / Back-Next / dots / Index drawer), and the work-block timer all
   work. Flag dimension="animation" ONLY if a still clearly shows something structurally
   broken (a blank/garbled demo, a broken control) -- do NOT assume motion you cannot see.
C) SITE FIXES: PY-STEM accent text is now a darker AA-safe amber #A85F12 (Home camp card
   heading + hero session name, Schedule camp heading, Teams team title/emblem) -- should
   read clearly, not washed out. The leaderboard .progress track now has an inset hairline
   ring so the bar/track is visible. Footer social icons are 28px; schedule doc-links have
   a taller tap area.

YOUR JOB: strict, evidence-based PER-ELEMENT QA of the given route on BOTH desktop and
mobile. Walk every visible element and check: renders correctly; readable contrast;
alignment/spacing; clear affordance; adapts at 390px (no overflow/clipping, tap targets
>= ~28px); no overlap/broken wrapping; consistent with the design system. For /deck,
also CONFIRM items A and B above and CATCH any regression from the re-theme. Flag only
REAL, visible problems; a clean element needs no finding.

NOTE: the /admin shot is the sign-in gate only (not "empty"). The single console error
per route is the expected Supabase-not-configured fallback, NOT a defect.
`

const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['route', 'overall', 'findings'],
  properties: {
    route: { type: 'string' },
    overall: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['element', 'title', 'severity', 'dimension', 'device', 'evidence', 'fix'],
        properties: {
          element: { type: 'string' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          dimension: { type: 'string', enum: ['render-bug', 'wasted-space', 'clarity', 'mobile', 'affordance', 'accessibility', 'consistency', 'integration', 'animation'] },
          device: { type: 'string', enum: ['desktop', 'mobile', 'both'] },
          evidence: { type: 'string' },
          fix: { type: 'string' },
        },
      },
    },
  },
}

const VERIFIED_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['route', 'verified'],
  properties: {
    route: { type: 'string' },
    verified: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['element', 'title', 'severity', 'dimension', 'device', 'evidence', 'fix', 'real', 'verifyNote'],
        properties: {
          element: { type: 'string' }, title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          dimension: { type: 'string' }, device: { type: 'string' },
          evidence: { type: 'string' }, fix: { type: 'string' },
          real: { type: 'boolean', description: 'true ONLY if genuinely visible in the screenshot; default false if unsure.' },
          verifyNote: { type: 'string' },
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
  { route: '/deck', name: 'deck', deck: true, src: ['site/pages/DeckPage.jsx', 'deck/Home.jsx', 'deck/Presentation.jsx', 'deck/theme.js', 'deck/icons.jsx', 'deck/ui/primitives.jsx'] },
]

function reviewPrompt(item) {
  const srcList = item.src.map((s) => `${SRC}/${s}`).join('\n  ')
  const deckExtra = item.deck ? `

THIS IS THE DEEP-RE-THEMED /deck ROUTE -- the focus. Route shots show only the landing;
ALSO read these in-station captures (final state):
  ${OUT}/deck_title.png , ${OUT}/deck_science.png (a live RAF demo), ${OUT}/deck_steps.png ,
  ${OUT}/deck_compete.png , ${OUT}/deck_science_m.png (mobile).
Confirm A (reads as a site route: site .card tiles, .section-title, .btn filters, .card.ticks
station cards, flat icons; in-station .btn.ghost Back/Index, Cherry progress+dots, .table kit/
competition, .card.ticks mission, mono step indices; NO fieldbook chrome, NO full-screen, NO
red Index side-tab, NO ruled index margin) and B (demo renders/animates; nav + timer controls
present and unbroken). Compare side by side with ${OUT}/site_teams.png / ${OUT}/site_files.png
to judge whether it now belongs to the same system. Report any element that still looks
"separate", any re-theme regression (broken card, lost control, contrast loss, overflow), or
any demo that looks structurally broken.` : ''
  return `${CONTEXT}

PER-ELEMENT QA of "${item.route}". Read BOTH screenshots and the source.
Desktop: ${OUT}/site_${item.name}.png
Mobile:  ${OUT}/site_${item.name}_m.png
Source:
  ${srcList}
Design system: ${SRC}/site/styles.css , ${SRC}/site/ui.jsx${deckExtra}

Use Read to open the images + source. Return up to 8 findings, highest signal first; fewer
(even zero) if clean. Name the exact element and the pixel evidence.`
}

function verifyPrompt(item, findings) {
  return `${CONTEXT}

ADVERSARIAL VERIFICATION for "${item.route}". For EACH finding below, re-open the
screenshots and decide if it is genuinely visible. Default real=false if not clearly seen.
Be especially strict on dimension=integration/animation: only confirm what a still clearly
shows. Keep severity honest.

Desktop: ${OUT}/site_${item.name}.png
Mobile:  ${OUT}/site_${item.name}_m.png${item.deck ? `
In-station: ${OUT}/deck_title.png , ${OUT}/deck_science.png , ${OUT}/deck_steps.png , ${OUT}/deck_compete.png , ${OUT}/deck_science_m.png` : ''}

FINDINGS:
${JSON.stringify(findings, null, 2)}

Return the same findings annotated with real (boolean) + verifyNote; keep element/title/
dimension/device/fix, you may correct severity.`
}

phase('QA')
const perRoute = await pipeline(
  ROUTES,
  (item) => agent(reviewPrompt(item), { label: `qa:${item.name}`, phase: 'QA', schema: FINDINGS_SCHEMA }),
  (review, item) => agent(verifyPrompt(item, review.findings), { label: `verify:${item.name}`, phase: 'Verify', schema: VERIFIED_SCHEMA }),
)
const confirmed = []
for (const r of perRoute.filter(Boolean)) for (const f of (r.verified || [])) if (f.real) confirmed.push({ route: r.route, ...f })
log(`confirmed findings: ${confirmed.length} across ${ROUTES.length} routes`)

phase('Synthesize')
const SYNTH_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['summary', 'deckIntegration', 'siteFixes', 'blocking', 'polish', 'recommend'],
  properties: {
    summary: { type: 'string' },
    deckIntegration: {
      type: 'object', additionalProperties: false,
      required: ['readsAsSiteRoute', 'animationsFunctional', 'note'],
      properties: {
        readsAsSiteRoute: { type: 'boolean', description: 'true if /deck now reads as a route built in the site design system (not a separate fieldbook).' },
        animationsFunctional: { type: 'boolean', description: 'true if no deck demo/control appears removed or structurally broken in the stills.' },
        note: { type: 'string' },
      },
    },
    siteFixes: { type: 'string', description: 'Did the PY-STEM accent AA, leaderboard track, and tap-target fixes land cleanly? Any residual?' },
    blocking: {
      type: 'array', description: 'HIGH/MEDIUM confirmed issues to fix before sign-off. Empty if none.',
      items: {
        type: 'object', additionalProperties: false,
        required: ['route', 'element', 'title', 'severity', 'change'],
        properties: { route: { type: 'string' }, element: { type: 'string' }, title: { type: 'string' }, severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] }, change: { type: 'string' } },
      },
    },
    polish: { type: 'array', items: { type: 'string' } },
    recommend: { type: 'string' },
  },
}
const synth = await agent(`${CONTEXT}

QA synthesis lead. Below are CONFIRMED per-element findings (post adversarial verification)
across all 9 routes. Deduplicate cross-route issues. Render a verdict on the DECK
INTEGRATION (does /deck now read as a route of the site design system, and do animations/
controls appear functional?) and on the SITE FIXES (accent AA, leaderboard track, tap
targets). Then a BLOCKING list (HIGH/MEDIUM only), a short LOW polish list, and a ship
recommendation. Keep changes on-brand and in the existing vocabulary.

CONFIRMED FINDINGS:
${JSON.stringify(confirmed, null, 2)}`, { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA })

return { confirmedCount: confirmed.length, perRoute, synth }
