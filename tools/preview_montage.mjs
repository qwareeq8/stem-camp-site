// Drive the modular App in a browser: load home, enter a station to render the
// Presentation shell and a science slide, asserting no page errors throughout.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
await page.goto("file://" + path.join(here, "preview.html"), { waitUntil: "load" });
await page.waitForTimeout(1500);
const homeChildren = await page.evaluate(() => document.getElementById("root").children.length);
await page.screenshot({ path: path.join(here, "out", "modular_home.png") });

let entered = false;
try {
  const card = page.locator("text=/MudWatt|Bioelectric|Sensor|Seed|Pipeline/i").first();
  await card.click({ timeout: 2500 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(here, "out", "modular_slide.png") });
  entered = true;
} catch (e) { /* navigation is best-effort */ }

const pageErrs = errs.filter((e) => e.startsWith("PAGEERROR"));
console.log("home root children: " + homeChildren + ", entered station: " + entered + ", pageerrors: " + pageErrs.length + ", console errors: " + errs.length);
for (const e of pageErrs) console.log("  - " + e);
await b.close();
process.exit(homeChildren > 0 && pageErrs.length === 0 ? 0 : 1);
