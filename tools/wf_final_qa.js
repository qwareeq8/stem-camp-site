export const meta = {
  name: 'stem-final-qa',
  description: 'Final QA on the fixed build: fresh PC+mobile visual review of every route and deck slide with multi-vote adversarial verify, a document content spot-check across a representative sample, and a completeness critic',
  phases: [
    { title: 'Visual', detail: 'finders per route/deck-slide group, both viewports, then adversarial verify' },
    { title: 'Docs', detail: 'content spot-check of a representative document sample' },
    { title: 'Critique', detail: 'completeness critic' },
  ],
}

const ROOT = '/data/projects/stem-camp-site-publish'
const OUT = ROOT + '/tools/out'
const FILES_JSON = ROOT + '/src/data/files.json'

const PUBLISH_RULE = 'HARD RULE: work and read ONLY under ' + ROOT + '. There is a STALE sibling copy at /data/projects/stem-camp-site (canonical, untouched) - NEVER read, open, or cite it; its line numbers do not match. Use absolute paths under ' + ROOT + ' only.'

const DESIGN_SYSTEM = [
  'DESIGN SYSTEM (field-notebook, academic, paper-toned):',
  'Palette: --paper #FAFAF8, --paper2 #F2F1EE, --paper3 #E7E6E2, --ink #222222, --ink2/--mute #5A564F, --mute2 #8A8D8F, Cherry --primary #9D2235, --taupe #BCA685. Camp colors: Trees #2a5736 (accent #b04a2f), PY-STEM #1c3257 (heading accent #A85F12).',
  'Type: Fraunces (serif headings/numerals), Inter (sans body), JetBrains Mono (UPPERCASE eyebrows/badges/meta/labels).',
  'Vocabulary: .card (paper2 + rule22 border + corner ticks), .section-title (mono uppercase + trailing rule), .badge pill, .btn (dark) / .btn.ghost (ink border), .table, .notice. Cherry is the only red.',
  'HEURISTICS: wasted/awkward whitespace, unclear hierarchy, mobile overflow/clipping/cramping/mid-word breaks, tap targets >= 28px, weak affordance, text contrast below WCAG AA (4.5:1 body, 3:1 large/UI), inconsistency, misalignment, truncation, broken empty states, overlap with the sticky nav.',
].join('\n')

const KNOWN = [
  'KNOWN / BY-DESIGN - DO NOT report any of these:',
  '- The shipped seed is empty; screenshots use SAMPLE=1 demo data. Intentional empty-state copy is not a bug.',
  '- One console error per route is the expected Supabase-not-configured fallback.',
  '- Store has no public redeem button by design; the 5-card rewards grid leaving one trailing slot is accepted.',
  '- These fixes are now INTENTIONAL (do not flag them as wrong): schedule unscored break titles are muted + weight 600; the Files single-doc GET pill intentionally matches the HANDOUT/GUIDE button family; the admin login card is left-pinned to the page-head edge; the admin "not configured" notice is neutral (not Cherry); the admin password eye-toggle is stretched to the input height; the home "Full standings/Full schedule" links are Cherry; the schedule code badge is right-aligned and top-aligned; the leaderboard progress bars are PROPORTIONAL to the leader so a tight race shows near-equal long bars (this is correct, NOT a bug); the leaderboard shows a compact bar under each team name on mobile; the teams emblem is an inline camp-colored icon with no box; the deck landing mobile section-title shows a short label; the deck Competition total "100 pts" is one line; the Files search placeholder is darkened; the achievements prize criteria pin to the card bottom; the admin subtitle is balance-wrapped; the deck Kit-list Qty left-aligns on mobile.',
  '- NEW deck-route behavior is INTENTIONAL: /deck is a viewport-locked pane. There is NO footer on /deck and the PAGE does not scroll; the deck pins below the nav and its slides scroll INSIDE the deck card, under the deck\'s own pinned header (BACK / INDEX / NN of NN). Short slides hug their content. The Index drawer opens below the nav. Do NOT flag "no footer on deck", "deck page does not scroll", "deck is pinned", or "slide content scrolls under the deck header" as issues.',
  '- Deck .meta text computes to #5A564F (passes AA); PY-STEM accent is #A85F12 (AA). Do not re-flag these as contrast fails.',
  '- Deck data-comp SVG console warnings are known/out-of-scope. Deck RAF demo animation behavior must NOT be flagged (only static layout/contrast/overflow/hierarchy).',
].join('\n')

const FINDINGS_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['severity', 'viewport', 'shot', 'category', 'title', 'evidence', 'location', 'suggestedFix'],
        properties: {
          severity: { type: 'string', enum: ['HIGH', 'MED', 'LOW'] },
          viewport: { type: 'string', enum: ['desktop', 'mobile', 'both'] },
          shot: { type: 'string' },
          category: { type: 'string' },
          title: { type: 'string' },
          evidence: { type: 'string' },
          location: { type: 'string' },
          suggestedFix: { type: 'string' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['real', 'reason'],
  properties: { real: { type: 'boolean' }, reason: { type: 'string' }, severityAdjusted: { type: 'string', enum: ['HIGH', 'MED', 'LOW', 'NA'] } },
}

const DOC_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['files'],
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['id', 'opens', 'blankOrGarbled', 'contentMatchesMeta', 'audience', 'brandingConsistent', 'severity', 'issues', 'pagesChecked'],
        properties: {
          id: { type: 'string' },
          opens: { type: 'boolean' },
          blankOrGarbled: { type: 'boolean' },
          contentMatchesMeta: { type: 'boolean' },
          audience: { type: 'string', enum: ['appropriate', 'mismatch', 'na'] },
          brandingConsistent: { type: 'boolean' },
          severity: { type: 'string', enum: ['HIGH', 'MED', 'LOW', 'NONE'] },
          issues: { type: 'array', items: { type: 'string' } },
          pagesChecked: { type: 'string' },
        },
      },
    },
  },
}

const GAPS_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['gaps'],
  properties: { gaps: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['area', 'why'], properties: { area: { type: 'string' }, why: { type: 'string' } } } } },
}

const VISUAL = [
  { key: 'home', label: 'Home', source: ['src/site/pages/Home.jsx'], shots: ['site_home.png', 'site_home_m.png'] },
  { key: 'schedule', label: 'Schedule', source: ['src/site/pages/Schedule.jsx'], shots: ['site_schedule.png', 'site_schedule_m.png'] },
  { key: 'files', label: 'Files', source: ['src/site/pages/Files.jsx'], shots: ['site_files.png', 'site_files_m.png'] },
  { key: 'leaderboard', label: 'Leaderboard', source: ['src/site/pages/Leaderboard.jsx'], shots: ['site_leaderboard.png', 'site_leaderboard_m.png'] },
  { key: 'teams', label: 'Teams', source: ['src/site/pages/Teams.jsx'], shots: ['site_teams.png', 'site_teams_m.png'] },
  { key: 'store', label: 'Ticket store', source: ['src/site/pages/Store.jsx'], shots: ['site_store.png', 'site_store_m.png'] },
  { key: 'achievements', label: 'Achievements', source: ['src/site/pages/Achievements.jsx'], shots: ['site_achievements.png', 'site_achievements_m.png'] },
  { key: 'admin', label: 'Admin sign-in', source: ['src/site/pages/Admin.jsx'], shots: ['site_admin.png', 'site_admin_m.png'] },
  { key: 'deck-landing', label: 'Deck landing (viewport-locked route)', source: ['src/site/pages/DeckPage.jsx', 'src/deck/Home.jsx'], shots: ['site_deck.png', 'site_deck_m.png'] },
  { key: 'deck-slides-d', label: 'Deck in-station slides DESKTOP + internal-scroll + Index drawer', source: ['src/deck/Presentation.jsx'], shots: ['deck_qa_title.png', 'deck_qa_science.png', 'deck_qa_kit.png', 'deck_qa_steps.png', 'deck_qa_timer.png', 'deck_qa_compete.png', 'deck_qa_debrief.png', 'qa_steps_scrolled.png', 'qa_drawer.png'] },
  { key: 'deck-slides-m', label: 'Deck in-station slides MOBILE + internal-scroll', source: ['src/deck/Presentation.jsx'], shots: ['deck_qa_title_m.png', 'deck_qa_science_m.png', 'deck_qa_kit_m.png', 'deck_qa_steps_m.png', 'deck_qa_timer_m.png', 'deck_qa_compete_m.png', 'deck_qa_debrief_m.png', 'qa_steps_scrolled_m.png'] },
]

function finderPrompt(t) {
  return [
    PUBLISH_RULE, '',
    'FINAL QA. Review this area in its FIXED, final state: ' + t.label + ' (key ' + t.key + ').', '',
    DESIGN_SYSTEM, '', KNOWN, '',
    'SOURCE: ' + t.source.map((s) => ROOT + '/' + s).join(', '),
    'SCREENSHOTS (Read each PNG image): ' + t.shots.map((s) => OUT + '/' + s).join(', '),
    'Filenames ending "_m" are the 390px MOBILE viewport; others are 1280px DESKTOP. "scrolled" shows the deck mid internal-scroll; "drawer" shows the Index drawer open.',
    'Report ONLY issues you can SEE that are NOT in the KNOWN list. Name the exact shot and location. Severity HIGH=broken/illegible/overflow/inaccessible, MED=clearly suboptimal, LOW=polish. Cap 5 findings. If clean, return empty.',
  ].join('\n')
}

function verifyPrompt(f) {
  return [
    PUBLISH_RULE, '',
    'Adversarial verifier. REFUTE this claim unless CLEARLY visible. Default real=false when uncertain.',
    'CLAIM [' + f.severity + ', ' + f.viewport + '] on ' + f.route + ': ' + f.title,
    'WHERE: ' + f.location + ' | EVIDENCE: ' + f.evidence,
    'SCREENSHOT (Read it): ' + OUT + '/' + f.shot, '',
    'These are NOT issues:', KNOWN, '',
    'real=true ONLY if you see it yourself and it is material. Else real=false + reason.',
  ].join('\n')
}

const DOC_DOMAIN = '2026 STEM Camps (Temple College of Engineering), grades 6-8. "From Trees to Tech" (camp trees, codes TTT-* / backups TTB-*, Ambler). "PY-STEM" (camp pystem, codes PYS-* / backups PYB-*, main campus). handout = camper-facing (mission, build steps, safety; rubric may be shown for transparency, that is OK); guide = facilitator-facing (setup, timing, scoring, answers). Program/Logistics/Packet/Scoring/Signage = program-wide.'

const DOC_BATCHES = [
  { key: 'trees-pair+backup', want: 'The Student Handout AND Instructor Guide for station TTT-01 (the MudWatt activity), plus the handout AND guide for backup station TTB-01.' },
  { key: 'pystem-pair+backup', want: 'The Student Handout AND Instructor Guide for station PYS-01, plus the handout AND guide for backup station PYB-01.' },
  { key: 'program-docs', want: 'The Master Curriculum and Operations Guide; one From Trees to Tech Score Sheets PDF; the Reward and Competition Kit; the Safety Checklist (staff prep/safety).' },
  { key: 'data+packets', want: 'The Amazon Procurement Workbook (.xlsx); the buy list (.csv); one Student Handout Packet PDF; one Instructor Guide Packet PDF.' },
]

function docPrompt(batch) {
  return [
    PUBLISH_RULE, '', DOC_DOMAIN, '',
    'Read the metadata array at ' + FILES_JSON + '. Find the entries matching: ' + batch.want,
    'For each, OPEN the real file at ' + ROOT + '/public/<path> (PDFs via the Read pages param, sampling pages 1-4 and one later page for long docs; .xlsx/.csv as data) and check: opens without corruption; no blank/garbled/truncated pages; content matches its name/desc/code/camp; audience fit (handout vs guide); 2026 branding and internal consistency (correct camp names, no placeholder text). Set severity HIGH=corrupt/blank/wrong-doc/wrong-audience/wrong-camp, MED=notable mismatch, LOW=minor, NONE=clean. Return one entry per file with id and pagesChecked. Note: a deterministic check already PASSED for presence, type, size, pairing, and link resolution for all 77 files - focus on CONTENT.',
  ].join('\n')
}

// ---- Visual phase: find then verify (pipeline) ----
phase('Visual')
async function verifyFinding(f) {
  const votes = f.severity === 'LOW' ? 1 : 2
  const vs = (await parallel(Array.from({ length: votes }, () => () =>
    agent(verifyPrompt(f), { label: 'verify:' + f.fid, phase: 'Visual', schema: VERDICT_SCHEMA, model: 'sonnet' })))).filter(Boolean)
  const real = vs.filter((v) => v.real).length
  return { real: vs.length > 0 && real >= Math.ceil(vs.length / 2), realCount: real, total: vs.length, reasons: vs.map((v) => v.reason) }
}
const visualPer = await pipeline(
  VISUAL,
  (t) => agent(finderPrompt(t), { label: 'find:' + t.key, phase: 'Visual', schema: FINDINGS_SCHEMA })
    .then((r) => ({ key: t.key, findings: (r.findings || []).map((f, i) => ({ ...f, route: t.key, fid: t.key + '-' + i })) })),
  (res) => parallel((res.findings || []).map((f) => () => verifyFinding(f).then((v) => ({ ...f, verdict: v })))).then((vf) => vf.filter(Boolean)),
)
const visualConfirmed = visualPer.flat().filter((f) => f.verdict && f.verdict.real)
const visualRejected = visualPer.flat().filter((f) => f.verdict && !f.verdict.real)

// ---- Docs phase ----
phase('Docs')
const docPer = await parallel(DOC_BATCHES.map((b) => () => agent(docPrompt(b), { label: 'doc:' + b.key, phase: 'Docs', schema: DOC_SCHEMA }).then((r) => (r.files || []))))
const docAll = docPer.filter(Boolean).flat()
const docIssues = docAll.filter((d) => d.severity && d.severity !== 'NONE')

// ---- Critique ----
phase('Critique')
const critic = await agent([
  PUBLISH_RULE, '',
  'Completeness critic for a FINAL QA pass covering PC (1280) and mobile (390) of every route and deck slide, plus a document content spot-check.',
  'Visual coverage: ' + VISUAL.map((t) => t.key).join(', ') + '. Confirmed visual issues: ' + visualConfirmed.length + '.',
  'Document spot-check sampled: ' + DOC_BATCHES.map((b) => b.key).join(', ') + ' (a deterministic integrity + link-resolution check already passed for all 77 files; the full 77-doc content audit passed earlier with 0 HIGH/MED).',
  'Name any route, viewport, interactive state, deck slide type, or document class not covered that could still hide a real issue. Be concrete. Return gaps.',
].join('\n'), { phase: 'Critique', schema: GAPS_SCHEMA })

const sev = (s) => ({ HIGH: 0, MED: 1, LOW: 2 }[s] ?? 3)
visualConfirmed.sort((a, b) => sev(a.severity) - sev(b.severity))
return {
  visual: {
    confirmed: visualConfirmed.length,
    rejected: visualRejected.length,
    high: visualConfirmed.filter((f) => f.severity === 'HIGH').length,
    med: visualConfirmed.filter((f) => f.severity === 'MED').length,
    low: visualConfirmed.filter((f) => f.severity === 'LOW').length,
    findings: visualConfirmed.map((f) => ({ route: f.route, severity: f.severity, viewport: f.viewport, shot: f.shot, title: f.title, evidence: f.evidence, location: f.location, suggestedFix: f.suggestedFix, votes: f.verdict.realCount + '/' + f.verdict.total })),
    rejectedSample: visualRejected.slice(0, 12).map((f) => ({ route: f.route, title: f.title, reason: f.verdict.reasons[0] || '' })),
  },
  docs: {
    inspected: docAll.length,
    issues: docIssues.length,
    detail: docAll.map((d) => ({ id: d.id, severity: d.severity, audience: d.audience, contentMatchesMeta: d.contentMatchesMeta, blankOrGarbled: d.blankOrGarbled, brandingConsistent: d.brandingConsistent, issues: d.issues, pagesChecked: d.pagesChecked })),
  },
  gaps: critic.gaps,
}
