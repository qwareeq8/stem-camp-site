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
import { mazeBoardsHtml, MAZE_NOTE } from "./team_tools.mjs";

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

// ---------- PYS-01 maze boards ----------
// The seeded maze generator, board defs, and shared note now live in
// team_tools.mjs (single source), so these boards and the instructor-guide
// appendix rendered by render.mjs can never drift apart.
function magnetMazes() {
  return `<div class="sheet">
${head("PY-STEM 2026 &middot; PYS-01 Magnetic Capsule Maze Cup", "Maze boards")}
<p class="note">${MAZE_NOTE}</p>
${mazeBoardsHtml()}</div>`;
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
<p class="note">A partner holds the meter stick at the TOP so it hangs straight down with the 0&nbsp;cm mark level with your open fingers. They release it without warning; you pinch it as fast as you can. Read the cm where you caught it, then look it up below. Record the <b>median of at least 10 trials</b>, not your best one. Then test one strategy (focus cue, warm-up, or eyes on the release point) and compare medians.</p>
<div class="rt-flex">
<div style="flex:1"><div class="rt-cols">${tbl(rows.slice(0, half))}${tbl(rows.slice(half))}</div>
<p class="rt-foot">Formula: time = &radic;(2 &times; distance &divide; g), g = 9.81 m/s&sup2;. Lower is faster. Typical 8 to 12 year olds land near 18 to 31 cm (about 190 to 250 ms).</p></div>
<div class="rt-ruler"><div style="font-family:var(--mono);font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:var(--camp-acc);text-align:center;margin-bottom:3pt;">Quick read</div>
<svg viewBox="0 0 200 ${stripH}" width="2in"><line x1="120" y1="${top}" x2="120" y2="${top + 50 * scale}" stroke="#111" stroke-width="2"/>${ticks}</svg></div>
</div></div>`;
}

// ---------- PYS-08 balance challenge cards + COM template ----------
function balanceCards(part = "cards") {
  // Student card face carries ONLY the challenge and a prediction blank; the
  // center-of-mass reason lives on the instructor answer-key page so the
  // predict-first step (35 of 100 points) is not spoiled on the handout.
  const ch = [
    ["Wall and Heel", "Stand with your back and heels flat against a wall. Keeping them touching, try to reach a coin placed on the floor a little ahead of you, or lift one foot forward off the floor."],
    ["Backless Chair Stand", "Sit tall on a backless chair, feet flat, arms crossed. Try to stand up WITHOUT leaning your chest forward."],
    ["Toe Grab Hop", "Bend down, grab your toes, and try to hop forward while still holding them."],
    ["Loaded Line Walk", "Walk a taped floor line holding a small weight straight out at arm's length, then again holding it at your chest. Which is steadier?"],
  ];
  const cards = ch.map(([n, how], i) => `<div class="bc"><div class="bc-h"><span class="bc-n">${i + 1}</span><span class="bc-t">${n}</span></div>
<div class="bc-how">${how}</div>
<div class="bc-pred">My prediction &mdash; will it WORK or FAIL? &nbsp;__________ &nbsp;&nbsp; Where does my center of mass go? &nbsp;______________________</div></div>`).join("");
  const key = [
    ["Wall and Heel", "Fails", "The wall blocks your hips from shifting back to counterbalance, so as you reach forward your center of mass passes beyond your toes, out of your base of support, and you tip."],
    ["Backless Chair Stand", "Fails without a lean", "To stand you must first move your center of mass forward over your feet. With no chair back and no forward lean, it stays behind your feet, so you cannot rise."],
    ["Toe Grab Hop", "Very hard", "Holding your toes locks your center of mass low and forward, so you cannot swing your base under it to launch a hop."],
    ["Loaded Line Walk", "Steadier at the chest", "At arm's length the weight pulls your center of mass forward and sideways off the line; held at the chest it stays over your base, so you wobble less."],
  ];
  const keyRows = key.map(([n, verdict, why], i) => `<tr><td>${i + 1}</td><td>${n}</td><td>${verdict}</td><td>${why}</td></tr>`).join("");
  const style = `<style>
.bc-grid{display:grid;grid-template-columns:1fr 1fr;gap:13pt;}
.bc{border:1.3pt solid var(--camp-ink);border-radius:7pt;padding:9pt 11pt;break-inside:avoid;}
.bc-h{display:flex;align-items:center;gap:8pt;margin-bottom:4pt;}
.bc-n{font-family:var(--mono);font-weight:700;background:var(--camp-ink);color:#fff;border-radius:4pt;padding:1pt 7pt;font-size:11pt;}
.bc-t{font-family:var(--serif);font-weight:600;color:var(--camp-ink);font-size:13pt;}
.bc-how{font-size:9.5pt;margin-bottom:6pt;}
.bc-pred{font-size:8.5pt;color:var(--ink2);border-top:1pt dashed var(--rule2);padding-top:5pt;}
.bkey{border-collapse:collapse;width:100%;font-size:9pt;margin-top:4pt;}
.bkey th{background:var(--camp-ink);color:#fff;text-align:left;padding:4pt 7pt;font-size:8pt;text-transform:uppercase;letter-spacing:.05em;}
.bkey td{border-bottom:1pt solid var(--rule2);padding:5pt 7pt;vertical-align:top;}
.bkey td:nth-child(3){color:var(--camp-acc);font-weight:600;}
</style>`;
  if (part === "key") return `<div class="sheet">${style}
${head("PY-STEM 2026 &middot; PYS-08 Low-Ropes Force Map Relay", "Instructor answer key")}
<p class="note">Keep this page with the instructor. Reveal a challenge's reason only after each team has recorded its prediction.</p>
<table class="bkey"><tr><th>#</th><th>Challenge</th><th>Result</th><th>Center-of-mass reason</th></tr>${keyRows}</table></div>`;
  return `<div class="sheet">${style}
${head("PY-STEM 2026 &middot; PYS-08 Low-Ropes Force Map Relay", "Balance challenge cards (predict first)")}
<p class="note">Four indoor challenges that replace a real ropes course. Do EVERY challenge next to a wall so a slip just leaves you leaning. Keep the floor clear; a helper spots the chair stand; the taped line stays flat (no running, no raised beam). Mark WORK or FAIL on the card FIRST, then test, then map the forces.</p>
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
${head("PY-STEM 2026 &middot; PYS-08 Low-Ropes Force Map Relay", "Center-of-mass map template")}
<p class="note">For each of the four challenges, sketch the body in its box, mark the center of mass with an X, draw the line of gravity straight down, and shade the base of support (where you touch the floor). Balanced = the line of gravity falls inside the base.</p>
<div class="ct-grid">${box("Challenge 1 &mdash; Wall and Heel")}${box("Challenge 2 &mdash; Backless Chair Stand")}${box("Challenge 3 &mdash; Toe Grab Hop")}${box("Challenge 4 &mdash; Loaded Line Walk")}</div></div>`;
}

// ---------- PYS-10 spectrum reference ----------
function spectrumBar(kind) {
  const W = 320, H = 40;
  const rainbow = `<defs><linearGradient id="rb${kind}" x1="0" x2="1"><stop offset="0" stop-color="#7a00ff"/><stop offset="0.18" stop-color="#0040ff"/><stop offset="0.36" stop-color="#00c853"/><stop offset="0.55" stop-color="#ffeb00"/><stop offset="0.75" stop-color="#ff7a00"/><stop offset="1" stop-color="#d50000"/></linearGradient></defs>`;
  if (kind === "inc") return `<svg viewBox="0 0 ${W} ${H}" width="3.3in">${rainbow}<rect width="${W}" height="${H}" fill="url(#rbinc)"/></svg>`;
  if (kind === "led") return `<svg viewBox="0 0 ${W} ${H}" width="3.3in"><defs><linearGradient id="ledband" x1="0" x2="1"><stop offset="0" stop-color="#00c853"/><stop offset="0.4" stop-color="#ffeb00"/><stop offset="0.72" stop-color="#ff7a00"/><stop offset="1" stop-color="#7a0000"/></linearGradient></defs><rect width="${W}" height="${H}" fill="#000"/><rect x="${W * 0.14}" y="0" width="6" height="${H}" fill="#2b6bff"/><rect x="${W * 0.30}" width="${W * 0.62}" height="${H}" fill="url(#ledband)"/></svg>`;
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
${head("PY-STEM 2026 &middot; PYS-11 BookBot Bin Logic", "Route mat (24 addressed bins)")}
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
${head("PY-STEM 2026 &middot; PYS-11 BookBot Bin Logic", "Order deck and bin address tags")}
<p class="note">Hand a team one order card at a time. They plan the shortest collision-free route across the mat, then run it and log the time. The address tags below can be cut and taped onto real bins/cups if you build a physical mat.</p>
<div class="oc-grid">${cards}</div>
<div style="font-family:var(--mono);font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:var(--camp-acc);margin-top:11pt;">Cut-apart bin address tags</div>
<div class="tags">${tags}</div></div>`;
}

// Shared predict-first card + instructor answer-key styles (self-contained per sheet).
const CARD_CSS = `
.bc-grid{display:grid;grid-template-columns:1fr 1fr;gap:13pt;}
.bc{border:1.3pt solid var(--camp-ink);border-radius:7pt;padding:9pt 11pt;break-inside:avoid;}
.bc-h{display:flex;align-items:center;gap:8pt;margin-bottom:4pt;}
.bc-n{font-family:var(--mono);font-weight:700;background:var(--camp-ink);color:#fff;border-radius:4pt;padding:1pt 7pt;font-size:11pt;}
.bc-t{font-family:var(--serif);font-weight:600;color:var(--camp-ink);font-size:13pt;}
.bc-how{font-size:9.5pt;margin-bottom:6pt;}
.bc-pred{font-size:8.5pt;color:var(--ink2);border-top:1pt dashed var(--rule2);padding-top:5pt;}
.bkey{border-collapse:collapse;width:100%;font-size:9pt;margin-top:4pt;}
.bkey th{background:var(--camp-ink);color:#fff;text-align:left;padding:4pt 7pt;font-size:8pt;text-transform:uppercase;letter-spacing:.05em;}
.bkey td{border-bottom:1pt solid var(--rule2);padding:5pt 7pt;vertical-align:top;}
.bkey td:nth-child(2){color:var(--camp-acc);font-weight:600;}
`;

// ---------- PYS-06 SONAR slinky station cards ----------
function slinkyCards(part = "cards") {
  const ch = [
    ["Count the round trips", "Send one sharp pulse down the stretched slinky. Predict how many times it will travel down and back before it fades out, then send it and count."],
    ["Tension change", "One teammate pulls the slinky a little tighter (do not overstretch). Predict whether the pulse comes back faster or slower than before, then time it."],
    ["Pinch a wall", "A teammate pinches the middle of the slinky to make a fixed point. Predict what the pulse does when it reaches the pinch, then send one and watch."],
    ["Measure the speed", "Time 4 to 6 full round trips along your measured lane, then divide the total distance by the total time. Record the speed in metres per second."],
    ["Two pulses meet", "Two teammates each send a pulse from opposite ends at the same time. Predict what happens when the two pulses meet in the middle, then try it."],
    ["Big push or small push", "Send a small pulse, then a big one along the same lane. Predict whether the big push travels faster, slower, or the same speed, then time both."],
  ];
  const cards = ch.map(([n, how], i) => `<div class="bc"><div class="bc-h"><span class="bc-n">${i + 1}</span><span class="bc-t">${n}</span></div>
<div class="bc-how">${how}</div>
<div class="bc-pred">My prediction: &nbsp;___________________________ &nbsp;&nbsp; What I measured: &nbsp;__________________</div></div>`).join("");
  const key = [
    ["Fades after several trips", "Friction and air drag remove energy each pass, so the count is a measurement, not a fixed number."],
    ["Tighter is faster", "Wave speed rises with tension (it grows with the square root of tension), so a tighter slinky returns the pulse sooner."],
    ["Reflects, flipped", "The pinch acts as a fixed end, so the pulse bounces back inverted, just like it does off the held far end."],
    ["Distance over time", "Speed = total distance divided by total time. Timing several round trips and dividing cancels most of the human timing error."],
    ["They pass through", "The two pulses cross by superposition: where they overlap the coils add for an instant, then each pulse continues on unchanged."],
    ["Same speed", "Wave speed depends on the slinky's tension and mass per length, not on how big the pulse is; the big one just carries more energy."],
  ];
  const keyRows = key.map(([verdict, why], i) => `<tr><td>${i + 1}</td><td>${verdict}</td><td>${why}</td></tr>`).join("");
  if (part === "key") return `<div class="sheet"><style>${CARD_CSS}</style>
${head("PY-STEM 2026 &middot; PYS-06 SONAR Slinky Showdown", "Instructor answer key")}
<p class="note">Keep this page with the instructor. Reveal a station's reason only after each team has recorded its prediction.</p>
<table class="bkey"><tr><th>#</th><th>What happens</th><th>Why</th></tr>${keyRows}</table></div>`;
  return `<div class="sheet"><style>${CARD_CSS}</style>
${head("PY-STEM 2026 &middot; PYS-06 SONAR Slinky Showdown", "Station challenge cards (predict first)")}
<p class="note">Read the card, write your prediction FIRST, then test it with the slinky and record what happened. Keep the slinky flat on the floor, never let go while it is stretched, and wear goggles while it is stretched.</p>
<div class="bc-grid">${cards}</div></div>`;
}

// ---------- PYS-12 accessibility ramp client spec cards ----------
function rampClientCards() {
  const clients = [
    ["Community school", "10 cm", "1:12", "a 200 g cart", "folds to fit inside a backpack", 120],
    ["Public library", "8 cm", "1:14", "a 300 g cart", "one student can carry it alone", 112],
    ["Health clinic", "12 cm", "1:12", "a 250 g cart", "sets up in under one minute", 144],
    ["Science museum", "15 cm", "1:16", "a 200 g cart", "the ramp itself weighs under 200 g", 240],
  ];
  const cards = clients.map(([who, rise, slope, load, port], i) => `<div class="cl"><div class="cl-h"><span class="cl-n">Client ${String.fromCharCode(65 + i)}</span><span class="cl-w">${who}</span></div>
<table class="cl-t"><tr><td>Rise to cover</td><td>${rise}</td></tr>
<tr><td>Max slope</td><td>${slope}</td></tr>
<tr><td>Load to carry</td><td>${load}</td></tr>
<tr><td>Portability</td><td>${port}</td></tr></table></div>`).join("");
  const lengths = clients.map(([, rise, slope, , , len], i) => `Client ${String.fromCharCode(65 + i)}: ${rise} at ${slope} needs about ${len} cm of ramp`).join("; ");
  return `<div class="sheet"><style>
.cl-grid{display:grid;grid-template-columns:1fr 1fr;gap:13pt;}
.cl{border:1.3pt solid var(--camp-ink);border-radius:7pt;padding:10pt 12pt;break-inside:avoid;}
.cl-h{display:flex;align-items:baseline;gap:8pt;margin-bottom:5pt;}
.cl-n{font-family:var(--mono);font-weight:700;background:var(--camp-acc);color:#fff;border-radius:4pt;padding:1pt 8pt;font-size:11pt;}
.cl-w{font-family:var(--serif);font-weight:600;color:var(--camp-ink);font-size:13pt;}
.cl-t{width:100%;border-collapse:collapse;font-size:9.5pt;}
.cl-t td{padding:3pt 4pt;border-bottom:1pt solid var(--rule2);vertical-align:top;}
.cl-t td:first-child{white-space:nowrap;color:var(--ink2);}
.cl-t td:last-child{font-family:var(--mono);color:var(--camp-ink);font-weight:700;text-align:right;}
</style>
${head("PY-STEM 2026 &middot; PYS-12 Accessibility Ramp Rescue Lab", "Client spec cards")}
<p class="note">Hand each team one client card. Every design must meet ALL four of its client's numbers. Slope is written as rise:run, so 1:12 means 12 cm of ramp length for every 1 cm of height. Ramp length = rise &times; the run number.</p>
<div class="cl-grid">${cards}</div>
<p class="note" style="margin-top:12pt"><b>Length check (for the instructor):</b> ${lengths}.</p></div>`;
}

// ---------- PYS-04 stethoscope recovery heart-rate log ----------
function heartRateLog() {
  const rows = [
    ["Resting (sit calm for 1 min)", "0"],
    ["Right after 1 min of activity", "0"],
    ["Recovery at 1 minute", "1"],
    ["Recovery at 2 minutes", "2"],
    ["Recovery at 3 minutes", "3"],
  ];
  const body = rows.map(([label]) => `<tr><td>${label}</td><td></td><td></td><td></td></tr>`).join("");
  // Plot grid: x = time (0..3 min post), y = beats per minute (40..160).
  const W = 520, H = 300, ml = 44, mb = 28, pt = 10, pr = 12;
  const x0 = ml, x1 = W - pr, y0 = pt, y1 = H - mb;
  const yLabels = [40, 60, 80, 100, 120, 140, 160];
  const xLabels = ["rest", "after", "1 min", "2 min", "3 min"];
  const gy = yLabels.map((v) => {
    const y = y1 - ((v - 40) / 120) * (y1 - y0);
    return `<line x1="${x0}" y1="${y.toFixed(1)}" x2="${x1}" y2="${y.toFixed(1)}" stroke="#e2ded5" stroke-width="1"/><text x="${x0 - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" font-family="JetBrains Mono" fill="#5A564F">${v}</text>`;
  }).join("");
  const gx = xLabels.map((lab, i) => {
    const x = x0 + (i / (xLabels.length - 1)) * (x1 - x0);
    return `<line x1="${x.toFixed(1)}" y1="${y0}" x2="${x.toFixed(1)}" y2="${y1}" stroke="#efece5" stroke-width="1"/><text x="${x.toFixed(1)}" y="${y1 + 16}" text-anchor="middle" font-size="9" font-family="JetBrains Mono" fill="#5A564F">${lab}</text>`;
  }).join("");
  return `<div class="sheet"><style>
.hr-t{width:100%;border-collapse:collapse;font-size:10pt;margin-bottom:12pt;}
.hr-t th{background:var(--camp-ink);color:#fff;text-align:left;padding:5pt 8pt;font-size:8pt;text-transform:uppercase;letter-spacing:.05em;}
.hr-t td{border-bottom:1pt solid var(--rule2);padding:8pt;}
.hr-t td:first-child{width:42%;}
.hr-plot{border:1.2pt solid var(--camp-ink);border-radius:7pt;padding:10pt;}
.hr-plot svg{width:100%;height:auto;}
.hr-lab{font-family:var(--mono);font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:var(--camp-acc);margin-bottom:4pt;}
</style>
${head("PY-STEM 2026 &middot; PYS-04 Stethoscope Sprint and Recovery", "Heart-rate recovery log")}
<p class="note">Count heartbeats for 15 seconds and multiply by 4 to get beats per minute (bpm). With the person's consent, record a resting rate, then a rate right after one minute of light activity, then watch it recover. A faster drop back toward rest means better fitness. Fill both trials, then plot the points and connect them.</p>
<table class="hr-t"><tr><th>When</th><th>Trial 1 count (15 s)</th><th>Trial 2 count (15 s)</th><th>Beats per minute</th></tr>${body}</table>
<div class="hr-plot"><div class="hr-lab">Heart rate over time (bpm)</div>
<svg viewBox="0 0 ${W} ${H}">${gy}${gx}<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="#222" stroke-width="1.4"/><line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="#222" stroke-width="1.4"/></svg></div></div>`;
}

// ---------- PYS-09 hovercraft target and tournament rules ----------
function hovercraftTargetRules() {
  const cx = 260, cy = 250, rings = [
    [230, "#f4ede2", "5"],
    [175, "#e7d3b0", "10"],
    [120, "#cf9f66", "20"],
    [64, "#1f7a4d", "30"],
  ];
  const circles = rings.map(([r, fill]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="#1c3257" stroke-width="2"/>`).join("");
  const labels = rings.map(([r, , pts]) => `<text x="${cx}" y="${cy - r + 20}" text-anchor="middle" font-size="17" font-family="JetBrains Mono" font-weight="700" fill="#1c3257">${pts}</text>`).join("");
  return `<div class="sheet"><style>
.hv-rules{border:1.3pt solid var(--camp-ink);border-radius:8pt;padding:11pt 13pt;margin-bottom:12pt;}
.hv-rules h4{font-family:var(--serif);color:var(--camp-ink);font-size:12.5pt;margin:0 0 4pt;}
.hv-rules ol{margin:0 0 0 16pt;font-size:9.5pt;}
.hv-rules li{margin-bottom:3pt;}
.hv-target{border:1.3pt solid var(--camp-ink);border-radius:8pt;padding:10pt;text-align:center;break-inside:avoid;}
.hv-target svg{width:5in;height:auto;}
.hv-lab{font-family:var(--mono);font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:var(--camp-acc);margin-bottom:4pt;}
</style>
${head("PY-STEM 2026 &middot; PYS-09 Hovercraft Hockey Hackathon", "Glide test, target rules, and scoring target")}
<div class="hv-rules"><h4>Glide test (Glide performance, 30 points)</h4>
<ol><li>Tape a start line and a launch line 30&nbsp;cm apart on a smooth floor or long table.</li>
<li>Set the inflated hovercraft on the start line, open the cap, and give it one firm, level push so it crosses the launch line.</li>
<li>Measure how far past the launch line it glides before it stops. Record the <b>best of three</b> pushes in centimetres.</li></ol></div>
<div class="hv-rules"><h4>Target hockey (Target competition score, 25 points)</h4>
<ol><li>Place the target sheet 1&nbsp;to 1.5&nbsp;m from a shooting line on the floor.</li>
<li>Each team gets <b>five shots</b>: push the hovercraft from the shooting line so it comes to rest on the target.</li>
<li>Score the ring the puck's centre stops on (5, 10, 20, or the 30 bullseye). Off the target scores 0. Add the five shots.</li>
<li>Run it as a bracket: highest five-shot total advances. Ties take one extra shot.</li></ol></div>
<div class="hv-target"><div class="hv-lab">Scoring target</div>
<svg viewBox="0 0 520 500">${circles}${labels}<circle cx="${cx}" cy="${cy}" r="4" fill="#1c3257"/></svg></div></div>`;
}

// ---------- PYS-10 museum exhibit clue cards ----------
function museumClueCards(part = "cards") {
  const clues = [
    ["The OPEN sign", "A shop's glowing orange-red OPEN sign in the window.", "Line spectrum", "Neon gas"],
    ["The film projector", "The warm bulb inside an old cinema film projector.", "Smooth rainbow", "Hot filament"],
    ["The phone light", "The white flashlight on the back of a modern phone.", "Broad band with a blue spike", "White LED"],
    ["The street lamp", "A highway lamp that makes everything look yellow-orange.", "Line spectrum", "Sodium gas"],
    ["The red firework", "A single red burst at the fireworks show.", "Line spectrum", "Glowing strontium salt"],
    ["The desk lamp", "A dimmable desk lamp with an old-style clear bulb.", "Smooth rainbow", "Hot filament"],
  ];
  const cards = clues.map(([n, desc], i) => `<div class="bc"><div class="bc-h"><span class="bc-n">${i + 1}</span><span class="bc-t">${n}</span></div>
<div class="bc-how">${desc}</div>
<div class="bc-pred">Spectrum I would see: &nbsp;____________________ &nbsp;&nbsp; Source type: &nbsp;____________________</div></div>`).join("");
  const keyRows = clues.map(([, , spec, src], i) => `<tr><td>${i + 1}</td><td>${spec}</td><td>${src}</td></tr>`).join("");
  if (part === "key") return `<div class="sheet"><style>${CARD_CSS}</style>
${head("PY-STEM 2026 &middot; PYS-10 Spectra Sleuth Showdown", "Instructor answer key")}
<p class="note">Keep this page with the instructor. A hot filament gives a smooth rainbow; a white LED gives a broad band with a blue spike; a neon, sodium, or metal-salt source gives separate bright lines.</p>
<table class="bkey"><tr><th>#</th><th>Spectrum</th><th>Source</th></tr>${keyRows}</table></div>`;
  return `<div class="sheet"><style>${CARD_CSS}</style>
${head("PY-STEM 2026 &middot; PYS-10 Spectra Sleuth Showdown", "Museum exhibit clue cards (predict first)")}
<p class="note">Each card describes a real light you might meet in a museum or on the street. Predict the spectrum you would see through the grating and name the source type BEFORE you check it against the reference cards. This backs the exhibit-connection part of the score.</p>
<div class="bc-grid">${cards}</div></div>`;
}

// ---------- PYB-04 barcode checksum deck + answer key ----------
function upcCheckDigit(d) {
  // d: 11 data digits. UPC-A: odd positions (1-based) weight 3, even weight 1.
  let s = 0;
  for (let i = 0; i < 11; i++) s += d[i] * (i % 2 === 0 ? 3 : 1);
  return (10 - (s % 10)) % 10;
}
function barcodeDeck(part = "cards") {
  const bases = [
    "03600029145", "01234567890", "04012345678", "07350053850", "88491201203",
    "01200080351", "05000159407", "03800012345", "09780471486", "06414410062",
    "01650000201", "00754182014",
  ];
  // Card index -> data-digit index to bump by +1, making a single-digit error
  // the mod-10 check always catches. Untouched cards stay valid.
  const corrupt = { 1: 3, 3: 7, 4: 0, 6: 5, 8: 9, 10: 2, 11: 6 };
  const cards = [], key = [];
  bases.forEach((b, i) => {
    const d = b.split("").map(Number);
    let full = b + upcCheckDigit(d);
    let bad = false;
    if (corrupt[i] !== undefined) {
      const j = corrupt[i];
      const arr = full.split("");
      arr[j] = String((d[j] + 1) % 10);
      full = arr.join("");
      bad = true;
    }
    const shown = full.replace(/^(\d)(\d{5})(\d{5})(\d)$/, "$1 $2 $3 $4");
    cards.push(`<div class="bcard"><span class="bcard-n">${i + 1}</span><span class="bcard-code">${shown}</span></div>`);
    key.push(`<tr><td>${i + 1}</td><td>${shown}</td><td>${bad ? "Corrupted &mdash; reject" : "Valid &mdash; accept"}</td></tr>`);
  });
  const ex = "03600029145";
  const exChk = upcCheckDigit(ex.split("").map(Number));
  const style = `<style>
.rule{border:1.3pt solid var(--camp-ink);border-radius:8pt;padding:11pt 13pt;margin-bottom:12pt;font-size:9.5pt;}
.rule h4{font-family:var(--serif);color:var(--camp-ink);font-size:12.5pt;margin:0 0 5pt;}
.rule b{color:var(--camp-acc);}
.bcard-grid{display:grid;grid-template-columns:1fr 1fr;gap:9pt;}
.bcard{display:flex;align-items:center;gap:10pt;border:1.3pt solid var(--camp-ink);border-radius:6pt;padding:8pt 11pt;break-inside:avoid;}
.bcard-n{font-family:var(--mono);font-weight:700;background:var(--camp-ink);color:#fff;border-radius:4pt;padding:1pt 8pt;font-size:11pt;}
.bcard-code{font-family:var(--mono);font-weight:700;font-size:14pt;letter-spacing:.06em;color:#111;}
.bkey{border-collapse:collapse;width:100%;font-size:9.5pt;margin-top:4pt;}
.bkey th{background:var(--camp-ink);color:#fff;text-align:left;padding:4pt 7pt;font-size:8pt;text-transform:uppercase;letter-spacing:.05em;}
.bkey td{border-bottom:1pt solid var(--rule2);padding:5pt 7pt;}
.bkey td:nth-child(2){font-family:var(--mono);letter-spacing:.04em;}
.bkey td:nth-child(3){color:var(--camp-acc);font-weight:600;}
</style>`;
  if (part === "key") return `<div class="sheet">${style}
${head("PY-STEM 2026 &middot; PYB-04 Barcode Checksum Rescue", "Instructor answer key")}
<p class="note">Keep this page with the instructor. Each corrupted card has exactly one wrong digit, which the mod-10 rule always catches. Reject the corrupted codes; accept the rest.</p>
<table class="bkey"><tr><th>Card</th><th>Code</th><th>Verdict</th></tr>${key.join("")}</table></div>`;
  return `<div class="sheet">${style}
${head("PY-STEM 2026 &middot; PYB-04 Barcode Checksum Rescue", "Barcode cards and the check-digit rule")}
<div class="rule"><h4>The UPC-A check-digit rule</h4>
A product barcode has 12 digits. The last one is a <b>check digit</b> computed from the first 11 by a fixed rule, so a single mistyped digit no longer matches and the scanner rejects the code.
<ol style="margin:5pt 0 0 16pt"><li>Add the digits in the odd positions (1st, 3rd, 5th, ...) and multiply that sum by 3.</li>
<li>Add the digits in the even positions (2nd, 4th, ...).</li>
<li>Add those two results, then find what you must add to reach the next multiple of 10. That is the check digit.</li></ol>
<div style="margin-top:6pt">Worked example for <b>${ex.replace(/(\d)(\d{5})(\d{5})/, "$1 $2 $3")}</b>: the rule gives a check digit of <b>${exChk}</b>, so the full valid code is ${ex}${exChk}. Card 1 uses it.</div></div>
<div class="bcard-grid">${cards}</div></div>`;
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

// ---------- PYS-05 trials-and-median recording sheet ----------
function reactionTrials() {
  const rows = Array.from({ length: 10 }, (_, i) =>
    `<tr><td>${i + 1}</td><td></td><td></td><td></td><td></td></tr>`).join("");
  return `<div class="sheet"><style>
.rt-t{width:100%;border-collapse:collapse;font-size:10pt;margin-bottom:10pt;}
.rt-t th{background:var(--camp-ink);color:#fff;padding:5pt 6pt;font-size:7.5pt;text-transform:uppercase;letter-spacing:.04em;}
.rt-t th.grp{background:var(--camp-acc);}
.rt-t td{border:1pt solid var(--rule2);height:.28in;padding:3pt 7pt;text-align:center;}
.rt-t td:first-child{font-family:var(--mono);font-weight:700;color:var(--camp-ink);background:var(--camp-tint);width:12%;}
.rt-t tr.med td{border-top:1.6pt solid var(--camp-ink);font-weight:700;}
.rt-t tr.med td:first-child{background:#fff;text-align:right;}
.rt-meta{font-family:var(--mono);font-size:9pt;margin:2pt 0 9pt;}
</style>
${head("PY-STEM 2026 &middot; PYS-05 Reaction Time Combine", "Trials and median sheet")}
<p class="note">Catch the falling meter stick, read the catch distance in cm, then convert it to milliseconds with the reaction-time strip. Record <b>at least ten catches</b> for each condition and take the <b>median</b> (the middle value when sorted), not your best single catch. Then test one strategy and compare medians.</p>
<div class="rt-meta">Name ___________________     The ONE strategy I tested: ___________________ (for example, focus, warm up)</div>
<table class="rt-t"><thead><tr><th>Trial</th><th class="grp">Baseline catch (cm)</th><th class="grp">Baseline (ms)</th><th class="grp">Strategy catch (cm)</th><th class="grp">Strategy (ms)</th></tr></thead><tbody>${rows}<tr class="med"><td>Median</td><td></td><td></td><td></td><td></td></tr></tbody></table>
<p class="note">Did the strategy help? Compare your baseline median with your strategy median, and be ready to defend the difference with your data.</p></div>`;
}

// ---------- PYS-10 spectrum sketch sheet ----------
function spectrumSketch() {
  const bar = () => `<svg viewBox="0 0 520 54" style="width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">
<rect x="1" y="1" width="518" height="40" fill="none" stroke="#222" stroke-width="1.4"/>
${Array.from({ length: 21 }, (_, i) => `<line x1="${1 + i * 25.85}" y1="34" x2="${1 + i * 25.85}" y2="41" stroke="#cfcabf" stroke-width="0.7"/>`).join("")}
<text x="4" y="52" font-family="JetBrains Mono" font-size="8" fill="#5A564F">violet</text>
<text x="516" y="52" text-anchor="end" font-family="JetBrains Mono" font-size="8" fill="#5A564F">red</text></svg>`;
  const blocks = Array.from({ length: 6 }, (_, i) => `<div class="ss-block">
<div class="ss-src">Source ${i + 1}: <span class="ss-line"></span></div>
${bar()}
<div class="ss-row"><span>Band or lines? (circle): &nbsp; smooth rainbow &nbsp;&middot;&nbsp; broad band &nbsp;&middot;&nbsp; separate lines</span><span>My match: <span class="ss-line"></span></span></div>
</div>`).join("");
  return `<div class="sheet"><style>
.ss-block{border:1pt solid var(--rule2);border-radius:6pt;padding:8pt 11pt;margin-bottom:9pt;break-inside:avoid;}
.ss-src{font-family:var(--serif);font-weight:600;color:var(--camp-ink);font-size:11pt;margin-bottom:5pt;}
.ss-line{display:inline-block;min-width:38%;border-bottom:0.8pt solid var(--rule2);}
.ss-row{display:flex;justify-content:space-between;gap:14pt;font-size:9pt;margin-top:5pt;}
</style>
${head("PY-STEM 2026 &middot; PYS-10 Spectra Sleuth Showdown", "Spectrum sketch sheet")}
<p class="note">Look at each source through the diffraction glasses and <b>draw what you see</b> across the bar: a smooth rainbow from a hot filament, a broad colored band from a white LED, or separate bright lines from a neon or gas source. Then match each source to its clue card. Do not view the sun directly.</p>
${blocks}</div>`;
}

// Staff-only compilation of the four instructor answer keys. Stays out of
// public/files and files.json so answers never reach the public site library.
function answerKeys() {
  return [balanceCards("key"), slinkyCards("key"), museumClueCards("key"), barcodeDeck("key")]
    .join(`<div style="break-before:page"></div>`);
}

const SHEETS = [
  { slug: "PYS_01_Magnet_Maze_Boards", body: magnetMazes },
  { slug: "PYS_05_Reaction_Time_Strip", body: reactionStrip },
  { slug: "PYS_05_Trials_and_Median_Sheet", body: reactionTrials },
  { slug: "PYS_10_Spectrum_Sketch_Sheet", body: spectrumSketch },
  { slug: "PYS_08_Balance_Challenge_Cards", body: balanceCards },
  { slug: "PYS_08_Center_of_Mass_Template", body: comTemplate },
  { slug: "PYS_10_Spectrum_Reference_Cards", body: spectrumCards },
  { slug: "PYS_11_BookBot_Route_Mat", body: bookbotMat, landscape: true },
  { slug: "PYS_11_BookBot_Order_Deck", body: bookbotCards },
  { slug: "PYS_04_Heart_Rate_Recovery_Log", body: heartRateLog },
  { slug: "PYS_06_Slinky_Station_Cards", body: slinkyCards },
  { slug: "PYS_09_Hovercraft_Target_and_Rules", body: hovercraftTargetRules },
  { slug: "PYS_10_Museum_Clue_Cards", body: museumClueCards },
  { slug: "PYS_12_Ramp_Client_Spec_Cards", body: rampClientCards },
  { slug: "PYB_04_Barcode_Card_Deck", body: barcodeDeck },
  { slug: "PY_STEM_Staff_Run_Sheets", body: runSheets },
  { slug: "PY_STEM_Instructor_Answer_Keys", body: answerKeys },
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
