// Stamp exact byte sizes from public/files into src/data/files.json.
// The public Files page formats this metadata locally, avoiding one HEAD request
// per document. Run after adding or rebuilding any published file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
const dataPath = path.join(repo, "src", "data", "files.json");
const publicDir = path.join(repo, "public");
const entries = JSON.parse(fs.readFileSync(dataPath, "utf8"));

for (const entry of entries) {
  const relative = String(entry.path || "");
  const absolute = path.resolve(publicDir, relative);
  if (!absolute.startsWith(`${publicDir}${path.sep}`)) throw new Error(`unsafe public path: ${relative}`);
  const stat = fs.statSync(absolute);
  if (!stat.isFile() || stat.size <= 0) throw new Error(`invalid published file: ${relative}`);
  entry.bytes = stat.size;
}

fs.writeFileSync(dataPath, `${JSON.stringify(entries, null, 2)}\n`);
process.stdout.write(`stamped ${entries.length} file sizes in ${dataPath}\n`);
