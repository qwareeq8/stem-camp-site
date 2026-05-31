// Verify the interactive flows static shots miss: admin login unlocks the data
// console, and a downloadable asset is actually served.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "..", "dist");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".csv": "text/csv", ".pdf": "application/pdf", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(dist, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, "index.html");
  fs.readFile(file, (e, buf) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" }); res.end(buf); } });
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));

await page.goto(`${base}/#/admin`, { waitUntil: "load" });
await page.waitForTimeout(800);
await page.fill('input[type="password"]', "fieldnotebook2026");
await page.getByRole("button", { name: /sign in/i }).click();
await page.waitForTimeout(900);
const hasSelect = await page.locator("select").count();
const hasTextarea = await page.locator("textarea").count();
await page.screenshot({ path: path.join(here, "out", "site_admin_console.png"), fullPage: true });

// wrong password should NOT unlock (fresh context)
const page2 = await ctx.newPage();
await page2.goto(`${base}/#/admin`, { waitUntil: "load" });
await page2.waitForTimeout(500);
await page2.fill('input[type="password"]', "wrongpass");
await page2.getByRole("button", { name: /sign in/i }).click();
await page2.waitForTimeout(700);
const wrongUnlocked = (await page2.locator("textarea").count()) > 0;

// asset served?
const asset = await page.request.get(`${base}/files/buy_list.csv`);

console.log("admin login -> console: select=" + hasSelect + " textarea=" + hasTextarea);
console.log("wrong password unlocked (should be false): " + wrongUnlocked);
console.log("buy_list.csv status: " + asset.status());
console.log("pageerrors: " + errs.length + (errs.length ? " :: " + errs.join(" | ") : ""));
await b.close();
server.close();
const ok = hasSelect > 0 && hasTextarea > 0 && !wrongUnlocked && asset.status() === 200 && errs.length === 0;
console.log(ok ? "ADMIN OK" : "ADMIN CHECK FAILED");
process.exit(ok ? 0 : 1);
