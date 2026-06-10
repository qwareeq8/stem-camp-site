// Extract every source document in the manifest into the JSON IR.
// Word documents go through extract_docx.py and spreadsheets (the procurement
// workbook and the buy list CSV) through extract_xlsx.py. Requires the
// consolidated source archive on this machine; see manifest.mjs.
//
//   node tools/docgen/extract_all.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { DOCS, IR_DIR } from "./manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(IR_DIR, { recursive: true });

let count = 0;
for (const doc of DOCS) {
  const script = doc.isSheet ? "extract_xlsx.py" : "extract_docx.py";
  const out = path.join(IR_DIR, `${doc.slug}.json`);
  execFileSync("python3", [path.join(here, script), doc.source, out], { stdio: "inherit" });
  count++;
}
process.stdout.write(`extracted ${count} documents into ${IR_DIR}\n`);
