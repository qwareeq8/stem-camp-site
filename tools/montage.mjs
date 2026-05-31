// Browser smoke of the modular deck audit page: render all 64, assert no
// render-error nodes and capture console errors plus a full-page screenshot.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 20000 } });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
await page.goto("file://" + path.join(here, "audit.html"), { waitUntil: "load" });
await page.waitForTimeout(2500);
const count = await page.locator("[data-comp]").count();
const renderErr = await page.evaluate(
  () => Array.from(document.querySelectorAll("*")).filter((n) => n.children.length === 0 && /RENDER ERROR/.test(n.textContent || "")).length
);
await page.screenshot({ path: path.join(here, "out", "modular_audit.png"), fullPage: true });
console.log("data-comp cells: " + count + ", render-error nodes: " + renderErr + ", console errors: " + errs.length);
for (const e of errs.slice(0, 15)) console.log("  - " + e);
await b.close();
process.exit(count === 64 && renderErr === 0 ? 0 : 1);
