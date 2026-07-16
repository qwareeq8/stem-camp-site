// Regenerate supabase/seed.sql from the bundled src/data/*.json collections.
// Write one INSERT row per collection, with the whole collection as a JSONB
// blob. Every collection uses ON CONFLICT DO NOTHING so re-running this
// bootstrap cannot overwrite any live state. Routine production updates use
// the narrower supabase/sync_*.sql files.
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

const data = Object.fromEntries(COLLECTIONS.map((name) => {
  const raw = fs.readFileSync(path.join(dataDir, `${name}.json`), "utf8");
  const value = JSON.parse(raw);
  return [name, value];
}));

const rows = COLLECTIONS.map((name) => `  ('${name}', ${sqlString(data[name])}::jsonb)`);

const header = `-- Generate this file from src/data/*.json by running tools/gen_seed.mjs.
-- BOOTSTRAP ONLY: run after supabase/schema.sql when creating a new database.
-- Existing rows are never overwritten. Routine live updates must use the
-- scoped supabase/sync_*.sql scripts instead.

insert into public.collections (name, data) values
`;

const sql = header + rows.join(",\n") + "\non conflict (name) do nothing;\n";

fs.writeFileSync(outFile, sql);
process.stdout.write(`wrote ${outFile} (${COLLECTIONS.length} collections)\n`);
