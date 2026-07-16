// Build repo-native program addenda that document live-event decisions without
// rewriting the read-only reviewed source kit.
//
//   node tools/docgen/build_addenda.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..");
const filename = "2026_Live_Scoring_Addendum.pdf";
const buildOutput = path.join(repo, "tools", "out", "docgen", "pdf", filename);
const publicOutput = path.join(repo, "public", "files", filename);

const reviewedPolicy = "Each primary activity is scored out of 100; the best 9 of 12 primary scores count.";
const livePolicy = "Ordinary entered scores are 0 to 100; the lowest floor(n / 4) non-CRANK entries are canceled.";
const crankMaximum = 3 * 5 * 10 * 2;
if (crankMaximum !== 300) throw new Error("CRANK scoring math drifted from the 300-point live rule.");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><style>
  @page { size: Letter; margin: 0.58in 0.64in 0.62in; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #222; font-family: Arial, sans-serif; font-size: 10.3pt; line-height: 1.38; }
  .rule { height: 8px; background: #9d2235; margin: 0 0 0.18in; }
  .eyebrow { color: #9d2235; font: 700 8.5pt ui-monospace, monospace; letter-spacing: .12em; text-transform: uppercase; }
  h1 { margin: 7px 0 4px; font-family: Georgia, serif; font-size: 27pt; line-height: 1.05; }
  .sub { color: #5a564f; margin: 0 0 14px; }
  .provenance { border: 1px solid #b8afa1; background: #faf7f0; padding: 10px 12px; margin-bottom: 12px; }
  h2 { margin: 12px 0 5px; color: #6f1f2f; font: 700 11pt ui-monospace, monospace; letter-spacing: .04em; text-transform: uppercase; }
  ul { margin: 5px 0 8px 20px; padding: 0; }
  li { margin: 3px 0; }
  .policy { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .card { border: 1px solid #c8c0b4; border-radius: 5px; padding: 9px 10px; }
  .card strong { display: block; margin-bottom: 4px; color: #222; }
  .math { font-family: ui-monospace, monospace; background: #f2eee5; padding: 7px 9px; margin: 6px 0; }
  footer { margin-top: 9px; border-top: 1px solid #c8c0b4; padding-top: 5px; color: #5a564f; font: 7pt ui-monospace, monospace; display: flex; justify-content: space-between; }
</style></head><body>
  <div class="rule"></div>
  <div class="eyebrow">2026 STEM Camps | Operations record</div>
  <h1>Live Scoring Addendum</h1>
  <p class="sub">The reviewed curriculum policy and the scoring override used during the 2026 live event are different provenance layers.</p>

  <div class="provenance">
    <strong>Do not silently combine these policies.</strong> The original reviewed kit remains the source for the planned curriculum. This addendum records later live-event decisions preserved by the historical website and leaderboard.
  </div>

  <div class="policy">
    <div class="card">
      <strong>Original reviewed kit</strong>
      ${reviewedPolicy}
    </div>
    <div class="card">
      <strong>2026 live-event override</strong>
      ${livePolicy} CRANK always counts separately.
    </div>
  </div>

  <h2>Live calculation</h2>
  <ul>
    <li>Validate every ordinary station entry from 0 through 100 points.</li>
    <li>For each team, set aside CRANK. Sort all other entered scores and cancel the lowest <strong>floor(n / 4)</strong>.</li>
    <li>Count CRANK in full. It is never eligible for cancellation.</li>
    <li>Tickets are a separate participation currency and never change leaderboard points.</li>
  </ul>

  <h2>CRANK Championship</h2>
  <p>Three judges score five categories from 0 through 10: motion, reliability, engineering, aesthetics, and pitch. Double the card total.</p>
  <div class="math">3 judges x 5 categories x 10 points x 2 = ${crankMaximum} points maximum</div>

  <h2>Live additions and repeated activities</h2>
  <p>The operational schedule uses distinct score keys where needed: PYS-00 is the scored Card Tower Kickoff; PYS-02R is the Oobleck rematch while its resource code remains PYS-02; CRANK is the championship; and PYB-05 is the live-added Code Break Cipher Relay. An entry affects standings only when a team score is actually recorded.</p>

  <h2>Operator rule</h2>
  <p>Choose the reviewed-kit policy or the 2026 live policy before calculating a leaderboard. The website's Admin console and historical standings use the live policy above. Use the original score sheets only for the reviewed best-9-of-12 format.</p>

  <footer><span>Published July 15, 2026 | No participant data</span><span>campnotebook.org</span></footer>
</body></html>`;

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
fs.mkdirSync(path.dirname(buildOutput), { recursive: true });
await page.pdf({ path: buildOutput, format: "Letter", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
fs.copyFileSync(buildOutput, publicOutput);

process.stdout.write(`wrote ${buildOutput} and ${publicOutput} (${fs.statSync(publicOutput).size} bytes)\n`);
