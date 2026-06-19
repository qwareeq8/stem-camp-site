// Print the rendered HTML documents to PDF with headless Chromium.
// Reads tools/out/docgen/html/, writes tools/out/docgen/pdf/. Each page gets
// the document's footer line on the left and "Page N of M" on the right, set
// in a small mono face to match the site's metadata styling.
//
//   node tools/docgen/build_pdfs.mjs            # all documents
//   node tools/docgen/build_pdfs.mjs TTT-01     # only matching slugs
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { DOCS, HTML_DIR, PDF_DIR } from "./manifest.mjs";

const MARGIN = { top: "0.72in", bottom: "0.85in", left: "0.8in", right: "0.8in" };

function footerTemplate(text) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<div style="width:100%;margin:0 0.8in;padding-top:4px;border-top:1px solid rgba(34,34,34,.22);
font-family:monospace;font-size:6.6px;letter-spacing:.06em;color:#5A564F;
display:flex;justify-content:space-between;">
<span>${esc(text)}</span>
<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
</div>`;
}

async function main() {
  const filter = process.argv[2];
  fs.mkdirSync(PDF_DIR, { recursive: true });
  const meta = JSON.parse(fs.readFileSync(path.join(HTML_DIR, "meta.json"), "utf8"));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const report = [];
  for (const doc of DOCS) {
    if (filter && !doc.slug.includes(filter) && !doc.id.includes(filter)) continue;
    const htmlPath = path.join(HTML_DIR, `${doc.slug}.html`);
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => document.fonts.ready);
    const outPath = path.join(PDF_DIR, doc.out);
    // Posted or cut-apart documents (station signs, score slips, leaderboard) are
    // for display, so they render without the running footer and page numbers; read
    // documents (handouts, guides, packets, master, safety, rewards) keep it.
    const showFooter = doc.template !== "signs" && doc.template !== "scores";
    await page.pdf({
      path: outPath,
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: showFooter,
      headerTemplate: "<span></span>",
      footerTemplate: showFooter ? footerTemplate(meta[doc.slug].footer) : "<span></span>",
      margin: MARGIN,
    });
    const kb = Math.round(fs.statSync(outPath).size / 1024);
    report.push(`${doc.out}  ${kb} KB`);
  }
  await browser.close();
  process.stdout.write(report.join("\n") + `\n${report.length} PDFs written to ${PDF_DIR}\n`);
}

await main();
