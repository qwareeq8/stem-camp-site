// ExtraPinecone component for the STEM Camp interactive deck.
import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraPinecone() {
  // TTT-06 "Hygromorphs" (concept 1). Sibling ExtraBilayer is the engineered
  // strip + dial. This is the NATURAL cone and its seed-dispersal strategy: it
  // opens in dry air to fling winged seeds on the breeze, and seals shut when
  // humid to hold them for a better day. No motor, no power, just material.
  // The breeze is drifting streamlines bounded inside the box, and the cone is a
  // teardrop of overlapping rounded scales that splay open when the air is dry.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, wood = "#6e4a26", woodD = "#3e2a14", woodH = "#a9793f";
  const [humid, setHumid] = useState(35);
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);
  useRAF(playing, (dt) => setClk((v) => (v + dt * 0.0006) % 1));

  const open = Math.max(0, Math.min(1, (75 - humid) / 55));
  const state = open >= 0.66 ? "open" : open >= 0.28 ? "ajar" : "closed";
  const releasing = open >= 0.5;
  const aloft = releasing ? Math.round(open * 6) : 0;
  const strat = releasing ? "dry: release seeds" : "humid: hold seeds";

  const rows = Array.from({ length: 9 }, (_, r) => r);
  // response curve
  const cX0 = 280, cX1 = 410, cY0 = 72, cY1 = 150;
  const px = (h) => cX0 + ((h - 20) / 75) * (cX1 - cX0);
  const py = (o) => cY1 - o * (cY1 - cY0);
  const curve = Array.from({ length: 31 }, (_, i) => { const h = 20 + i * 2.5; const o = Math.max(0, Math.min(1, (75 - h) / 55)); return px(h) + "," + py(o); }).join(" ");

  // contained drifting breeze (traveling sine; arrowheads stay inside the box)
  const wPhase = clk * 6.2832 * 2;
  const streamPts = (yB, x0, x1, amp, kk) => { let o = ""; for (let x = x0; x <= x1; x += 6) { const yy = yB + amp * Math.sin(kk * (x - x0) - wPhase); o += x.toFixed(1) + "," + yy.toFixed(1) + " "; } return o.trim(); };
  const breeze = [{ y: 56, x0: 168, x1: 240, amp: 4, k: 0.07 }, { y: 80, x0: 168, x1: 240, amp: 5, k: 0.06 }, { y: 104, x0: 172, x1: 238, amp: 4, k: 0.07 }];

  return (
    <div>
      <Field height={226}>
        <svg viewBox="0 0 440 226" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Hygromorphs</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>a cone that opens and closes with no power</text>

          {/* ===== LEFT: the cone ===== */}
          <rect x="16" y="34" width="232" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {/* drifting breeze, only when dry/open, fully inside the box */}
          {open > 0.4 && breeze.map((sm, i) => { const pts = streamPts(sm.y, sm.x0, sm.x1, sm.amp, sm.k); const ye = sm.y + sm.amp * Math.sin(sm.k * (sm.x1 - sm.x0) - wPhase); return (
            <g key={"br" + i} opacity={0.3 + open * 0.3}>
              <polyline points={pts} fill="none" stroke={T.mute} strokeWidth="1" strokeLinecap="round" />
              <polygon points={(sm.x1 + 5).toFixed(1) + "," + ye.toFixed(1) + " " + sm.x1.toFixed(1) + "," + (ye - 2.6).toFixed(1) + " " + sm.x1.toFixed(1) + "," + (ye + 2.6).toFixed(1)} fill={T.mute} />
            </g>
          ); })}
          {/* drifting winged seeds when releasing */}
          {playing && releasing && Array.from({ length: aloft }, (_, i) => {
            const u = (clk + i * 0.17) % 1;
            const sx = 150 + u * 84, sy = 110 - u * 64 + Math.sin((clk + i) * 6.2) * 4;
            return (
              <g key={"sd" + i} opacity={0.9 * (1 - u)}>
                <line x1={sx - 6} y1={sy - 3} x2={sx} y2={sy} stroke="#b89a5e" strokeWidth="1.4" />
                <circle cx={sx} cy={sy} r="1.8" fill={woodD} />
              </g>
            );
          })}
          {/* stem */}
          <line x1="120" y1="70" x2="120" y2="60" stroke={woodD} strokeWidth="2.6" />
          {/* cone: teardrop body (dark gaps) + overlapping rounded scales */}
          <g transform="translate(120 122)">
            <ellipse cx="0" cy="0" rx="13" ry="44" fill={woodD} />
            {rows.map((r) => {
              const ry0 = -42 + r * 10.5;
              const rs = 1 - Math.abs(r - 4) / 5.4;
              const ext = 4 + open * (16 * rs + 4);
              const lift = open * (3 + r * 0.3);
              return [-1, 1].map((side) => {
                const bx = -2 * side, tx = (15 * rs + ext) * side, ty = ry0 - lift, mx = (bx + tx) / 2;
                return (
                  <g key={r + "_" + side}>
                    <path d={"M " + bx + " " + (ry0 - 3) + " Q " + mx + " " + (ty - 6) + " " + tx + " " + (ty - 1) + " Q " + (tx + 3 * side) + " " + (ty + 2.5) + " " + tx + " " + (ty + 6) + " Q " + mx + " " + (ry0 + 9) + " " + bx + " " + (ry0 + 6) + " Z"} fill={wood} stroke={woodD} strokeWidth="0.7" />
                    <path d={"M " + bx + " " + (ry0 - 1) + " Q " + mx + " " + (ty - 3.5) + " " + (tx - 2 * side) + " " + (ty - 0.5)} fill="none" stroke={woodH} strokeWidth="0.9" opacity="0.7" />
                  </g>
                );
              });
            })}
            <ellipse cx="0" cy="-46" rx="4.5" ry="6.5" fill={wood} stroke={woodD} strokeWidth="0.6" />
          </g>
          <text x="120" y="208" textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>
            {state === "open" ? "wide open → seeds fly" : state === "ajar" ? "ajar" : "sealed → seeds held"}
          </text>

          {/* ===== RIGHT: response curve ===== */}
          <rect x="258" y="34" width="166" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="270" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>opens when dry</text>
          <line x1={cX0} y1={cY1} x2={cX1} y2={cY1} stroke={T.rule22} strokeWidth="1" />
          <line x1={cX0} y1={cY0} x2={cX0} y2={cY1} stroke={T.rule22} strokeWidth="1" />
          <polyline points={curve} fill="none" stroke={C} strokeWidth="2" />
          <line x1={px(humid)} y1={cY0} x2={px(humid)} y2={cY1} stroke={T.mute} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
          <circle cx={px(humid)} cy={py(open)} r="4.5" fill={A} stroke={T.paper} strokeWidth="1.5" />
          <text x={cX0 - 4} y={cY0 + 4} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5)}>open</text>
          <text x={cX0 - 4} y={cY1} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5)}>shut</text>
          <text x={cX0} y={cY1 + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>dry</text>
          <text x={cX1} y={cY1 + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>humid</text>
          {/* dispersal badge */}
          <rect x="270" y="176" width="140" height="26" rx="4" fill={releasing ? okC : warnC} opacity="0.16" />
          <text x="340" y="193" textAnchor="middle" fill={releasing ? okC : warnC} style={f.mono(700, 10, { upper: true, tracking: 0.06 })}>{releasing ? "releasing seeds" : "holding seeds"}</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Slider val={humid} set={setHumid} min={20} max={95} step={1} color={C} label="Humidity" suffix={humid + "%"} />
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "breezy" : "still"}</Btn>
      </div>

      <Readout items={[
        { l: "Scale opening", v: Math.round(open * 100) + "%", color: open >= 0.5 ? okC : A },
        { l: "State", v: state, color: state === "open" ? okC : state === "closed" ? warnC : A },
        { l: "Seeds aloft", v: aloft, color: aloft > 0 ? okC : T.mute },
        { l: "Strategy", v: strat, color: C },
      ]} />

      <Caption color={C}>
        A pine cone is a smart material with no moving parts. Each woody scale is two layers that
        swell by different amounts, so in dry air the scales bend open and the winged seeds spill
        out to catch a breeze, while damp air swells them shut to hold the seeds until conditions
        improve. Dry and breezy is the best time to fly, so the cone waits for it on its own.
      </Caption>
    </div>
  );
}

export { ExtraPinecone };
