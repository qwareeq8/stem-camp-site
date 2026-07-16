// Screenshot built site routes. Serves dist/ from an in-process static server
// (Vite emits type=module scripts that Chromium blocks over file://), then
// drives the hash router. Usage: node tools/shoot.mjs /  /schedule  /deck ...
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "..", "dist");
const routes = process.argv.slice(2);
if (!routes.length) routes.push("/");

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".csv": "text/csv", ".pdf": "application/pdf", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
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
const base = `http://localhost:${port}`;

const MOBILE = !!process.env.MOBILE;
const vp = MOBILE ? { width: 390, height: 844 } : { width: 1280, height: 900 };
const SUFFIX = MOBILE ? "_m" : "";
const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
// Use local fallbacks during deterministic screenshots without emitting a
// synthetic Chromium console error for an intentionally aborted stylesheet.
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
  route.fulfill({ status: 200, contentType: "text/css", body: "" }));

// SAMPLE=1 injects the demo data set as a local overlay before each page loads,
// so the screenshots show a populated site (the shipped seed is intentionally
// empty). Mirrors the admin console's "Load sample data" button.
if (process.env.SAMPLE) {
  const { SAMPLE_DATA } = await import("../src/site/lib/sampleData.js");
  await ctx.addInitScript((data) => {
    for (const [name, value] of Object.entries(data)) {
      localStorage.setItem("stemcamp:" + name, JSON.stringify(value));
    }
  }, SAMPLE_DATA);
}
let bad = 0;
for (const route of routes) {
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(`${base}/#${route}`, { waitUntil: "load" });
  await page.waitForTimeout(1400);
  const name = route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "");
  const full = route !== "/deck";
  await page.screenshot({ path: path.join(here, "out", `site_${name}${SUFFIX}.png`), fullPage: full });
  const perr = errs.filter((e) => e.startsWith("PAGEERROR"));
  if (perr.length) bad += 1;
  console.log(`${route}: bytes=${fs.statSync(path.join(here, "out", `site_${name}${SUFFIX}.png`)).size} pageerrors=${perr.length} consoleErrors=${errs.length}` + (perr.length ? " :: " + perr.join(" | ") : ""));
  await page.close();
}
await b.close();
server.close();
console.log("done");
process.exit(bad ? 1 : 0);
