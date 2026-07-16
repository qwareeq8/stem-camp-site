// Bundle the admin-editor preview entry, render it headless, and report any
// runtime errors plus a screenshot. Verifies the form editors actually render
// (the production /admin route is auth-gated, so the build alone cannot reach
// the console). Usage: node tools/admin_preview.mjs
import { build } from "esbuild";
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "out");
fs.mkdirSync(outDir, { recursive: true });

const jsOut = path.join(outDir, "admin_preview_bundle.js");
await build({
  entryPoints: [path.join(here, "admin_preview_entry.jsx")],
  bundle: true,
  outfile: jsOut,
  absWorkingDir: here,
  format: "esm",
  jsx: "automatic",
  loader: { ".jsx": "jsx", ".js": "jsx", ".json": "json", ".css": "css" },
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.BASE_URL": '"./"',
  },
  logLevel: "warning",
});

const cssOut = path.join(outDir, "admin_preview_bundle.css");
const hasCss = fs.existsSync(cssOut);
const html = `<!doctype html><html><head><meta charset="utf-8">
${hasCss ? '<link rel="stylesheet" href="./admin_preview_bundle.css">' : ""}
</head><body><div id="root"></div><script type="module" src="./admin_preview_bundle.js"></script></body></html>`;
fs.writeFileSync(path.join(outDir, "admin_preview.html"), html);

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(outDir, rel === "/" ? "admin_preview.html" : rel);
  if (!fs.existsSync(file)) { res.writeHead(404); res.end("404"); return; }
  const ext = path.extname(file);
  const mime = ext === ".js" ? "text/javascript" : ext === ".css" ? "text/css" : "text/html";
  res.writeHead(200, { "content-type": mime });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage();
const errs = [];
const headRequests = [];
page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
page.on("console", (m) => { if (m.type() === "error") errs.push("CONSOLE " + m.text()); });
page.on("request", (request) => {
  if (request.method() === "HEAD") headRequests.push(request.url());
});
await page.goto(`http://localhost:${port}/`, { waitUntil: "load" });
await page.waitForTimeout(1200);

const crashes = await page.$$eval('[data-crash="1"]', (els) => els.map((e) => e.textContent));
const shot = path.join(outDir, "admin_preview.png");
await page.screenshot({ path: shot, fullPage: true });
// A readable top-of-page crop (Setup + start of Teams) for documentation.
await page.screenshot({ path: path.join(outDir, "admin_preview_hero.png"), clip: { x: 0, y: 0, width: 1280, height: 1150 } });
const pageErrs = errs.filter((e) => e.startsWith("PAGEERROR"));

console.log(`screenshot: ${shot} (${fs.statSync(shot).size} bytes)`);
console.log(`crash boundaries: ${crashes.length}`);
crashes.forEach((c) => console.log("  - " + c));
console.log(`pageerrors: ${pageErrs.length}`);
pageErrs.forEach((e) => console.log("  - " + e));
console.log(`console errors (non-font): ${errs.filter((e) => e.startsWith("CONSOLE") && !/fonts\./.test(e)).length}`);
console.log(`HEAD requests: ${headRequests.length}`);
errs.filter((e) => e.startsWith("CONSOLE")).forEach((e) => console.log("  · " + e.slice(0, 160)));

await b.close();
server.close();
process.exit(pageErrs.length === 0 && crashes.length === 0 && headRequests.length === 0 ? 0 : 1);
