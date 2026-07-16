// Generate the social preview card at public/og-card.png.
// Local brand fonts are embedded when the document pipeline has fetched them;
// system fallbacks keep the generator usable in a fresh checkout.
//
//   node tools/build_og_card.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
const fontsDir = path.join(repo, "tools", "out", "docgen", "fonts");
const logo = fs.readFileSync(path.join(repo, "public", "logo.svg"), "utf8");

function fontFace(family, weight, file) {
  const fontPath = path.join(fontsDir, file);
  if (!fs.existsSync(fontPath)) return "";
  const data = fs.readFileSync(fontPath).toString("base64");
  return `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;src:url(data:font/ttf;base64,${data}) format("truetype")}`;
}

const faces = [
  fontFace("Fraunces Local", 600, "Fraunces-600.ttf"),
  fontFace("Inter Local", 400, "Inter-400.ttf"),
  fontFace("Inter Local", 600, "Inter-600.ttf"),
  fontFace("JetBrains Mono Local", 500, "JetBrainsMono-500.ttf"),
].filter(Boolean).join("\n");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
${faces}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#fafaf8;color:#222;font-family:"Inter Local",Arial,sans-serif;overflow:hidden}
.card{height:630px;padding:60px 72px;position:relative}
.bar{position:absolute;top:0;left:0;right:0;height:14px;background:#9d2235}
.brandart{position:absolute;right:-70px;top:96px;width:520px;height:520px;opacity:.16}
.brandart svg{width:520px;height:520px;display:block}
.col{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;max-width:760px}
.eyebrow{font-family:"JetBrains Mono Local",monospace;font-weight:500;font-size:18px;letter-spacing:.18em;text-transform:uppercase;color:#9d2235}
h1{font-family:"Fraunces Local",Georgia,serif;font-weight:600;font-size:78px;line-height:1;letter-spacing:-.015em;color:#222;margin-top:18px}
.tag{font-size:24px;color:#5a564f;margin-top:16px;max-width:34ch}
.camps{margin-top:auto;display:flex;flex-direction:column;gap:13px}
.camp{display:flex;align-items:baseline;gap:13px;font-size:23px}
.dot{width:15px;height:15px;border-radius:50%;flex:none;position:relative;top:2px}
.cname{font-family:"Fraunces Local",Georgia,serif;font-weight:600;color:#222}
.cmeta{color:#5a564f;font-size:20px}
.foot{margin-top:24px;font-family:"JetBrains Mono Local",monospace;font-size:17px;letter-spacing:.04em;color:#5a564f}
</style></head><body><div class="card">
  <div class="bar"></div><div class="brandart">${logo}</div>
  <div class="col">
    <div class="eyebrow">2026 Summer STEM Camps</div>
    <h1>STEM Camp<br>Field Notebook</h1>
    <div class="tag">Two camps, one notebook. Build it, measure it, defend it with data.</div>
    <div class="camps">
      <div class="camp"><span class="dot" style="background:#2a5736"></span><span class="cname">From Trees to Tech</span><span class="cmeta">June 22 to 26 | Temple Ambler</span></div>
      <div class="camp"><span class="dot" style="background:#a85f12"></span><span class="cname">PY-STEM</span><span class="cmeta">July 6 to 10 | Main Campus</span></div>
    </div>
    <div class="foot">campnotebook.org</div>
  </div>
</div></body></html>`;

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const output = path.join(repo, "public", "og-card.png");
await page.screenshot({ path: output, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

process.stdout.write(`wrote ${output} (${fs.statSync(output).size} bytes, 2400x1260)\n`);
