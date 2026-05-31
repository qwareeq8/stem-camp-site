// ExtraTour component for the STEM Camp interactive deck.
import { useState } from "react";
import { Leaf, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { Btn, Caption, Field, Readout, Tag } from "../../ui/primitives.jsx";

function ExtraTour() {
  // TTT-05 "Evidence from the tour" (concept 2). Sibling ExtraGreenhouse is the
  // single closed-loop control. This is EVIDENCE-BASED placement: the tour gives
  // each zone's measured temp, humidity, and light; you place a plant in the
  // zone whose readings match its needs, not by guessing.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, hC = "#5a93c9", lC = "#cf9b3f";
  const PLANTS = [
    { id: "fern", n: "Fern", T: 38, H: 82, L: 30 },
    { id: "orchid", n: "Orchid", T: 60, H: 68, L: 52 },
    { id: "cactus", n: "Cactus", T: 82, H: 16, L: 90 },
  ];
  const ZONES = [
    { id: "mist", n: "Cool Mist", T: 34, H: 86, L: 34 },
    { id: "bench", n: "Warm Bench", T: 62, H: 62, L: 56 },
    { id: "desert", n: "Desert Shelf", T: 84, H: 18, L: 88 },
    { id: "shade", n: "Shade Corner", T: 52, H: 50, L: 22 },
  ];
  const [pi, setPi] = useState(0);
  const [pick, setPick] = useState(null);
  const plant = PLANTS[pi];

  const fac = (a, b) => Math.max(0, 1 - Math.abs(a - b) / 45);
  const fit = (z) => Math.round(((fac(plant.T, z.T) + fac(plant.H, z.H) + fac(plant.L, z.L)) / 3) * 100);
  const fits = ZONES.map(fit);
  const bestIdx = fits.indexOf(Math.max(...fits));
  const pickedZone = pick != null ? ZONES.find((z) => z.id === pick) : null;
  const pickedFit = pickedZone ? fit(pickedZone) : null;
  const verdict = () => {
    if (!pickedZone) return "pick a zone";
    if (pickedFit >= 80) return "thrives";
    if (pickedFit >= 55) return "gets by";
    const d = [["T", pickedZone.T - plant.T], ["H", pickedZone.H - plant.H], ["L", pickedZone.L - plant.L]].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    if (d[0] === "T") return d[1] > 0 ? "too hot" : "too cold";
    if (d[0] === "H") return d[1] > 0 ? "too damp" : "too dry";
    return d[1] > 0 ? "scorched" : "too dim";
  };
  const vC = !pickedZone ? T.mute : pickedFit >= 80 ? okC : pickedFit >= 55 ? A : warnC;

  return (
    <div>
      <Field height={244}>
        <svg viewBox="0 0 440 244" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Evidence from the tour</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>read each zone, then place the plant on the evidence</text>

          {/* ===== zone cards (the tour readings) ===== */}
          {ZONES.map((z, i) => {
            const cx = 18 + (i % 2) * 108, cy = 36 + Math.floor(i / 2) * 90;
            const picked = pick === z.id, best = i === bestIdx;
            const bars = [["T", z.T, A], ["H", z.H, hC], ["L", z.L, lC]];
            return (
              <g key={z.id} data-zone={z.id} style={{ cursor: "pointer" }} onClick={() => setPick(z.id)}>
                <rect x={cx} y={cy} width="100" height="82" rx="3" fill={T.paper} stroke={picked ? C : T.rule12} strokeWidth={picked ? 1.8 : 1} />
                <text x={cx + 8} y={cy + 15} fill={C} style={f.mono(700, 8.5, { upper: true, tracking: 0.04 })}>{z.n}</text>
                <text x={cx + 92} y={cy + 15} textAnchor="end" fill={best ? okC : T.mute} style={f.mono(700, 8.5)}>{fits[i]}%</text>
                {bars.map((b, k) => {
                  const bx = cx + 26 + k * 26, bt = cy + 26, bh = 44, fh = (b[1] / 100) * bh;
                  return (
                    <g key={k}>
                      <rect x={bx - 6} y={bt} width="12" height={bh} rx="1.5" fill={T.rule12} />
                      <rect x={bx - 6} y={bt + bh - fh} width="12" height={fh} rx="1.5" fill={b[2]} />
                      <text x={bx} y={cy + 80} textAnchor="middle" fill={T.mute} style={f.mono(600, 7)}>{b[0]}</text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* ===== plant panel ===== */}
          <rect x="238" y="36" width="186" height="172" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          <text x="250" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>place this plant</text>
          <text x="250" y="76" fill={C} style={f.display(600, 20, { opsz: 40 })}>{plant.n}</text>
          {/* glyph */}
          <g transform="translate(366 50)">
            <path d="M -12 22 L 12 22 L 9 38 L -9 38 Z" fill="#8a5a2a" />
            <ellipse cx="-7" cy="12" rx="11" ry="5" fill={C} opacity="0.85" transform="rotate(-28 -7 12)" />
            <ellipse cx="7" cy="10" rx="11" ry="5" fill={C} opacity="0.85" transform="rotate(28 7 10)" />
            <ellipse cx="0" cy="4" rx="6" ry="11" fill={C} opacity="0.9" />
          </g>
          {/* need bars: ideal (plant) vs picked zone */}
          {[["temp", plant.T, pickedZone && pickedZone.T, A], ["humid", plant.H, pickedZone && pickedZone.H, hC], ["light", plant.L, pickedZone && pickedZone.L, lC]].map((r, k) => {
            const y = 110 + k * 22, x0 = 300, w = 112;
            const mIdeal = x0 + (r[1] / 100) * w;
            return (
              <g key={k}>
                <text x="250" y={y + 3} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.06 })}>{r[0]}</text>
                <line x1={x0} y1={y} x2={x0 + w} y2={y} stroke={T.rule22} strokeWidth="3" strokeLinecap="round" />
                <circle cx={mIdeal} cy={y} r="4" fill={r[3]} stroke={T.paper} strokeWidth="1" />
                {r[2] != null && <path d={"M " + (x0 + (r[2] / 100) * w) + " " + (y - 9) + " l -4 -5 l 8 0 Z"} fill={C} />}
              </g>
            );
          })}
          <text x="250" y="166" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.06 })}>{"●"} need  {"▾"} zone</text>
          <rect x="248" y="178" width="166" height="24" rx="4" fill={vC} opacity="0.16" />
          <text x="331" y="194" textAnchor="middle" fill={vC} style={f.mono(700, 10, { upper: true, tracking: 0.04 })}>{pickedZone ? verdict() + "  " + pickedFit + "%" : "pick a zone"}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={Leaf} color={C} onClick={() => { setPi((v) => (v + 1) % PLANTS.length); setPick(null); }}>next plant</Btn>
        <Btn small icon={RotateCcw} color={C} onClick={() => setPick(null)}>clear pick</Btn>
        <Tag color={C} style={{ marginLeft: 2 }}>click a zone to place {plant.n.toLowerCase()}</Tag>
      </div>

      <Readout items={[
        { l: "Plant", v: plant.n, color: C },
        { l: "Placed in", v: pickedZone ? pickedZone.n : "-", color: pickedZone ? C : T.mute },
        { l: "Fit", v: pickedFit != null ? pickedFit + "%" : "-", color: vC },
        { l: "Verdict", v: verdict(), color: vC },
      ]} />

      <Caption color={C}>
        On the tour you record each zone's real temperature, humidity, and light, then place a
        plant where the readings match its needs. That is evidence over guesswork: a fern wants the
        cool, damp, shaded corner, while a cactus wants the hot, dry, bright shelf. Put a plant in
        the wrong zone and the numbers tell you exactly how it will suffer.
      </Caption>
    </div>
  );
}

export { ExtraTour };
