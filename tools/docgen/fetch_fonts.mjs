// Download the site's three font families as TTF files for PDF generation.
// The Google Fonts css2 endpoint serves single-file TTFs to clients with no
// modern User-Agent, which is exactly what an embedded print stylesheet needs.
// Files land in tools/out/docgen/fonts/ (generated, not tracked).
//   node tools/docgen/fetch_fonts.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, "..", "out", "docgen", "fonts");
fs.mkdirSync(outDir, { recursive: true });

const WANTED = [
  { file: "Fraunces-400.ttf", css: "family=Fraunces:wght@400" },
  { file: "Fraunces-500.ttf", css: "family=Fraunces:wght@500" },
  { file: "Fraunces-600.ttf", css: "family=Fraunces:wght@600" },
  { file: "Fraunces-Italic-400.ttf", css: "family=Fraunces:ital,wght@1,400" },
  { file: "Inter-400.ttf", css: "family=Inter:wght@400" },
  { file: "Inter-500.ttf", css: "family=Inter:wght@500" },
  { file: "Inter-600.ttf", css: "family=Inter:wght@600" },
  { file: "Inter-700.ttf", css: "family=Inter:wght@700" },
  { file: "JetBrainsMono-400.ttf", css: "family=JetBrains+Mono:wght@400" },
  { file: "JetBrainsMono-500.ttf", css: "family=JetBrains+Mono:wght@500" },
  { file: "JetBrainsMono-700.ttf", css: "family=JetBrains+Mono:wght@700" },
];

async function fetchOne({ file, css }) {
  const dest = path.join(outDir, file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) return `kept ${file}`;
  const cssRes = await fetch(`https://fonts.googleapis.com/css2?${css}&display=swap`, {
    headers: { "User-Agent": "curl/8" },
  });
  if (!cssRes.ok) throw new Error(`css ${cssRes.status} for ${css}`);
  const text = await cssRes.text();
  const m = text.match(/url\((https:[^)]+\.ttf)\)/);
  if (!m) throw new Error(`no ttf url in css for ${css}`);
  const fontRes = await fetch(m[1]);
  if (!fontRes.ok) throw new Error(`font ${fontRes.status} for ${file}`);
  fs.writeFileSync(dest, Buffer.from(await fontRes.arrayBuffer()));
  return `fetched ${file} (${Math.round(fs.statSync(dest).size / 1024)} KB)`;
}

for (const want of WANTED) {
  process.stdout.write((await fetchOne(want)) + "\n");
}
