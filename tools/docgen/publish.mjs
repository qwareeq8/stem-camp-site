// Publish every manifest PDF into the site after a complete staging preflight.
// Copies tools/out/docgen/pdf/*.pdf into public/files/, stamps exact byte
// metadata, and regenerates the scoped sync SQL plus bootstrap seed so every
// generated database artifact stays in lockstep with the bundled data.
//
//   node tools/docgen/publish.mjs --replace-all-reviewed
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DOCS, PDF_DIR, repo } from "./manifest.mjs";

if (!process.argv.includes("--replace-all-reviewed")) {
  throw new Error(
    "Full publish is guarded because it replaces public/files wholesale. Use publish_one.mjs, or pass --replace-all-reviewed after reconciling every build artifact.",
  );
}

const filesDir = path.join(repo, "public", "files");
const filesJson = path.join(repo, "src", "data", "files.json");

const entries = JSON.parse(fs.readFileSync(filesJson, "utf8"));
const bySlugOut = new Map(DOCS.map((d) => [d.id, d]));

if (bySlugOut.size !== DOCS.length) throw new Error("Document manifest contains duplicate ids.");
const outputNames = new Set(DOCS.map((doc) => doc.out));
if (outputNames.size !== DOCS.length) throw new Error("Document manifest contains duplicate output filenames.");
for (const entry of entries) {
  if (!bySlugOut.has(entry.id)) throw new Error(`files.json entry ${entry.id} has no manifest doc`);
}
if (entries.length !== DOCS.length) throw new Error("files.json and the document manifest have different lengths.");

// Validate the complete already-built catalog before creating the stage or
// touching the served library. This checks both source-backed fidelity/layout
// and basic static-printable readability.
execFileSync(
  "node",
  [path.join(repo, "tools", "docgen", "check_pdfs.mjs"), "--built"],
  { stdio: "inherit" },
);

// Copy every source into a temporary staging directory before touching the
// served library. A missing/unreadable build artifact therefore cannot erase
// public/files after the operator acknowledges the full-publish guard.
const stageDir = fs.mkdtempSync(path.join(path.dirname(filesDir), ".files-stage-"));
try {
  for (const doc of DOCS) {
    const src = path.join(PDF_DIR, doc.out);
    if (!fs.existsSync(src)) throw new Error(`Built PDF is missing: ${src}`);
    fs.copyFileSync(src, path.join(stageDir, doc.out));
  }

  fs.mkdirSync(filesDir, { recursive: true });
  for (const doc of DOCS) {
    fs.copyFileSync(path.join(stageDir, doc.out), path.join(filesDir, doc.out));
  }
  for (const name of fs.readdirSync(filesDir)) {
    if (!outputNames.has(name)) fs.rmSync(path.join(filesDir, name));
  }
} finally {
  fs.rmSync(stageDir, { recursive: true, force: true });
}

for (const entry of entries) {
  const doc = bySlugOut.get(entry.id);
  entry.path = `files/${doc.out}`;
  entry.type = "pdf";
  entry.bytes = fs.statSync(path.join(filesDir, doc.out)).size;
}
fs.writeFileSync(filesJson, JSON.stringify(entries, null, 2) + "\n");
execFileSync("node", [path.join(repo, "tools", "gen_sync.mjs")], { stdio: "inherit" });
execFileSync("node", [path.join(repo, "tools", "gen_seed.mjs")], { stdio: "inherit" });
process.stdout.write(`published ${DOCS.length} PDFs into public/files/\n`);
