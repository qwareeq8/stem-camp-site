// DemoTreering component for the STEM Camp interactive deck.
import { useMemo, useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider, Tag } from "../../ui/primitives.jsx";

function DemoTreering() {
  // TTT "Rings as proxy data" (concept 1). Sibling ExtraCER (concept 2) is the
  // claim/evidence/reasoning drill. This demo owns the proxy idea: one ring per
  // year, wide rings = good season, narrow = stress, so the ring series is an
  // indirect record of past climate. A real concentric cross-section on the left
  // is synced to a width-per-year record on the right; scrub a year to read both.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const N = 36, y0 = 1989;
  const rings = useMemo(() => {
    const out = []; let ph = 0;
    for (let i = 0; i < N; i++) {
      ph += 0.5;
      const drought = (i >= 12 && i <= 16) ? -2.6 : 0;
      const fire = (i === 24) ? -3.6 : 0;
      const w = Math.max(0.9, 5.4 + Math.sin(ph) * 1.1 + Math.sin(ph * 0.4) * 1.5 + drought + fire);
      const ev = fire ? "fire scar" : drought ? "drought" : (w > 6.6 ? "wet warm year" : (w < 3.4 ? "stress year" : "average"));
      out.push({ year: y0 + i, w, ev, fire: !!fire, drought: !!drought });
    }
    return out;
  }, []);
  const [sel, setSel] = useState(20);
  const sr = rings[sel];
  const woodCol = (r) => r.fire ? "#3b2410" : (r.drought || r.w < 3.4) ? "#7a4b22" : (r.w > 6.6 ? "#cda35a" : "#a8763a");

  // disc geometry: cumulative radii
  const cx = 128, cy = 168, pith = 7, maxR = 104;
  const total = rings.reduce((s, r) => s + r.w, 0), k = (maxR - pith) / total;
  const radii = []; let acc = pith; for (let i = 0; i < N; i++) { acc += rings[i].w * k; radii.push(acc); }
  const rInner = (i) => i === 0 ? pith : radii[i - 1];

  // series geometry
  const pX = 264, pW = 204, pY = 70, pH = 150, baseY = pY + pH - 16;
  const bw = pW / N, maxW = Math.max(...rings.map((r) => r.w));
  const bh = (w) => (w / maxW) * (pH - 30);

  return (
    <div>
      <Field height={300}>
        <svg viewBox="0 0 480 300" style={{ width: "100%", height: "100%" }}>
          <text x="16" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Rings as proxy data</text>
          <text x="16" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>one ring per year, width records the season</text>

          {/* concentric cross-section (outer drawn first) */}
          <circle cx={cx} cy={cy} r={maxR + 5} fill="#8a5a2c" />
          {rings.slice().reverse().map((r, ri) => { const i = N - 1 - ri; return <circle key={i} cx={cx} cy={cy} r={radii[i]} fill={woodCol(r)} />; })}
          <circle cx={cx} cy={cy} r={pith} fill="#5e3a18" />
          {/* selected ring highlight */}
          <circle cx={cx} cy={cy} r={radii[sel]} fill="none" stroke={A} strokeWidth="1.6" />
          <circle cx={cx} cy={cy} r={rInner(sel)} fill="none" stroke={A} strokeWidth="1.6" opacity="0.7" />
          {/* radial pointer to the selected ring */}
          {(() => { const rr = (rInner(sel) + radii[sel]) / 2; const ang = -Math.PI / 2.4; const ex = cx + Math.cos(ang) * rr, ey = cy + Math.sin(ang) * rr; return (<g><line x1={cx} y1={cy} x2={cx + Math.cos(ang) * (maxR + 16)} y2={cy + Math.sin(ang) * (maxR + 16)} stroke={A} strokeWidth="0.7" strokeDasharray="2 3" opacity="0.7" /><circle cx={ex} cy={ey} r="3.2" fill={A} stroke={T.paper} strokeWidth="1" /></g>); })()}
          <text x={cx} y={cy + maxR + 22} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>trunk cross-section</text>
          <text x={cx} y={52} textAnchor="middle" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.06 })}>outside = newest, center = oldest</text>

          {/* width-per-year record */}
          <text x={pX} y={pY - 8} fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.14 })}>ring width per year (proxy record)</text>
          <line x1={pX} y1={baseY} x2={pX + pW} y2={baseY} stroke={T.rule22} strokeWidth="0.7" />
          {rings.map((r, i) => <rect key={"s" + i} x={pX + i * bw + 0.4} y={baseY - bh(r.w)} width={bw - 0.8} height={bh(r.w)} fill={woodCol(r)} opacity={i === sel ? 1 : 0.85} />)}
          {/* drought + fire markers */}
          {(() => { const ds = rings.findIndex((r) => r.drought), de = rings.length - 1 - rings.slice().reverse().findIndex((r) => r.drought); const fi = rings.findIndex((r) => r.fire); return (<g><rect x={pX + ds * bw} y={pY + 2} width={(de - ds + 1) * bw} height={pH - 18} fill={T.warn} opacity="0.08" /><text x={pX + (ds + (de - ds) / 2) * bw} y={baseY + 11} textAnchor="middle" fill="#7a4b22" style={f.mono(700, 6.5, { upper: true, tracking: 0.06 })}>drought</text><line x1={pX + fi * bw + bw / 2} y1={pY + 2} x2={pX + fi * bw + bw / 2} y2={baseY} stroke="#3b2410" strokeWidth="1.2" strokeDasharray="2 2" /><text x={pX + fi * bw + bw / 2} y={baseY + 11} textAnchor="middle" fill="#3b2410" style={f.mono(700, 6.5, { upper: true, tracking: 0.04 })}>fire</text></g>); })()}
          {/* selected cursor */}
          <line x1={pX + sel * bw + bw / 2} y1={pY} x2={pX + sel * bw + bw / 2} y2={baseY} stroke={A} strokeWidth="1.1" strokeDasharray="3 3" />
          <text x={pX} y={baseY + 11} fill={T.mute} style={f.mono(500, 7)}>{rings[0].year}</text>
          <text x={pX + pW} y={baseY + 11} textAnchor="end" fill={T.mute} style={f.mono(500, 7)}>{rings[N - 1].year}</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={sel} set={setSel} min={0} max={N - 1} step={1} color={C} label="Scrub year" suffix={sr.year} />
        <Tag color={sr.fire ? "#3b2410" : sr.drought ? "#7a4b22" : A}>{sr.ev}</Tag>
      </div>

      <Readout items={[
        { l: "Year", v: sr.year, color: C },
        { l: "Ring width", v: sr.w.toFixed(1) + " mm", color: A },
        { l: "Season", v: sr.w > 6.6 ? "good growth" : sr.w < 3.4 ? "stress" : "average" },
        { l: "Record", v: "proxy" },
      ]} />

      <Caption color={C}>
        A tree lays down one ring each year, so counting from the bark inward dates every ring. A wide
        pale ring means a warm, wet, easy season; a narrow dark ring means stress such as drought,
        cold, or crowding; a charcoal scar marks a fire. The tree never writes down a number, so the
        rings are a proxy, an indirect record that lets us reconstruct the climate of years no one
        measured.
      </Caption>
    </div>
  );
}

export { DemoTreering };
