export const meta = {
  name: 'stem-visual-audit',
  description: 'Multi-lens visual+UX audit of the STEM camp site: review each route (desktop+mobile), adversarially verify, synthesize a prioritized fix list',
  phases: [
    { title: 'Review' },
    { title: 'Verify' },
    { title: 'Synthesize' },
  ],
}

const OUT = '/data/projects/stem-camp-site-publish/tools/out'
const SRC = '/data/projects/stem-camp-site-publish/src'

// Shared design context so reviewers stay on-brand and ground fixes in the code.
const CONTEXT = `
PROJECT: "STEM Camp Field Notebook" — a Vite + React public site for two Temple
University middle-school engineering camps (From Trees to Tech; PY-STEM). Design
language is an academic "field notebook": warm paper background (--paper #FAFAF8,
--paper2 #F2F1EE, --paper3 #E7E6E2), ink text (--ink #222, --ink2/--mute #5A564F,
--mute2 #8A8D8F), Temple Cherry primary (--primary #9D2235), serif display
(Fraunces) for headings, sans (Inter) for body, mono (JetBrains Mono) for labels
and meta. Camp accents: trees green (--trees #2a5736), PY-STEM navy (--py #1c3257).
Cards use --paper2 fill + 1px --rule22 border + 10px radius. Section titles are
small uppercase mono labels with a trailing hairline rule.

The user's explicit goals for this review: the site must "work perfectly, have a
clear and easy to use interface, without much wasted space" on BOTH desktop and
mobile.

SCREENSHOTS: full-page PNGs captured with sample data loaded (teams, scores,
tickets populated). Desktop viewport 1280px wide; mobile 390px wide. NOTE: the
/admin screenshot is the sign-in gate only (the console is behind auth) — do NOT
flag it as "empty"; only judge the sign-in screen itself. The /deck screenshot is
the deck's landing rendered inside the normal site layout (nav + footer visible).

EVALUATION LENSES (apply all, but report only real, visible problems):
1. Wasted space / density: large empty gutters, oversized padding, low
   information density, a layout that forces excessive scrolling, columns that
   leave big blank areas. The user specifically dislikes wasted space.
2. Clarity / information architecture: is the purpose obvious, hierarchy clear,
   labels unambiguous, scannable? (educational-content/UDL: clear labels,
   audience cues, group related items.)
3. Mobile: does the desktop layout adapt well at 390px? Cramped rows, overflow,
   horizontal scroll, tap targets < ~28px, text too small, broken wrapping.
4. Affordance / interaction (Norman): do buttons/links look clickable, is state
   communicated, are filters/search obviously usable?
5. Accessibility / contrast: small text on low-contrast tones, icon-only controls
   without labels, heading order. Reason about the color tokens above.
6. Consistency: spacing rhythm, button styles, card styles, alignment to a grid.

Be concrete and visual. Prefer a few real, high-signal findings over many vague
ones. For each finding give the exact on-screen evidence (what/where) and a
concrete, on-brand fix that fits the existing CSS vocabulary.
`

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['route', 'overall', 'findings'],
  properties: {
    route: { type: 'string' },
    overall: { type: 'string', description: 'One-sentence verdict on this route.' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'severity', 'dimension', 'device', 'evidence', 'fix'],
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          dimension: { type: 'string', enum: ['wasted-space', 'clarity', 'mobile', 'affordance', 'accessibility', 'consistency'] },
          device: { type: 'string', enum: ['desktop', 'mobile', 'both'] },
          evidence: { type: 'string', description: 'Exactly what is visible and where on screen.' },
          fix: { type: 'string', description: 'Concrete on-brand fix, ideally naming the file/CSS class.' },
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
        required: ['title', 'severity', 'dimension', 'device', 'evidence', 'fix', 'real', 'verifyNote'],
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          dimension: { type: 'string' },
          device: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' },
          real: { type: 'boolean', description: 'true only if the problem is genuinely visible in the screenshot' },
          verifyNote: { type: 'string', description: 'Why confirmed or refuted, from a second look at the image.' },
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
  { route: '/deck', name: 'deck', src: ['site/pages/DeckPage.jsx'] },
]

function reviewPrompt(item) {
  const srcList = item.src.map((s) => `${SRC}/${s}`).join('\n  ')
  return `${CONTEXT}

You are reviewing the "${item.route}" route. Read BOTH screenshots and the source.

Desktop screenshot: ${OUT}/site_${item.name}.png
Mobile screenshot:  ${OUT}/site_${item.name}_m.png
Source file(s):
  ${srcList}
Shared design system: ${SRC}/site/styles.css (read the parts relevant to your findings)
Shared UI primitives:  ${SRC}/site/ui.jsx

Use the Read tool to open the two PNG images and the source. Then report findings
strictly about visible quality on this route, judged against the lenses above and
the user's "clear, easy, no wasted space" goal. Return up to 6 findings, highest
signal first. If the route is genuinely clean, return fewer (even zero) findings.`
}

function verifyPrompt(item, findings) {
  return `${CONTEXT}

ADVERSARIAL VERIFICATION for the "${item.route}" route. A first reviewer produced
the findings below. Re-open the screenshots and decide, for EACH finding, whether
the problem is genuinely visible. Default to real=false if you cannot clearly see
it in the image (screenshot misreads are common). Keep severity honest: downgrade
inflated severities; a minor polish issue is LOW, not MEDIUM.

Desktop screenshot: ${OUT}/site_${item.name}.png
Mobile screenshot:  ${OUT}/site_${item.name}_m.png

FINDINGS TO CHECK:
${JSON.stringify(findings, null, 2)}

Use Read to re-open both PNGs. Return the same findings annotated with real
(boolean) and verifyNote. Preserve title/dimension/device/fix; you may correct
severity and tighten the fix.`
}

phase('Review')
const perRoute = await pipeline(
  ROUTES,
  (item) => agent(reviewPrompt(item), { label: `review:${item.name}`, phase: 'Review', schema: FINDINGS_SCHEMA }),
  (review, item) => agent(verifyPrompt(item, review.findings), { label: `verify:${item.name}`, phase: 'Verify', schema: VERIFIED_SCHEMA }),
)

// Keep only confirmed findings.
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
  required: ['summary', 'fixPlan'],
  properties: {
    summary: { type: 'string', description: '2-4 sentence overall assessment of the site.' },
    fixPlan: {
      type: 'array',
      description: 'Deduped, prioritized, actionable fixes grouped by area. Highest impact first.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'severity', 'routes', 'area', 'change'],
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          routes: { type: 'array', items: { type: 'string' } },
          area: { type: 'string', description: 'File or CSS area to change (e.g., styles.css .doc-card, Home.jsx hero).' },
          change: { type: 'string', description: 'Precise, on-brand change to make.' },
        },
      },
    },
  },
}

const synth = await agent(
  `${CONTEXT}

You are the synthesis lead. Below are CONFIRMED findings from per-route review +
adversarial verification of the STEM camp site. Deduplicate cross-route issues
(e.g., a shared component problem seen on several routes becomes ONE fix naming
all routes). Drop anything trivial. Produce a prioritized, deduplicated fix plan
that directly serves the user's goal: clear, easy to use, minimal wasted space,
flawless on desktop and mobile. Order by impact. Keep every change on-brand and
expressible in the existing CSS/component vocabulary.

CONFIRMED FINDINGS:
${JSON.stringify(confirmed, null, 2)}`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA },
)

return { confirmedCount: confirmed.length, perRoute, synth }
