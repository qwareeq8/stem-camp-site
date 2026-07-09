// Generate safe, per-collection sync SQL for the live Supabase database.
// Each output file upserts ONLY its named collection (insert ... on conflict
// (name) do update), so it refreshes published content -- the document library
// (files), the program schedule, and the prize criteria -- WITHOUT touching
// the participant collections (teams, members, scores, tickets) or the
// ticket store.
//
// Run after editing src/data/files.json, schedule.json, or prizes.json:
//   node tools/gen_sync.mjs
// Then paste the regenerated file into the Supabase SQL editor (or psql).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "..", "src", "data");
const outDir = path.resolve(here, "..", "supabase");

const SYNCS = [
  { name: "files", out: "sync_files.sql", title: "the published document library" },
  { name: "schedule", out: "sync_schedule.sql", title: "the program schedule" },
  { name: "prizes", out: "sync_prizes.sql", title: "the prize list and criteria" },
];

for (const s of SYNCS) {
  const value = JSON.parse(fs.readFileSync(path.join(dataDir, `${s.name}.json`), "utf8"));
  const json = JSON.stringify(value);
  const tag = `$${s.name}$`;
  if (json.includes(tag)) throw new Error(`${s.name}.json contains the dollar tag ${tag}`);
  const sql = `-- Sync ${s.title} to the live Supabase database.
-- Safe to run any time: updates ONLY the '${s.name}' collection; leaves teams,
-- members, scores, tickets, and the store untouched. Run in the Supabase SQL
-- editor or: psql "$DATABASE_URL" -f supabase/${s.out}
-- Generated from src/data/${s.name}.json by tools/gen_sync.mjs.
insert into public.collections (name, data)
values ('${s.name}', ${tag}${json}${tag}::jsonb)
on conflict (name) do update set data = excluded.data;
`;
  fs.writeFileSync(path.join(outDir, s.out), sql);
  process.stdout.write(`wrote supabase/${s.out} (${s.name})\n`);
}
