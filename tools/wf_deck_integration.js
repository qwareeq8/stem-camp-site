export const meta = {
  name: 'stem-deck-integration',
  description: 'Analyze how to make the interactive /deck read as a SECTION of the STEM camp site (not a private microsite) without altering any animation; emit an ordered, low-risk, shell-only integration spec.',
  phases: [
    { title: 'Analyze' },
    { title: 'Synthesize' },
  ],
}

const OUT = '/data/projects/stem-camp-site-publish/tools/out'
const SRC = '/data/projects/stem-camp-site-publish/src'

// Shared, load-bearing context. Every agent must respect the hard constraints.
const CONTEXT = `
GOAL: The interactive "field deck" at /#/deck must read as a SECTION OF THE WEBSITE,
not its own private microsite. We are blending its SURFACE, CHROME, and TYPOGRAPHY
into the warm "field notebook" site around it WITHOUT changing any animation.

SITE DESIGN TOKENS (src/site/styles.css :root) -- the deck must visually belong here:
  --paper #FAFAF8 (warm page bg), --paper2 #F2F1EE (card fill), --paper3 #E7E6E2,
  --ink #222, --ink2/--mute #5A564F, --mute2 #8A8D8F,
  --rule12 rgba(34,34,34,.12), --rule22 rgba(34,34,34,.22),
  --primary #9D2235 (Temple Cherry), camp accents trees #2a5736 / py #1c3257,
  --serif Fraunces (display), --sans Inter (body), --mono JetBrains Mono (labels),
  --radius 10px. Site CARDS = --paper2 fill + 1px --rule22 border + 10px radius.
  Site headings are UPRIGHT Fraunces; section labels are small uppercase mono with
  a trailing hairline rule.

CRITICAL ARCHITECTURE DISCOVERY (verified):
- The deck has NO stylesheet of its own. The ONLY css file is src/site/styles.css.
- Every deck className (.fu, .corner, .ticker, .focusable, .stage, .smallcaps,
  .nofocus, .accentRule) is UNDEFINED = a styling no-op. @keyframes blink / dash /
  fu DO NOT EXIST, so the deck currently has ZERO css-keyframe animation.
- The deck is therefore styled ENTIRELY by INLINE styles built from theme.js tokens
  T.* and the font helpers f.display/f.sans/f.mono. To recolor the deck you edit
  theme.js tokens and/or the inline background:/color: props in the SHELL files.
- theme.js token T.paper = "#FFFFFF". It is used for BOTH the page background AND
  card fills AND many demo internal surfaces. The deck root (.stemdeck in App.jsx,
  the Home root, the Presentation root + sticky header + nav + index drawer) paint
  T.paper = pure white over the warm site -> this is the #1 "separate microsite" cue.

HARD ANIMATION-SAFETY CONSTRAINTS (do NOT propose anything that violates these):
- The real animations are requestAnimationFrame loops INSIDE
  src/deck/components/demos/* and src/deck/components/extras/* (Demo*/Extra*). Their
  bodies, RAF loops, transition logic, and keyboard logic are OFF-LIMITS. Never edit them.
- Do NOT add any @keyframes (.fu, blink, dash must stay undefined no-ops). Adding a
  keyframe would CREATE animation where there is none now.
- Do NOT change any inline transition: or animation: prop anywhere.
- The user will review animations separately; KEEP ALL ANIMATIONS EXACTLY AS THEY ARE.

ALLOWED EDIT SURFACE (the ONLY files a fix may touch):
  src/deck/theme.js
  src/deck/App.jsx
  src/deck/Home.jsx
  src/deck/Presentation.jsx
  src/deck/ui/primitives.jsx
  src/deck/icons.jsx
  src/site/pages/DeckPage.jsx
  the .deck-host block in src/site/styles.css
WARNING: theme.js tokens T.* are also consumed by the 64 demos. A token change
ripples into every demo (a montage gate re-runs after any theme.js token edit).
Prefer introducing a NEW token (e.g. a warm background token) and repainting only
the SHELL roots/headers/nav with it, over mutating T.paper itself, when that keeps
demo internals unchanged. Call out the blast radius of any token change.

THE FIVE KNOWN "SEPARATE MICROSITE" CUES (already scoped) to resolve:
  a. SURFACE TONE: T.paper #FFFFFF deck vs --paper #FAFAF8 warm site. Recolor the
     ROOT/background paints to warm while keeping CARDS lighter (white) so they lift,
     or move cards to --paper2 -- do NOT just flatten both to one color.
  b. REDUNDANT CHROME: DeckPage.jsx already renders a SITE header ("Interactive /
     Field deck / Pick a camp..."). The deck's OWN masthead in Home.jsx ("Middle
     School STEM - Edition 2026 / Field Notebook / vol I - N stations / arrow-key
     hints") is a SECOND publication-style header that duplicates the site identity.
     Tone it down or remove so there is ONE header.
  c. BORDERED PAGE FRAME: the borderLeft/borderRight + maxWidth 1100 wrapper inside
     Home.jsx makes the deck look like a standalone bound document.
  d. CARD LANGUAGE: station cards use a hard black 1px border + ~0 radius + white
     fill; site cards use --paper2 fill + --rule22 1px border + 10px radius. (Note
     the StationCard has a folded-corner span pinned at top:0 right:0 -- a large
     border-radius would make it overhang; account for that.)
  e. ITALIC DISPLAY: the deck leans on italic Fraunces display; the site headings are
     upright. De-italicizing is the BIGGEST aesthetic shift and the most likely to
     change the deck's character -- treat it as OPTIONAL and reversible, lower priority
     than surface tone + chrome reduction.

SCREENSHOTS (full-page PNGs; read with the Read tool):
  Site for comparison (warm bg, soft cards): ${OUT}/site_home.png , ${OUT}/site_teams.png
  Deck landing inside the site:              ${OUT}/site_deck.png (desktop) , ${OUT}/site_deck_m.png (390px)
  In-station slides (NOT shown by route shots): ${OUT}/deck_title.png , ${OUT}/deck_science.png (has a live RAF demo) , ${OUT}/deck_steps.png
  In-station mobile:                          ${OUT}/deck_title_m.png , ${OUT}/deck_science_m.png

Be concrete and visual. Ground every proposed change in an exact file + the exact
inline style / token it edits. Prefer the lowest-risk change that achieves cohesion.
`

const LENS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['lens', 'observations', 'changes'],
  properties: {
    lens: { type: 'string' },
    observations: {
      type: 'array',
      description: 'What, specifically, makes the deck read as a separate microsite through this lens (with on-screen evidence).',
      items: { type: 'string' },
    },
    changes: {
      type: 'array',
      description: 'Proposed atomic edits, each scoped to an allowed shell file. Lowest-risk first.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'file', 'what', 'why', 'risk', 'touchesForbidden', 'animationImpact', 'blastRadius'],
        properties: {
          id: { type: 'string', description: 'short slug, e.g. surface-root-warm' },
          file: { type: 'string', description: 'exact allowed file, or ".deck-host in styles.css"' },
          what: { type: 'string', description: 'Exact edit: which inline prop / token / element, old -> new value.' },
          why: { type: 'string', description: 'Which microsite cue (a-e) it resolves and how it matches the site.' },
          risk: { type: 'string', enum: ['low', 'medium', 'high'] },
          touchesForbidden: { type: 'boolean', description: 'true if it would touch a Demo*/Extra* body, RAF/keyboard/transition logic, add a @keyframes, or change an inline transition:/animation: prop. MUST be false to be acceptable.' },
          animationImpact: { type: 'string', description: 'Explicitly: does this change any motion? It must not. Explain why it is motion-neutral.' },
          blastRadius: { type: 'string', description: 'If a theme.js token change, which other consumers (cards, demos, pills) are affected and whether montage stays 64/0.' },
        },
      },
    },
  },
}

const LENSES = [
  {
    key: 'surface-color',
    prompt: `LENS 1 -- SURFACE & COLOR. Focus on cue (a) and any other color/tone divergence.
Compare the warm site (site_home.png, site_teams.png) against the white-on-warm deck
(site_deck.png, deck_title.png). Decide exactly how to repaint the deck SHELL roots
(.stemdeck root in App.jsx; Home root; Presentation root + its sticky header + bottom
nav + the index drawer aside) to the warm site background, while keeping station/backup
CARDS lighter so they lift (cue d's fill is your concern only for tone, not border).
Address whether to introduce a NEW warm bg token vs mutating T.paper, and the blast
radius into the 64 demos. Read theme.js, App.jsx, Home.jsx, Presentation.jsx and the
.deck-host block in styles.css before proposing.`,
  },
  {
    key: 'typography',
    prompt: `LENS 2 -- TYPOGRAPHY. Focus on cue (e) plus any type-scale/label mismatches.
The fonts already match the site (Fraunces/Inter/JetBrains via theme.js). The divergence
is STYLE: the deck leans on ITALIC Fraunces display (masthead, station titles, slide
titles, big numerals) while the site uses UPRIGHT Fraunces. Decide whether and where to
move from italic to upright for cohesion, treating full de-italicization as OPTIONAL,
reversible, and LOWER priority than surface+chrome (it most changes the deck's character).
If you recommend partial de-italicizing, say exactly which f.display(...) call sites
(Home.jsx masthead/cards, Presentation.jsx slide/section titles, step/debrief numerals)
and which to LEAVE italic to preserve voice. Read theme.js (the f.display helper) and the
display call sites in Home.jsx + Presentation.jsx.`,
  },
  {
    key: 'chrome-layout',
    prompt: `LENS 3 -- CHROME, IDENTITY & LAYOUT. Focus on cues (b), (c), (d-border/radius).
On the landing (site_deck.png, site_deck_m.png) the deck shows its OWN masthead ("Middle
School STEM - Edition 2026 / Field Notebook / vol I - N stations / arrow hints") directly
under the site's own "Field deck" page header from DeckPage.jsx -> two stacked publication
headers. Decide how to collapse to ONE identity (tone down / remove the deck masthead, or
fold its useful bits like the camp tagline + station count into the site header in
DeckPage.jsx). Also address the bordered page frame in Home.jsx (borderLeft/borderRight +
maxWidth 1100) and the station/backup CARD chrome (hard black 1px border + ~0 radius ->
soft --rule22 border + modest radius), accounting for the folded-corner span at top:0
right:0 (a big radius makes it overhang). Read DeckPage.jsx, Home.jsx, and the .deck-host
CSS. Keep every edit inside the allowed files.`,
  },
  {
    key: 'animation-safety',
    prompt: `LENS 4 -- ANIMATION-SAFETY DO-NOT-TOUCH LIST. You are the guardrail. Produce the
explicit list of code that the implementer must NOT change, so cohesion edits stay
motion-neutral. Enumerate: (1) the Demo*/Extra* component dirs and that their bodies/RAF
loops are off-limits; (2) every INLINE transition: and animation: prop in the SHELL files
(grep Home.jsx, Presentation.jsx, ui/primitives.jsx) with file:line so they are preserved
verbatim; (3) that .fu / blink / dash have NO @keyframes and must STAY undefined (adding
keyframes = new animation = forbidden); (4) which theme.js tokens the demos consume (so a
token rename/removal would break them -- prefer adding a token over changing T.paper). In
your "changes" array, put each item as an observation-style guard with what="DO NOT
CHANGE: ..." risk="low" touchesForbidden=false animationImpact="n/a guard". Read the
shell files and list the demos/extras dirs. This lens proposes NO visual edits, only the
guard list the synthesizer must honor.`,
  },
]

phase('Analyze')
const lensResults = await parallel(
  LENSES.map((l) => () =>
    agent(`${CONTEXT}\n\n=== YOUR LENS ===\n${l.prompt}`, { label: `lens:${l.key}`, phase: 'Analyze', schema: LENS_SCHEMA })
  )
)
const lenses = lensResults.filter(Boolean)
const allChanges = lenses.flatMap((r) => (r.changes || []).map((c) => ({ lens: r.lens, ...c })))
log(`lenses: ${lenses.length}; proposed changes: ${allChanges.length}`)

phase('Synthesize')
const SPEC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'doNotTouch', 'spec', 'risks'],
  properties: {
    summary: { type: 'string', description: '2-4 sentences: the integration strategy.' },
    doNotTouch: {
      type: 'array',
      description: 'Verbatim guard list from the animation-safety lens that the implementer must honor.',
      items: { type: 'string' },
    },
    spec: {
      type: 'array',
      description: 'Ordered implementation steps, LOWEST-RISK / highest-confidence FIRST. Deduplicated across lenses. Each step is independently shippable and gate-checkable.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['order', 'cue', 'file', 'change', 'rationale', 'risk', 'optional'],
        properties: {
          order: { type: 'integer' },
          cue: { type: 'string', description: 'which microsite cue a-e (or "polish")' },
          file: { type: 'string' },
          change: { type: 'string', description: 'Precise edit incl. old -> new values / tokens, ready to implement.' },
          rationale: { type: 'string' },
          risk: { type: 'string', enum: ['low', 'medium', 'high'] },
          optional: { type: 'boolean', description: 'true for character-changing / reversible items (e.g. de-italicizing) the user may want to review first.' },
        },
      },
    },
    risks: { type: 'array', items: { type: 'string' }, description: 'Anything that could break a gate (build, deck:test 64/0, montage 64/0, shoot 0 pageerrors) and how to avoid it.' },
  },
}

const synth = await agent(
  `${CONTEXT}

You are the integration LEAD. Below are proposed changes from four lenses plus an
animation-safety guard list. Produce ONE ordered, deduplicated, low-risk-first
implementation spec to make the deck read as a site section without changing any
animation. Rules:
- DROP or fix any change with touchesForbidden=true. Nothing in the final spec may
  add a @keyframes, edit a Demo*/Extra* body, or change an inline transition:/animation: prop.
- Order LOWEST-RISK / highest-confidence FIRST: surface tone, then chrome/identity
  reduction, then card softening, then (optional, last) any de-italicizing.
- Prefer adding a warm-bg token and repainting only shell roots/headers/nav over
  mutating T.paper (keep the 64 demos visually unchanged; montage must stay 64/0).
- For the station card, account for the folded-corner span (top:0 right:0) when
  choosing a radius.
- Mark genuinely character-changing items optional=true.
- Carry the animation-safety guard list verbatim into doNotTouch.

LENS OUTPUTS:
${JSON.stringify(lenses, null, 2)}`,
  { label: 'synthesize', phase: 'Synthesize', schema: SPEC_SCHEMA },
)

return { lensCount: lenses.length, proposedChanges: allChanges.length, synth }
