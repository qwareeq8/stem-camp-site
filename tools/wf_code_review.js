export const meta = {
  name: 'stem-code-standards-pass',
  description: 'Code-standards review + safe documentation/smell fixes across the files changed this session, then rebuild and re-gate. Conservative: no behavior change, no reformat, no public renames, no deck animation/logic edits.',
  phases: [
    { title: 'Review + fix', detail: 'one agent per file group, conservative fixes only' },
    { title: 'Verify', detail: 'build + deck:test + montage + shoots' },
  ],
}

const ROOT = '/data/projects/stem-camp-site-publish'

const PUBLISH_RULE = 'HARD RULE: work and read ONLY under ' + ROOT + '. There is a STALE sibling copy at /data/projects/stem-camp-site (canonical, untouched) - NEVER read, open, or edit it. Use absolute paths under ' + ROOT + ' only.'

const STANDARDS = [
  'CODE-STANDARDS (Clean Code / Refactoring), applied with judgment to an existing codebase:',
  '- Comments explain WHY, not WHAT, and MUST match the current code. The single most important target: comments that went STALE after recent edits (a comment describing behavior the code no longer has). Fix or remove them.',
  '- Naming is intention-revealing. Functions are small and do one thing. DRY / KISS / YAGNI.',
  '- Smell catalog to look for: duplicated logic, dead/unreachable code, commented-out code, an unused import/variable/prop, a magic number repeated 2+ times or non-obvious enough to deserve a named constant, a data clump, needless complexity.',
  '- Every module/exported component should have an accurate top-of-file purpose comment (this codebase already does; verify accuracy).',
].join('\n')

const CONSTRAINTS = [
  'CONSTRAINTS (this is a deliberately inline-styled React + plain-CSS codebase; respect its idioms):',
  '- Apply ONLY safe, NON-BEHAVIORAL fixes: correct/remove stale comments, delete dead or commented-out code, remove unused imports/vars, add a missing accurate comment, and extract a magic number to a named constant ONLY when it is repeated or clearly obscure AND the change is local and obviously correct.',
  '- DO NOT: reformat or re-indent existing code, add JSDoc to every function, convert to TypeScript, rename exported components/props/functions, change inline-style numbers that are one-off layout values (that is the established idiom, not a smell), reorder imports for its own sake, or alter any runtime behavior.',
  '- NEVER touch deck demo bodies (src/deck/components/demos/* or extras/*), src/deck/ui/hooks.js, keyboard/timer/slide-state logic, any inline transition:/animation: value, or add @keyframes.',
  '- After editing, read the changed region back to confirm. If a file is already clean, change nothing and say so.',
  '- Keep the build green; do not introduce syntax errors.',
].join('\n')

const REPORT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['group', 'applied', 'skipped'],
  properties: {
    group: { type: 'string' },
    applied: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['file', 'location', 'type', 'change'],
        properties: {
          file: { type: 'string' },
          location: { type: 'string' },
          type: { type: 'string', enum: ['stale-comment', 'dead-code', 'unused', 'magic-number', 'doc', 'duplication', 'other'] },
          change: { type: 'string' },
        },
      },
    },
    skipped: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['file', 'note'],
        properties: { file: { type: 'string' }, note: { type: 'string' } },
      },
    },
  },
}

const GROUPS = [
  { key: 'deck-route', files: ['src/site/App.jsx', 'src/site/pages/DeckPage.jsx'] },
  { key: 'styles', files: ['src/site/styles.css'] },
  { key: 'leaderboard', files: ['src/site/pages/Leaderboard.jsx'] },
  { key: 'teams-achievements', files: ['src/site/pages/Teams.jsx', 'src/site/pages/Achievements.jsx'] },
  { key: 'schedule-admin', files: ['src/site/pages/Schedule.jsx', 'src/site/pages/Admin.jsx'] },
  { key: 'deck-shell', files: ['src/deck/Home.jsx', 'src/deck/Presentation.jsx'] },
]

function reviewPrompt(g) {
  const extra = g.key === 'deck-shell'
    ? '\nThis group is the deck shell. Restrict yourself to comment accuracy, dead code, and unused imports/vars ONLY. Make no structural change.'
    : ''
  return [
    PUBLISH_RULE,
    '',
    'You are a meticulous senior engineer doing a code-standards pass on these files (changed earlier this session): ' + g.files.map((f) => ROOT + '/' + f).join(', ') + '.',
    '',
    STANDARDS,
    '',
    CONSTRAINTS + extra,
    '',
    'Read each file in full. Find genuine code-standards issues, prioritizing comments that became stale or inaccurate after recent edits. Apply ONLY the safe fixes allowed above with the Edit tool, then report every change you made (applied) and anything you deliberately left (skipped) with a one-line reason. If everything is clean, return empty applied and a skipped note saying so. Set group to "' + g.key + '".',
  ].join('\n')
}

const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['build', 'deckTest', 'montageCells', 'montageRenderErrors', 'desktopRoutesClean', 'mobileRoutesClean', 'issues'],
  properties: {
    build: { type: 'string' },
    deckTest: { type: 'string' },
    montageCells: { type: 'number' },
    montageRenderErrors: { type: 'number' },
    desktopRoutesClean: { type: 'number' },
    mobileRoutesClean: { type: 'number' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

const VERIFY_PROMPT = [
  PUBLISH_RULE,
  'Run each command with cwd ' + ROOT + ' (prefix with: cd ' + ROOT + ' && ...). Do not edit source.',
  '1. `npm run build` -> "pass" or the failing tail.',
  '2. `npm run deck:test` -> "N / M" (components tested / failures).',
  '3. `node tools/build_audit.mjs && node tools/montage.mjs` -> the data-comp cells count and render-error nodes count.',
  '4. `SAMPLE=1 node tools/shoot.mjs / /schedule /files /leaderboard /teams /store /achievements /admin /deck` -> count route lines with pageerrors=0 (out of 9).',
  '5. `MOBILE=1 SAMPLE=1 node tools/shoot.mjs / /schedule /files /leaderboard /teams /store /achievements /admin /deck` -> count pageerrors=0 (out of 9).',
  'Report structured. The 1 console error per route (Supabase fallback) and the 6 known montage SVG warnings are NOT regressions; list real regressions in issues[].',
].join('\n')

phase('Review + fix')
const reports = await parallel(GROUPS.map((g) => () => agent(reviewPrompt(g), { label: 'review:' + g.key, phase: 'Review + fix', schema: REPORT_SCHEMA })))

phase('Verify')
const verify = await agent(VERIFY_PROMPT, { label: 'verify', phase: 'Verify', schema: VERIFY_SCHEMA })

const applied = reports.filter(Boolean).flatMap((r) => (r.applied || []).map((a) => ({ group: r.group, ...a })))
return {
  totalApplied: applied.length,
  applied,
  skipped: reports.filter(Boolean).flatMap((r) => (r.skipped || []).map((s) => ({ group: r.group, ...s }))),
  verify,
}
