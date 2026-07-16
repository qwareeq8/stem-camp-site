// Generate print-ready From Trees to Tech station printables into the
// doc-library PDF build dir (tools/out/docgen/pdf), using the site
// field-notebook print theme and brand fonts, rendered with the same headless
// Chromium the document library uses. Trees palette (forest ink #2a5736, rust
// accent #b04a2f). Measurement scales stay pure black so every sheet survives
// grayscale printing.
//
// The sheet bodies are the shared builders in team_tools.mjs, so these
// standalone printables are the single shipped form of every Trees game piece
// and data sheet; guides and packets embed none of them. The staff-only
// From_Trees_to_Tech_Instructor_Answer_Keys sheet is built here too but is
// never copied to public/files nor listed in src/data/files.json.
//
//   node tools/docgen/build_trees.mjs            # all sheets
//   node tools/docgen/build_trees.mjs quest      # only matching slugs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  voltageLogAppendix,
  teamToolsAppendix,
  standoffAppendix,
  seedDerbyAppendix,
  greenhouseControllerAppendix,
  pollinatorNetworkAppendix,
  arboretumQuestAppendix,
  arboretumQuestAnswerKey,
  resilienceGridAppendix,
  treeRingAppendix,
  treeRingAnswerKey,
  stomataCountAppendix,
  clinometerTanAppendix,
  urbanHeatRouteMapAppendix,
  floatOffDataAppendix,
} from "./team_tools.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..");
const PDF_DIR = path.join(repo, "tools", "out", "docgen", "pdf");
const fontsDir = path.join(repo, "tools", "out", "docgen", "fonts");
const outDir = PDF_DIR;

const FACES = [
  ["Fraunces", 400, "normal", "Fraunces-400.ttf"],
  ["Fraunces", 500, "normal", "Fraunces-500.ttf"],
  ["Fraunces", 600, "normal", "Fraunces-600.ttf"],
  ["Fraunces", 400, "italic", "Fraunces-Italic-400.ttf"],
  ["Inter", 400, "normal", "Inter-400.ttf"],
  ["Inter", 500, "normal", "Inter-500.ttf"],
  ["Inter", 600, "normal", "Inter-600.ttf"],
  ["Inter", 700, "normal", "Inter-700.ttf"],
  ["JetBrains Mono", 400, "normal", "JetBrainsMono-400.ttf"],
  ["JetBrains Mono", 700, "normal", "JetBrainsMono-700.ttf"],
].map(([fam, w, s, file]) => {
  const p = path.join(fontsDir, file);
  if (!fs.existsSync(p)) return "";
  const b64 = fs.readFileSync(p).toString("base64");
  return `@font-face{font-family:'${fam}';font-weight:${w};font-style:${s};src:url(data:font/ttf;base64,${b64}) format('truetype');font-display:swap;}`;
}).join("\n");

const themeCss = fs.readFileSync(path.join(repo, "tools", "docgen", "theme.css"), "utf8");

const PALETTE = `
body { --camp-ink:#2a5736; --camp-acc:#b04a2f; --camp-tint:#F1F0EC; --ink:#222; --ink2:#5A564F; --rule2:#cfcabf; background:#fff; }
.sheet { padding: 0; }
.sheet-eyebrow { font-family: var(--mono); font-size: 8pt; letter-spacing: .1em; text-transform: uppercase; color: var(--camp-acc); }
.sheet-title { font-family: var(--serif); font-weight: 600; font-size: 19pt; color: var(--camp-ink); margin-top: 2pt; }
.sheet-head { border-bottom: 1.6pt solid var(--camp-acc); padding-bottom: 5pt; margin-bottom: 9pt; }
.note { font-size: 9pt; color: var(--ink2); margin: 0 0 7pt; }
.pagebreak { break-before: page; }
`;

function docHtml(bodyHtml, landscape = false) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${FACES}
${themeCss}
${PALETTE}
${landscape ? "@page { size: letter landscape; }" : ""}
</style></head><body>${bodyHtml}</body></html>`;
}

const wrap = (fn) => () => `<div class="sheet">${fn()}</div>`;

// Staff-only compilation of the Trees instructor answer keys. The TTT-10 key
// documents the authored practice-card model and its real-evidence limits.
// This file stays out of public/files and files.json.
function answerKeys() {
  return [arboretumQuestAnswerKey(), treeRingAnswerKey()].join(
    `<div style="break-before:page"></div>`,
  );
}

const SHEETS = [
  { slug: "TTT_01_Daily_Voltage_Log", body: wrap(voltageLogAppendix) },
  { slug: "TTT_02_Paper_Clinometer_and_Route_Cards", body: wrap(teamToolsAppendix) },
  { slug: "TTT_02_Standoff_Floor_Marker", body: wrap(standoffAppendix) },
  { slug: "TTT_03_Drop_Lane_Strip_and_Landing_Target", body: wrap(seedDerbyAppendix) },
  { slug: "TTT_05_Greenhouse_Matching_Game_Sheets", body: wrap(greenhouseControllerAppendix) },
  { slug: "TTT_07_Pollinator_Cards_and_Bloom_Board", body: wrap(pollinatorNetworkAppendix) },
  { slug: "TTT_08_Eco_Quest_Pack", body: wrap(arboretumQuestAppendix) },
  { slug: "TTT_09_Paper_Grid_Fallback_Kit", body: wrap(resilienceGridAppendix) },
  { slug: "TTT_10_Tree_Ring_Cards_and_Boards", body: wrap(treeRingAppendix) },
  { slug: "TTT_12_Stomata_Counting_Sheet", body: wrap(stomataCountAppendix) },
  { slug: "TTB_02_Paper_Clinometer_and_Tan_Table", body: wrap(clinometerTanAppendix) },
  { slug: "TTB_03_Urban_Heat_Route_Map_and_Field_Log", body: wrap(urbanHeatRouteMapAppendix), landscape: true },
  { slug: "TTB_04_Floating_Disk_Data_Table", body: wrap(floatOffDataAppendix) },
  { slug: "From_Trees_to_Tech_Instructor_Answer_Keys", body: wrap(answerKeys) },
];

async function main() {
  const filter = process.argv[2];
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const report = [];
  for (const sheet of SHEETS) {
    if (filter && !sheet.slug.toLowerCase().includes(filter.toLowerCase())) continue;
    await page.setContent(docHtml(sheet.body(), !!sheet.landscape), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const outPath = path.join(outDir, `${sheet.slug}.pdf`);
    await page.pdf({ path: outPath, format: "Letter", printBackground: true, landscape: !!sheet.landscape,
      margin: { top: "0.55in", bottom: "0.55in", left: "0.65in", right: "0.65in" } });
    report.push(`${sheet.slug}.pdf  ${Math.round(fs.statSync(outPath).size / 1024)} KB`);
  }
  await browser.close();
  process.stdout.write(report.join("\n") + `\n${report.length} PDFs written to ${outDir}\n`);
}
await main();
