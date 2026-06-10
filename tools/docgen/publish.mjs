// Publish the generated PDFs into the site.
// Copies tools/out/docgen/pdf/*.pdf into public/files/, rewrites the two
// former spreadsheet entries (procurement workbook, buy list) as PDF
// documents, restamps every entry's size in src/data/files.json, and
// regenerates supabase/seed.sql so the optional database seed stays in
// lockstep with the bundled data.
//
//   node tools/docgen/publish.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DOCS, PDF_DIR, repo } from "./manifest.mjs";

// Matches FilesEditor.AutoSizeField so the admin HEAD check agrees with the
// bundled metadata.
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

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
  entry.size = formatBytes(fs.statSync(path.join(filesDir, doc.out)).size);
}
// The buy list is now a normal printable document, not a spreadsheet.
const buylist = entries.find((e) => e.id === "doc-buylist");
buylist.desc = "Every material aggregated across all stations, with per-station quantities, in one printable list.";

fs.writeFileSync(filesJson, JSON.stringify(entries, null, 2) + "\n");
execFileSync("node", [path.join(repo, "tools", "gen_seed.mjs")], { stdio: "inherit" });
process.stdout.write(`published ${copied} PDFs into public/files/, restamped ${entries.length} entries\n`);
