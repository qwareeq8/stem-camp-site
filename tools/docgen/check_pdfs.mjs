// Verify the generated PDFs against the extracted IR.
// Three gates per document:
//   1. fidelity: every IR text fragment appears in the PDF text,
//   2. orphan headings: no page ends on a section heading or eyebrow,
//   3. kept tables: any table short enough to stay whole sits on one page.
// Uses pdftotext (poppler). Exits nonzero when any gate fails.
//
//   node tools/docgen/check_pdfs.mjs            # all documents
//   node tools/docgen/check_pdfs.mjs TTT-01     # only matching slugs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DOCS, IR_DIR, PDF_DIR } from "./manifest.mjs";

// Squash text to a comparable form: lowercase alphanumerics only. This rides
// over ligatures, soft hyphens, currency formatting, and line wrapping.
const squash = (s) =>
  s
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const FILL_RE = /_{2,}/g;

// Workbook dashboard scaffolding that the print layout intentionally
// restructures into the document header and stat cards.
const MAT_HEADERS = ["Camp", "Activity ID", "Activity title", "Category", "Item name"];
const DROPPED_CELLS = new Set([
  "2026 STEM Camps Procurement Dashboard",
  "Last checked date",
  "Workbook note",
  "Metric",
  "Formula/Value",
  "Procurement priorities",
]);

function irFragments(ir) {
  const frags = [];
  const headings = [];
  const tables = [];
  const walk = (blocks) => {
    for (const b of blocks) {
      if (b.kind === "table") {
        const rowKeys = [];
        for (const row of b.rows) {
          for (const cell of row.cells) walk(cell.blocks);
          const first = cell0Text(row);
          if (first) rowKeys.push(first);
        }
        tables.push({ nrows: b.rows.length, rowKeys });
        continue;
      }
      if (b.kind === "sheet") {
        // Materials sheets render as item cards with their own field labels,
        // so their spreadsheet header row does not appear verbatim.
        const isMaterials = MAT_HEADERS.every((h, i) => (b.rows[0] || [])[i] === h);
        for (const [ri, row] of b.rows.entries()) {
          if (isMaterials && ri === 0) continue;
          for (const v of row) {
            if (v && !DROPPED_CELLS.has(v)) frags.push(v);
          }
        }
        continue;
      }
      if (!b.runs) continue;
      // Ordered steps render their literal "1 " prefix run as a CSS counter;
      // compare on the content runs only, mirroring the renderer.
      const isStep =
        b.runs[0] && /^\d+\s*$/.test(b.runs[0].t.trim()) && (b.hanging || 0) >= 300;
      const text = (isStep ? b.runs.slice(1) : b.runs)
        .map((r) => r.t)
        .join("")
        .replace(FILL_RE, " ")
        .replace(/^\s*[•□]\s*/, "")
        .trim();
      if (text) frags.push(text);
      const s = b.runs[0] ? b.runs[0].sz : 0;
      if (s === 21 || s === 18 || (s === 22 && b.runs[0].b) || /^Phase\s+\d/.test(b.runs[0] ? b.runs[0].t : "")) {
        headings.push(text);
      }
    }
  };
  const cell0Text = (row) =>
    row.cells[0]
      ? row.cells[0].blocks
          .map((c) => (c.runs || []).map((r) => r.t).join(""))
          .join(" ")
          .trim()
      : "";
  walk(ir.blocks);
  return { frags, headings, tables };
}

// Layout mode preserves the visual line structure (for last-line heading
// checks); reading order keeps each table cell contiguous (for fidelity).
function pdfPages(pdfPath, mode) {
  const args = mode === "layout" ? ["-layout", pdfPath, "-"] : ["-raw", pdfPath, "-"];
  const raw = execFileSync("pdftotext", args, { maxBuffer: 64e6 }).toString();
  return raw.split("\f").filter((p) => p.trim());
}

function main() {
  const filter = process.argv[2];
  let failures = 0;
  let checked = 0;
  for (const doc of DOCS) {
    if (filter && !doc.slug.includes(filter) && !doc.id.includes(filter)) continue;
    const ir = JSON.parse(fs.readFileSync(path.join(IR_DIR, `${doc.slug}.json`), "utf8"));
    const pdfPath = path.join(PDF_DIR, doc.out);
    const pages = pdfPages(pdfPath, "layout");
    const readingPages = pdfPages(pdfPath, "reading");
    const pagesSquashed = readingPages.map(squash);
    const all = pagesSquashed.join("");
    const { frags, headings, tables } = irFragments(ir);
    const problems = [];

    for (const f of frags) {
      const key = squash(f);
      if (key && !all.includes(key)) problems.push(`missing text: ${f.slice(0, 80)}`);
    }

    const headKeys = new Set(headings.map(squash).filter(Boolean));
    for (const [i, page] of pages.entries()) {
      const lines = page.split("\n").map((l) => l.trim()).filter(Boolean);
      // The printed footer is not part of pdftotext body output (it is, last
      // lines include "Page N of M"); drop trailing footer lines first.
      let last = lines.length - 1;
      while (last >= 0 && /Page \d+ of \d+|\|/.test(lines[last])) last--;
      if (last >= 0 && headKeys.has(squash(lines[last]))) {
        problems.push(`page ${i + 1} ends with heading: ${lines[last].slice(0, 60)}`);
      }
    }

    for (const t of tables) {
      if (t.nrows > 12 || t.rowKeys.length < 2) continue;
      const keys = [...new Set(t.rowKeys.map(squash))].filter((k) => k.length > 3);
      if (!keys.length) continue;
      const wholePage = pagesSquashed.some((p) => keys.every((k) => p.includes(k)));
      if (!wholePage) problems.push(`kept table split across pages (first row: ${t.rowKeys[0].slice(0, 50)})`);
    }

    checked++;
    if (problems.length) {
      failures++;
      process.stdout.write(`FAIL ${doc.out}\n`);
      for (const p of problems.slice(0, 8)) process.stdout.write(`   - ${p}\n`);
      if (problems.length > 8) process.stdout.write(`   ... ${problems.length - 8} more\n`);
    }
  }
  process.stdout.write(`checked ${checked} documents, ${failures} with findings\n`);
  process.exit(failures ? 1 : 0);
}

main();
