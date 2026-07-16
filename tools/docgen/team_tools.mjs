// Print-and-cut sheet builders for both camps: student-facing game pieces,
// data sheets, and templates. Each top-level builder returns one standalone
// sheet (or a small bundle of sheets) that tools/docgen/build_trees.mjs and
// tools/docgen/build_pystem.mjs render into the standalone printables the
// site library serves. Guides and packets carry NO embedded printables; every
// sheet ships only as its own student-facing PDF. Print logistics (copy
// counts, stock, lamination) live in the operator camp-prep checklists, never
// on the sheets themselves.
//
// The TTT-02 clinometer below is trigonometry-exact so the scale is correct.
// Scales, ticks, and numbers are pure black so the sheets read in grayscale.

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

  // Outline (cut line): flat top edge + lower semicircle, pure black.
  e.push(`<line x1="${r2(cx - R)}" y1="${cy}" x2="${r2(cx + R)}" y2="${cy}" stroke="#000" stroke-width="2"/>`);
  e.push(`<path d="M ${r2(cx - R)} ${cy} A ${R} ${R} 0 0 0 ${r2(cx + R)} ${cy}" fill="none" stroke="#000" stroke-width="2"/>`);

  // Ticks every 5 deg, numbers every 10 deg; 0 shared at bottom center.
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

  // Center string hole (the plumb pivot).
  e.push(`<circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#000" stroke-width="1.3"/>`);
  e.push(`<circle cx="${cx}" cy="${cy}" r="1.8" fill="#000"/>`);
  e.push(`<text x="${cx + 11}" y="${cy + 17}" font-family="Inter, sans-serif" font-size="10" fill="#000">string hole (center)</text>`);

  // Straw guide along the flat top edge.
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
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-02 Forest Sensor Sprint</div><div class="sheet-title">Paper clinometer</div></div>

<div class="tt-clino">
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

<div style="page-break-before:always"></div>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-02 Forest Sensor Sprint</div><div class="sheet-title">Team route card</div></div>
${routeCard()}
<div class="tt-cutline">cut here</div>
${routeCard()}
</div>`;
}

// TTT-03 Seed Dispersal Derby print-and-cut floor sheets: a real-scale (1 unit =
// 1 mm) drop-lane distance ruler and a concentric-ring landing target. Numbers
// are kept clear of the ticks and rings and the launch-line rule so the sheet
// reads cleanly when printed at 100 percent. Exposed as seedDerbyAppendix();
// build_trees.mjs renders it as the standalone TTT-03 printable.
export function dropLaneStrip(startCm = 0) {
  const segmentLengthCm = 18;
  const endCm = startCm + segmentLengthCm;
  const e = [];
  // The box runs to y=195.4, ~6 mm below the last tick (y=187), so the "18" label clears the bottom.
  e.push(`<rect x="0.6" y="0.6" width="148.8" height="194.8" fill="none" stroke="#2a5736" stroke-width="1.2" rx="2"/>`);
  // Centimeter edge: spine at x=34, mm ticks 0..180 (major every cm, mid every 5 mm).
  e.push(`<line x1="34" y1="7" x2="34" y2="187" stroke="#000" stroke-width="1.3"/>`);
  for (let mm = 0; mm <= 180; mm++) {
    const y = 7 + mm, major = mm % 10 === 0, mid = mm % 10 === 5;
    e.push(`<line x1="34" y1="${y}" x2="${major ? 50 : mid ? 43 : 39}" y2="${y}" stroke="#000" stroke-width="${major ? 1.3 : 0.7}"/>`);
  }
  for (let k = 0; k <= segmentLengthCm; k++) {   // numbers centered on their cm tick line, sitting left of the spine
    e.push(`<text x="29" y="${7 + k * 10}" text-anchor="end" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="5.5" font-weight="700" fill="#000">${startCm + k}</text>`);
  }
  // Inch edge (backup): preserve cumulative distance across sequential tiles.
  e.push(`<line x1="116" y1="7" x2="116" y2="187" stroke="#000" stroke-width="1.3"/>`);
  const firstQuarterInch = Math.ceil((startCm / 2.54) * 4);
  const lastQuarterInch = Math.floor((endCm / 2.54) * 4);
  for (let q = firstQuarterInch; q <= lastQuarterInch; q++) {
    const y = r2(7 + ((q / 4) * 25.4) - (startCm * 10));
    const major = q % 4 === 0, half = q % 4 === 2;
    e.push(`<line x1="${major ? 100 : half ? 107 : 111}" y1="${y}" x2="116" y2="${y}" stroke="#000" stroke-width="${major ? 1.3 : 0.7}"/>`);
    if (major) {
      e.push(`<text x="121" y="${y}" text-anchor="start" dominant-baseline="central" font-family="JetBrains Mono, monospace" font-size="5.5" font-weight="700" fill="#000">${q / 4}</text>`);
    }
  }
  // Every tile has an exact alignment edge; only tile 1 is the launch line.
  e.push(`<line x1="30" y1="7" x2="120" y2="7" stroke="#000" stroke-width="2"/>`);
  e.push(`<line x1="30" y1="187" x2="120" y2="187" stroke="#000" stroke-width="2"/>`);
  e.push(`<text x="75" y="19" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6.5" font-weight="700" fill="#000">${startCm === 0 ? "LAUNCH LINE" : `ALIGN AT ${startCm} CM`}</text>`);
  e.push(`<text x="62" y="40" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6.5" font-weight="700" fill="#000">&larr; cm</text>`);
  e.push(`<text x="88" y="40" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6.5" font-weight="700" fill="#000">in &rarr;</text>`);
  e.push(`<text x="75" y="193" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="4.5" font-weight="700" fill="#000">CONTINUE AT ${endCm} CM</text>`);
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
  const lanePages = [0, 18, 36, 54, 72, 90].map((startCm, index) => `${index > 0 ? `<div style="page-break-before:always"></div>` : ""}
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-03 Seed Dispersal Derby</div><div class="sheet-title">Drop-lane strip &middot; ${startCm}&ndash;${startCm + 18} cm</div></div>
<p class="sd-note">Print at <b>100%</b>. ${index === 0 ? "Put 0 at the launch line." : `Align this page's ${startCm} cm edge with the previous page.`} Tape the pages flat in number order; use a long tape for a lane beyond 108 cm.</p>
<div class="sd-sheet">${dropLaneStrip(startCm)}</div>`).join("");
  return `<div class="seed-derby"><style>${css}</style>
${lanePages}
<div style="page-break-before:always"></div>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-03 Seed Dispersal Derby</div><div class="sheet-title">Landing-zone target</div></div>
<p class="sd-note">Lay the target flat where staff pick down the lane and line the crosshairs up with the lane center. A higher ring number is a better landing.</p>
<div class="sd-sheet">${landingTarget()}</div>
<div class="sd-legend">${rings}</div>
</div>`;
}

// TTT-01 daily voltage log: the per-team sheet teams write a reading on each day
// of the week. Day rows use generic weekday labels (not camp-week dates) so the
// sheet reuses across seasons. Exposed as voltageLogAppendix(); build_trees.mjs
// renders it as the standalone TTT-01 printable.
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
  const days = ["Day 1 (Mon)", "Day 2 (Tue)", "Day 3 (Wed)", "Day 4 (Thu)", "Day 5 (Fri)"];
  const rows = days
    .map((d) => `<tr><td style="font-family:var(--mono);font-size:9pt">${d}</td><td></td><td></td><td></td></tr>`)
    .join("");
  return `<div class="vlog-apx"><style>${css}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-01 Mud Battery Bioelectric League</div><div class="sheet-title">Daily voltage log</div></div>
<p class="va-note">Each day, set the multimeter to DC millivolts and read the voltage across the 100 k&#8486; resistor at the same time; the cell is weak on day 1 and climbs as the biofilm grows. Defend the design with the trend, not one number.</p>
<div class="va-hdr"><span>Team <span class="fill"></span></span><span>The ONE variable we are testing <span class="fill"></span></span></div>
<table><thead><tr><th style="width:24%">Day</th><th style="width:18%">Time</th><th style="width:24%">Voltage <span style="text-transform:none">(mV)</span></th><th style="width:34%">Notes</th></tr></thead>
<tbody>${rows}<tr class="peak"><td>Peak reading</td><td></td><td></td><td>Day of peak</td></tr></tbody></table>
</div>`;
}

// TTT-02 standoff floor marker: the "stand here" sign placed at the pre-marked
// tree-height distance. Exposed as standoffAppendix(); build_trees.mjs renders
// it as its own standalone TTT-02 printable.
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
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-02 Forest Sensor Sprint</div><div class="sheet-title">Standoff floor marker</div></div>
<p class="so-note">This sign sits at the measured distance from the tree base, marked out with the long tape.</p>
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
// reused by camp-prep/print/build_print.mjs for the operator-local Day-2 print
// files and bundled by greenhouseControllerAppendix() for the standalone TTT-05
// printable built by build_trees.mjs. Climate scales print pure black (#000)
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

// Bundle all three as the standalone TTT-05 printable (build_trees.mjs).
// Student-facing print sheets only: each sheet carries its own title and student
// usage note, so the wrapper adds no print logistics (counts, stock, laminate,
// spares). Those live in the camp-prep print plan and Day-of facilitation docs.
export function greenhouseControllerAppendix() {
  return `${plantProfileCards()}
<div style="page-break-before:always"></div>
${climateDialBoard()}
<div style="page-break-before:always"></div>
${tourClueSheet()}`;
}

// ---- TTT-10 Tree Ring Climate Detective: print-and-cut game pieces -------------
// Ring cards (cross-sections to read), a recording board, and claim-evidence
// cards. The cards are student-facing: each shows a pattern and a card letter,
// never the answer. The staff-only key describes an authored practice code, not
// a real-tree attribution. Real dendrochronology cross-dates many trees and
// calibrates ring measurements against local records; relationships depend on
// species and site.
export const RING_CARDS = [
  {
    id: "A",
    widths: [2, 2, 2, 2, 2, 2, 2, 2],
    model: "Steady model conditions: eight similar-width annual bands.",
  },
  {
    id: "B",
    widths: [2, 3, 2, 1, 1, 1, 1, 3, 2],
    model: "Model stress run followed by recovery: four narrow bands, then a wide band.",
  },
  {
    id: "C",
    widths: [2, 3, 2, 2, 1, 1, 2, 3],
    scar: 4,
    model: "Model disturbance and recovery: a black-marked band, a narrow run, then wider bands.",
  },
  {
    id: "D",
    widths: [1, 1, 1, 1, 1, 3, 3, 3],
    model: "Model release or recovery: five narrow bands followed by three wide bands.",
  },
  {
    id: "E",
    widths: [3, 3, 3, 2, 2, 1, 1, 1],
    model: "Model increasing stress: a sequence that shifts from wide to narrow bands.",
  },
  {
    id: "F",
    widths: [3, 2, 1, 1, 2, 3, 1, 2],
    scar: 6,
    model: "Mixed model history: changing widths plus one black-marked disturbance band.",
  },
];

const TR_CSS = `
.trc h3 { font-family: var(--serif); color: var(--camp-ink); font-size: 13pt; margin: 8pt 0 2pt; break-after: avoid; }
.trc .tr-note { color: var(--ink2); font-size: 9pt; margin: 0 0 8pt; }
.trc .tr-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12pt; }
.trc .tr-card { border: 1.2pt solid var(--rule2); border-radius: 5pt; padding: 8pt 8pt 6pt; break-inside: avoid; text-align: center; }
.trc .tr-card .lab { font-family: var(--mono); font-size: 7pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--camp-ink); }
.trc .tr-card .ttl { font-family: var(--serif); font-size: 11pt; color: var(--ink); margin-bottom: 2pt; }
.trc .tr-card svg { width: 2.4in; height: auto; display: block; margin: 2pt auto 0; }
.trc .tr-card .cap { font-size: 7pt; color: var(--ink2); margin-top: 1pt; }
.trc table.tr-tbl { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 4pt; }
.trc table.tr-tbl th { font-family: var(--mono); font-size: 7pt; letter-spacing: .05em; text-transform: uppercase; color: var(--camp-ink); border-bottom: 1.4pt solid #000; padding: 4pt 5pt; text-align: left; }
.trc table.tr-tbl td { border-bottom: 1pt solid #000; height: .42in; padding: 4pt 5pt; vertical-align: top; font-size: 9pt; }
.trc .ce-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12pt; }
.trc .ce-card { border: 1.2pt dashed var(--rule2); border-radius: 5pt; padding: 9pt 10pt; break-inside: avoid; }
.trc .ce-card .ce-h { font-family: var(--mono); font-size: 7pt; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--camp-acc); }
.trc .ce-card .ce-row { font-size: 9pt; color: var(--ink); margin-top: 7pt; }
.trc .ce-card .ce-row b { color: var(--camp-ink); }
.trc .ce-card .ce-line { border-bottom: 1pt solid #000; height: .34in; }
`;

// One half-cookie cross-section. A pith hub sits at the flat-edge center so the
// innermost years are not crammed to a point; then one SHADED BAND per year runs
// out to the bold bark arc, bands alternating light gray and white and divided by
// black ring lines. Shading each year as a band (not just boundary arcs) makes it
// easy to tell one ring from the next and to compare how wide each is, the two
// things bare arcs made hard near the center. A scar is a bold ring line plus a
// solid wedge cut into that year. Band widths stay proportional to the ring
// widths. SVG path fills (not CSS backgrounds) render regardless of
// printBackground, and the black ring lines keep years separated on a grayscale
// copy even if the gray fades.
export function ringCookie(widths, scar = -1) {
  const W = 320, pad = 12;
  const cx = W / 2, top = pad + 6;
  const Rmax = W / 2 - pad;
  const r0 = 16; // pith hub radius, so the first few years are not pinched at the center
  const total = widths.reduce((a, b) => a + b, 0);
  let cum = 0;
  const radii = widths.map((w) => { cum += w; return r0 + (cum / total) * (Rmax - r0); });
  const H = top + Rmax + 8;
  const arc = (r, sw) => `<path d="M ${r2(cx - r)} ${top} A ${r2(r)} ${r2(r)} 0 0 0 ${r2(cx + r)} ${top}" fill="none" stroke="#000" stroke-width="${sw}"/>`;
  // Filled half-annulus between inner radius ri and outer radius ro.
  const band = (ri, ro, fill) => `<path d="M ${r2(cx - ro)} ${top} A ${r2(ro)} ${r2(ro)} 0 0 0 ${r2(cx + ro)} ${top} L ${r2(cx + ri)} ${top} A ${r2(ri)} ${r2(ri)} 0 0 1 ${r2(cx - ri)} ${top} Z" fill="${fill}" stroke="none"/>`;
  const e = [];
  // Year bands, inner to outer, alternating tone.
  let prev = r0;
  radii.forEach((r, i) => { e.push(band(prev, r, i % 2 === 0 ? "#d6d6d6" : "#ffffff")); prev = r; });
  // Ring lines between years (the scarred year's outer line is bold).
  radii.slice(0, -1).forEach((r, i) => e.push(arc(r, i === scar ? 2.6 : 1.1)));
  // Bold bark arc and the flat cut-face edge.
  e.push(arc(Rmax, 2.8));
  e.push(`<line x1="${r2(cx - Rmax)}" y1="${top}" x2="${r2(cx + Rmax)}" y2="${top}" stroke="#000" stroke-width="1.6"/>`);
  // Pith hub (small white half-disk) and pith dot.
  e.push(`<path d="M ${r2(cx - r0)} ${top} A ${r2(r0)} ${r2(r0)} 0 0 0 ${r2(cx + r0)} ${top} Z" fill="#fff" stroke="#000" stroke-width="1.1"/>`);
  e.push(`<circle cx="${cx}" cy="${top}" r="2.8" fill="#000"/>`);
  // Scar: a solid wedge cut from the outer line of the scarred year inward.
  if (scar >= 0 && scar < radii.length) {
    const ro = radii[scar], ri = scar === 0 ? r0 : radii[scar - 1];
    const y0 = top + ri, y1 = top + ro, halfw = 7;
    e.push(`<path d="M ${cx - halfw} ${r2(y1)} L ${cx + halfw} ${r2(y1)} L ${cx} ${r2(y0)} Z" fill="#000"/>`);
  }
  return `<svg viewBox="0 0 ${W} ${r2(H)}" xmlns="http://www.w3.org/2000/svg">${e.join("")}</svg>`;
}

// Ring cards: the cross-sections students read (pattern + letter, no answer).
export function treeRingCards() {
  const cards = RING_CARDS.map((c) => `<div class="tr-card">
<div class="lab">Card ${c.id}</div>
${ringCookie(c.widths, c.scar ?? -1)}
<div class="cap">center (pith) on the flat edge, bark on the curve</div>
</div>`).join("");
  return `<div class="trc"><style>${TR_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-10 Tree Ring Climate Detective</div><div class="sheet-title">Ring cards</div></div>
<p class="tr-note">These six stylized cards use an authored practice code: relatively wide = model-favorable, relatively narrow = model-stress, and a black mark = model-disturbance. Read annual bands from pith to bark. Each annual ring contains earlywood and latewood; alternating gray and white only separates adjacent years. This code is not a universal rule for real trees.</p>
<div class="tr-cards">${cards}</div></div>`;
}

// Staff-only key: authored model answers and the limits of the practice code.
export function treeRingAnswerKey() {
  const rows = RING_CARDS.map(
    (card) => `<tr><td style="font-family:var(--mono);font-weight:700">Card ${card.id}</td><td>${card.model}</td></tr>`,
  ).join("");
  return `<div class="trc"><style>${TR_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-10 Tree Ring Climate Detective</div><div class="sheet-title">Instructor practice-card key</div></div>
<p class="tr-note"><b>Staff only.</b> These are authored answers for a simplified card code, not climate attributions from real samples. Real dendrochronology cross-dates many trees and calibrates measured ring series against local weather; relationships vary by species and site. Each annual ring contains earlywood and latewood. Gray and white fill only separates years.</p>
<table class="tr-tbl"><thead><tr><th style="width:14%">Card</th><th>Authored model reading under the practice code</th></tr></thead><tbody>${rows}</tbody></table>
</div>`;
}

// Recording board: where teams log observations and supporting annual bands.
export function ringAnswerBoard() {
  const rows = RING_CARDS.map((c) =>
    `<tr><td style="font-family:var(--mono);font-weight:700">Card ${c.id}</td><td></td><td></td><td></td></tr>`).join("");
  return `<div class="trc"><style>${TR_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-10 Tree Ring Climate Detective</div><div class="sheet-title">Answer board</div></div>
<p class="tr-note">For each stylized card, record what you see, the model event assigned under the authored code, and the exact annual bands that support it. Read from the center out. A card cannot reconstruct real climate.</p>
<table class="tr-tbl"><thead><tr><th style="width:12%">Card</th><th style="width:30%">Observed width / mark pattern</th><th style="width:30%">Model event under card code</th><th>Annual bands that support it</th></tr></thead><tbody>${rows}</tbody></table>
</div>`;
}

// Claim-evidence-reasoning cards: cut apart, one per inference a team defends.
export function claimEvidenceCard() {
  const card = `<div class="ce-card">
<div class="ce-h">Claim, evidence, reasoning</div>
<div class="ce-row"><b>Card:</b> _____ &nbsp; <b>Model event under the card code:</b></div>
<div class="ce-line"></div>
<div class="ce-row"><b>Evidence (which annual bands):</b></div>
<div class="ce-line"></div>
<div class="ce-row"><b>Reasoning (how the bands support the model assignment):</b></div>
<div class="ce-line"></div>
</div>`;
  return `<div class="trc"><style>${TR_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-10 Tree Ring Climate Detective</div><div class="sheet-title">Claim-evidence cards</div></div>
<p class="tr-note">Use one card for each model event assigned under the authored practice code. Point to exact annual bands and explain how they support the model. Real climate claims require cross-dated samples and local calibration.</p>
<div class="ce-cards">${card}${card}${card}${card}</div></div>`;
}

// Bundle as the standalone TTT-10 printable (student-facing sheets only).
export function treeRingAppendix() {
  return `${treeRingCards()}
<div style="page-break-before:always"></div>
${ringAnswerBoard()}
<div style="page-break-before:always"></div>
${claimEvidenceCard()}`;
}

// ---- TTT-07 Pollinator Network Draft and Build: print-and-cut game pieces ------
// Plant cards, pollinator cards, and a bloom-calendar board. Cards are native to
// Pennsylvania / the northeastern US with source-verified bloom seasons and
// visitors (Xerces, Penn State Extension, Mt. Cuba, Lady Bird Johnson Wildflower
// Center; adversarially fact-checked). Season chips use weight and border, not a
// fill, so they read in grayscale (printBackground is off). Pure black scales.
const PN_PLANTS = [
  { n: "Serviceberry", l: "Amelanchier canadensis", bloom: ["sp"], poll: "native bees, bumble bees, flies", note: "One of the first trees to bloom each April." },
  { n: "Golden Alexanders", l: "Zizia aurea", bloom: ["sp", "su"], poll: "native bees, flies, beetles, butterflies", note: "Tiny yellow flowers feed early short-tongued insects." },
  { n: "Eastern Redbud", l: "Cercis canadensis", bloom: ["sp"], poll: "native bees, bumble bees, butterflies, hummingbirds", note: "Pink flowers on bare branches; early spring nectar and pollen for bees and migrating hummingbirds." },
  { n: "Butterfly Weed", l: "Asclepias tuberosa", bloom: ["su"], poll: "butterflies, native bees, hummingbirds", note: "Orange milkweed and a monarch caterpillar host." },
  { n: "Wild Bergamot", l: "Monarda fistulosa", bloom: ["su"], poll: "bumble bees, butterflies, hummingbirds", note: "Lavender tubes that long-tongued visitors love." },
  { n: "Black-eyed Susan", l: "Rudbeckia hirta", bloom: ["su", "fa"], poll: "native bees, butterflies, flies", note: "Golden petals with a dark center; a summer classic." },
  { n: "Mountain Mint", l: "Pycnanthemum tenuifolium", bloom: ["su", "fa"], poll: "native bees, flies, butterflies, beetles", note: "Flat white flowers draw a huge mix of insects." },
  { n: "Summersweet", l: "Clethra alnifolia", bloom: ["su"], poll: "bumble bees, butterflies, hummingbirds", note: "Sweet-smelling white spikes for shady, wet spots." },
  { n: "Cardinal Flower", l: "Lobelia cardinalis", bloom: ["su", "fa"], poll: "hummingbirds, butterflies", note: "Red tubes built for hummingbird beaks." },
  { n: "Joe-Pye Weed", l: "Eutrochium purpureum", bloom: ["su", "fa"], poll: "butterflies, native bees, bumble bees", note: "Tall pink clouds buzzing in late summer." },
  { n: "New England Aster", l: "Symphyotrichum novae-angliae", bloom: ["fa"], poll: "native bees, bumble bees, butterflies, flies", note: "Purple fall blooms fuel migrating monarchs." },
  { n: "Goldenrod", l: "Solidago rugosa", bloom: ["fa"], poll: "native bees, butterflies, flies, beetles", note: "Yellow plumes blooming right up to frost." },
  // Non-native FOILS: showy and popular but poor ecological choices. They carry a
  // rust badge and a dashed border; teams should recognize and limit them (that is
  // the native-and-clumping-logic score). Status verified against PA DCNR, Penn
  // State Extension, and Xerces; see camp-prep/day-of/03_Facilitation_TTT-07.md.
  { n: "Callery Pear", l: "Pyrus calleryana", bloom: ["sp"], poll: "a few early flies and bees; little real value", note: "Showy white spring tree, but invasive here and it crowds out native trees.", native: false, badge: "Invasive" },
  { n: "Butterfly Bush", l: "Buddleja davidii", bloom: ["su"], poll: "adult butterflies (nectar only)", note: "Named for butterflies, but it feeds adults only and no native caterpillar can eat it.", native: false, badge: "Invasive" },
  { n: "Garden Mum", l: "Chrysanthemum x morifolium", bloom: ["fa"], poll: "few; double petals hide the nectar and pollen", note: "Most fall pompom mums are double cultivars whose petals block bees from food.", native: false, badge: "Non-native" },
];

const PN_POLLINATORS = [
  { n: "Native Bees", active: ["sp", "su", "fa"], visits: "Open daisy, mint, and clustered flowers with easy pollen.", note: "Most are solitary and rarely sting." },
  { n: "Bumble Bees", active: ["sp", "su", "fa"], visits: "Tube and hooded flowers like bergamot, reached with long tongues.", note: "Queens wake first and need early spring blooms." },
  { n: "Butterflies and Monarchs", active: ["sp", "su", "fa"], visits: "Flat-topped clusters and big landing-pad flowers.", note: "Monarchs fuel on fall asters before migrating." },
  { n: "Hummingbirds", active: ["sp", "su", "fa"], visits: "Red and pink tubular flowers full of nectar.", note: "Spring migrants follow early flowers; long beaks reach where bees cannot." },
  { n: "Hoverflies and Flies", active: ["sp", "su", "fa"], visits: "Shallow open flowers like mountain mint.", note: "Hoverflies copy bees but cannot sting." },
  { n: "Beetles", active: ["sp", "su", "fa"], visits: "Flat, sturdy flower clusters they can crawl across.", note: "Some of Earth's oldest pollinators." },
];

const PN_SEASONS = [["sp", "Spring"], ["su", "Summer"], ["fa", "Fall"]];

const PN_CSS = `
.pnc h3 { font-family: var(--serif); color: var(--camp-ink); font-size: 13pt; margin: 8pt 0 2pt; break-after: avoid; }
.pnc .pn-note { color: var(--ink2); font-size: 9pt; margin: 0 0 8pt; }
.pnc .pn-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 9pt; }
.pnc .pn-card { border: 1.2pt solid var(--rule2); border-radius: 5pt; padding: 7pt 8pt; break-inside: avoid; }
.pnc .pn-card.poll { border-style: dashed; }
.pnc .pn-card.foil { border-style: dashed; border-color: var(--camp-acc); }
.pnc .pn-name { font-family: var(--serif); font-size: 11.5pt; color: var(--camp-ink); line-height: 1.1; }
.pnc .pn-latin { font-style: italic; font-size: 7.5pt; color: var(--ink2); margin-bottom: 4pt; }
.pnc .pn-chips { margin: 3pt 0; }
.pnc .chip { display: inline-block; font-family: var(--mono); font-size: 6.4pt; letter-spacing: .04em; text-transform: uppercase; padding: 1pt 4pt; border-radius: 3pt; margin-right: 3pt; }
.pnc .chip.on { border: 1.4pt solid var(--camp-ink); color: var(--camp-ink); font-weight: 700; }
.pnc .chip.off { border: 0.7pt solid #c2c2c2; color: #c2c2c2; }
.pnc .pn-row { font-size: 8pt; color: var(--ink); margin-top: 3pt; }
.pnc .pn-row b { font-family: var(--mono); font-size: 6.4pt; letter-spacing: .05em; text-transform: uppercase; color: var(--camp-acc); }
.pnc .pn-tag { font-size: 7.5pt; color: var(--ink2); margin-top: 4pt; font-style: italic; }
.pnc .pn-native { float: right; font-family: var(--mono); font-size: 6pt; font-weight: 700; letter-spacing: .08em; color: var(--camp-ink); border: 1pt solid var(--camp-ink); border-radius: 3pt; padding: 0 3pt; }
.pnc .pn-foil { float: right; font-family: var(--mono); font-size: 6pt; font-weight: 700; letter-spacing: .08em; color: var(--camp-acc); border: 1pt solid var(--camp-acc); border-radius: 3pt; padding: 0 3pt; }
.pnc .pn-code { display: inline-block; font-family: var(--mono); font-size: 6.4pt; font-weight: 700; color: var(--camp-acc); margin: 2pt 0 1pt; }
.pnc table.pn-tbl { width: 100%; border-collapse: collapse; margin-top: 4pt; }
.pnc table.pn-tbl th { font-family: var(--mono); font-size: 7.5pt; letter-spacing: .05em; text-transform: uppercase; color: var(--camp-ink); border-bottom: 1.4pt solid #000; padding: 4pt 6pt; text-align: left; width: 33.33%; }
.pnc table.pn-tbl td { border: 1pt solid #000; height: .47in; vertical-align: top; padding: 3pt; font-family: var(--mono); font-size: 6.4pt; color: var(--ink2); }
.pnc table.pn-chk { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-top: 4pt; }
.pnc table.pn-chk th { font-family: var(--mono); font-size: 7pt; letter-spacing: .04em; text-transform: uppercase; color: var(--camp-ink); border-bottom: 1.4pt solid #000; padding: 3pt 5pt; text-align: center; }
.pnc table.pn-chk th.lh { text-align: left; }
.pnc table.pn-chk td { border-bottom: 1pt solid #000; height: .34in; padding: 3pt 5pt; text-align: center; }
.pnc table.pn-chk td.lh { text-align: left; font-size: 8.5pt; }
.pnc table.pn-chk td.active { font-family: var(--mono); font-size: 7pt; }
.pnc table.pn-chk td.inactive { color: var(--ink2); }
.pnc .pn-clump { border: 1pt solid var(--rule2); border-radius: 4pt; padding: 5pt 7pt; margin: 6pt 0; font-size: 8.5pt; }
`;

function pnChips(active) {
  return `<div class="pn-chips">` + PN_SEASONS.map(([c, t]) =>
    `<span class="chip ${active.includes(c) ? "on" : "off"}">${t}</span>`).join("") + `</div>`;
}

// Plant cards: cut apart. Each shows bloom seasons, who visits, and a fact.
export function plantCards() {
  const cards = PN_PLANTS.map((p, index) => `<div class="pn-card${p.native === false ? " foil" : ""}">
${p.native === false ? `<span class="pn-foil">${p.badge}</span>` : `<span class="pn-native">Native</span>`}<div class="pn-name">${p.n}</div><div class="pn-latin">${p.l}</div>
<div class="pn-code">PL-${String(index + 1).padStart(2, "0")}</div>
<div class="pn-row"><b>Blooms</b></div>${pnChips(p.bloom)}
<div class="pn-row"><b>Visited by</b> ${p.poll}</div>
<div class="pn-tag">${p.note}</div>
</div>`).join("");
  return `<div class="pnc"><style>${PN_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-07 Pollinator Network</div><div class="sheet-title">Plant cards</div></div>
<p class="pn-note">Most cards are native (green badge); a few are non-native foils (rust badge, dashed edge) that look nice but feed pollinators poorly - spot them and limit them. The dark chips show bloom season and the visitors each feeds. Cover spring, summer, and fall, favor natives, and clump the same plant.</p>
<div class="pn-cards">${cards}</div></div>`;
}

// Pollinator cards: cut apart. Each shows active seasons and what it visits.
export function pollinatorCards() {
  const cards = PN_POLLINATORS.map((p) => `<div class="pn-card poll">
<div class="pn-name">${p.n}</div>
<div class="pn-row"><b>Active</b></div>${pnChips(p.active)}
<div class="pn-row"><b>Visits</b> ${p.visits}</div>
<div class="pn-tag">${p.note}</div>
</div>`).join("");
  return `<div class="pnc"><style>${PN_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-07 Pollinator Network</div><div class="sheet-title">Pollinator cards</div></div>
<p class="pn-note">Each pollinator needs flowers in bloom across every season it is active. Match it to plants whose flower type fits (hummingbirds to red tubes, flies and beetles to flat open clusters, bees and butterflies to most flowers).</p>
<div class="pn-cards">${cards}</div></div>`;
}

// Bloom board: place plants by season, then check every pollinator has food.
export function bloomBoard() {
  const gridRows = Array.from({ length: 4 }, (_, rowIndex) =>
    `<tr>${PN_SEASONS.map(([, season]) => `<td>${rowIndex + 1}. ${season} plant ID/name: ____________________</td>`).join("")}</tr>`).join("");
  const chkRows = PN_POLLINATORS.map((p) => `<tr><td class="lh">${p.n}</td>${PN_SEASONS.map(([code]) =>
    p.active.includes(code)
      ? `<td class="active">Plant ID: __________</td>`
      : `<td class="inactive">not active</td>`).join("")}</tr>`).join("");
  return `<div class="pnc"><style>${PN_CSS}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-07 Pollinator Network</div><div class="sheet-title">Grid board</div></div>
<p class="pn-note">Use the cards as references. Write a plant ID or name in each cell; repeat it to show multiple plants. Only write it in seasons shown on its card. A multi-season plant may appear in each matching column.</p>
<table class="pn-tbl"><thead><tr><th>Spring</th><th>Summer</th><th>Fall</th></tr></thead><tbody>${gridRows}</tbody></table>
<div class="pn-clump"><b>Clump evidence:</b> I placed the same native plant in 3 edge-sharing cells. Plant ID/name ____________________ &nbsp; Cells ____________________</div>
<h3>Pollinator food check</h3>
<p class="pn-note" style="margin-top:0">For every active season, write the ID of a plant in your grid that feeds that pollinator. Every active-season cell needs evidence; “not active” cells need none.</p>
<table class="pn-chk"><thead><tr><th class="lh">Pollinator</th><th>Spring</th><th>Summer</th><th>Fall</th></tr></thead><tbody>${chkRows}</tbody></table>
</div>`;
}

// Bundle as the standalone TTT-07 printable (student-facing sheets only). Season
// tokens stay a separate operator-local sheet (camp-prep/print/build_print.mjs).
export function pollinatorNetworkAppendix() {
  return `${plantCards()}
<div style="page-break-before:always"></div>
${pollinatorCards()}
<div style="page-break-before:always"></div>
${bloomBoard()}`;
}

// TTT-08 Arboretum Eco-Quest print pack: a cut-apart clue-card set, an
// adaptive field evidence key, a location schematic, and a cut-apart
// evidence-token sheet. Exposed as arboretumQuestAppendix() (student sheets
// only), rendered standalone by build_trees.mjs. The instructor setup key is
// deliberately NOT in the pack: arboretumQuestAnswerKey() feeds the staff-only
// From_Trees_to_Tech_Instructor_Answer_Keys.pdf, which never reaches
// public/files or files.json.
// Candidate checkpoints use names, descriptions, and coordinates from Temple
// University's 2026 Ambler Arboretum visitor map and Arboretum Text Map. The
// official map does not establish current closures, surface conditions, or an
// accessible connection between every point. Staff therefore approve and mark
// the actual route on site before releasing teams.
const AQ_ROUTE = [
  {
    area: "Pinetum",
    loc: "South of the Learning Center, along Loop Drive",
    coordinates: "40.1646640, -75.1895180",
    x: 520,
    y: 260,
  },
  {
    area: "Oak Canopy",
    loc: "Southeast of the Ambler Research and Collaboration Building",
    coordinates: "40.1657442, -75.1899040",
    x: 470,
    y: 135,
  },
  {
    area: "Maple Canopy",
    loc: "Between the Ambler Research and Collaboration Building and the Learning Center",
    coordinates: "40.1661009, -75.1899147",
    x: 470,
    y: 65,
  },
  {
    area: "Aesculus Grove",
    loc: "North of Bright Hall and southwest of the Ambler Research and Collaboration Building",
    coordinates: "40.1657401, -75.1908910",
    x: 320,
    y: 135,
  },
  {
    area: "Columnar Copse",
    loc: "South of Widener Hall",
    coordinates: "40.1657996, -75.1918459",
    x: 205,
    y: 125,
  },
  {
    area: "Beech Grove",
    loc: "West of Dixon Hall, across the bluestone Accessible Path",
    coordinates: "40.1655580, -75.1932590",
    x: 70,
    y: 155,
  },
];
const AQ_CHECKPOINTS = AQ_ROUTE.length;

export function questClueCards() {
  const cards = AQ_ROUTE.map(({ area, loc }, i) => {
    const n = i + 1;
    return `<div class="aq-card keep">
<div class="aq-card-h"><span class="aq-cp">Checkpoint ${n}</span><span class="aq-tok">token &#9711;</span></div>
<div class="aq-fill"><b>${area}</b><br><span class="aq-loc">${loc}</span></div>
<div class="aq-work">
  <div>Staff tag or plant-label ID: <span class="aq-line"></span></div>
  <div>Tree name from the approved route key or label: <span class="aq-line"></span></div>
  <div class="aq-clue">Evidence-key path: <span class="aq-line"></span></div>
  <div>The specific feature you saw: <span class="aq-line"></span></div>
</div></div>`;
  }).join("");
  return `<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-08 Arboretum Eco-Quest</div><div class="sheet-title">Checkpoint clue cards</div></div>
<p class="aq-note">Cut the cards apart. Follow only the staff-marked route to each named collection area. Match the numbered field tag, record the approved tree name, and use the evidence key to document the feature you observed. If a tag or label is missing, write <b>unverified</b> instead of guessing.</p>
<div class="aq-grid">${cards}</div>`;
}

export function questKey() {
  const couplets = [
    ["1a", "Foliage is needle-like or scale-like", "go to 2"],
    ["1b", "Leaves are broad and flat", "go to 3"],
    ["2a", "Needles occur in bundles or clusters", "record: bundled needles"],
    ["2b", "Needles attach singly, or foliage is scale-like", "record: single needles / scales"],
    ["3a", "Leaves attach in opposite pairs", "go to 4"],
    ["3b", "Leaves attach alternately along the twig", "go to 5"],
    ["4a", "Each leaf has one blade", "record: opposite + simple"],
    ["4b", "Each leaf has multiple leaflets", "record: opposite + compound"],
    ["5a", "Each leaf has one blade", "go to 6"],
    ["5b", "Each leaf has multiple leaflets", "record: alternate + compound"],
    ["6a", "Blade has lobes", "record: alternate + simple + lobed"],
    ["6b", "Blade has no lobes", "record: alternate + simple + unlobed"],
  ];
  const rows = couplets.map(([k, test, res]) =>
    `<tr><td class="aq-k">${k}</td><td>${test}</td><td class="aq-r">${res}</td></tr>`).join("");
  return `<div style="page-break-before:always"></div>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-08 Arboretum Eco-Quest</div><div class="sheet-title">Adaptive field evidence key</div></div>
<p class="aq-note">This adaptive evidence key records visible traits; it does not prove a species name. Start at step 1, record the path you follow, then match the numbered field tag to the staff-approved route key or visible plant label. Staff may substitute a host-verified species key.</p>
<table class="aq-key"><thead><tr><th>Step</th><th>What to look for</th><th>Then</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function questRouteMap() {
  const markers = AQ_ROUTE.map(({ area, x, y }, i) => {
    const n = i + 1;
    return `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="#2a5736" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Inter, sans-serif" font-size="15" font-weight="700" fill="#2a5736">${n}</text><text x="${x}" y="${y + 30}" text-anchor="middle" font-family="Inter, sans-serif" font-size="9.5" font-weight="600" fill="#2a5736">${area}</text>`;
  }).join("");
  const list = AQ_ROUTE.map(({ area, loc, coordinates }, i) => `<li><b>${i + 1}. ${area}</b> &mdash; ${loc}<br><span class="aq-coord">Map check: ${coordinates}</span></li>`).join("");
  return `<div style="page-break-before:always"></div>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-08 Arboretum Eco-Quest</div><div class="sheet-title">Adaptive route plan</div></div>
<div class="aq-field-check"><b>FIELD VERIFICATION REQUIRED.</b> Before teams use this sheet, staff must prewalk the route with the Ambler host, confirm each numbered tag and plant label, mark the approved paths plus start/finish, and provide an alternate for any closed, uneven, or inaccessible segment. Temple notes that only portions of the gardens are accessible and some natural areas have uneven terrain.</div>
<div class="aq-route-meta"><span>Camp base / start / finish: ______________________________</span><span>Approved checkpoint order: ______________________________</span><span>Closed or no-go areas: __________________________________</span><span>Accessible alternate(s): _________________________________</span></div>
<p class="aq-note">The checkpoint positions below are a location schematic based on Temple's current map coordinates. <b>No walking paths are shown.</b> Use the staff-marked official visitor map and field markers for the actual route.</p>
<svg viewBox="0 0 620 310" role="img" aria-label="Schematic positions of six Ambler Arboretum collection-area checkpoints; no walking paths shown" style="width:6.5in;display:block;margin:5pt auto;border:1.2pt solid var(--rule2);border-radius:4pt" xmlns="http://www.w3.org/2000/svg">
<rect x="18" y="18" width="584" height="274" fill="none" stroke="#cfcabf" stroke-width="1" stroke-dasharray="5 4"/>
<text x="34" y="40" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#2a5736">SCHEMATIC COLLECTION POSITIONS &middot; NO PATHS SHOWN</text>
<path d="M578 58 L586 32 L594 58 L586 52 Z" fill="#2a5736"/><text x="586" y="26" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="#2a5736">N</text>
${markers}
</svg>
<ol class="aq-routelist">${list}</ol>
<p class="aq-source">Location names, descriptions, and coordinates: Temple University Ambler, <b>2026 Ambler Arboretum Visitor Map</b> and <b>Arboretum Text Map</b> (ambler.temple.edu/arboretum-text-map). Coordinates are for staff cross-checking, not permission to leave the marked route. Stay on designated paths, remain with your team, do not climb trees, and do not pick plant material.</p>`;
}

export function questAnswerKey() {
  const rows = AQ_ROUTE.map(({ area, loc }, i) =>
    `<tr><td class="aq-k">${i + 1}</td><td>${area}<br><span class="aq-loc">${loc}</span></td><td></td><td></td><td></td></tr>`).join("");
  return `<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-08 Arboretum Eco-Quest</div><div class="sheet-title">Instructor route setup and answer key (do not hand out)</div></div>
<div class="aq-field-check"><b>COMPLETE ON SITE BEFORE RELEASE.</b> This is a candidate checkpoint set, not proof of a safe route or of a particular specimen. Prewalk with the Ambler host; place one numbered tag at the path edge in each approved area; copy the exact plant label or host-confirmed name below; record an accepted evidence-key path; and document an accessible alternate. Remove or replace any checkpoint that cannot be verified.</div>
<table class="aq-key aq-staff-key"><thead><tr><th>CP</th><th>Official area</th><th>Numbered tag + exact tree name</th><th>Accepted key path / feature</th><th>Approach open + alternate</th></tr></thead><tbody>${rows}</tbody></table>
<p class="aq-source">Do not award tree-ID accuracy from a guessed species list. If the tag, label, route, or access condition cannot be confirmed that day, mark the checkpoint closed and use the documented alternate.</p>`;
}

export function questTokens() {
  const cols = AQ_CHECKPOINTS, rowsN = 5; // 4 teams + 1 spare set = 30 tokens
  let cells = "";
  for (let r = 0; r < rowsN; r++) for (let n = 1; n <= cols; n++) {
    cells += `<div class="aq-tokcell"><span class="aq-tokleaf">&#127811;</span><span class="aq-toknum">CP ${n}</span></div>`;
  }
  return `<div style="page-break-before:always"></div>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-08 Arboretum Eco-Quest</div><div class="sheet-title">Evidence tokens (cut apart)</div></div>
<p class="aq-note">Cut the tokens apart. Your team collects one token for each checkpoint you solve; ${cols} tokens means you finished the whole quest.</p>
<div class="aq-tokgrid">${cells}</div>`;
}

const AQ_CSS = `
.aq-apx .aq-note { color: var(--ink2); font-size: 9pt; margin: 0 0 7pt; }
.aq-apx .aq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9pt; }
.aq-apx .aq-card { border: 1.3pt solid var(--camp-ink); border-radius: 6pt; padding: 8pt 10pt; break-inside: avoid; }
.aq-apx .aq-card-h { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1.4pt solid var(--camp-acc); padding-bottom: 3pt; margin-bottom: 5pt; }
.aq-apx .aq-cp { font-family: var(--serif); font-weight: 600; color: var(--camp-ink); font-size: 12pt; }
.aq-apx .aq-tok { font-family: var(--mono); font-size: 8pt; color: var(--ink2); }
.aq-apx .aq-fill { font-size: 9.5pt; margin-bottom: 6pt; }
.aq-apx .aq-fill b { color: var(--camp-ink); }
.aq-apx .aq-loc { font-size: 8pt; color: var(--ink2); }
.aq-apx .aq-line { display: inline-block; min-width: 40%; border-bottom: 0.8pt solid var(--rule2); }
.aq-apx .aq-field-check { border: 1.4pt solid var(--camp-acc); border-left-width: 5pt; background: #fff9eb; color: var(--ink); font-size: 8.4pt; line-height: 1.35; padding: 6pt 8pt; margin: 0 0 6pt; }
.aq-apx .aq-field-check b { color: var(--camp-ink); }
.aq-apx .aq-route-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4pt 12pt; font-family: var(--mono); font-size: 7.7pt; margin: 5pt 0 6pt; }
.aq-apx ol.aq-routelist { columns: 2; column-gap: 22pt; margin: 5pt 0 0 16pt; font-size: 8.2pt; color: var(--ink); }
.aq-apx ol.aq-routelist li { break-inside: avoid; margin: 0 0 4pt; }
.aq-apx ol.aq-routelist b { color: var(--camp-ink); }
.aq-apx .aq-coord { color: var(--ink2); font-family: var(--mono); font-size: 7.2pt; }
.aq-apx .aq-source { color: var(--ink2); font-size: 7.4pt; line-height: 1.35; margin: 6pt 0 0; }
.aq-apx .aq-work > div { font-size: 9pt; margin: 5pt 0; }
.aq-apx .aq-clue { color: var(--camp-ink); font-weight: 600; }
.aq-apx table.aq-key { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
.aq-apx table.aq-key th { background: var(--camp-ink); color: #fff; text-align: left; padding: 4pt 8pt; font-size: 8pt; text-transform: uppercase; letter-spacing: .05em; }
.aq-apx table.aq-key td { border-bottom: 0.7pt solid var(--rule2); padding: 4pt 8pt; vertical-align: top; }
.aq-apx table.aq-key td.aq-k { font-family: var(--mono); font-weight: 700; color: var(--camp-acc); width: 12%; }
.aq-apx table.aq-key td.aq-r { font-family: var(--serif); color: var(--camp-ink); width: 26%; }
.aq-apx table.aq-staff-key { font-size: 8.5pt; table-layout: fixed; }
.aq-apx table.aq-staff-key td { height: 0.62in; }
.aq-apx table.aq-staff-key th:nth-child(1) { width: 6%; }
.aq-apx table.aq-staff-key th:nth-child(2) { width: 21%; }
.aq-apx table.aq-staff-key th:nth-child(3) { width: 24%; }
.aq-apx table.aq-staff-key th:nth-child(4) { width: 23%; }
.aq-apx table.aq-staff-key th:nth-child(5) { width: 26%; }
.aq-apx .aq-tokgrid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5pt; }
.aq-apx .aq-tokcell { border: 1pt dashed var(--camp-ink); border-radius: 5pt; padding: 9pt 2pt; text-align: center; break-inside: avoid; }
.aq-apx .aq-tokleaf { display: block; font-size: 15pt; }
.aq-apx .aq-toknum { font-family: var(--mono); font-size: 8pt; font-weight: 700; color: var(--camp-ink); }
`;

// Student-facing quest pack: clue cards, key, route map, and tokens. The
// instructor answer key is NOT bundled here; see arboretumQuestAnswerKey().
export function arboretumQuestAppendix() {
  return `<div class="aq-apx"><style>${AQ_CSS}</style>
${questClueCards()}
${questKey()}
${questRouteMap()}
${questTokens()}
</div>`;
}

// Staff-only answer key for the Eco-Quest, compiled by build_trees.mjs into
// From_Trees_to_Tech_Instructor_Answer_Keys.pdf (never published to the site).
export function arboretumQuestAnswerKey() {
  return `<div class="aq-apx"><style>${AQ_CSS}</style>
${questAnswerKey()}
</div>`;
}

// TTT-09 Minecraft Tree World Resilience Cup paper-grid fallback kit: a design
// grid and a feature legend so a team can build the same resilient landscape on
// paper if a device or login fails. General, not site-specific. Exposed as
// resilienceGridAppendix(); build_trees.mjs renders it as the standalone
// TTT-09 printable.
export function resilienceGridAppendix() {
  const cols = 12, rowsN = 9, cell = 42;
  const W = cols * cell, H = rowsN * cell;
  let g = "";
  for (let i = 0; i <= cols; i++) g += `<line x1="${i * cell}" y1="0" x2="${i * cell}" y2="${H}" stroke="#cfcabf" stroke-width="${i % 4 === 0 ? 1.2 : 0.6}"/>`;
  for (let j = 0; j <= rowsN; j++) g += `<line x1="0" y1="${j * cell}" x2="${W}" y2="${j * cell}" stroke="#cfcabf" stroke-width="${j % 4 === 0 ? 1.2 : 0.6}"/>`;
  const legend = [
    ["&#127795;", "Diverse tree cluster", "mix species, not a monoculture"],
    ["&#127807;", "Connected green space", "link habitats into a corridor"],
    ["&#9730;", "Shade canopy", "shade buildings and paths"],
    ["&#128167;", "Water control", "rain garden, swale, or wetland"],
    ["&#9632;", "Built or paved", "keep this to a minimum"],
  ].map(([sym, name, hint]) => `<li><span class="rg-sym">${sym}</span><b>${name}</b> &mdash; ${hint}</li>`).join("");
  const css = `
.rg-apx .rg-note { color: var(--ink2); font-size: 9pt; margin: 0 0 6pt; }
.rg-apx .rg-stress { font-size: 10pt; margin: 4pt 0 8pt; }
.rg-apx .rg-stress b { color: var(--camp-ink); }
.rg-apx .rg-cols { display: flex; gap: 18pt; }
.rg-apx .rg-legend { flex: 0 0 40%; }
.rg-apx .rg-legend .rg-h { font-family: var(--mono); font-size: 8pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--camp-acc); margin-bottom: 4pt; }
.rg-apx ul { list-style: none; margin: 0; padding: 0; font-size: 9pt; }
.rg-apx ul li { margin: 5pt 0; }
.rg-apx .rg-sym { display: inline-block; width: 20pt; font-size: 13pt; }
.rg-apx svg { width: 100%; height: auto; }
.rg-apx .rg-grid { flex: 1; border: 1.2pt solid var(--camp-ink); border-radius: 5pt; padding: 5pt; }
`;
  return `<div class="rg-apx"><style>${css}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-09 Minecraft Tree World Resilience Cup</div><div class="sheet-title">Paper-grid fallback kit</div></div>
<p class="rg-note">Use this if a device or login fails so no team loses build time. Draw your resilient landscape on the grid, label every feature with the strategy it represents, then defend it to the judges just like the on-screen build.</p>
<div class="rg-stress">Team ___________________   Stress we design against (circle one): &nbsp; <b>flood</b> &nbsp; <b>drought</b> &nbsp; <b>heat</b></div>
<div class="rg-cols">
<div class="rg-legend"><div class="rg-h">Feature legend &mdash; label each on the grid</div><ul>${legend}</ul></div>
<div class="rg-grid"><svg viewBox="-1 -1 ${W + 2} ${H + 2}">${g}</svg></div>
</div>
<p class="rg-note" style="margin-top:6pt">Scored on resilience features, biodiversity support, realism, explanation, and <b>build polish</b>: make the grid clear, complete, and readable. Decoration never outweighs ecological strategy.</p>`;
}

// TTT-12 Leaf Stomata Microscope Detective counting sheet: a field-of-view
// counting reference and a per-leaf tally table so every team uses the same
// surface, preparation, magnification, field area, and counting rule.
// Exposed as stomataCountAppendix(); build_trees.mjs renders it as the
// standalone TTT-12 printable.
export function stomataCountAppendix() {
  // A field-of-view circle with a light grid, plus a few example dots, to fix
  // the "count every stoma fully inside the circle" convention.
  const fov = `<svg viewBox="0 0 200 200" style="width:1.7in;display:block" xmlns="http://www.w3.org/2000/svg">
<circle cx="100" cy="100" r="92" fill="none" stroke="#2a5736" stroke-width="2"/>
<clipPath id="fovc"><circle cx="100" cy="100" r="92"/></clipPath>
<g clip-path="url(#fovc)" stroke="#e2ded5" stroke-width="1">
${[40, 70, 100, 130, 160].map((v) => `<line x1="${v}" y1="8" x2="${v}" y2="192"/><line x1="8" y1="${v}" x2="192" y2="${v}"/>`).join("")}
</g>
<text x="100" y="104" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#5A564F">count inside</text>
<text x="100" y="118" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#5A564F">the circle</text>
</svg>`;
  const rows = [1, 2, 3, 4].map((n) =>
    `<tr><td class="sc-leaf">Leaf ${n}<div class="sc-name">name/type: ____________</div></td><td></td><td></td><td></td><td class="sc-summary"></td><td class="sc-summary"></td></tr>`).join("");
  const css = `
.sc-apx .sc-note { color: var(--ink2); font-size: 9pt; margin: 0 0 6pt; }
.sc-apx .sc-cols { display: flex; gap: 16pt; align-items: flex-start; }
.sc-apx .sc-conv { flex: 0 0 34%; font-size: 9pt; }
.sc-apx .sc-conv .sc-h { font-family: var(--mono); font-size: 8pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--camp-acc); margin-bottom: 4pt; }
.sc-apx .sc-conv ul { margin: 4pt 0 0 14pt; padding: 0; }
.sc-apx .sc-conv li { margin: 3pt 0; }
.sc-apx table.sc-t { flex: 1; border-collapse: collapse; width: 100%; font-size: 9.5pt; }
.sc-apx table.sc-t th { background: var(--camp-ink); color: #fff; padding: 4pt 6pt; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .04em; }
.sc-apx table.sc-t td { border: 0.7pt solid var(--rule2); height: 0.42in; padding: 3pt 6pt; }
.sc-apx table.sc-t td.sc-leaf { font-size: 9pt; color: var(--camp-ink); width: 24%; }
.sc-apx table.sc-t td.sc-name { font-size: 7.5pt; color: var(--ink2); font-weight: 400; }
.sc-apx table.sc-t td.sc-summary { background: var(--camp-tint); }
.sc-apx .sc-rank { font-size: 9.5pt; margin-top: 8pt; }
`;
  return `<div class="sc-apx"><style>${css}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTT-12 Leaf Stomata Microscope Detective</div><div class="sheet-title">Stomata counting sheet</div></div>
<p class="sc-note">Compare stomatal density with one standardized method. Counts alone cannot rank actual water use.</p>
<div class="sc-cols">
<div class="sc-conv"><div class="sc-h">Counting convention</div>
<div style="text-align:center;margin:4pt 0">${fov}</div>
<ul><li>Keep leaf surface, preparation, magnification, and field area the same.</li><li>Count every stoma <b>fully inside</b> the field.</li><li>Count at least <b>three fields</b> per leaf.</li><li>Report the <b>mean and range</b>.</li></ul></div>
<table class="sc-t"><thead><tr><th>Leaf</th><th>Field 1</th><th>Field 2</th><th>Field 3</th><th>Mean</th><th>Range</th></tr></thead><tbody>${rows}</tbody></table>
</div>
<div class="sc-rank"><b>Density comparison and cautious hypothesis:</b> _______________________________________________<br>Counts alone cannot rank water use. What aperture, pore-size, gas-exchange, species, or condition evidence would you need? ________________________________</div>`;
}

// TTB-02 Tree Height Triangulation Shootout paper clinometer and tan table. The
// clinometer geometry is the same trig-exact half circle as TTT-02 (reused), and
// the printed tan table is the calculator-free option the guide calls for.
// Exposed as clinometerTanAppendix(); build_trees.mjs renders it as the
// standalone TTB-02 printable.
export function clinometerTanAppendix() {
  const assemble = [
    "Cut out the half circle along the curved outline.",
    "Tape a straight straw along the top straight edge.",
    "Punch the center dot, thread a string through it, and tie a washer on the end as a weight.",
    "Sight the treetop through the straw, let the string hang, then pinch it against the scale and read the angle.",
    "Self-check: sight something level (reads 0) and straight up (reads 90).",
  ].map((s) => `<li>${s}</li>`).join("");
  const tan = [[15, "0.27"], [20, "0.36"], [25, "0.47"], [30, "0.58"], [35, "0.70"], [40, "0.84"], [45, "1.00"],
    [50, "1.19"], [55, "1.43"], [60, "1.73"], [65, "2.14"], [70, "2.75"], [75, "3.73"]];
  const half = Math.ceil(tan.length / 2);
  const tanTable = (rows) => `<table class="tight cl-tan"><thead><tr><th>Angle</th><th>tan</th></tr></thead><tbody>${rows.map(([d, t]) => `<tr><td>${d}&deg;</td><td>${t}</td></tr>`).join("")}</tbody></table>`;
  const css = `
.cl-apx .cl-note { color: var(--ink2); font-size: 9pt; margin: 0 0 6pt; }
.cl-apx .cl-cut { text-align: center; font-size: 8pt; color: var(--ink2); margin: 0 0 6pt; }
.cl-apx .cl-cols { display: flex; gap: 22pt; margin-top: 4pt; }
.cl-apx .cl-cols > div { flex: 1; }
.cl-apx .cl-h { font-family: var(--mono); font-size: 8pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--camp-acc); margin-bottom: 3pt; }
.cl-apx ol { margin: 0 0 0 14pt; font-size: 9.5pt; }
.cl-apx ol li { margin: 2pt 0; break-inside: avoid; }
.cl-apx .cl-formula { font-size: 9.5pt; margin-bottom: 5pt; }
.cl-apx .cl-tans { display: flex; gap: 10pt; }
.cl-apx table.cl-tan { font-size: 8.5pt; margin: 2pt 0 5pt; }
.cl-apx table.cl-tan th, .cl-apx table.cl-tan td { border: 0.6pt solid var(--rule2); padding: 2pt 8pt; text-align: center; font-family: var(--mono); }
.cl-apx table.cl-tan th { color: var(--camp-ink); }
.cl-apx .cl-eg { font-size: 9pt; color: var(--ink2); }
`;
  return `<div class="cl-apx"><style>${css}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTB-02 Tree Height Triangulation Shootout</div><div class="sheet-title">Paper clinometer and tan table</div></div>
<p class="cl-note">Read the angle to the treetop, then use the tan table (no calculator needed) to find the height.</p>
${clinometerSvg()}
<p class="cl-cut">Cut along the flat top edge and the curved outline.</p>
<div class="cl-cols">
<div><p class="cl-h">Assemble</p><ol>${assemble}</ol></div>
<div><p class="cl-h">Find the tree height</p>
<p class="cl-formula">Tree height = eye height + (distance to the tree &times; tan of the angle). Use the standoff distance the instructor pre-marked with the long tape.</p>
<div class="cl-tans">${tanTable(tan.slice(0, half))}${tanTable(tan.slice(half))}</div>
<p class="cl-eg">Example: eye height 1.5 m, distance 15 m, angle 40&deg; gives 1.5 + 15 &times; 0.84 = about 14.1 m.</p></div>
</div>`;
}

// TTB-03 Urban Heat Shade Dash route map and field log. The source activity
// requires a local campus map or route card, so this deliberately stays
// location-neutral: the instructor marks the current safe boundary, start,
// and finish before teams leave, while teams add their measured surfaces and
// evidence-backed cool corridor. Exposed as urbanHeatRouteMapAppendix();
// build_trees.mjs renders it as a standalone landscape printable.
export function urbanHeatRouteMapAppendix() {
  const gridLines = Array.from({ length: 17 }, (_, i) => {
    const x = 24 + i * 29.5;
    return `<line x1="${x}" y1="18" x2="${x}" y2="300"/>`;
  }).concat(Array.from({ length: 11 }, (_, i) => {
    const y = 18 + i * 28.2;
    return `<line x1="24" y1="${y}" x2="496" y2="${y}"/>`;
  })).join("");
  const rows = Array.from({ length: 4 }, (_, i) => `<tr><td>${i + 1}</td><td></td><td></td><td></td><td></td></tr>`).join("");
  const css = `
.uh-apx .uh-note { color: var(--ink2); font-size: 8.5pt; margin: 0 0 5pt; }
.uh-apx .uh-meta { display: flex; gap: 18pt; font-family: var(--mono); font-size: 8.5pt; margin: 4pt 0 7pt; }
.uh-apx .uh-layout { display: grid; grid-template-columns: 1.62fr 1fr; gap: 12pt; align-items: start; }
.uh-apx .uh-map { border: 1.2pt solid var(--camp-ink); border-radius: 6pt; padding: 6pt; }
.uh-apx .uh-map svg { display: block; width: 100%; height: 3.75in; }
.uh-apx .uh-legend { display: flex; flex-wrap: wrap; gap: 4pt 12pt; margin-top: 4pt; font-size: 7.8pt; color: var(--ink2); }
.uh-apx .uh-legend b { color: var(--camp-ink); }
.uh-apx .uh-side { display: flex; flex-direction: column; gap: 7pt; }
.uh-apx .uh-box { border: 1pt solid var(--rule2); border-radius: 6pt; padding: 6pt 7pt; break-inside: avoid; }
.uh-apx .uh-h { font-family: var(--mono); font-size: 7.5pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--camp-acc); margin-bottom: 4pt; }
.uh-apx table.uh-t { width: 100%; border-collapse: collapse; font-size: 7.8pt; }
.uh-apx table.uh-t th { background: var(--camp-ink); color: #fff; padding: 3pt 4pt; font-size: 6.8pt; line-height: 1.2; }
.uh-apx table.uh-t td { border: .65pt solid var(--rule2); height: .29in; padding: 2pt 3pt; text-align: center; }
.uh-apx table.uh-t td:first-child { font-family: var(--mono); font-weight: 700; color: var(--camp-ink); width: 7%; }
.uh-apx .uh-line { border-bottom: .8pt solid var(--rule2); min-height: 15pt; margin-top: 2pt; font-size: 7.8pt; }
.uh-apx .uh-safe { font-size: 8pt; border-left: 3pt solid var(--camp-acc); padding-left: 6pt; color: var(--ink2); }
`;
  return `<div class="uh-apx"><style>${css}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTB-03 Urban Heat Shade Dash</div><div class="sheet-title">Route map and field log</div></div>
<p class="uh-note"><b>Before teams leave:</b> the instructor marks the safe walking boundary, start, finish, and any no-go areas on every copy. Teams then map matched sunny and shaded surfaces, draw the direct path with a dashed line, and draw their cooler route with a solid line.</p>
<div class="uh-meta"><span>Team ____________________</span><span>Date/time ____________________</span><span>Sky: sunny / mixed / cloudy</span></div>
<div class="uh-layout">
<div class="uh-map"><div class="uh-h">Field map &mdash; label measurement stops 1 to 4</div>
<svg viewBox="0 0 520 318" role="img" aria-label="Blank gridded field map">
<rect x="24" y="18" width="472" height="282" rx="4" fill="#fff" stroke="#2a5736" stroke-width="1.5"/>
<g stroke="#dedad1" stroke-width="0.8">${gridLines}</g>
<path d="M472 55 L486 24 L500 55 L486 48 Z" fill="#2a5736"/><text x="486" y="16" text-anchor="middle" font-family="JetBrains Mono" font-size="11" fill="#2a5736">N</text>
<text x="260" y="160" text-anchor="middle" font-family="Inter" font-size="12" fill="#9a958b">Sketch buildings, paths, trees, shade, and safe boundaries here</text>
</svg>
<div class="uh-legend"><span><b>S / E</b> instructor-marked start and finish</span><span><b>1&ndash;4</b> paired measurement stops</span><span><b>////</b> shade</span><span><b>△</b> tree</span><span><b>▭</b> building</span><span><b>- - -</b> direct path</span><span><b>&mdash;</b> cool corridor</span></div></div>
<div class="uh-side">
<div class="uh-box"><div class="uh-h">Matched surface temperatures</div>
<table class="uh-t"><thead><tr><th>#</th><th>Same surface type</th><th>Sun &deg;F / &deg;C</th><th>Shade &deg;F / &deg;C</th><th>Gap</th></tr></thead><tbody>${rows}</tbody></table>
<div class="uh-note" style="margin-top:4pt">At each stop, compare the same surface type from the same distance. Circle one unit and use it throughout.</div></div>
<div class="uh-box"><div class="uh-h">Route evidence</div>
<div class="uh-line">Hottest point on the direct path: ____________________</div>
<div class="uh-line">Hottest point on our cool corridor: _________________</div>
<div class="uh-line">Our route reduces peak surface temperature by: ______</div>
<div class="uh-line">Distance or convenience tradeoff: __________________</div>
<div class="uh-line">Evidence sentence: _________________________________</div>
<div class="uh-line">__________________________________________________</div></div>
<div class="uh-safe"><b>Field safety:</b> stay with your buddy, remain inside the marked boundary, walk, hydrate, and aim the IR thermometer at surfaces only &mdash; never at eyes.</div>
</div></div></div>`;
}

// TTB-04 Photosynthesis Float-Off Playoffs data table: the minute-by-minute
// floating-disk record for the baseline and redesign runs, which the rubric
// grades but the handout leaves no room for. Exposed as floatOffDataAppendix();
// build_trees.mjs renders it as the standalone TTB-04 printable.
export function floatOffDataAppendix() {
  const rows = Array.from({ length: 11 }, (_, m) =>
    `<tr><td class="fo-min">${m}</td><td></td><td></td></tr>`).join("");
  const css = `
.fo-apx .fo-note { color: var(--ink2); font-size: 9pt; margin: 0 0 6pt; }
.fo-apx .fo-meta { font-family: var(--mono); font-size: 9pt; margin: 4pt 0 8pt; }
.fo-apx table.fo-t { border-collapse: collapse; width: 70%; font-size: 9.5pt; }
.fo-apx table.fo-t th { background: var(--camp-ink); color: #fff; padding: 4pt 7pt; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .04em; }
.fo-apx table.fo-t td { border: 0.7pt solid var(--rule2); height: 0.3in; padding: 2pt 7pt; text-align: center; }
.fo-apx table.fo-t td.fo-min { font-family: var(--mono); font-weight: 700; color: var(--camp-ink); background: var(--camp-tint); }
.fo-apx .fo-half { font-size: 9.5pt; margin-top: 9pt; }
.fo-apx .fo-half div { margin: 4pt 0; }
`;
  return `<div class="fo-apx"><style>${css}</style>
<div class="sheet-head"><div class="sheet-eyebrow">From Trees to Tech 2026 &middot; TTB-04 Photosynthesis Float-Off Playoffs</div><div class="sheet-title">Floating-disk data table</div></div>
<p class="fo-note">Load 10 disks, start the timer, and record how many are floating at the end of each minute for the baseline run, then again after your redesign. The graded data table is worth 20 points.</p>
<div class="fo-meta">Team ___________________   The ONE variable we changed for the redesign: ___________________</div>
<table class="fo-t"><thead><tr><th>Minute</th><th>Baseline: disks floating</th><th>Redesign: disks floating</th></tr></thead><tbody>${rows}</tbody></table>
<div class="fo-half">
<div>Half-float time, baseline (minutes until 5 of 10 disks float): ________________</div>
<div>Half-float time, after redesign: ________________</div>
</div>`;
}

// PYS-01 Magnetic Capsule Maze Cup: the seeded maze generator and the four
// maze boards. The geometry lives here as the single source consumed by the
// standalone printable (tools/docgen/build_pystem.mjs), the only place the
// boards ship. Seeds are chosen so the solvable path length rises A<B<C<D
// (5<9<11<14 cells), verified by BFS on the seeded generator; one full-width
// board per page keeps the corridor pitch wide enough for the steel token.
function mazeRng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; }
function genMaze(cols, rows, seed) {
  const rand = mazeRng(seed);
  const c = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ n: true, e: true, s: true, w: true, v: false })));
  const stack = [[0, 0]]; c[0][0].v = true;
  const dirs = [["n", 0, -1, "s"], ["s", 0, 1, "n"], ["e", 1, 0, "w"], ["w", -1, 0, "e"]];
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const opts = dirs.filter(([, dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && nx < cols && ny >= 0 && ny < rows && !c[ny][nx].v; });
    if (!opts.length) { stack.pop(); continue; }
    const [d, dx, dy, opp] = opts[Math.floor(rand() * opts.length)];
    c[y][x][d] = false; const nx = x + dx, ny = y + dy; c[ny][nx][opp] = false; c[ny][nx].v = true; stack.push([nx, ny]);
  }
  return c;
}
export function mazeSvg(cols, rows, seed, cell) {
  const m = genMaze(cols, rows, seed);
  const W = cols * cell, H = rows * cell, t = 8;
  // Interior walls only; the arena border is a dedicated rounded frame below.
  let lines = "";
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const px = x * cell, py = y * cell, q = m[y][x];
    if (y > 0 && q.n) lines += `<line x1="${px}" y1="${py}" x2="${px + cell}" y2="${py}"/>`;
    if (x > 0 && q.w) lines += `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + cell}"/>`;
  }
  // Faint lattice dots at the interior corridor grid so the board reads as a
  // designed game surface; walls and markers paint over them.
  let dots = "";
  for (let y = 1; y < rows; y++) for (let x = 1; x < cols; x++) {
    dots += `<circle cx="${x * cell}" cy="${y * cell}" r="2.4" fill="#d9d3c7"/>`;
  }
  // Endpoint cells get a soft tint; START is a labeled green pad, FINISH a
  // labeled bullseye, so the endpoints are unmistakable at arm's length.
  const inset = 7;
  const fx = (cols - 1) * cell, fy = (rows - 1) * cell;
  const cellTint = (px, py, fill) =>
    `<rect x="${px + inset}" y="${py + inset}" width="${cell - 2 * inset}" height="${cell - 2 * inset}" rx="10" fill="${fill}"/>`;
  const padW = cell * 0.66, padH = cell * 0.4;
  const start = `${cellTint(0, 0, "#e7f0e9")}
<rect x="${cell / 2 - padW / 2}" y="${cell / 2 - padH / 2}" width="${padW}" height="${padH}" rx="9" fill="#1f7a4d"/>
<text x="${cell / 2}" y="${cell / 2 + 5}" font-size="14.5" font-weight="700" letter-spacing="1.5" text-anchor="middle" fill="#fff" font-family="JetBrains Mono">START</text>`;
  const bcx = fx + cell / 2, bcy = fy + cell / 2 - 7;
  const finish = `${cellTint(fx, fy, "#f7e9e5")}
<circle cx="${bcx}" cy="${bcy}" r="21" fill="#fff" stroke="#b3402a" stroke-width="4.5"/>
<circle cx="${bcx}" cy="${bcy}" r="12" fill="none" stroke="#b3402a" stroke-width="3"/>
<circle cx="${bcx}" cy="${bcy}" r="4.5" fill="#b3402a"/>
<text x="${bcx}" y="${bcy + 40}" font-size="12.5" font-weight="700" letter-spacing="1.2" text-anchor="middle" fill="#b3402a" font-family="JetBrains Mono">FINISH</text>`;
  return `<svg viewBox="-${t} -${t} ${W + 2 * t} ${H + 2 * t}" width="${(W / 96).toFixed(2)}in">
<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="#faf8f4"/>
${dots}
${start}
${finish}
<g stroke="#111" stroke-width="5.5" stroke-linecap="round">${lines}</g>
<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="none" stroke="#111" stroke-width="7"/></svg>`;
}
// Seeds chosen by BFS on the seeded generator so the unique solution path
// rises A<B<C<D (6<10<12<15 cells) with walls spread evenly across the board
// quadrants and the route turning often instead of hugging the border.
export const MAZE_DEFS = [["Maze A", "warm-up", 4, 3, 696], ["Maze B", "easy", 5, 4, 214], ["Maze C", "medium", 5, 4, 904], ["Maze D", "hard", 6, 4, 642]];

// The four framed boards plus their scoped styles, one board per page. Shared
// verbatim by the standalone printable and the guide appendix.
export function mazeBoardsHtml() {
  const cards = MAZE_DEFS.map(([n, lv, c, r, s], i) => `<div class="mz"${i ? ' style="break-before:page"' : ""}><div class="mz-h"><b>${n}</b><span>${lv}</span></div>${mazeSvg(c, r, s, 96)}</div>`).join("");
  return `<style>
.mz-wrap{display:flex;flex-direction:column;gap:16pt;}
.mz{border:1.3pt solid var(--camp-ink);border-radius:7pt;padding:12pt;text-align:center;break-inside:avoid;}
.mz-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8pt;}
.mz-h b{font-family:var(--serif);color:var(--camp-ink);font-size:15pt;}
.mz-h span{font-family:var(--mono);font-size:8pt;text-transform:uppercase;letter-spacing:.08em;color:var(--camp-acc);}
.mz svg{width:100%;height:auto;}
</style>
<div class="mz-wrap">${cards}</div>`;
}

// The student-facing maze-board note that heads the standalone printable.
export const MAZE_NOTE = `Place a steel washer or small nut (the "capsule") on the green <b>START</b> pad and move the 6&nbsp;mm driver magnet UNDER the board to drag it to the red <b>FINISH</b> bullseye without touching the maze walls. A small washer turns corners more easily than a long paperclip, especially on Maze D. Move the driver slowly.`;
