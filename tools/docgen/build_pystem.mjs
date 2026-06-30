// Generate print-ready PY-STEM station printables and staff run-sheets into
// the doc-library PDF build dir (tools/out/docgen/pdf), using the site field-notebook print theme and brand fonts,
// rendered with the same headless Chromium the document library uses. PY-STEM
// palette (navy ink #1c3257, amber accent #A85F12). Measurement scales stay
// pure black so every sheet survives grayscale printing.
//
//   node tools/docgen/build_pystem.mjs            # all sheets
//   node tools/docgen/build_pystem.mjs maze       # only matching slugs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..");
const PDF_DIR = path.join(repo, "tools", "out", "docgen", "pdf");
const fontsDir = path.join(repo, "tools", "out", "docgen", "fonts");
const outDir = PDF_DIR;

const FACES = [
  ["Fraunces", 400, "normal", "Fraunces-400.ttf"],
  ["Fraunces", 500, "normal", "Fraunces-500.ttf"],
  ["Fraunces", 600, "normal", "Fraunces-600.ttf"],
  ["Fraunces", 400, "italic", "Fraunces-Italic-400.ttf"],
  ["Inter", 400, "normal", "Inter-400.ttf"],
  ["Inter", 500, "normal", "Inter-500.ttf"],
  ["Inter", 600, "normal", "Inter-600.ttf"],
  ["Inter", 700, "normal", "Inter-700.ttf"],
  ["JetBrains Mono", 400, "normal", "JetBrainsMono-400.ttf"],
  ["JetBrains Mono", 700, "normal", "JetBrainsMono-700.ttf"],
].map(([fam, w, s, file]) => {
  const p = path.join(fontsDir, file);
  if (!fs.existsSync(p)) return "";
  const b64 = fs.readFileSync(p).toString("base64");
  return `@font-face{font-family:'${fam}';font-weight:${w};font-style:${s};src:url(data:font/ttf;base64,${b64}) format('truetype');font-display:swap;}`;
}).join("\n");

const themeCss = fs.readFileSync(path.join(repo, "tools", "docgen", "theme.css"), "utf8");

const PALETTE = `
body { --camp-ink:#1c3257; --camp-acc:#A85F12; --camp-tint:#F1F0EC; --ink:#222; --ink2:#5A564F; --rule2:#cfcabf; background:#fff; }
.sheet { padding: 0; }
.sheet-eyebrow { font-family: var(--mono); font-size: 8pt; letter-spacing: .1em; text-transform: uppercase; color: var(--camp-acc); }
.sheet-title { font-family: var(--serif); font-weight: 600; font-size: 19pt; color: var(--camp-ink); margin-top: 2pt; }
.sheet-head { border-bottom: 1.6pt solid var(--camp-acc); padding-bottom: 5pt; margin-bottom: 9pt; }
.note { font-size: 9pt; color: var(--ink2); margin: 0 0 7pt; }
.pagebreak { break-before: page; }
`;

function docHtml(bodyHtml) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${FACES}
${themeCss}
${PALETTE}
</style></head><body>${bodyHtml}</body></html>`;
}

function head(eyebrow, title) {
  return `<div class="sheet-head"><div class="sheet-eyebrow">${eyebrow}</div><div class="sheet-title">${title}</div></div>`;
}

// ---------- seeded RNG + maze generator (wide corridors) ----------
function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; }
function genMaze(cols, rows, seed) {
  const rand = rng(seed);
  const c = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ n: true, e: true, s: true, w: true, v: false })));
  const stack = [[0, 0]]; c[0][0].v = true;
  const dirs = [["n", 0, -1, "s"], ["s", 0, 1, "n"], ["e", 1, 0, "w"], ["w", -1, 0, "e"]];
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const opts = dirs.filter(([d, dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && nx < cols && ny >= 0 && ny < rows && !c[ny][nx].v; });
    if (!opts.length) { stack.pop(); continue; }
    const [d, dx, dy, opp] = opts[Math.floor(rand() * opts.length)];
    c[y][x][d] = false; const nx = x + dx, ny = y + dy; c[ny][nx][opp] = false; c[ny][nx].v = true; stack.push([nx, ny]);
  }
  return c;
}
function mazeSvg(cols, rows, seed, cell) {
  const m = genMaze(cols, rows, seed);
  const W = cols * cell, H = rows * cell, t = 4;
  let lines = "";
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const px = x * cell, py = y * cell, q = m[y][x];
    if (q.n) lines += `<line x1="${px}" y1="${py}" x2="${px + cell}" y2="${py}"/>`;
    if (q.w) lines += `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + cell}"/>`;
    if (x === cols - 1 && q.e) lines += `<line x1="${px + cell}" y1="${py}" x2="${px + cell}" y2="${py + cell}"/>`;
    if (y === rows - 1 && q.s) lines += `<line x1="${px}" y1="${py + cell}" x2="${px + cell}" y2="${py + cell}"/>`;
  }
  const r = cell * 0.26;
  return `<svg viewBox="-${t} -${t} ${W + 2 * t} ${H + 2 * t}" width="${(W / 96).toFixed(2)}in">
<rect x="${cell * 0.5 - r}" y="${cell * 0.5 - r}" width="${2 * r}" height="${2 * r}" rx="3" fill="#1f7a4d"/>
<circle cx="${W - cell * 0.5}" cy="${H - cell * 0.5}" r="${r}" fill="none" stroke="#b3402a" stroke-width="3"/>
<circle cx="${W - cell * 0.5}" cy="${H - cell * 0.5}" r="${r * 0.45}" fill="#b3402a"/>
<g stroke="#111" stroke-width="${t}" stroke-linecap="round">${lines}</g>
<text x="${cell * 0.5}" y="${cell * 0.5 + 3}" font-size="8" text-anchor="middle" fill="#fff" font-family="JetBrains Mono">S</text></svg>`;
}

function magnetMazes() {
  const defs = [["Maze A", "warm-up", 4, 3, 7], ["Maze B", "easy", 5, 4, 23], ["Maze C", "medium", 5, 4, 91], ["Maze D", "hard", 6, 4, 144]];
  const cards = defs.map(([n, lv, c, r, s]) => `<div class="mz"><div class="mz-h"><b>${n}</b><span>${lv}</span></div>${mazeSvg(c, r, s, 88)}</div>`).join("");
  return `<div class="sheet"><style>
.mz-wrap{display:grid;grid-template-columns:1fr 1fr;gap:16pt;}
.mz{border:1.3pt solid var(--camp-ink);border-radius:7pt;padding:9pt;text-align:center;break-inside:avoid;}
.mz-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5pt;}
.mz-h b{font-family:var(--serif);color:var(--camp-ink);font-size:12pt;}
.mz-h span{font-family:var(--mono);font-size:7.5pt;text-transform:uppercase;letter-spacing:.08em;color:var(--camp-acc);}
.mz svg{max-width:100%;height:auto;}
</style>
${head("PY-STEM 2026 &middot; PYS-01 Magnetic Capsule Maze Cup", "Maze boards (laminate; one per team)")}
<p class="note">Print on cardstock and laminate. The green square <b>S</b> is the start; the red target is the finish. Place a steel paperclip or washer (the "capsule") on S and move the 6&nbsp;mm driver magnet UNDER the board to drag it to the target without touching the maze walls. Paths are kept wide on purpose &mdash; move the driver slowly. Pre-test each token through the laminated sheet before the run.</p>
<div class="mz-wrap">${cards}</div></div>`;
}

// ---------- PYS-05 reaction time conversion ----------
function reactionStrip() {
  const g = 9.81;
  const tFor = (dcm) => Math.sqrt(2 * (dcm / 100) / g) * 1000; // ms
  const rows = [];
  for (let d = 2; d <= 40; d += 2) rows.push(`<tr><td>${d}</td><td>${Math.round(tFor(d))}</td></tr>`);
  const half = Math.ceil(rows.length / 2);
  const tbl = (rs) => `<table class="rt"><tr><th>cm caught</th><th>reaction (ms)</th></tr>${rs.join("")}</table>`;
  // ruler marks at round ms values
  const marks = [120, 150, 180, 200, 220, 250, 280, 300, 350, 400].map((ms) => {
    const d = 490.5 * (ms / 1000) ** 2; // cm
    return { ms, d: d.toFixed(1) };
  }).filter((m) => m.d <= 50);
  const stripH = 560, top = 18, scale = (stripH - 2 * top) / 50;
  const ticks = marks.map((m) => {
    const y = top + Number(m.d) * scale;
    return `<line x1="60" y1="${y}" x2="120" y2="${y}" stroke="#111" stroke-width="2"/>
<text x="54" y="${y + 3}" text-anchor="end" font-size="11" font-family="JetBrains Mono">${m.d} cm</text>
<text x="126" y="${y + 3}" font-size="11" font-family="JetBrains Mono" fill="#A85F12">${m.ms} ms</text>`;
  }).join("");
  return `<div class="sheet"><style>
.rt{border-collapse:collapse;font-family:var(--mono);font-size:9pt;width:48%;}
.rt th{background:var(--camp-ink);color:#fff;padding:3pt 6pt;text-align:left;font-size:7.5pt;text-transform:uppercase;letter-spacing:.05em;}
.rt td{border-bottom:1pt solid var(--rule2);padding:2.5pt 6pt;}
.rt td:nth-child(2){color:var(--camp-acc);font-weight:700;}
.rt-cols{display:flex;gap:5%;margin-top:4pt;}
.rt-flex{display:flex;gap:24pt;align-items:flex-start;}
.rt-ruler{border:1.2pt solid var(--camp-ink);border-radius:6pt;padding:6pt;}
.rt-foot{font-size:8.5pt;color:var(--ink2);margin-top:8pt;}
</style>
${head("PY-STEM 2026 &middot; PYS-05 Reaction Time Combine", "Catch-distance to reaction-time strip")}
<p class="note">A partner pinches a meter stick at 0&nbsp;cm; you hold your fingers open at the 0 mark. They drop it without warning; you catch it. Read the cm where you caught it, then look it up below. Record the <b>median of at least 10 trials</b>, not your best one. Then test one strategy (focus cue, warm-up, dominant hand) and compare medians.</p>
<div class="rt-flex">
<div style="flex:1"><div class="rt-cols">${tbl(rows.slice(0, half))}${tbl(rows.slice(half))}</div>
<p class="rt-foot">Formula: time = &radic;(2 &times; distance &divide; g), g = 9.81 m/s&sup2;. Lower is faster. Typical 8 to 12 year olds land near 18 to 31 cm (about 190 to 250 ms).</p></div>
<div class="rt-ruler"><div style="font-family:var(--mono);font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:var(--camp-acc);text-align:center;margin-bottom:3pt;">Quick read</div>
<svg viewBox="0 0 200 ${stripH}" width="2in"><line x1="120" y1="${top}" x2="120" y2="${top + 50 * scale}" stroke="#111" stroke-width="2"/>${ticks}</svg></div>
</div></div>`;
}

// ---------- PYS-08 balance challenge cards + COM template ----------
function balanceCards() {
  const ch = [
    ["Wall and Heel", "Stand with your back and heels flat against a wall. Try to bend and touch your toes, or lift one foot forward, without leaning off the wall.", "It fails: the wall stops you leaning forward, so your center of mass cannot move over your toes (your base)."],
    ["Backless Chair Stand", "Sit tall on a backless chair, feet flat, arms crossed. Try to stand up WITHOUT leaning your chest forward.", "It fails: you must shift your center of mass forward over your feet first. No lean = no balance over the base."],
    ["Toe Grab Hop", "Bend down, grab your toes, and try to hop forward while still holding them.", "It is very hard: holding your toes locks your center of mass low and forward, so you cannot get your base under you to jump."],
    ["Loaded Line Walk", "Walk a taped floor line holding a weight straight out at arm's length, then again holding it at your chest. Which is steadier?", "Arm's length moves your center of mass sideways and forward off the line; held at the chest it stays over your base, so you wobble less."],
  ];
  const cards = ch.map(([n, how, why], i) => `<div class="bc"><div class="bc-h"><span class="bc-n">${i + 1}</span><span class="bc-t">${n}</span></div>
<div class="bc-how">${how}</div>
<div class="bc-pred">Predict: will it WORK or FAIL? Where does your center of mass go? &nbsp;___________________</div>
<div class="bc-why"><b>Center-of-mass reason:</b> ${why}</div></div>`).join("");
  return `<div class="sheet"><style>
.bc-grid{display:grid;grid-template-columns:1fr 1fr;gap:13pt;}
.bc{border:1.3pt solid var(--camp-ink);border-radius:7pt;padding:9pt 11pt;break-inside:avoid;}
.bc-h{display:flex;align-items:center;gap:8pt;margin-bottom:4pt;}
.bc-n{font-family:var(--mono);font-weight:700;background:var(--camp-ink);color:#fff;border-radius:4pt;padding:1pt 7pt;font-size:11pt;}
.bc-t{font-family:var(--serif);font-weight:600;color:var(--camp-ink);font-size:13pt;}
.bc-how{font-size:9.5pt;margin-bottom:5pt;}
.bc-pred{font-size:8.5pt;color:var(--ink2);border-top:1pt dashed var(--rule2);padding-top:4pt;margin-bottom:4pt;}
.bc-why{font-size:8pt;color:var(--ink2);background:var(--camp-tint);border-radius:4pt;padding:5pt 7pt;}
.bc-why b{color:var(--camp-acc);}
</style>
${head("PY-STEM 2026 &middot; PYS-08 Low-Ropes Force Map Relay", "Indoor balance-challenge cards")}
<p class="note">Four indoor challenges that replace a real ropes course. Do EVERY challenge next to a wall so a slip just leaves you leaning. Keep the floor clear; a helper spots the chair stand; the taped line stays flat (no running, no raised beam). Predict first, then test, then map the forces.</p>
<div class="bc-grid">${cards}</div></div>`;
}

function comTemplate() {
  const box = (label) => `<div class="ct"><div class="ct-l">${label}</div>
<svg viewBox="0 0 220 150" width="2.1in"><rect x="1" y="1" width="218" height="148" rx="6" fill="none" stroke="#cfcabf"/>
<line x1="20" y1="120" x2="200" y2="120" stroke="#cfcabf" stroke-dasharray="4 4"/>
<text x="24" y="115" font-size="8" fill="#9a958b" font-family="JetBrains Mono">base of support (shade it)</text></svg>
<div class="ct-p">Mark your center of mass with an X. Draw the straight line of gravity down from it. Does the line land inside the base?</div></div>`;
  return `<div class="sheet"><style>
.ct-grid{display:grid;grid-template-columns:1fr 1fr;gap:14pt;}
.ct{border:1.2pt solid var(--camp-ink);border-radius:7pt;padding:9pt;text-align:center;break-inside:avoid;}
.ct-l{font-family:var(--mono);font-size:8pt;text-transform:uppercase;letter-spacing:.06em;color:var(--camp-acc);margin-bottom:4pt;}
.ct-p{font-size:8.5pt;color:var(--ink2);margin-top:4pt;text-align:left;}
</style>
${head("PY-STEM 2026 &middot; PYS-08 Force Map", "Center-of-mass map template (sketch your prediction)")}
<p class="note">For each challenge, sketch the body in the box, mark the center of mass with an X, draw the line of gravity straight down, and shade the base of support (where you touch the floor). Balanced = the line of gravity falls inside the base.</p>
<div class="ct-grid">${box("Challenge 1 &mdash; before")}${box("Challenge 1 &mdash; redesign")}${box("Challenge 2 &mdash; before")}${box("Challenge 2 &mdash; redesign")}</div></div>`;
}

// ---------- PYS-10 spectrum reference ----------
function spectrumBar(kind) {
  const W = 320, H = 40;
  const rainbow = `<defs><linearGradient id="rb${kind}" x1="0" x2="1"><stop offset="0" stop-color="#7a00ff"/><stop offset="0.18" stop-color="#0040ff"/><stop offset="0.36" stop-color="#00c853"/><stop offset="0.55" stop-color="#ffeb00"/><stop offset="0.75" stop-color="#ff7a00"/><stop offset="1" stop-color="#d50000"/></linearGradient></defs>`;
  if (kind === "inc") return `<svg viewBox="0 0 ${W} ${H}" width="3.3in">${rainbow}<rect width="${W}" height="${H}" fill="url(#rbinc)"/></svg>`;
  if (kind === "led") return `<svg viewBox="0 0 ${W} ${H}" width="3.3in">${rainbow}<rect width="${W}" height="${H}" fill="#000"/><rect x="${W * 0.14}" y="0" width="6" height="${H}" fill="#2b6bff"/><rect x="${W * 0.30}" width="${W * 0.62}" height="${H}" fill="url(#rbled)" opacity="0.85" style="clip-path:none"/><rect x="${W * 0.30}" width="${W * 0.62}" height="${H}" fill="#000" opacity="0.15"/></svg>`;
  // neon: black with bright lines (orange/red dominant)
  const lines = [[0.60, "#ff8a00"], [0.66, "#ff5a00"], [0.71, "#ff3000"], [0.78, "#e00000"], [0.84, "#c00000"], [0.50, "#ffd000"]];
  const ls = lines.map(([f, c]) => `<rect x="${(W * f).toFixed(0)}" y="0" width="3.5" height="${H}" fill="${c}"/>`).join("");
  return `<svg viewBox="0 0 ${W} ${H}" width="3.3in"><rect width="${W}" height="${H}" fill="#000"/>${ls}</svg>`;
}
function spectrumCards() {
  const rows = [
    ["Filament / incandescent bulb", "inc", "A smooth, complete rainbow with no gaps. A hot solid glows across all colors (a continuous spectrum)."],
    ["White LED flashlight", "led", "A bright blue spike plus a broad band of green-yellow-orange, weaker deep red. A blue LED chip plus a yellow phosphor, NOT separate lines."],
    ["Neon / gas light", "neon", "A black background with a few separate bright lines (neon is orange-red). Each gas has its own line fingerprint &mdash; this is how we read starlight and fireworks."],
  ];
  const cards = rows.map(([n, k, d]) => `<div class="sp"><div class="sp-n">${n}</div>${spectrumBar(k)}<div class="sp-d">${d}</div></div>`).join("");
  return `<div class="sheet"><style>
.sp{border:1.3pt solid var(--camp-ink);border-radius:7pt;padding:9pt 11pt;margin-bottom:11pt;break-inside:avoid;}
.sp-n{font-family:var(--serif);font-weight:600;color:var(--camp-ink);font-size:13pt;margin-bottom:5pt;}
.sp svg{display:block;border-radius:3pt;margin:3pt 0 5pt;}
.sp-d{font-size:9pt;color:var(--ink);}
.match{border:1.2pt dashed var(--camp-acc);border-radius:6pt;padding:8pt 10pt;font-size:9pt;margin-top:4pt;}
</style>
${head("PY-STEM 2026 &middot; PYS-10 Spectra Sleuth Showdown", "Spectrum reference cards (what each source looks like)")}
<p class="note">Look at each light through your diffraction glasses and match what you see to a card. The key idea: two lights can both look white but have very different spectra. Sketches are schematic &mdash; match the PATTERN (smooth rainbow vs broad band vs separate lines), not the exact colors.</p>
${cards}
<div class="match"><b>Your task:</b> sketch the spectrum of each mystery source, then name it (filament, LED, or neon/gas) and give one reason from its pattern. A line spectrum is a fingerprint; a broad band is not.</div></div>`;
}

// ---------- PYS-11 BookBot route mat + cards ----------
function bookbotMat() {
  const rows = ["A", "B", "C", "D"], cols = [1, 2, 3, 4, 5, 6];
  let cells = "";
  for (const r of rows) for (const c of cols) cells += `<div class="bin"><span class="addr">${r}${c}</span></div>`;
  return `<div class="sheet"><style>
.mat{display:grid;grid-template-columns:repeat(6,1fr);gap:7pt;margin-top:6pt;}
.bin{border:1.4pt solid var(--camp-ink);border-radius:5pt;height:1.15in;position:relative;background:var(--camp-tint);}
.bin .addr{position:absolute;top:4pt;left:6pt;font-family:var(--mono);font-weight:700;color:var(--camp-ink);font-size:11pt;}
.matkey{font-size:8.5pt;color:var(--ink2);margin-top:8pt;}
</style>
${head("PY-STEM 2026 &middot; PYS-11 BookBot Bin Logic", "Route mat (tape to a table; 24 addressed bins)")}
<p class="note">Print landscape and tape down, or copy the grid onto a table with painter tape. Rows are lettered A to D, columns numbered 1 to 6, so every bin has an address like <b>B3</b>. Place items by ADDRESS, not by subject &mdash; that is how a library BookBot (an automated storage and retrieval system) finds a book fast.</p>
<div class="mat">${cells}</div>
<p class="matkey">Aisle rule: only one team "crane" in a column at a time. Plan a route that fills an order with the fewest column changes and no collisions.</p></div>`;
}
function bookbotCards() {
  const orders = [
    ["Order 1", ["A2", "A5", "B1"]], ["Order 2", ["C3", "A3", "D6"]], ["Order 3", ["B4", "D4", "C1"]],
    ["Order 4", ["D2", "B5", "A6"]], ["Order 5", ["C5", "C2", "B6"]], ["Order 6", ["A1", "D1", "B3", "C4"]],
  ];
  const cards = orders.map(([n, addrs]) => `<div class="oc"><div class="oc-h">${n}</div><div class="oc-a">${addrs.map((a) => `<span>${a}</span>`).join("")}</div>
<div class="oc-p">Plan the shortest route. Route: ____________  Time: ______  Collisions: ______</div></div>`).join("");
  const tags = ["A", "B", "C", "D"].flatMap((r) => [1, 2, 3, 4, 5, 6].map((c) => `<span class="tag">${r}${c}</span>`)).join("");
  return `<div class="sheet"><style>
.oc-grid{display:grid;grid-template-columns:1fr 1fr;gap:11pt;}
.oc{border:1.3pt solid var(--camp-ink);border-radius:7pt;padding:9pt 11pt;break-inside:avoid;}
.oc-h{font-family:var(--serif);font-weight:600;color:var(--camp-ink);font-size:12.5pt;}
.oc-a{display:flex;gap:7pt;margin:5pt 0;}
.oc-a span{font-family:var(--mono);font-weight:700;color:#fff;background:var(--camp-acc);border-radius:4pt;padding:2pt 9pt;font-size:12pt;}
.oc-p{font-size:8.5pt;color:var(--ink2);border-top:1pt dashed var(--rule2);padding-top:4pt;}
.tags{display:flex;flex-wrap:wrap;gap:5pt;margin-top:6pt;}
.tag{font-family:var(--mono);font-weight:700;color:var(--camp-ink);border:1.2pt solid var(--camp-ink);border-radius:4pt;padding:2pt 8pt;font-size:10pt;}
</style>
${head("PY-STEM 2026 &middot; PYS-11 BookBot Bin Logic", "Order deck + bin address tags (cut apart)")}
<p class="note">Hand a team one order card at a time. They plan the shortest collision-free route across the mat, then run it and log the time. The address tags below can be cut and taped onto real bins/cups if you build a physical mat.</p>
<div class="oc-grid">${cards}</div>
<div style="font-family:var(--mono);font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:var(--camp-acc);margin-top:11pt;">Cut-apart bin address tags</div>
<div class="tags">${tags}</div></div>`;
}

// ---------- staff run-sheets ----------
const SCIENCE = {
  "PYS-01": "Move a magnet under the board to drag a steel token through the maze with no contact (remote actuation, like a magnetically steered capsule endoscope).",
  "PYS-02": "Oobleck (cornstarch + water) stiffens under fast force and flows under slow force (shear thickening). Fast press protects; slow lean sinks.",
  "PYS-03": "A cam glued to a turning axle lifts a follower; a straw bearing keeps the follower sliding freely. Reliability is the whole game.",
  "PYS-04": "A funnel and a sealed tube carry body sounds; measure pulse (wrist or neck) before and after exercise and watch recovery.",
  "PYS-05": "A falling meter stick measures reaction time (t = sqrt(2d/g)). Use the median of >=10 trials, then test one strategy.",
  "PYS-06": "A pulse runs down a stretched metal slinky and reflects, like SONAR. Time several round trips and divide for a steadier speed.",
  "PYS-07": "Light travels straight, so a pinhole makes an inverted image. There is a BEST hole size; too tiny is dim AND blurry (diffraction).",
  "PYS-08": "You stay balanced while your center of mass stays over your base of support. Four INDOOR challenges replace the (nonexistent) ropes course.",
  "PYS-09": "A balloon air cushion cuts friction so a CD puck glides. A small opening glides longest; more lift is not always better.",
  "PYS-10": "A diffraction grating splits light. White LED = broad band, neon/gas = sharp lines, filament = smooth rainbow. Lines are fingerprints.",
  "PYS-11": "Retrieve items by bin ADDRESS (A1..D6) with a smart, collision-free route, like a library BookBot (an automated storage/retrieval system).",
  "PYS-12": "A gentler ramp slope needs more length (ADA ~1:12). Build a portable ramp that holds a load and rolls a cart smoothly (universal design).",
  "PYB-01": "Pressure = force / area. Spread the same force over more area so the point no longer pierces the target.",
  "PYB-02": "A domino chain models a nerve signal. Taped rigid blocks 'jump' like myelinated segments to cross gaps faster.",
  "PYB-03": "A movable pulley trades distance for force (mechanical advantage). Measure effort with a spring scale and compare to theory.",
  "PYB-04": "A check digit (mod-10) catches a mistyped barcode. Score correct catches against false alarms.",
};
const PREP = {
  "PYS-01": "Laminate the maze boards (this packet). Pre-test a paperclip and each washer through the lamination with the 6 mm driver; glue a few drivers into a bottle cap so they are non-mouthable. LOCK the 200 tiny 2x1 mm magnets away from kids.",
  "PYS-02": "Confirm/buy mixing bins + cups. Mix in-bag (gallon zip). Reference batch ~2:1 cornstarch:water. NEVER pour oobleck down a drain; whole bag to the trash. Corn-allergy: hand a sealed teacher-made pad.",
  "PYS-03": "BUY low-temp glue guns + sticks + straight straws (none on hand). Run two guns at the staff station. Glue the cam so it cannot spin; the follower must slide free in a glued-in straw.",
  "PYS-04": "On arrival OPEN the funnel set; if no tubing, use the aquarium tubing (buy list). Soak the tube end to press-fit the funnel. Pulse at wrist/neck is the reliable measure if the rig is faint. One earpiece per team; wipe.",
  "PYS-05": "Print the cm-to-ms strip (this packet). Median of >=10 trials; compare a strategy median-to-median.",
  "PYS-06": "Needs ~6 x 6 m clear floor for four ~3 m slinky lanes. Metal slinky only. Keep it flat; never release it stretched.",
  "PYS-07": "BUY push pins (clean aperture). Dim the room; aim at a flashlight or sunny window; look THROUGH a wax-paper screen. Frame the BEST hole, not the smallest.",
  "PYS-08": "Print the balance cards + COM template (this packet). Every challenge against a wall; clear the floor; spot the chair stand; the line stays flat.",
  "PYS-09": "BUY low-temp glue (shared with PYS-03). Collect ~12-15 recycled CDs. Confirm a smooth hard floor (else tabletops). Adult inflates balloons; small cap opening glides best.",
  "PYS-10": "BUY a true-NEON night light (our LED flashlights all look identical through a grating). Print the spectrum cards (this packet). Check if room ceiling lights are fluorescent (free lines) or LED.",
  "PYS-11": "Print the route mat + order deck + address tags (this packet). One team per column at a time; log route, time, collisions.",
  "PYS-12": "Do NOT pile weights on the pull-back car. Step 1: unwound car roll-check (smooth/straight). Step 2: bridge the ramp between two desks and hang the 200 g weights at mid-span for the load test. Sequence teams through the one weight set.",
  "PYB-01": "Use the graph-paper pierce + traced-area method (on-hand EVA foam rebounds, so do not score dent depth). Same load every time.",
  "PYB-02": "28 tiles is enough for this BACKUP if teams run sequentially. Tape paper down first so tiles do not slide; gaps < a tile's height.",
  "PYB-03": "One pulley kit = one team. Rotate it as a demo, OR buy the 8-set kit for 4 parallel teams. Keep the load heavy enough that the spring scale reads clearly.",
  "PYB-04": "Build the deck by changing exactly ONE digit per 'fake' (100% caught by mod-10); avoid differ-by-5 adjacent transpositions. Print a pre-computed answer key. Pin 12-digit UPC-A format.",
};
function runSheets() {
  const data = JSON.parse(fs.readFileSync(path.join(here, "data", "pystem_runsheets.json"), "utf8"));
  const order = ["PYS-01", "PYS-02", "PYS-03", "PYS-04", "PYS-05", "PYS-06", "PYS-07", "PYS-08", "PYS-09", "PYS-10", "PYS-11", "PYS-12", "PYB-01", "PYB-02", "PYB-03", "PYB-04"];
  const cards = order.map((c, idx) => {
    const a = data[c]; if (!a) return "";
    const pts = (a.points || []).map((p) => `<li>${p}</li>`).join("");
    const brk = idx > 0 && idx % 2 === 0 ? ' style="break-before:page"' : "";
    return `<div class="rsheet"${brk}><div class="rs-h"><span class="rs-c">${c}</span><span class="rs-t">${a.title}</span></div>
<div class="rs-sci">${SCIENCE[c] || ""}</div>
<div class="rs-prep"><b>Setup &amp; buy:</b> ${PREP[c] || ""}</div>
<div class="rs-pk">Facilitation</div><ul class="rs-list">${pts}</ul></div>`;
  }).join("");
  return `<div class="sheet"><style>
.rsheet{border:1.3pt solid var(--camp-ink);border-radius:8pt;padding:11pt 13pt;margin-bottom:13pt;break-inside:avoid;}
.rs-h{display:flex;align-items:baseline;gap:9pt;border-bottom:1.4pt solid var(--camp-acc);padding-bottom:4pt;margin-bottom:5pt;}
.rs-c{font-family:var(--mono);font-weight:700;background:var(--camp-ink);color:#fff;border-radius:4pt;padding:2pt 8pt;font-size:11pt;}
.rs-t{font-family:var(--serif);font-weight:600;color:var(--camp-ink);font-size:14pt;}
.rs-sci{font-size:9.5pt;margin-bottom:5pt;}
.rs-prep{font-size:9pt;background:var(--camp-tint);border-radius:5pt;padding:6pt 9pt;margin-bottom:6pt;}
.rs-prep b{color:var(--camp-acc);}
.rs-pk{font-family:var(--mono);font-size:7.5pt;text-transform:uppercase;letter-spacing:.08em;color:var(--camp-acc);margin-bottom:2pt;}
.rs-list{margin:0 0 0 15pt;font-size:9pt;}
.rs-list li{margin-bottom:2.5pt;}
</style>
${head("PY-STEM 2026 &middot; Staff run-sheets", "Per-station facilitation, prep &amp; safety")}
<p class="note">One block per station: the core science, what to set up or buy, and the facilitation moves that make it work. Built from the 2026-06-30 deep-research and handout audit. Keep with the instructor; not student-facing.</p>
${cards}</div>`;
}

const SHEETS = [
  { slug: "PYS_01_Magnet_Maze_Boards", body: magnetMazes },
  { slug: "PYS_05_Reaction_Time_Strip", body: reactionStrip },
  { slug: "PYS_08_Balance_Challenge_Cards", body: balanceCards },
  { slug: "PYS_08_Center_of_Mass_Template", body: comTemplate },
  { slug: "PYS_10_Spectrum_Reference_Cards", body: spectrumCards },
  { slug: "PYS_11_BookBot_Route_Mat", body: bookbotMat, landscape: true },
  { slug: "PYS_11_BookBot_Order_Deck", body: bookbotCards },
  { slug: "PY_STEM_Staff_Run_Sheets", body: runSheets },
];

async function main() {
  const filter = process.argv[2];
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const report = [];
  for (const sheet of SHEETS) {
    if (filter && !sheet.slug.toLowerCase().includes(filter.toLowerCase())) continue;
    await page.setContent(docHtml(sheet.body()), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const outPath = path.join(outDir, `${sheet.slug}.pdf`);
    await page.pdf({ path: outPath, format: "Letter", printBackground: true, landscape: !!sheet.landscape,
      margin: { top: "0.55in", bottom: "0.55in", left: "0.65in", right: "0.65in" } });
    report.push(`${sheet.slug}.pdf  ${Math.round(fs.statSync(outPath).size / 1024)} KB`);
  }
  await browser.close();
  process.stdout.write(report.join("\n") + `\n${report.length} PDFs written to ${outDir}\n`);
}
await main();
