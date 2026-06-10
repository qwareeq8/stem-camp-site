export const meta = {
  name: 'stem-verify-fixes',
  description: 'Verify the audit fixes resolved each route\'s findings and introduced no regressions, from fresh desktop+mobile screenshots',
  phases: [
    { title: 'Verify' },
    { title: 'Synthesize' },
  ],
}

const OUT = '/data/projects/stem-camp-site-publish/tools/out'
const SRC = '/data/projects/stem-camp-site-publish/src'
const FINDINGS = '/data/projects/stem-camp-site-publish/tools/_audit_findings.json'

const CONTEXT = `
PROJECT: "STEM Camp Field Notebook" — a warm paper-toned, field-notebook React
site for two Temple University middle-school engineering camps (From Trees to
Tech; PY-STEM). Tokens: --paper/--paper2/--paper3 (warm near-whites), --ink #222,
--ink2/--mute #5A564F, Cherry --primary #9D2235, camp accents trees green / PY
navy. Serif headings, mono labels.

These screenshots are the POST-FIX build (sample data loaded; desktop 1280px,
mobile 390px). A first audit found issues; fixes were then applied. Your job is
to confirm, from the images, that the route now reads as clear, easy to use, and
free of wasted space on BOTH devices — and to catch any NEW regression the fixes
may have introduced (broken layout, overlap, overflow, misalignment, unreadable
text, a control that lost its affordance).

The /admin screenshot is the sign-in gate only (do not flag it as "empty").
`

const EXPECT = {
  '/': 'Desktop hero is now two columns (heading + CTAs left, a bordered "Two sessions" panel listing both camps on the right) so the right gutter is filled. Mobile quick-stats are a 2x2 grid (not four tall rows). Mobile "Up next" rows stack: time + code badge on one line, the activity title on its own full-width line below.',
  '/schedule': 'Mobile activity rows stack: time + code badge on the top line, the title (and any Handout/Guide links) on a full-width line below, so titles no longer crush into 3-4 line wraps. Desktop unchanged.',
  '/files': 'Single-document cards (program guides, packets) now show a bordered "Get" pill matching the activity cards\' Handout/Guide buttons. The camp heading has a little more breathing room above its first section.',
  'leaderboard': 'Standings table now has 4 columns (Rank, Team, Progress, Total); the redundant identical "Stations" column was folded into the team cell as a small "N stations scored" line; progress bars are now scaled to the visible range so 255 vs 243 vs 241 read as clearly different lengths. On mobile the Progress column and the motto are hidden and team names stay on one line.',
  '/teams': 'Team cards now flow in an auto grid (3-up at desktop width) so an odd team count no longer leaves a blank half-row. One column on mobile.',
  '/store': 'Team ticket balances are now a compact 3-column table (Team | Camp | Tickets) instead of sparse half-empty cards. A one-line caption under "Rewards you can redeem" explains redemption happens in person with a facilitator.',
  '/achievements': 'Daily awards flow in an auto grid; recipient pills are pinned to the bottom of each card so they line up across a row regardless of description length.',
  '/admin': 'The sign-in card and notice are centered in the page (no longer hugging the left edge with a blank right half). The SIGN IN button is dimmed/disabled because publishing is not connected. The password show/hide eye is a small compact icon button.',
  '/deck': 'On mobile the camp switcher is a single column so "PY-STEM" sits on one line (no mid-word break) and "From Trees to Tech" no longer wraps to 4 lines; the masthead "Field Notebook" title is smaller so it fits. Desktop is unchanged (two-column switcher, large title).',
}

const ROUTES = [
  { route: '/', name: 'home', key: '/', src: ['site/pages/Home.jsx'] },
  { route: '/schedule', name: 'schedule', key: '/schedule', src: ['site/pages/Schedule.jsx'] },
  { route: '/files', name: 'files', key: '/files', src: ['site/pages/Files.jsx'] },
  { route: '/leaderboard', name: 'leaderboard', key: 'leaderboard', src: ['site/pages/Leaderboard.jsx'] },
  { route: '/teams', name: 'teams', key: '/teams', src: ['site/pages/Teams.jsx'] },
  { route: '/store', name: 'store', key: '/store', src: ['site/pages/Store.jsx'] },
  { route: '/achievements', name: 'achievements', key: '/achievements', src: ['site/pages/Achievements.jsx'] },
  { route: '/admin', name: 'admin', key: '/admin', src: ['site/pages/Admin.jsx'] },
  { route: '/deck', name: 'deck', key: '/deck', src: ['deck/Home.jsx'] },
]

const VERIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['route', 'verdict', 'originalFindings', 'regressions', 'note'],
  properties: {
    route: { type: 'string' },
    verdict: { type: 'string', enum: ['clean', 'minor-residual', 'has-regression'] },
    originalFindings: {
      type: 'array',
      description: 'One entry per original finding for this route from the findings file.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'status'],
        properties: {
          title: { type: 'string' },
          status: { type: 'string', enum: ['resolved', 'partial', 'unresolved', 'not-applicable'] },
        },
      },
    },
    regressions: {
      type: 'array',
      description: 'NEW problems visible in the post-fix screenshots. Empty if none.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'severity', 'device', 'evidence', 'fix'],
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          device: { type: 'string', enum: ['desktop', 'mobile', 'both'] },
          evidence: { type: 'string' },
          fix: { type: 'string' },
        },
      },
    },
    note: { type: 'string', description: 'One-sentence overall read on the route now.' },
  },
}

phase('Verify')
const results = await pipeline(
  ROUTES,
  (item) => agent(`${CONTEXT}

Verify the "${item.route}" route after fixes.

New desktop screenshot: ${OUT}/site_${item.name}.png
New mobile screenshot:  ${OUT}/site_${item.name}_m.png
Source: ${item.src.map((s) => `${SRC}/${s}`).join(', ')}
Original findings file (JSON keyed by route): ${FINDINGS}

Steps:
1. Read the original findings file and pull the array under the key "${item.key}".
2. Read BOTH new screenshots.
3. Intended fixes for this route: ${EXPECT[item.route]}
4. For EACH original finding, mark resolved / partial / unresolved / not-applicable based on what you actually see now.
5. Independently scan both screenshots for any NEW regression the fix may have caused (overlap, overflow, broken alignment, lost affordance, unreadable text). List only what is genuinely visible.

Be strict and evidence-based. If the route looks good, say so plainly.`,
    { label: `verify:${item.name}`, phase: 'Verify', schema: VERIFY_SCHEMA }),
)

const clean = results.filter(Boolean)
const regressions = clean.flatMap((r) => (r.regressions || []).map((x) => ({ route: r.route, ...x })))
const unresolved = clean.flatMap((r) => (r.originalFindings || []).filter((f) => f.status === 'unresolved' || f.status === 'partial').map((f) => ({ route: r.route, ...f })))
log(`routes verified: ${clean.length}; regressions: ${regressions.length}; unresolved/partial: ${unresolved.length}`)

phase('Synthesize')
const SYNTH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'blocking', 'recommend'],
  properties: {
    summary: { type: 'string' },
    blocking: {
      type: 'array',
      description: 'HIGH/MEDIUM regressions or unresolved items that should be fixed before sign-off. Empty if none.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['route', 'title', 'severity', 'change'],
        properties: {
          route: { type: 'string' },
          title: { type: 'string' },
          severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          change: { type: 'string' },
        },
      },
    },
    recommend: { type: 'string', description: 'Ship-as-is, or fix-then-ship, with one sentence why.' },
  },
}

const synth = await agent(`${CONTEXT}

Synthesis. Per-route post-fix verification results are below. Produce a short
overall summary, a BLOCKING list (only HIGH/MEDIUM regressions or unresolved
items worth fixing now — drop LOW polish), and a recommendation.

RESULTS:
${JSON.stringify(clean, null, 2)}`,
  { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA })

return { regressions, unresolved, perRoute: clean, synth }
