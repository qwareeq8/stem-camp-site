// Document manifest for the print pipeline: one entry per generated PDF.
// Maps each library entry in src/data/files.json to its source document in the
// consolidated archive and to the print template that renders it.
//
// Spreadsheet sources (xlsx, csv) are converted to normal PDF documents; the
// library serves only PDFs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const repo = path.resolve(here, "..", "..");
export const ARCHIVE = "/data/projects/10_Final_Reviewed_PY_STEM";
export const IR_DIR = path.join(repo, "tools", "out", "docgen", "ir");
export const HTML_DIR = path.join(repo, "tools", "out", "docgen", "html");
export const PDF_DIR = path.join(repo, "tools", "out", "docgen", "pdf");

const files = JSON.parse(fs.readFileSync(path.join(repo, "src", "data", "files.json"), "utf8"));

// Resolve the archive-relative source document for a library entry.
function sourceFor(entry) {
  const base = path.basename(entry.path).replace(/\.pdf$/, "");
  const code = entry.code || "";
  const camp = entry.camp;
  if (entry.category === "Activity") {
    const campDir = camp === "trees" ? "02_From_Trees_to_Tech" : "03_PY_STEM";
    const backup = code.startsWith("TTB") || code.startsWith("PYB");
    if (backup) {
      const dir = camp === "trees" ? "07_Backup_Activities/From_Trees_to_Tech" : "07_Backup_Activities/PY_STEM";
      return `${dir}/${base}.docx`;
    }
    const sub = entry.kind === "handout" ? "Student_Handouts" : "Instructor_Guides";
    return `${campDir}/${sub}/Individual_PDFs/${base}.docx`;
  }
  if (entry.category === "Packet" || entry.category === "Scoring" || entry.category === "Signage") {
    const campDir = camp === "trees" ? "02_From_Trees_to_Tech" : "03_PY_STEM";
    const sub = { Packet: entry.id.endsWith("handout") ? "Student_Handouts" : "Instructor_Guides",
                  Scoring: "Score_Sheets", Signage: "Station_Signs" }[entry.category];
    return `${campDir}/${sub}/${base}.docx`;
  }
  const program = {
    "doc-master": "01_Master_Guides/2026_STEM_Camps_Master_Curriculum_and_Operations_Guide.docx",
    "doc-rewards": "05_Rewards_and_Competition/Printable_Reward_and_Competition_Kit.docx",
    "doc-safety": "06_Safety_and_Setup/Staff_Setup_Prep_and_Safety_Checklist.docx",
    "doc-procurement": "04_Shopping_and_Budget/2026_STEM_Camps_Amazon_Procurement_Workbook.xlsx",
    "doc-buylist": "PUBLIC_CSV", // vendored at public/files/buy_list.csv
  };
  return program[entry.id];
}

function templateFor(entry) {
  if (entry.category === "Activity") return entry.kind === "handout" ? "handout" : "guide";
  if (entry.category === "Packet") return entry.id.endsWith("handout") ? "handout-packet" : "guide-packet";
  if (entry.category === "Scoring") return "scores";
  if (entry.category === "Signage") return "signs";
  return { "doc-master": "master", "doc-rewards": "rewards", "doc-safety": "safety",
           "doc-procurement": "workbook", "doc-buylist": "buylist" }[entry.id];
}

export const DOCS = files.map((entry) => {
  const src = sourceFor(entry);
  const isSheet = entry.id === "doc-procurement" || entry.id === "doc-buylist";
  const outName = entry.id === "doc-procurement"
    ? "2026_STEM_Camps_Amazon_Procurement_Workbook.pdf"
    : entry.id === "doc-buylist"
      ? "Materials_Buy_List.pdf"
      : path.basename(entry.path);
  return {
    id: entry.id,
    name: entry.name,
    desc: entry.desc,
    camp: entry.camp,
    code: entry.code,
    category: entry.category,
    kind: entry.kind,
    template: templateFor(entry),
    source: src === "PUBLIC_CSV" ? path.join(repo, "public", "files", "buy_list.csv") : path.join(ARCHIVE, src),
    isSheet,
    out: outName,
    slug: outName.replace(/\.pdf$/, ""),
  };
});
