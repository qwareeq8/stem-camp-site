// Capture the in-station deck slide view (route shots only show the deck landing).
// Serves dist/, opens /#/deck, clicks a station card, optionally advances slides,
// then screenshots. Usage: node tools/shoot_deck_slide.mjs
//   CARD=<n>   which station card to open (1-based, default 1)
//   STEPS=<n>  ArrowRight presses after opening (default 0 = title slide)
//   TAG=<name> output filename suffix (default "slide")
//   MOBILE=1   390px viewport
//   SCROLL=<px> scroll then capture a viewport shot (default 0 = full-page shot)
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "..", "dist");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".csv": "text/csv", ".pdf": "application/pdf" };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  let file = path.join(dist, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, "index.html");
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); res.end("404"); return; }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const MOBILE = !!process.env.MOBILE;
const CARD = Math.max(1, parseInt(process.env.CARD || "1", 10));
const STEPS = Math.max(0, parseInt(process.env.STEPS || "0", 10));
const TAG = process.env.TAG || "slide";
const SUFFIX = MOBILE ? "_m" : "";
const vp = MOBILE ? { width: 390, height: 844 } : { width: 1280, height: 900 };

const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

await page.goto(`http://localhost:${port}/#/deck`, { waitUntil: "load" });
await page.waitForTimeout(1200);
const cards = page.locator(".stemdeck button.card.ticks");
const n = await cards.count();
await cards.nth(Math.min(CARD - 1, n - 1)).click();
await page.waitForTimeout(700);
for (let i = 0; i < STEPS; i++) { await page.keyboard.press("ArrowRight"); await page.waitForTimeout(450); }
await page.waitForTimeout(600);

// SCROLL=<px> scrolls the page then captures a VIEWPORT (not full-page) shot, so
// sticky-vs-nav overlap is visible at that scroll position.
const SCROLL = parseInt(process.env.SCROLL || "0", 10);
const out = path.join(here, "out", `deck_${TAG}${SUFFIX}.png`);
if (SCROLL > 0) {
  await page.evaluate((y) => window.scrollTo(0, y), SCROLL);
  await page.waitForTimeout(500);
  await page.screenshot({ path: out, fullPage: false });
} else {
  await page.screenshot({ path: out, fullPage: true });
}
const perr = errs.filter((e) => e.startsWith("PAGEERROR"));
console.log(`deck_${TAG}${SUFFIX}: cards=${n} bytes=${fs.statSync(out).size} pageerrors=${perr.length} consoleErrors=${errs.length}` + (perr.length ? " :: " + perr.join(" | ") : ""));
await b.close();
server.close();
process.exit(perr.length ? 1 : 0);
