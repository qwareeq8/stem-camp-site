// Publish exactly one already-built PDF without replacing the full library.
// This is the safe path for a targeted source-backed correction while the
// ignored IR still contains reviewed edits that are not yet represented in the
// source archive.
//
//   node tools/docgen/publish_one.mjs TTB-04-guide
import fs from "node:fs";
import path from "node:path";
import { DOCS, PDF_DIR, repo } from "./manifest.mjs";

const key = process.argv[2];
if (!key) throw new Error("Provide one exact document id, slug, or output filename.");

const matches = DOCS.filter((doc) => [doc.id, doc.slug, doc.out].includes(key));
if (matches.length !== 1) {
  throw new Error(`Expected one exact document match for "${key}", found ${matches.length}.`);
}

const [doc] = matches;
const source = path.join(PDF_DIR, doc.out);
const destination = path.join(repo, "public", "files", doc.out);
if (!fs.existsSync(source)) throw new Error(`Built PDF is missing: ${source}`);

fs.copyFileSync(source, destination);
process.stdout.write(`published only ${doc.out}\n`);
