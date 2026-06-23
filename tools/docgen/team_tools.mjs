// Print-and-cut appendix for the From Trees to Tech instructor guide packet:
// a trigonometry-exact paper clinometer and a team route card for TTT-02
// Forest Sensor Sprint. The geometry is generated from real trig so the scale
// is correct. Styled with the packet theme via CSS variables; the protractor
// outline, ticks, and numbers are pure black so the sheet reads in grayscale.
//
// Exposed as teamToolsAppendix(); render.mjs appends it to the trees guide
// packet body (doc.id === "pk-trees-guide") after the main content.

const DEG = Math.PI / 180;
const r2 = (n) => Math.round(n * 100) / 100;

// Half circle, flat edge on top, plumb pivot at the midpoint of the flat edge
// (the circle center). 0 degrees sits at the bottom of the arc and rises to 90
// at each end of the flat edge, symmetric on both sides, so the reading equals
// the angle of elevation directly.
export function clinometerSvg() {
  const W = 640, pad = 8;
  const R = W / 2 - pad;            // 312 px = 3.25 in at 96 px/in
  const cx = W / 2;
  const cy = pad + 40;             // leave room above the flat edge for the straw
  const H = cy + R + 18;
  const e = [];

  // outline (cut line): flat top edge + lower semicircle, pure black
  e.push(`<line x1="${r2(cx - R)}" y1="${cy}" x2="${r2(cx + R)}" y2="${cy}" stroke="#000" stroke-width="2"/>`);
  e.push(`<path d="M ${r2(cx - R)} ${cy} A ${R} ${R} 0 0 0 ${r2(cx + R)} ${cy}" fill="none" stroke="#000" stroke-width="2"/>`);

  // ticks every 5 deg, numbers every 10 deg; 0 shared at bottom center
  for (let a = 0; a <= 90; a += 5) {
    const major = a % 10 === 0;
    const len = major ? 16 : 9;
    const sn = Math.sin(a * DEG), cs = Math.cos(a * DEG);
    for (const s of (a === 0 ? [0] : [1, -1])) {
      const ox = cx + s * R * sn, oy = cy + R * cs;
      const ix = cx + s * (R - len) * sn, iy = cy + (R - len) * cs;
      e.push(`<line x1="${r2(ox)}" y1="${r2(oy)}" x2="${r2(ix)}" y2="${r2(iy)}" stroke="#000" stroke-width="${major ? 1.6 : 1}"/>`);
      if (major) {
        const nr = R - len - 13;
        // Keep the topmost numbers (notably 90) clear of the flat top edge line.
        const ny = Math.max(cy + nr * cs + 4, cy + 16);
        e.push(`<text x="${r2(cx + s * nr * sn)}" y="${r2(ny)}" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="#000">${a}</text>`);
      }
    }
  }

  // center string hole (the plumb pivot)
  e.push(`<circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#000" stroke-width="1.3"/>`);
  e.push(`<circle cx="${cx}" cy="${cy}" r="1.8" fill="#000"/>`);
  e.push(`<text x="${cx + 11}" y="${cy + 17}" font-family="Inter, sans-serif" font-size="10" fill="#000">string hole (center)</text>`);

  // straw guide along the flat top edge
  e.push(`<rect x="${r2(cx - R + 34)}" y="${cy - 16}" width="${r2(2 * R - 68)}" height="7" rx="3.5" fill="none" stroke="#000" stroke-width="1" stroke-dasharray="4 3"/>`);
  e.push(`<text x="${cx}" y="${cy - 23}" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="#000">tape a straw along this edge and sight along it</text>`);

  return `<svg viewBox="0 0 ${W} ${r2(H)}" style="width:6.5in;display:block;margin:8pt auto 2pt;" xmlns="http://www.w3.org/2000/svg">${e.join("")}</svg>`;
}

export const TAN = [[10, "0.18"], [20, "0.36"], [30, "0.58"], [40, "0.84"], [45, "1.00"], [50, "1.19"], [60, "1.73"], [70, "2.75"]];

export function routeCard() {
  const cols = [
    ["Checkpoint", "18%"], ["Visit order", "10%"], ["Temp (&deg;F)", "11%"],
    ["Humidity (%)", "12%"], ["Light (relative)", "12%"], ["Soil moisture (1 to 10)", "15%"], ["Notes", "22%"],
  ];
  const rows = ["Reference (calibrate)", "A", "B", "C", "D", "E"];
  const head = cols.map(([t]) => `<th>${t}</th>`).join("");
  const colgroup = cols.map(([, w]) => `<col style="width:${w}">`).join("");
  const body = rows.map((label) =>
    `<tr><td class="tt-rc-cp">${label}</td>${"<td></td>".repeat(cols.length - 1)}</tr>`).join("");
  return `<div class="tt-card keep">
<div class="tt-rc-head">
  <div class="tt-rc-title">From Trees to Tech &middot; TTT-02 Forest Sensor Sprint &middot; Team Route Card</div>
  <div class="tt-rc-meta">Team _______________________&nbsp;&nbsp;&nbsp;Date ______________</div>
</div>
<p class="tt-rc-instr">Plan an order that avoids backtracking, take a reading at each checkpoint, then recommend the best sensor site using your numbers.</p>
<table class="tight tt-rc"><colgroup>${colgroup}</colgroup><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
<div class="tt-rc-rec">Our recommended sensor site: ___________________________________________________</div>
<div class="tt-rc-rec">Why (use your data): ___________________________________________________________</div>
<div class="tt-rc-foot">The checkpoints are the spots the instructor marked outside.</div>
</div>`;
}

export function teamToolsAppendix() {
  const css = `
.team-tools h3 { font-family: var(--serif); color: var(--camp-ink); font-size: 13pt; margin: 7pt 0 2pt; break-after: avoid; }
.team-tools .tt-note { color: var(--ink2); font-size: 9pt; margin-bottom: 4pt; }
.team-tools .tt-clino { break-inside: avoid; }
.team-tools .tt-cut { text-align: center; font-size: 8pt; color: var(--ink2); margin: 0 0 6pt; }
.team-tools .tt-cols { display: flex; gap: 22pt; margin-top: 4pt; }
.team-tools .tt-cols > div { flex: 1; }
.team-tools .tt-h { font-family: var(--mono); font-size: 8pt; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--camp-acc); margin-bottom: 3pt; }
.team-tools ol { margin: 0 0 0 14pt; font-size: 9.5pt; }
.team-tools ol li { margin: 2pt 0; break-inside: avoid; }
.team-tools .tt-formula { font-size: 9.5pt; margin-bottom: 4pt; }
.team-tools table.tt-tan { width: auto; font-size: 8.5pt; margin: 2pt 0 5pt; }
.team-tools table.tt-tan th, .team-tools table.tt-tan td { border: 0.6pt solid var(--rule2); padding: 2pt 7pt; text-align: center; font-family: var(--mono); }
.team-tools table.tt-tan th { color: var(--camp-ink); }
.team-tools .tt-eg { font-size: 9pt; color: var(--ink2); }
.team-tools .tt-card { border: 1pt solid var(--rule2); border-radius: 4pt; padding: 7pt 10pt; margin: 4pt 0; }
.team-tools .tt-rc-title { font-family: var(--serif); font-weight: 600; color: var(--camp-ink); font-size: 10.5pt; }
.team-tools .tt-rc-meta { font-family: var(--mono); font-size: 8.5pt; color: var(--ink); margin-top: 3pt; }
.team-tools .tt-rc-head { border-bottom: 2pt solid var(--camp-acc); padding-bottom: 3pt; margin-bottom: 4pt; }
.team-tools .tt-rc-instr { font-size: 8.5pt; color: var(--ink2); margin: 0 0 4pt; }
.team-tools table.tt-rc { width: 100%; font-size: 8pt; table-layout: fixed; }
.team-tools table.tt-rc th { font-family: var(--mono); font-size: 6.8pt; letter-spacing: 0.02em; color: var(--camp-ink); border-bottom: 1pt solid var(--rule2); padding: 3pt 4pt; vertical-align: bottom; }
.team-tools table.tt-rc td { border-bottom: 0.6pt solid var(--rule); height: 0.26in; padding: 1.5pt 4pt; }
.team-tools table.tt-rc td.tt-rc-cp { font-size: 7.5pt; color: var(--ink); }
.team-tools .tt-rc-rec { font-size: 9pt; margin-top: 5pt; }
.team-tools .tt-rc-foot { font-size: 7.5pt; color: var(--ink2); margin-top: 3pt; }
.team-tools .tt-cutline { text-align: center; font-size: 7pt; letter-spacing: 0.3em; color: var(--ink2); border-top: 0.8pt dashed var(--rule2); margin: 2pt 0; padding-top: 2pt; }
`;
  const assemble = [
    "Cut out the half circle along the curved outline.",
    "Tape a straight straw along the top straight edge.",
    "Punch the center dot, thread a string through it, and tie a washer or paper clip on the end as a weight.",
    "Sight the treetop through the straw, let the string hang free, then pinch it against the scale and read the number.",
    "Self-check: sight something level (reads 0) and straight up (reads 90).",
  ].map((s) => `<li>${s}</li>`).join("");

  const tanRows = TAN.map(([d, t]) => `<tr><td>${d}</td><td>${t}</td></tr>`).join("");

  return `<div class="team-tools"><style>${css}</style>
<h2 class="page-break" style="margin-top:0">Team tools: clinometer and route card</h2>

<div class="tt-clino">
<h3>Paper clinometer</h3>
${clinometerSvg()}
<p class="tt-cut">Cut along the flat top edge and the curved outline.</p>
</div>

<div class="tt-cols">
  <div>
    <p class="tt-h">Assemble</p>
    <ol>${assemble}</ol>
  </div>
  <div>
    <p class="tt-h">Find the tree height</p>
    <p class="tt-formula">Tree height = eye height + (distance to the tree &times; tan of the angle). Use the standoff distance the instructor marked.</p>
    <table class="tight tt-tan"><thead><tr><th>Angle</th><th>tan</th></tr></thead><tbody>${tanRows}</tbody></table>
    <p class="tt-eg">Example: eye height 1.5 m, distance 10 m, angle 40&deg; gives 1.5 + 10 &times; 0.84 = about 9.9 m.</p>
  </div>
</div>

<h3 class="page-break">Team route card</h3>
${routeCard()}
<div class="tt-cutline">cut here</div>
${routeCard()}
</div>`;
}

// TTT-03 Seed Dispersal Derby print-and-cut floor sheets: a real-scale (1 unit =
// 1 mm) drop-lane distance ruler and a concentric-ring landing target. Numbers
// are kept clear of the ticks and rings and the launch-line rule so the sheet
// reads cleanly when printed at 100 percent. Exposed as seedDerbyAppendix();
// render.mjs places it after the TTT-03 guide section, the same way the TTT-02
// team tools follow TTT-02.
export function dropLaneStrip() {
  const e = [];
  // The box runs to y=195.4, ~6 mm below the last tick (y=187), so the "18" label clears the bottom.
  e.push(`<rect x="0.6" y="0.6" width="148.8" height="194.8" fill="none" stroke="#2a5736" stroke-width="1.2" rx="2"/>`);
  // centimeter edge: spine at x=34, mm ticks 0..180 (major every cm, mid every 5 mm)
  e.push(`<line x1="34" y1="7" x2="34" y2="187" stroke="#000" stroke-width="1.3"/>`);
  for (let mm = 0; mm <= 180; mm++) {
    const y = 7 + mm, major = mm % 10 === 0, mid = mm % 10 === 5;
    e.push(`<line x1="34" y1="${y}" x2="${major ? 50 : mid ? 43 : 39}" y2="${y}" stroke="#000" stroke-width="${major ? 1.3 : 0.7}"/>`);
  }
  for (let k = 0; k <= 18; k++) {   // numbers centered on their cm tick line, sitting left of the spine
    e.push(`<text x="29" y="${7 + k * 10}" text-anchor="end" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="5.5" font-weight="700" fill="#000">${k}</text>`);
  }
  // inch edge (backup): spine at x=116, quarter-inch ticks 0..28 (major every inch, mid every half)
  e.push(`<line x1="116" y1="7" x2="116" y2="187" stroke="#000" stroke-width="1.3"/>`);
  for (let q = 0; q <= 28; q++) {
    const y = r2(7 + q * 6.35), major = q % 4 === 0, half = q % 4 === 2;
    e.push(`<line x1="${major ? 100 : half ? 107 : 111}" y1="${y}" x2="116" y2="${y}" stroke="#000" stroke-width="${major ? 1.3 : 0.7}"/>`);
  }
  for (let k = 0; k <= 7; k++) {   // inch numbers centered on their tick line, sitting right of the spine
    e.push(`<text x="121" y="${r2(7 + k * 25.4)}" text-anchor="start" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="5.5" font-weight="700" fill="#000">${k}</text>`);
  }
  // launch line at 0 and the cm / in orientation labels
  e.push(`<line x1="30" y1="7" x2="120" y2="7" stroke="#000" stroke-width="2"/>`);
  e.push(`<text x="75" y="19" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6.5" font-weight="700" fill="#000">LAUNCH LINE</text>`);
  e.push(`<text x="62" y="40" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6.5" font-weight="700" fill="#000">&larr; cm</text>`);
  e.push(`<text x="88" y="40" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6.5" font-weight="700" fill="#000">in &rarr;</text>`);
  return `<svg viewBox="0 0 150 196" width="150mm" height="196mm" preserveAspectRatio="xMidYMin meet" style="display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">${e.join("")}</svg>`;
}

export function landingTarget() {
  const e = [];
  e.push(`<rect x="4" y="4" width="592" height="592" fill="none" stroke="#2a5736" stroke-width="3" rx="6"/>`);
  for (const r of [250, 185, 120, 55]) e.push(`<circle cx="300" cy="300" r="${r}" fill="none" stroke="#000" stroke-width="3"/>`);
  e.push(`<circle cx="300" cy="300" r="4" fill="#000"/>`);
  for (const [x1, y1, x2, y2] of [[300, 50, 300, 72], [300, 550, 300, 528], [50, 300, 72, 300], [550, 300, 528, 300]])
    e.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="2"/>`);
  for (const [n, y] of [["1", 95], ["2", 156.5], ["3", 221.5], ["4", 286]])
    e.push(`<text x="300" y="${y}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" fill="#000">${n}</text>`);
  return `<svg viewBox="0 0 600 600" width="4.5in" height="4.5in" style="display:block;margin:6pt auto" xmlns="http://www.w3.org/2000/svg">${e.join("")}</svg>`;
}

export function seedDerbyAppendix() {
  const css = `
.seed-derby h3 { font-family: var(--serif); color: var(--camp-ink); font-size: 13pt; margin: 7pt 0 2pt; break-after: avoid; }
.seed-derby .sd-note { color: var(--ink2); font-size: 9pt; margin: 0 0 4pt; }
.seed-derby .sd-sheet { break-inside: avoid; text-align: center; }
.seed-derby .sd-legend { display: flex; gap: 9pt; margin: 6pt 0 0; font-size: 8.5pt; }
.seed-derby .sd-legend > div { flex: 1; border: 0.8pt solid var(--rule2); border-radius: 3pt; padding: 4pt 6pt; }
.seed-derby .sd-legend b { color: var(--camp-ink); font-family: var(--mono); }
`;
  const rings = [
    ["Ring 1", "Outer ring. Your seed touched the target."],
    ["Ring 2", "Good aim. Getting closer."],
    ["Ring 3", "Close to the center."],
    ["Ring 4", "Bullseye, right on the dot."],
  ].map(([t, d]) => `<div><b>${t}</b><br>${d}</div>`).join("");
  return `<div class="seed-derby"><style>${css}</style>
<h2 class="page-break" style="margin-top:0">Print and cut: TTT-03 floor scale and target</h2>
<p class="sd-note">Print at 100% (not "fit to page") on cardstock so the centimeter ruler stays true to size. Tape the strip flat down the lane with the <b>0</b> end at the launch line; for a longer lane print several strips and tape them head to tail.</p>
<h3>Drop-lane distance strip</h3>
<div class="sd-sheet">${dropLaneStrip()}</div>

<h3 class="page-break">Landing-zone target</h3>
<p class="sd-note">Lay the target flat where staff pick down the lane and line the crosshairs up with the lane center. A higher ring number is a better landing.</p>
<div class="sd-sheet">${landingTarget()}</div>
<div class="sd-legend">${rings}</div>
</div>`;
}

// TTT-01 daily voltage log: the per-team sheet teams write a reading on each day
// of the week. Exposed as voltageLogAppendix(); render.mjs appends it after the
// TTT-01 guide section so the instructor guide keeps a record of every printable.
export function voltageLogAppendix() {
  const css = `
.vlog-apx h3 { font-family: var(--serif); color: var(--camp-ink); font-size: 13pt; margin: 7pt 0 3pt; break-after: avoid; }
.vlog-apx .va-note { color: var(--ink2); font-size: 9pt; margin: 0 0 6pt; }
.vlog-apx .va-hdr { display: flex; gap: 20pt; font-family: var(--mono); font-size: 9pt; margin: 6pt 0 4pt; }
.vlog-apx .va-hdr .fill { border-bottom: 1pt solid var(--rule2); min-width: 130pt; display: inline-block; }
.vlog-apx table { width: 100%; font-size: 10pt; border-collapse: collapse; }
.vlog-apx th { font-family: var(--mono); font-size: 7.5pt; letter-spacing: .06em; text-transform: uppercase; color: var(--camp-ink); border-bottom: 1.4pt solid #000; padding: 5pt; text-align: left; }
.vlog-apx td { border-bottom: 1pt solid #000; height: .4in; padding: 5pt; }
.vlog-apx tr.peak td { border-top: 1.6pt solid #000; font-weight: 700; }
`;
  const days = ["Mon Jun 22", "Tue Jun 23", "Wed Jun 24", "Thu Jun 25", "Fri Jun 26"];
  const rows = days
    .map((d) => `<tr><td style="font-family:var(--mono);font-size:9pt">${d}</td><td></td><td></td><td></td></tr>`)
    .join("");
  return `<div class="vlog-apx"><style>${css}</style>
<h2 class="page-break" style="margin-top:0">Print: TTT-01 daily voltage log</h2>
<p class="va-note">One per team, on cardstock (or a sheet protector for dry-erase). Each day, set the multimeter to DC millivolts and read the voltage across the 100 k&#8486; resistor at the same time; the cell is weak on day 1 and climbs as the biofilm grows. Defend the design with the trend, not one number.</p>
<h3>Daily voltage log</h3>
<div class="va-hdr"><span>Team <span class="fill"></span></span><span>The ONE variable we are testing <span class="fill"></span></span></div>
<table><thead><tr><th style="width:24%">Day</th><th style="width:18%">Time</th><th style="width:24%">Voltage <span style="text-transform:none">(mV)</span></th><th style="width:34%">Notes</th></tr></thead>
<tbody>${rows}<tr class="peak"><td>Peak reading</td><td></td><td></td><td>Day of peak</td></tr></tbody></table>
</div>`;
}

// TTT-02 standoff floor marker: the "stand here" sign placed at the pre-marked
// tree-height distance. Exposed as standoffAppendix(); render.mjs appends it after
// the TTT-02 team tools so the guide records this printable too.
export function standoffAppendix() {
  const css = `
.standoff-apx h3 { font-family: var(--serif); color: var(--camp-ink); font-size: 13pt; margin: 7pt 0 3pt; break-after: avoid; }
.standoff-apx .so-note { color: var(--ink2); font-size: 9pt; margin: 0 0 6pt; }
.standoff-apx .so-sign { min-height: 7.4in; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 14pt; border: 1pt solid var(--rule2); border-radius: 6pt; padding: 24pt; }
.standoff-apx .so-chip { font-family: var(--mono); font-size: 11pt; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--ink); border: 1px solid var(--rule2); border-radius: 999px; padding: 5pt 16pt; }
.standoff-apx .so-rule { width: 64pt; border-top: 3px solid var(--camp-acc); }
.standoff-apx .so-sub { font-family: var(--serif); font-style: italic; font-size: 17pt; color: var(--ink2); max-width: 30ch; }
.standoff-apx .so-big { font-family: var(--serif); font-weight: 600; font-size: 52pt; color: var(--camp-ink); line-height: 1.02; }
.standoff-apx .so-foot { font-size: 11pt; color: var(--ink2); max-width: 42ch; }
`;
  return `<div class="standoff-apx"><style>${css}</style>
<h2 class="page-break" style="margin-top:0">Print: TTT-02 standoff floor marker</h2>
<p class="so-note">One per tree, on cardstock (laminate; it sits on the ground). Place it at the distance you pre-mark from the tree base with the long tape.</p>
<div class="so-sign">
<div class="so-chip">From Trees to Tech 2026 &middot; TTT-02</div>
<div class="so-rule"></div>
<div class="so-sub">Tree-height station</div>
<div class="so-big">Stand here</div>
<div class="so-sub">Sight the treetop through your clinometer straw from this mark.</div>
<div class="so-foot">This mark is a measured distance from the tree base. Write that distance here: __________ m, then use it in your tree-height formula.</div>
</div>
</div>`;
}

// ---- TTT-05 Greenhouse Climate Controller: print-and-cut game pieces ----------
// The card-and-board set for the greenhouse matching game. Three generators,
// reused by camp-prep/print/build_print.mjs for the standalone Day-2 print files
// and bundled by greenhouseControllerAppendix() so the TTT-05 guide records them
// (mirrors teamToolsAppendix for TTT-02). Climate scales print pure black (#000)
// so they survive grayscale; the rest uses the camp palette.
//
// Verified climate needs (deep research: UMass, AOS, Clemson, UF/IFAS, UC IPM):
// fern = cool, humid, shaded (never direct sun); moth orchid = warm, humid, bright
// but FILTERED (full sun is a myth); cactus = warm, dry, very bright. Ranges are
// daytime; teams gather the live zone readings on the tour and match on evidence.
const GH_PLANTS = [
  { name: "Fern",
    temp: [16, 24], tempT: "cool to warm, 16 to 24 &deg;C (60 to 75 &deg;F)",
    humid: [55, 90], humidT: "high, 50% or more; likes damp air",
    light: [12, 42], lightT: "shade or bright indirect; never direct sun",
    wants: "Damp air and shade, like a forest floor.",
    avoid: "Direct sun and dry air crisp the fronds." },
  { name: "Moth orchid",
    temp: [24, 30], tempT: "warm, 24 to 29 &deg;C (75 to 85 &deg;F) by day, above 16 &deg;C (60 &deg;F) at night",
    humid: [50, 80], humidT: "humid, 50 to 80%, with some air movement",
    light: [38, 66], lightT: "medium; bright but filtered, no direct beam",
    wants: "Warm, humid air and bright, filtered light.",
    avoid: "Full direct sun scorches the leaves (the orchid-loves-sun myth)." },
  { name: "Cactus",
    temp: [24, 34], tempT: "warm days, big day-to-night swing, 24 to 34 &deg;C (75 to 90 &deg;F)",
    humid: [8, 35], humidT: "low; dry air and fast-draining soil",
    light: [80, 100], lightT: "very high; full, direct sun",
    wants: "Hot, bright, dry air like a desert shelf.",
    avoid: "Damp, shady air rots the roots." },
];

// A labelled scale with the plant's preferred band drawn as a thick black segment
// over a thin black baseline (no fill, so it survives grayscale with no printBackground).
function ghNeedBar(label, smin, smax, lo, hi, text) {
  const pct = (v) => Math.max(0, Math.min(100, ((v - smin) / (smax - smin)) * 100));
  const l = pct(lo), w = pct(hi) - pct(lo);
  return `<div class="gh-need"><span class="gh-need-l">${label}</span>` +
    `<span class="gh-track"><span class="gh-band" style="left:${l.toFixed(1)}%;width:${w.toFixed(1)}%"></span></span>` +
    `<span class="gh-need-v">${text}</span></div>`;
}

const GH_CSS = `
.ghc h3 { font-family: var(--serif); color: var(--camp-ink); font-size: 13pt; margin: 8pt 0 2pt; break-after: avoid; }
.ghc .gh-note { color: var(--ink2); font-size: 9pt; margin: 0 0 7pt; }
.ghc .gh-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10pt; }
.ghc .gh-card { border: 1.2pt solid var(--rule2); border-radius: 5pt; padding: 8pt 10pt; break-inside: avoid; }
.ghc .gh-card-h { border-bottom: 1.4pt solid var(--camp-acc); padding-bottom: 4pt; margin-bottom: 5pt; }
.ghc .gh-card-h .n { font-family: var(--serif); font-weight: 600; font-size: 13pt; color: var(--camp-ink); }
.ghc .gh-need { display: flex; align-items: center; gap: 7pt; margin: 3.5pt 0; }
.ghc .gh-need-l { font-family: var(--mono); font-size: 6.6pt; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--camp-ink); width: 50pt; flex: 0 0 50pt; }
.ghc .gh-track { position: relative; flex: 0 0 66pt; height: 7pt; }
.ghc .gh-track::before { content: ""; position: absolute; left: 0; right: 0; top: 3pt; border-top: 1pt solid #000; }
.ghc .gh-band { position: absolute; top: 1pt; height: 0; border-top: 4.5pt solid #000; }
.ghc .gh-need-v { font-size: 8pt; color: var(--ink); flex: 1; }
.ghc .gh-tag { font-size: 8pt; color: var(--ink2); margin-top: 5pt; line-height: 1.4; }
.ghc .gh-tag b { color: var(--camp-ink); font-family: var(--mono); font-size: 6.6pt; letter-spacing: .06em; text-transform: uppercase; }
.ghc table.gh-tbl { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 4pt; }
.ghc table.gh-tbl th { font-family: var(--mono); font-size: 7pt; letter-spacing: .05em; text-transform: uppercase; color: var(--camp-ink); border-bottom: 1.4pt solid #000; padding: 4pt 5pt; text-align: left; }
.ghc table.gh-tbl td { border-bottom: 1pt solid #000; height: .42in; padding: 4pt 5pt; vertical-align: top; }
.ghc .gh-set { display: flex; gap: 16pt; flex-wrap: wrap; margin: 6pt 0 2pt; }
.ghc .gh-dial { flex: 1; min-width: 150pt; }
.ghc .gh-dial .dl { font-family: var(--mono); font-size: 7pt; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--camp-ink); margin-bottom: 11pt; }
.ghc .gh-scale { position: relative; height: 0; border-top: 1.2pt solid #000; margin: 0 7pt; }
.ghc .gh-scale .tk { position: absolute; top: -4pt; width: 0; border-left: 1pt solid #000; height: 8pt; }
.ghc .gh-scale .tl { position: absolute; top: 7pt; font-family: var(--mono); font-size: 6pt; color: var(--ink); white-space: nowrap; }
.ghc .gh-mark { font-size: 7.5pt; color: var(--ink2); text-align: center; margin-top: 18pt; }
`;

// One labelled tick scale on the dial board (mark your pointer with a dry-erase pen).
function ghDial(label, ticks) {
  const n = ticks.length;
  const marks = ticks.map((t, i) => {
    const x = (i / (n - 1)) * 100;
    // Anchor the end labels inward: left-align the first and right-align the last
    // so they do not spill off the scale ends; center the middle ones.
    const pos = i === 0 ? "left:0;transform:none"
      : i === n - 1 ? "left:100%;transform:translateX(-100%)"
      : `left:${x}%;transform:translateX(-50%)`;
    return `<span class="tk" style="left:${x}%"></span><span class="tl" style="${pos}">${t}</span>`;
  }).join("");
  return `<div class="gh-dial"><div class="dl">${label}</div><div class="gh-scale">${marks}</div>` +
    `<div class="gh-mark">mark your setting with a dry-erase pen</div></div>`;
}

// Plant profile cards: one set (cut apart), what each plant needs.
export function plantProfileCards() {
  const cards = GH_PLANTS.map((p) => `<div class="gh-card">
<div class="gh-card-h"><span class="n">${p.name}</span></div>
${ghNeedBar("Temp", 10, 40, p.temp[0], p.temp[1], p.tempT)}
${ghNeedBar("Humidity", 0, 100, p.humid[0], p.humid[1], p.humidT)}
${ghNeedBar("Light", 0, 100, p.light[0], p.light[1], p.lightT)}
<div class="gh-tag"><b>Wants</b> ${p.wants}<br><b>Avoid</b> ${p.avoid}</div>
</div>`).join("");
  return `<div class="ghc"><style>${GH_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-05 Greenhouse Climate Controller</div><div class="sheet-title">Plant profile cards</div></div>
<p class="gh-note">Each card says what one plant needs. Match it to the greenhouse zone whose tour readings fit, then defend the placement with a clue from the tour.</p>
<div class="gh-cards">${cards}
<div class="gh-card" style="display:flex;flex-direction:column;justify-content:center">
<div class="gh-card-h"><span class="n">How to read a card</span></div>
<div class="gh-tag" style="margin-top:0">The thick black bar on each scale is the plant's happy range. <b style="display:block;margin-top:5pt">Temp</b> 10 to 40 &deg;C. <b style="display:block;margin-top:3pt">Humidity</b> 0 to 100%. <b style="display:block;margin-top:3pt">Light</b> shade on the left to full sun on the right. A plant in the wrong zone tells you how it suffers: too dry wilts, too bright scorches, too damp molds.</div>
</div>
</div></div>`;
}

// Control dial board: one per team. Set the three dials and record placements.
export function climateDialBoard() {
  const rows = ["Fern", "Moth orchid", "Cactus", ""].map((p) =>
    `<tr><td style="font-family:var(--serif);color:var(--camp-ink)">${p || "&nbsp;"}</td><td></td><td></td><td></td><td></td></tr>`).join("");
  return `<div class="ghc"><style>${GH_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-05 Greenhouse Climate Controller</div><div class="sheet-title">Control dial board</div></div>
<p class="gh-note">Set each dial for the plant you are placing, then record where each plant goes and the tour clue that backs it.</p>
<div class="gh-set">
${ghDial("Temperature (&deg;C)", ["10", "20", "30", "40"])}
${ghDial("Humidity (% RH)", ["0", "25", "50", "75", "100"])}
${ghDial("Light", ["shade", "filtered", "bright", "full sun"])}
</div>
<h3>Placements: defend each one with a tour clue</h3>
<table class="gh-tbl"><thead><tr><th style="width:18%">Plant</th><th style="width:20%">Zone you chose</th><th style="width:13%">Temp</th><th style="width:13%">Humidity</th><th style="width:12%">Light</th><th>Tour clue that supports it</th></tr></thead><tbody>${rows}</tbody></table>
</div>`;
}

// Tour clue sheet: the zoned evidence instrument teams fill in during the tour.
export function tourClueSheet() {
  const zones = ["Main greenhouse", "Hoop house", "Shaded bench", "Bright bench", "", ""];
  const rows = zones.map((z) =>
    `<tr><td style="font-family:var(--serif);color:var(--camp-ink)">${z || "&nbsp;"}</td><td></td><td></td><td></td><td></td></tr>`).join("");
  return `<div class="ghc"><style>${GH_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-05 Greenhouse Climate Controller</div><div class="sheet-title">Tour clue sheet</div></div>
<p class="gh-note">As you tour, record what you see, feel, and hear for each zone: warm or cool, damp or dry, bright or shaded, plus any reading the docent points out. Back at the table this is your evidence for matching plants to zones.</p>
<table class="gh-tbl"><thead><tr><th style="width:20%">Greenhouse zone</th><th style="width:18%">Temperature</th><th style="width:18%">Humidity (damp/dry)</th><th style="width:18%">Light (shade/bright)</th><th>What the docent said / evidence</th></tr></thead><tbody>${rows}</tbody></table>
<p class="gh-note" style="margin-top:8pt">Tip: you do not need exact numbers. "Warmer and more humid than the hoop house" is good evidence. Use the control-system or weather-station readout if the docent shows one.</p>
</div>`;
}

// Bundle all three for the TTT-05 instructor guide (mirrors teamToolsAppendix).
// Student-facing print sheets only: each sheet carries its own title and student
// usage note, so the wrapper adds no print logistics (counts, stock, laminate,
// spares). Those live in the camp-prep print plan and Day-of facilitation docs.
export function greenhouseControllerAppendix() {
  return `<div style="page-break-before:always"></div>
${plantProfileCards()}
<div style="page-break-before:always"></div>
${climateDialBoard()}
<div style="page-break-before:always"></div>
${tourClueSheet()}`;
}
