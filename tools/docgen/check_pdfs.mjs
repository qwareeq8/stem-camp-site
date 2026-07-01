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
  const writeLabels = new Set();
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
        // Materials sheets render as ledger entries with their own field
        // labels, so their spreadsheet header row does not appear verbatim,
        // and the Amazon URL column (11) prints as its search terms.
        const isMaterials = MAT_HEADERS.every((h, i) => (b.rows[0] || [])[i] === h);
        for (const [ri, row] of b.rows.entries()) {
          if (isMaterials && ri === 0) continue;
          for (const [ci, v] of row.entries()) {
            if (isMaterials && ci === 11) continue;
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
      const raw = (isStep ? b.runs.slice(1) : b.runs).map((r) => r.t).join("");
      const text = raw.replace(FILL_RE, " ").replace(/^\s*[•□]\s*/, "").trim();
      if (text) frags.push(text);
      // A write-in row prints its label text beside a ruled fill that
      // extracts as nothing, so each printed label line is a legitimate
      // last-line-of-page; remember them for the dangling-label check.
      if (FILL_RE.test(raw)) {
        for (const line of text.split("\n")) {
          if (line.trim()) writeLabels.add(squash(line));
        }
      }
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
  return { frags, headings, tables, writeLabels };
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
    // Static printables are drawn straight to PDF and have no extracted IR.
    if (doc.isStatic) continue;
    const ir = JSON.parse(fs.readFileSync(path.join(IR_DIR, `${doc.slug}.json`), "utf8"));
    const pdfPath = path.join(PDF_DIR, doc.out);
    const pages = pdfPages(pdfPath, "layout");
    const readingPages = pdfPages(pdfPath, "reading");
    const pagesSquashed = readingPages.map(squash);
    const all = pagesSquashed.join("");
    const { frags, headings, tables, writeLabels } = irFragments(ir);
    const problems = [];

    for (const f of frags) {
      const key = squash(f);
      if (key && !all.includes(key)) problems.push(`missing text: ${f.slice(0, 80)}`);
    }

    const headKeys = new Set(headings.map(squash).filter(Boolean));
    // Content lines per page, with the printed footer ("... | ... Page N of
    // M") dropped from the tail.
    const contentByPage = pages.map((page) => {
      const lines = page.split("\n").map((l) => l.trim()).filter(Boolean);
      let last = lines.length - 1;
      while (last >= 0 && /Page \d+ of \d+|\|/.test(lines[last])) last--;
      return lines.slice(0, last + 1);
    });
    const BULLET = /^▪/;
    const STEP = /^\d{2}\s/;
    for (const [i, content] of contentByPage.entries()) {
      if (content.length > 0 && headKeys.has(squash(content[content.length - 1]))) {
        problems.push(`page ${i + 1} ends with heading: ${content[content.length - 1].slice(0, 60)}`);
      }
      // A page whose body is one or two lines is an orphan unless it is a
      // divider page, which opens with a short all-uppercase display line.
      const isDivider = content.length > 0 && content[0] === content[0].toUpperCase() && content[0].length < 40;
      if (content.length > 0 && content.length <= 2 && !isDivider) {
        problems.push(`page ${i + 1} is nearly blank: ${content.join(" / ").slice(0, 70)}`);
      }
      // A short label ending in a colon at the very bottom of a page sits
      // stranded from the list or table it introduces. Write-in labels are
      // exempt: their ruled fill prints no text but sits on the same line.
      const lastLine = content[content.length - 1] || "";
      if (
        /:\s*$/.test(lastLine) && lastLine.length < 45 && !lastLine.includes("_") &&
        !writeLabels.has(squash(lastLine))
      ) {
        problems.push(`page ${i + 1} ends with a dangling label: ${lastLine.slice(0, 60)}`);
      }
      // A page must not open with the single last item of a list that runs
      // on from the previous page.
      const prev = i > 0 ? contentByPage[i - 1] : [];
      const prevLast = prev[prev.length - 1] || "";
      for (const marker of [BULLET, STEP]) {
        if (!marker.test(content[0] || "") || !marker.test(prevLast)) continue;
        const more = content.slice(1, 6).some((l) => marker.test(l));
        if (!more) problems.push(`page ${i + 1} starts with a stranded list item: ${content[0].slice(0, 60)}`);
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
