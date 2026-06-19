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
