// Publish the generated PDFs into the site.
// Copies tools/out/docgen/pdf/*.pdf into public/files/, rewrites the two
// former spreadsheet entries (procurement workbook, buy list) as PDF
// documents, and regenerates supabase/seed.sql so the optional database seed
// stays in lockstep with the bundled data. File sizes are NOT stored: the Files
// page measures each served file live (see src/site/lib/fileSize.js).
//
//   node tools/docgen/publish.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DOCS, PDF_DIR, repo } from "./manifest.mjs";

const filesDir = path.join(repo, "public", "files");
const filesJson = path.join(repo, "src", "data", "files.json");

const entries = JSON.parse(fs.readFileSync(filesJson, "utf8"));
const bySlugOut = new Map(DOCS.map((d) => [d.id, d]));

// Replace the library wholesale: every served document is a generated PDF.
for (const name of fs.readdirSync(filesDir)) fs.rmSync(path.join(filesDir, name));
let copied = 0;
for (const doc of DOCS) {
  const src = path.join(PDF_DIR, doc.out);
  fs.copyFileSync(src, path.join(filesDir, doc.out));
  copied++;
}

for (const entry of entries) {
  const doc = bySlugOut.get(entry.id);
  if (!doc) throw new Error(`files.json entry ${entry.id} has no manifest doc`);
  entry.path = `files/${doc.out}`;
  entry.type = "pdf";
}
fs.writeFileSync(filesJson, JSON.stringify(entries, null, 2) + "\n");
execFileSync("node", [path.join(repo, "tools", "gen_seed.mjs")], { stdio: "inherit" });
process.stdout.write(`published ${copied} PDFs into public/files/\n`);
