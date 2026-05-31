// Throwaway a11y/UX audit. Serves dist/ in-process (same static-server pattern
// as shoot.mjs) and drives the HashRouter, checking every route at desktop and
// mobile. Emits JSON findings to stdout. Review-only: writes nothing to source.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, "..", "dist");

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".csv": "text/csv", ".pdf": "application/pdf", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };

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
const base = `http://localhost:${port}`;

const ROUTES = ["/", "/schedule", "/leaderboard", "/teams", "/achievements", "/files", "/admin", "/deck"];
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const out = { perRoute: {}, fontReqAborted: false };

const browser = await chromium.launch({ args: ["--no-sandbox"] });

// A page is the NotFound page if it renders the 404 eyebrow + title.
const isNotFound = async (page) =>
  page.evaluate(() => {
    const h1 = document.querySelector("main h1");
    const eyebrow = document.querySelector(".page-eyebrow");
    return !!(h1 && /not found/i.test(h1.textContent) && eyebrow && eyebrow.textContent.trim() === "404");
  });

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  // Mirror shoot.mjs: abort Google Fonts; record that it happened.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => { out.fontReqAborted = true; r.abort(); });

  for (const route of ROUTES) {
    const key = `${route} [${vp.name}]`;
    const rec = { consoleErrors: [], pageErrors: [], info: {} };
    const page = await ctx.newPage();
    page.on("pageerror", (e) => rec.pageErrors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") rec.consoleErrors.push(m.text()); });
    page.on("requestfailed", (r) => {
      const u = r.url();
      if (!/fonts\.(googleapis|gstatic)\.com/.test(u)) rec.consoleErrors.push("REQFAILED " + u + " :: " + (r.failure()?.errorText || ""));
    });

    await page.goto(`${base}/#${route}`, { waitUntil: "load" });
    await page.waitForTimeout(1200);

    // Heading structure.
    rec.info.headings = await page.evaluate(() => {
      const hs = [...document.querySelectorAll("main h1, main h2, main h3, main h4, main h5, main h6")];
      return hs.map((h) => ({ tag: h.tagName.toLowerCase(), text: (h.textContent || "").trim().slice(0, 60) }));
    });
    rec.info.h1Count = await page.evaluate(() => document.querySelectorAll("main h1").length);
    rec.info.h1AllCount = await page.evaluate(() => document.querySelectorAll("h1").length);

    // Landed on NotFound?
    rec.info.isNotFound = await isNotFound(page);

    // Interactive controls without discernible text/label.
    rec.info.namelessControls = await page.evaluate(() => {
      const acc = (el) => {
        const aria = el.getAttribute("aria-label");
        if (aria && aria.trim()) return aria.trim();
        const labelledby = el.getAttribute("aria-labelledby");
        if (labelledby) {
          const t = labelledby.split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ").trim();
          if (t) return t;
        }
        const title = el.getAttribute("title");
        if (title && title.trim()) return title.trim();
        const txt = (el.textContent || "").replace(/\s+/g, " ").trim();
        return txt;
      };
      const bad = [];
      for (const el of document.querySelectorAll("button, a[href], [role=button]")) {
        // Skip hidden.
        const r = el.getBoundingClientRect();
        const hidden = el.closest("[aria-hidden=true]");
        if (hidden) continue;
        const name = acc(el);
        if (!name) bad.push({ tag: el.tagName.toLowerCase(), cls: el.className, html: el.outerHTML.slice(0, 120), visible: r.width > 0 && r.height > 0 });
      }
      return bad;
    });

    // Non-button/non-anchor clickable elements (onClick on a div/span).
    rec.info.fakeControls = await page.evaluate(() => {
      // Heuristic: elements with cursor:pointer that are not real controls and not links/labels.
      const bad = [];
      for (const el of document.querySelectorAll("main *, nav *")) {
        if (["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA", "LABEL", "OPTION", "SVG", "PATH"].includes(el.tagName)) continue;
        const cs = getComputedStyle(el);
        if (cs.cursor === "pointer" && el.getAttribute("role") !== "button" && !el.closest("a,button")) {
          bad.push({ tag: el.tagName.toLowerCase(), cls: el.className, text: (el.textContent || "").trim().slice(0, 40) });
        }
      }
      return bad.slice(0, 10);
    });

    // Form controls without an associated label.
    rec.info.unlabeledInputs = await page.evaluate(() => {
      const bad = [];
      for (const el of document.querySelectorAll("input, select, textarea")) {
        if (el.type === "hidden") continue;
        const id = el.id;
        const hasFor = id && document.querySelector(`label[for="${CSS.escape(id)}"]`);
        const wrapped = el.closest("label");
        const aria = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
        if (!hasFor && !wrapped && !aria) bad.push({ tag: el.tagName.toLowerCase(), type: el.type, id, html: el.outerHTML.slice(0, 100) });
      }
      return bad;
    });

    // SVG accessibility: meaningful (no aria-hidden, no role/label) vs decorative.
    rec.info.svgs = await page.evaluate(() => {
      const list = [];
      for (const svg of document.querySelectorAll("svg")) {
        const hidden = svg.getAttribute("aria-hidden") === "true" || !!svg.closest("[aria-hidden=true]");
        const labeled = !!(svg.getAttribute("aria-label") || svg.getAttribute("role") === "img" || svg.querySelector("title"));
        const r = svg.getBoundingClientRect();
        list.push({ hidden, labeled, w: Math.round(r.width), h: Math.round(r.height), cls: svg.getAttribute("class") || "" });
      }
      const total = list.length;
      const notHiddenNotLabeled = list.filter((s) => !s.hidden && !s.labeled);
      return { total, notHiddenNotLabeled };
    });

    // Horizontal overflow.
    rec.info.overflow = await page.evaluate(() => {
      const de = document.documentElement;
      const scrollW = de.scrollWidth;
      const clientW = de.clientWidth;
      const offenders = [];
      if (scrollW > clientW + 1) {
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.right > clientW + 1 && r.width > 0 && r.width <= scrollW) {
            offenders.push({ tag: el.tagName.toLowerCase(), cls: (el.className || "").toString().slice(0, 40), right: Math.round(r.right), w: Math.round(r.width) });
          }
        }
      }
      return { scrollW, clientW, overflow: scrollW - clientW, offenders: offenders.slice(0, 8) };
    });

    // Nav: visible link count (desktop should be > 1).
    rec.info.navVisibleLinks = await page.evaluate(() => {
      const links = [...document.querySelectorAll(".nav-links a")];
      return links.filter((a) => { const r = a.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map((a) => a.textContent.trim());
    });

    rec.consoleErrorsDeduped = [...new Set(rec.consoleErrors)];
    out.perRoute[key] = rec;
    await page.close();
  }
  await ctx.close();
}

// --- Files download links: fetch each href, expect 200 ---
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/#/files`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("a.btn[download], a[download]")].map((a) => ({ href: a.getAttribute("href"), abs: a.href, label: a.getAttribute("aria-label") || a.textContent.trim() }))
  );
  out.fileLinks = [];
  for (const h of hrefs) {
    const resp = await page.request.get(h.abs);
    out.fileLinks.push({ href: h.href, status: resp.status(), ctype: resp.headers()["content-type"], label: h.label });
  }
  await ctx.close();
}

// --- Mobile MENU toggle reveals links ---
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/#/`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const before = await page.evaluate(() => [...document.querySelectorAll(".nav-links a")].filter((a) => a.getBoundingClientRect().width > 0).length);
  const toggle = await page.$(".nav-toggle");
  out.mobileMenu = { toggleExists: !!toggle, linksBefore: before };
  if (toggle) {
    out.mobileMenu.toggleText = (await toggle.textContent()).trim();
    out.mobileMenu.ariaExpandedBefore = await toggle.getAttribute("aria-expanded");
    await toggle.click();
    await page.waitForTimeout(300);
    out.mobileMenu.linksAfter = await page.evaluate(() => [...document.querySelectorAll(".nav-links a")].filter((a) => a.getBoundingClientRect().width > 0).length);
    out.mobileMenu.ariaExpandedAfter = await toggle.getAttribute("aria-expanded");
    out.mobileMenu.revealedLabels = await page.evaluate(() => [...document.querySelectorAll(".nav-links a")].filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.textContent.trim()));
  }
  await ctx.close();
}

// --- Nav link resolution: click each nav item, confirm not NotFound ---
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/#/`, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const labels = await page.evaluate(() => [...document.querySelectorAll(".nav-links a")].map((a) => a.textContent.trim()));
  out.navResolution = [];
  for (const label of labels) {
    await page.evaluate((lbl) => {
      const a = [...document.querySelectorAll(".nav-links a")].find((x) => x.textContent.trim() === lbl);
      if (a) a.click();
    }, label);
    await page.waitForTimeout(500);
    const nf = await isNotFound(page);
    const hash = await page.evaluate(() => location.hash);
    out.navResolution.push({ label, hash, isNotFound: nf });
  }
  await ctx.close();
}

await browser.close();
server.close();
console.log(JSON.stringify(out, null, 2));
