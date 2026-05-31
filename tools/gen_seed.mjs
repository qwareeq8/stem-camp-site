// Regenerate supabase/seed.sql from the bundled src/data/*.json collections.
// Write one INSERT row per collection, with the whole collection as a JSONB blob.
// Use an upsert on name so re-running is safe.
// Run this command after editing any src/data file:
//   node tools/gen_seed.mjs
// Keep the optional Supabase seed in lockstep with the shipped bundled data.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, "..", "src", "data");
const outFile = path.resolve(here, "..", "supabase", "seed.sql");

// Keep collection order deterministic and aligned with the store's SEEDS order.
const COLLECTIONS = [
  "teams", "members", "scores", "tickets", "catalog",
  "schedule", "achievements", "prizes", "files", "config",
];

// Escape SQL single quotes by doubling every quote inside the literal.
function sqlString(value) {
  return "'" + JSON.stringify(value).replace(/'/g, "''") + "'";
}

const rows = COLLECTIONS.map((name) => {
  const raw = fs.readFileSync(path.join(dataDir, `${name}.json`), "utf8");
  const value = JSON.parse(raw);
  return `  ('${name}', ${sqlString(value)}::jsonb)`;
});

const header = `-- Generate this file from src/data/*.json by running tools/gen_seed.mjs.
-- Run this file after supabase/schema.sql to pre-populate the collections table.
-- Re-run this file safely because it upserts rows by collection name.
-- Keep participant collections and the ticket store cleared for a new camp.
-- Seed the schedule, awards, prizes, files, and config from the public program scaffold.

insert into public.collections (name, data) values
`;

const sql = header + rows.join(",\n") +
  "\non conflict (name) do update set data = excluded.data, updated_at = now();\n";

fs.writeFileSync(outFile, sql);
process.stdout.write(`wrote ${outFile} (${COLLECTIONS.length} collections)\n`);
