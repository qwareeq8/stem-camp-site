# STEM Camp Field Notebook

A static, GitHub-Pages-ready site for the two summer STEM camps, From Trees to
Tech and PY-STEM. It has two parts:

1. **The interactive deck** (`src/deck/`): the camp's 64-component interactive
   slide deck, modularized from a single 704 KB file into focused ES modules
   with zero behavior change. It is the centerpiece of the site (the `/deck`
   route).
2. **The site** (`src/site/`): a field-notebook web app with the deck plus a
   schedule, leaderboard, teams, achievements, prizes, tickets, a ticket store,
   and a files/resources area, with a form-based, Supabase-auth-gated admin console for
   authoring all of it. Data lives in a Supabase (Postgres) table, read at runtime
   with the bundled JSON as an offline fallback so the public site always renders
   with no credential. The site ships with the made-up participants cleared (empty
   teams, roster, scores, and tickets) so a real camp starts from a blank
   notebook; the real schedule, award and prize definitions, and files stay as a
   starting point. `DeckPage` and `Admin` are lazy-loaded, so the initial bundle a
   visitor downloads stays small; the deck loads only on `/deck`, split into
   several cacheable chunks.

## Quick start

```bash
npm install
npm run dev        # Start the local dev server.
npm run build      # Build the production site into dist/.
npm run preview    # Serve the built dist/ locally.
```

## Project structure

```
src/
  deck/                 modularized interactive deck
    theme.js            palette, camp identity, font helpers
    icons.jsx           lucide imports + icon maps + IconChip
    ui/                 hooks.js, primitives.jsx
    data/decks.js       the four activity arrays + CATMAP
    components/         one file per Demo*/Extra*, plus shared.jsx and the
                        EXTRAS/DEMOS routing maps
    Presentation.jsx, Home.jsx, App.jsx
    index.js            public surface (default App + all named exports)
  site/                 the website
    App.jsx             router (HashRouter routes)
    Nav.jsx, Footer.jsx
    ui.jsx              shared primitives (Page, Card, Badge, Btn, ...)
    styles.css          field-notebook stylesheet
    lib/                supabaseStore.js (Supabase-backed data layer) + store.js
                        re-export, supabaseAuth.js (email/password gate) +
                        auth.js re-export, supabaseClient.js (lazy SDK),
                        schemas.js (write validation), scoring.js
    pages/              Home, DeckPage, Schedule, Leaderboard, Teams,
                        Achievements, Store, Files, Admin (lazy), NotFound
      admin/            form editors (one per collection) + shared.jsx contract
                        + RawJsonEditor (the Advanced fallback)
    lib/sampleData.js   the demo data set the "Load sample data" button restores
  data/                 JSON seeds: config, teams, members, scores, tickets,
                        catalog, schedule, achievements, prizes, files (teams/
                        members/scores/tickets/catalog ship empty; the rest ship
                        populated)
supabase/               schema.sql (table + RLS), seed.sql (generated, optional)
public/files/           downloadable docs + buy_list.csv
tools/                  build/verify scripts (deck tests, screenshots,
                        gen_seed.mjs, admin_preview.mjs)
reference/Deck.mono.jsx the pre-theme monolith (provenance baseline; deck:diff differs)
```

## The deck modularization

The deck was split with `tools/split_deck.cjs`, which slices each top-level
declaration **verbatim** and generates only the import/export headers, so no
component body is ever reauthored. Equivalence is verified:

```bash
npm run deck:test   # Render all 64 deck components server-side.
npm run deck:diff   # Compare the modular deck to the provenance monolith.
```

`deck:test` is the equivalence gate. It must report 64 components and 0 failures.
`deck:diff` may report differences against `reference/Deck.mono.jsx` because the
current deck uses updated theme tokens. Treat the monolith as provenance, not as
a current byte-for-byte identity target.

## Data layer and admin

All site data is JSON, stored as whole-collection blobs. The backend is
**Supabase** (Postgres + PostgREST + Auth + Row Level Security). Each collection
is one row in a `collections(name text primary key, data jsonb, updated_at)`
table, which mirrors the bundled `src/data/*.json` model exactly, so schema
validation is unchanged. See `supabase/schema.sql`.

**Authoring console (forms).** The admin console (`/admin`) is a tabbed set of
form editors, one per collection (Setup, Teams, Roster, Scores, Schedule, Awards,
Tickets, Catalog, Prizes, Files), plus an "Advanced (JSON)" tab that keeps a raw
editor as a fallback. The editors share one small contract (`src/site/pages/admin/shared.jsx`)
and all go through the same validate-then-`commitCollection` path. The Schedule
editor edits each day and its timed blocks; a block with no station code is a
field visit, lunch, or other custom event. The roster uses **aliases**, never
real names. A "Load sample data" button fills the site from
`src/site/lib/sampleData.js` as a local-only preview (never written to Supabase),
and "Reset all to seed" clears it.

**Tickets.** A per-team reward currency (a camp-facing layer, not from the
source kit): the `tickets` collection is a ledger of `{ teamId, amount, reason,
ts }` entries, a positive amount grants and a negative redeems, and a team's
balance is the running sum. Balances show on Teams, the Leaderboard, and the ticket
Store; the admin grants and deducts them on the Tickets tab. The `catalog`
collection is the ticket store (redeemable rewards with a cost in tickets), shown
publicly at `/store`; redeeming a reward on the Tickets tab appends a negative
ledger entry and records who picked it up (an alias).

**Read path (public, no credential).** On load the site fetches each collection
from PostgREST with the publishable anon key (a plain `fetch`, so the
`@supabase/supabase-js` SDK stays out of the initial bundle) through
`src/site/lib/supabaseStore.js`. If the fetch fails, Supabase is unconfigured,
or no row exists yet, it falls back to the compiled-in `src/data/*.json` seed,
so the public site always renders with no credential. Saved changes appear to
visitors on their next load (no CDN lag, no redeploy).

**Write path (admin, session required).** Save in the admin console upserts the
edited JSON to the table through `supabase-js` (loaded on demand), using the
signed-in admin's session. The JSON is validated against a small per-collection
schema (`src/site/lib/schemas.js`) before any network call. Row Level Security
enforces the gate: anon may read, only an authenticated admin may write.
**Download JSON** remains as a no-auth fallback.

**Config and secrets.** The project URL and publishable anon key come from
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`), with an
optional non-secret `supabase` block in `src/data/config.json` as a local-dev
fallback. Both are baked into the build; the anon key is designed to be public
and is safe to expose (RLS does the enforcing). Empty or unset values mean
seed-only: the site still renders and admin sign-in is disabled. No service-role
key ever reaches the browser.

**Admin auth (Supabase email/password).** The admin signs in with the single
Supabase Auth account created for the camp; Supabase issues a JWT held in this
browser, and RLS uses it to allow writes. Reading the public bundle grants no
write: only a holder of valid admin credentials gets a write-capable session.
Create the one account and disable open sign-ups (or restrict writes by email,
see `supabase/schema.sql`). The SDK is loaded only on demand (sign-in, an
existing-session restore, or a save), so public visitors never download it.

**Public-read caveat (important).** The table's read policy makes **every
collection publicly readable**, which is intended for a public leaderboard and
schedule. Authentication guards writes only. Store only data safe to be public
(team names, scores, schedule, public achievements). Do **not** put personal
data, contact details, private notes, or anything sensitive about minors into
the database.

## Deploy to GitHub Pages

Deployment is handled by the GitHub Actions workflow at
`.github/workflows/deploy.yml`.

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Optionally run `supabase/seed.sql` to pre-populate schedule, awards, prizes,
   files, and config.
4. Create one Supabase Auth admin account.
5. Disable open email sign-ups in Supabase.
6. Add GitHub Actions secrets named `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY`.
7. Add the optional GitHub Actions variable `VITE_SUPABASE_TABLE=collections`.
8. Set GitHub Pages source to **GitHub Actions**.
9. Push `main`, or manually run the `Deploy site to GitHub Pages` workflow.

Without the Actions secrets, the deployed site still renders from bundled seed
data, but admin sign-in is disabled.

`vite.config.js` uses `base: "./"` and the app uses `HashRouter`, so deep links
work under any project subpath with no server rewrites.
