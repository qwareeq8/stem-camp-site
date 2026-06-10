export const meta = {
  name: 'stem-apply-audit-fixes',
  description: 'Apply the 1 HIGH (deck scroll) + 7 MED + 4 LOW audit fixes to the publish copy: CSS edits in one agent, then file-disjoint JSX edits in parallel, then an independent rebuild+gate verify pass',
  phases: [
    { title: 'Apply CSS', detail: 'single agent owns styles.css (8 edits)' },
    { title: 'Apply JSX', detail: 'parallel, one agent per page file' },
    { title: 'Verify', detail: 'rebuild, gates, re-shoot, re-capture deck scroll shots' },
  ],
}

const ROOT = '/data/projects/stem-camp-site-publish'

const PUBLISH_RULE = 'HARD RULE: work and read ONLY under ' + ROOT + '. There is a STALE sibling copy at /data/projects/stem-camp-site (canonical, untouched) - NEVER read, open, or edit it. Use absolute paths under ' + ROOT + ' only.'

const DECK_RULE = 'DECK SAFETY: never edit deck demo bodies (src/deck/components/demos/* or extras/*), src/deck/ui/hooks.js, the keyboard/timer/slide-state logic, or any inline transition:/animation: prop, and never add @keyframes. Only the specified static styling/markup changes are allowed.'

const HOWTO = 'Apply ONLY the edits below, using the Edit tool with the exact FIND text as old_string and the REPLACE text as new_string. Match whitespace exactly. After each edit, read the changed region back to confirm it applied. Do not make any other change. Then reply with a one-line confirmation per edit.'

// ----------------------------------------------------------------------------
// PHASE 1: styles.css (single owner, 8 edits)
// ----------------------------------------------------------------------------
const CSS_PROMPT = [
  PUBLISH_RULE,
  DECK_RULE,
  'You own exactly one file: ' + ROOT + '/src/site/styles.css. ' + HOWTO,
  '',
  'EDIT 1 (HIGH - deck slides no longer scroll under the sticky site nav). FIND this exact block:',
  '.deck-host {',
  '  position: relative;        /* in normal flow, not a fixed overlay */',
  '  background: var(--paper);',
  '  border: 1px solid var(--rule22);',
  '  border-radius: var(--radius);',
  '  overflow: hidden;          /* clip the deck\'s internal absolute corners */',
  '  isolation: isolate;        /* local stacking context: deck z-index stays below nav */',
  '}',
  'REPLACE WITH:',
  '.deck-host {',
  '  position: sticky;          /* pin the deck below the site nav so slides never slide under it */',
  '  top: var(--nav-h);',
  '  max-height: calc(100dvh - var(--nav-h) - 12px);',
  '  background: var(--paper);',
  '  border: 1px solid var(--rule22);',
  '  border-radius: var(--radius);',
  '  overflow: hidden;          /* clip the deck\'s internal absolute corners + rounded edges */',
  '  overflow-y: auto;          /* slides scroll WITHIN the deck, not under the sticky site nav */',
  '  isolation: isolate;        /* local stacking context: deck z-index stays below nav */',
  '}',
  '',
  'EDIT 2 (MED - home "see more" links read as links not muted captions). FIND:',
  '.notice.info { background: var(--paper2); border-color: var(--rule22); }',
  'REPLACE WITH:',
  '.notice.info { background: var(--paper2); border-color: var(--rule22); }',
  '/* inline "see more" links on the home cards: read as Cherry links, not muted captions */',
  '.see-more { color: var(--primary); }',
  '.see-more:hover { text-decoration: underline; }',
  '',
  'EDIT 3 (MED - schedule code badge pinned to the right edge + rows top-aligned on desktop). FIND:',
  '/* ---- schedule per-activity document links ---- */',
  'REPLACE WITH:',
  '/* top-align schedule rows and pin the code badge to the right edge so it anchors to a',
  '   column instead of floating in the middle of the row (desktop); mobile keeps its own order */',
  '.sched-row { align-items: flex-start; }',
  '.sched-row .badge { margin-left: auto; }',
  '',
  '/* ---- schedule per-activity document links ---- */',
  '',
  'EDIT 4a (MED - compact mobile standings bar; base = hidden). FIND:',
  '.progress > span { display: block; height: 100%; background: var(--accent); }',
  'REPLACE WITH:',
  '.progress > span { display: block; height: 100%; background: var(--accent); }',
  '/* compact standings bar shown only on the narrow leaderboard (the Progress column is',
  '   hidden on phones); keeps the standings visualization on mobile */',
  '.lb-progress-m { display: none; }',
  '',
  'EDIT 4b (MED - show that mobile bar inside the responsive block). FIND:',
  '  .lb-motto { display: none; }',
  'REPLACE WITH:',
  '  .lb-motto { display: none; }',
  '  .lb-progress-m { display: block; margin-top: 6px; }',
  '',
  'EDIT 5 (LOW - Files search placeholder meets WCAG AA). FIND:',
  '.input::placeholder { color: var(--mute2); opacity: 1; }',
  'REPLACE WITH:',
  '.input::placeholder { color: var(--mute); opacity: 1; }',
  '',
  'EDIT 6 (LOW - achievements prize criteria pinned to the card bottom). FIND:',
  '.award-recipients { margin-top: auto; padding-top: 12px; }',
  'REPLACE WITH:',
  '.award-recipients { margin-top: auto; padding-top: 12px; }',
  '.award-foot { margin-top: auto; }',
  '',
  'EDIT 7 (LOW - balance the page-sub wrap so admin subtitle has no one-word orphan line). FIND:',
  '.page-sub { color: var(--ink2); margin-top: 10px; max-width: 60ch; font-size: 16px; }',
  'REPLACE WITH:',
  '.page-sub { color: var(--ink2); margin-top: 10px; max-width: 60ch; font-size: 16px; text-wrap: balance; }',
  '',
  'EDIT 8 (LOW - deck Kit-list Qty column left-aligns long descriptive values on mobile). FIND:',
  '@media (max-width: 640px) { .deck-host .deck-landing { padding: 18px 14px 24px; } }',
  'REPLACE WITH:',
  '@media (max-width: 640px) { .deck-host .deck-landing { padding: 18px 14px 24px; } }',
  '@media (max-width: 640px) { .deck-host th.deck-kit-qty, .deck-host td.deck-kit-qty { text-align: left !important; } }',
].join('\n')

// ----------------------------------------------------------------------------
// PHASE 2: per-file JSX edits (parallel, file-disjoint)
// ----------------------------------------------------------------------------
const HOME_PROMPT = [
  PUBLISH_RULE,
  'You own exactly one file: ' + ROOT + '/src/site/pages/Home.jsx. ' + HOWTO,
  '',
  'EDIT 1 (MED). FIND:',
  '              <Link to="/leaderboard" className="mono muted" style={{ fontSize: 11, display: "inline-block", marginTop: 10 }}>Full standings &rarr;</Link>',
  'REPLACE WITH:',
  '              <Link to="/leaderboard" className="mono see-more" style={{ fontSize: 11, display: "inline-block", marginTop: 10 }}>Full standings &rarr;</Link>',
  '',
  'EDIT 2 (MED). FIND:',
  '                  <Link to="/schedule" className="mono muted" style={{ fontSize: 11, display: "inline-block", marginTop: 10 }}>Full schedule &rarr;</Link>',
  'REPLACE WITH:',
  '                  <Link to="/schedule" className="mono see-more" style={{ fontSize: 11, display: "inline-block", marginTop: 10 }}>Full schedule &rarr;</Link>',
].join('\n')

const LB_PROMPT = [
  PUBLISH_RULE,
  'You own exactly one file: ' + ROOT + '/src/site/pages/Leaderboard.jsx. ' + HOWTO,
  '',
  'EDIT 1 (MED - bars proportional to the leader so a tight race reads as tight). FIND:',
  '  const lowest = allRows.length ? allRows[allRows.length - 1].total : 0;',
  '  const span = ceiling - lowest;',
  '  const barPct = (total) => (span > 0 ? Math.round((0.15 + 0.85 * ((total - lowest) / span)) * 100) : 100);',
  'REPLACE WITH:',
  '  // Bars are proportional to the leader\'s total, so tightly-bunched totals read as a',
  '  // tight race instead of a blowout; the numeric Total column carries the exact figure.',
  '  const barPct = (total) => (ceiling > 0 ? Math.round((total / ceiling) * 100) : 100);',
  '',
  'EDIT 2 (MED - keep a compact standings bar on mobile where the Progress column is hidden). FIND:',
  '                        <span className="lb-name" style={{ fontWeight: lead ? 700 : 600 }}>{t.name}</span>',
  '                        <CampBadge camp={t.camp} />',
  '                      </div>',
  'REPLACE WITH:',
  '                        <span className="lb-name" style={{ fontWeight: lead ? 700 : 600 }}>{t.name}</span>',
  '                        <CampBadge camp={t.camp} />',
  '                      </div>',
  '                      <div className="lb-progress-m"><Progress value={barPct(t.total)} max={100} /></div>',
  '',
  'Note: Progress is already imported in this file; do not add an import.',
].join('\n')

const TEAMS_PROMPT = [
  PUBLISH_RULE,
  'You own exactly one file: ' + ROOT + '/src/site/pages/Teams.jsx. ' + HOWTO,
  '',
  'EDIT 1 (MED - the decorative team emblem must not look like a clickable icon button; drop the bordered/filled box and render the icon inline at the camp accent color). FIND:',
  '                      <span',
  '                        aria-hidden="true"',
  '                        style={{',
  '                          display: "inline-flex",',
  '                          alignItems: "center",',
  '                          justifyContent: "center",',
  '                          width: 34,',
  '                          height: 34,',
  '                          borderRadius: 8,',
  '                          border: "1px solid var(--rule22)",',
  '                          color: camp.accent,',
  '                          background: "var(--paper)",',
  '                          flexShrink: 0,',
  '                        }}',
  '                      >',
  '                        <Emblem size={18} strokeWidth={1.8} />',
  '                      </span>',
  'REPLACE WITH:',
  '                      <span',
  '                        aria-hidden="true"',
  '                        style={{',
  '                          display: "inline-flex",',
  '                          alignItems: "center",',
  '                          justifyContent: "center",',
  '                          width: 28,',
  '                          color: camp.accent,',
  '                          flexShrink: 0,',
  '                        }}',
  '                      >',
  '                        <Emblem size={24} strokeWidth={1.8} />',
  '                      </span>',
].join('\n')

const ACH_PROMPT = [
  PUBLISH_RULE,
  'You own exactly one file: ' + ROOT + '/src/site/pages/Achievements.jsx. ' + HOWTO,
  '',
  'EDIT 1 (LOW - make the prize card a flex column so its criteria line can pin to the bottom). FIND:',
  '        <div className="grid cols-2">',
  '          {prizes.map((p) => (',
  '            <Card key={p.id}>',
  'REPLACE WITH:',
  '        <div className="grid cols-2">',
  '          {prizes.map((p) => (',
  '            <Card key={p.id} className="award-card">',
  '',
  'EDIT 2 (LOW - pin the criteria line to the card bottom so paired cards share a baseline). FIND:',
  '              <div className="mono muted" style={{ fontSize: 12 }}>{p.criteria}</div>',
  'REPLACE WITH:',
  '              <div className="mono muted award-foot" style={{ fontSize: 12 }}>{p.criteria}</div>',
].join('\n')

const DECK_HOME_PROMPT = [
  PUBLISH_RULE,
  DECK_RULE,
  'You own exactly one file: ' + ROOT + '/src/deck/Home.jsx. ' + HOWTO,
  '',
  'EDIT 1 (MED - on narrow phones the long section-title wraps and its trailing rule line vanishes; show a short one-line label when narrow so the rule renders). FIND:',
  '      {/* section label: camp framing + station count */}',
  '      <h2 className="section-title">',
  '        {camp === "trees" ? "Field · Forest · Future" : "Signal · System · Science"} · {list.length} stations',
  '      </h2>',
  'REPLACE WITH:',
  '      {/* section label: camp framing + station count. On narrow phones the full tagline',
  '          wraps and collapses the trailing rule line, so show a short one-line label there. */}',
  '      <h2 className="section-title">',
  '        {isNarrow',
  '          ? `${list.length} stations`',
  '          : `${camp === "trees" ? "Field · Forest · Future" : "Signal · System · Science"} · ${list.length} stations`}',
  '      </h2>',
  '',
  'Note: isNarrow is already defined in this component (the useIsNarrow hook); do not redefine it.',
].join('\n')

const DECK_PRES_PROMPT = [
  PUBLISH_RULE,
  DECK_RULE,
  'You own exactly one file: ' + ROOT + '/src/deck/Presentation.jsx. ' + HOWTO,
  '',
  'EDIT 1 (MED - the Competition total "100 pts" wraps to two lines on mobile; keep it on one line). FIND:',
  '                      <td style={{ textAlign: "right", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 16, color: T.primary }}>100 pts</td>',
  'REPLACE WITH:',
  '                      <td style={{ textAlign: "right", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 16, color: T.primary, whiteSpace: "nowrap" }}>100 pts</td>',
  '',
  'EDIT 2 (LOW - tag the Kit-list Qty header so long descriptive quantities can left-align on mobile). FIND:',
  '                    <tr><th style={{ width: 44 }}>#</th><th>Item</th><th style={{ textAlign: "right" }}>Qty</th></tr>',
  'REPLACE WITH:',
  '                    <tr><th style={{ width: 44 }}>#</th><th>Item</th><th className="deck-kit-qty" style={{ textAlign: "right" }}>Qty</th></tr>',
  '',
  'EDIT 3 (LOW - tag the Kit-list Qty cell to match). FIND:',
  '                        <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>{m.q}</td>',
  'REPLACE WITH:',
  '                        <td className="deck-kit-qty" style={{ textAlign: "right", fontFamily: "var(--mono)" }}>{m.q}</td>',
].join('\n')

// ----------------------------------------------------------------------------
// PHASE 3: verify
// ----------------------------------------------------------------------------
const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['build', 'deckTest', 'montageCells', 'montageRenderErrors', 'desktopRoutesClean', 'mobileRoutesClean', 'deckScrollShots', 'issues'],
  properties: {
    build: { type: 'string', description: 'pass or the error tail' },
    deckTest: { type: 'string', description: 'e.g. "64 / 0"' },
    montageCells: { type: 'number' },
    montageRenderErrors: { type: 'number' },
    desktopRoutesClean: { type: 'number', description: 'count of the 9 routes with pageerrors=0' },
    mobileRoutesClean: { type: 'number' },
    deckScrollShots: { type: 'array', items: { type: 'string' }, description: 'filenames of the re-captured deck scroll shots' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

const VERIFY_PROMPT = [
  PUBLISH_RULE,
  'Run every command with the working directory ' + ROOT + ' (prefix each with: cd ' + ROOT + ' && ...). Run these gates in order and report results. Do not edit any source.',
  '',
  '1. Build: `npm run build` (report "pass" or the failing tail).',
  '2. Deck test: `npm run deck:test` (report the "components tested / failures" as "N / M").',
  '3. Audit + montage: `node tools/build_audit.mjs && node tools/montage.mjs` (report the "data-comp cells" number and the "render-error nodes" number).',
  '4. Desktop shoot: `SAMPLE=1 node tools/shoot.mjs / /schedule /files /leaderboard /teams /store /achievements /admin /deck` and count how many of the 9 route lines show pageerrors=0.',
  '5. Mobile shoot: `MOBILE=1 SAMPLE=1 node tools/shoot.mjs / /schedule /files /leaderboard /teams /store /achievements /admin /deck` and count pageerrors=0 lines.',
  '6. Re-capture deck scroll shots for the HIGH fix review: ',
  '   `CARD=1 STEPS=4 TAG=fix_steps_scroll SCROLL=450 node tools/shoot_deck_slide.mjs`',
  '   `CARD=1 STEPS=4 TAG=fix_steps_scroll SCROLL=500 MOBILE=1 node tools/shoot_deck_slide.mjs`',
  '   `CARD=1 STEPS=0 TAG=fix_title node tools/shoot_deck_slide.mjs`',
  '   List the output filenames under tools/out/ (they will be deck_fix_*.png).',
  '',
  'Report the structured result. Note in issues[] anything that regressed (build fail, deck:test not 64/0, montage not 64 cells / 0 render-errors, or any route with pageerrors>0). The expected 1 console error per route (Supabase-not-configured) and the 6 known montage console SVG warnings are NOT regressions.',
].join('\n')

// ----------------------------------------------------------------------------
// orchestration
// ----------------------------------------------------------------------------
phase('Apply CSS')
const cssResult = await agent(CSS_PROMPT, { label: 'css:styles.css', phase: 'Apply CSS' })

phase('Apply JSX')
const jsxResults = await parallel([
  () => agent(HOME_PROMPT, { label: 'jsx:Home', phase: 'Apply JSX' }),
  () => agent(LB_PROMPT, { label: 'jsx:Leaderboard', phase: 'Apply JSX' }),
  () => agent(TEAMS_PROMPT, { label: 'jsx:Teams', phase: 'Apply JSX' }),
  () => agent(ACH_PROMPT, { label: 'jsx:Achievements', phase: 'Apply JSX' }),
  () => agent(DECK_HOME_PROMPT, { label: 'jsx:deck/Home', phase: 'Apply JSX' }),
  () => agent(DECK_PRES_PROMPT, { label: 'jsx:deck/Presentation', phase: 'Apply JSX' }),
])

phase('Verify')
const verify = await agent(VERIFY_PROMPT, { label: 'verify', phase: 'Verify', schema: VERIFY_SCHEMA })

return {
  cssApplied: cssResult,
  jsxApplied: jsxResults,
  verify,
}
