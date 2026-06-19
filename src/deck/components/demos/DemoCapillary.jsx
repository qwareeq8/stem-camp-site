// DemoCapillary component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function DemoCapillary() {
  // TTT "Capillary action" (concept 1). Sibling (Material and geometry) compares
  // wicks and routes. This demo owns the physics: adhesion (water to wall) plus
  // cohesion (water to water) pulls a column up a narrow bore, and Jurin's law
  // says rise height goes as 1/r, so narrower and more wettable bores climb higher
  // and faster. A rack of tubes shows the 1/r trend, a meniscus zoom shows the two
  // forces, and a strip plots height vs bore. Trees moss and terracotta.
  const C = CAMP.trees.ink, A = CAMP.trees.acc, WAT = "#4f8ec9", WHI = "#9cc2e5";
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const bores = [6, 10, 16, 24, 34], xs = [54, 110, 168, 230, 298];
  const [wett, setWett] = useState(9);          // wettability 3..12
  const [running, setRunning] = useState(true);
  const [, force] = useState(0);
  const hsRef = useRef(bores.map(() => 0));
  const srcY = 280;
  const hMax = (b) => cl(150 * (wett / 9) * (10 / b), 16, 226);
  const reset = () => { hsRef.current = bores.map(() => 0); setRunning(true); };

  useRAF(running, (dt) => {
    let settled = true;
    hsRef.current = hsRef.current.map((h, i) => { const m = hMax(bores[i]); const tau = 360 + bores[i] * 55; const nh = h + (m - h) * Math.min(1, dt / tau * 2.4); if (Math.abs(nh - m) > 1) settled = false; return nh; });
    if (settled) setRunning(false);
    force((n) => (n + 1) % 1000000);
  });

  const hs = hsRef.current;
  const VW = 480, VH = 320;
  const zx = 404, zy = 116;                       // meniscus zoom center
  const lpX = 338, lpW = 132, lpY = 246, lpH = 58; // law strip
  const lx = (b) => lpX + 12 + ((b - 6) / 28) * (lpW - 24);
  const ly = (h) => lpY + lpH - 8 - (h / 226) * (lpH - 18);

  return (
    <div>
      <Field height={330}>
        <svg viewBox="0 0 480 340" style={{ width: "100%", height: "100%" }}>
          <text x="16" y="22" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Capillary action</text>
          <text x="16" y="36" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>narrow bores pull water higher: h proportional to 1/r</text>

          {/* water source */}
          <rect x="30" y={srcY} width="290" height="20" fill={WAT} opacity="0.35" />
          <line x1="30" y1={srcY} x2="320" y2={srcY} stroke={T.ink} strokeWidth="0.6" opacity="0.6" />
          <text x="36" y={srcY + 14} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>water source</text>

          {/* rack of tubes */}
          {bores.map((b, i) => { const x = xs[i], half = b / 2 + 1, top = srcY - hs[i]; return (
            <g key={i}>
              <rect x={x - half - 1.5} y="48" width="1.5" height={srcY - 48} fill={T.ink} opacity="0.7" />
              <rect x={x + half} y="48" width="1.5" height={srcY - 48} fill={T.ink} opacity="0.7" />
              <rect x={x - half} y={top} width={2 * half} height={srcY - top} fill={WAT} opacity="0.5" />
              <path d={"M " + (x - half) + " " + top + " Q " + x + " " + (top - Math.min(7, half * (wett / 9))) + " " + (x + half) + " " + top + " L " + (x + half) + " " + (top + 2) + " L " + (x - half) + " " + (top + 2) + " Z"} fill={WAT} />
              <text x={x} y={srcY + 30} textAnchor="middle" fill={i === 0 ? A : T.mute} style={f.mono(600, 8)}>{b}</text>
            </g>
          ); })}
          <text x={xs[2]} y={srcY + 44} textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>bore width (narrow to wide)</text>
          <line x1={xs[0]} y1={srcY - hMax(bores[0])} x2={zx - 54} y2={srcY - hMax(bores[0])} stroke={A} strokeWidth="0.6" strokeDasharray="2 3" opacity="0.5" />

          {/* meniscus zoom (narrowest tube) */}
          <circle cx={zx} cy={zy} r="50" fill={T.paper2} stroke={C} strokeWidth="1" />
          <rect x={zx - 22} y={zy - 40} width="3" height="78" fill={T.ink} opacity="0.8" />
          <rect x={zx + 19} y={zy - 40} width="3" height="78" fill={T.ink} opacity="0.8" />
          <rect x={zx - 19} y={zy - 6} width="38" height="44" fill={WAT} opacity="0.5" />
          <path d={"M " + (zx - 19) + " " + (zy - 6) + " Q " + zx + " " + (zy - 26) + " " + (zx + 19) + " " + (zy - 6) + " L " + (zx + 19) + " " + (zy - 2) + " L " + (zx - 19) + " " + (zy - 2) + " Z"} fill={WAT} />
          {[-1, 1].map((s, i) => <g key={i}><line x1={zx + s * 17} y1={zy - 2} x2={zx + s * 17} y2={zy - 22} stroke={A} strokeWidth="1.4" /><polygon points={(zx + s * 17) + "," + (zy - 24) + " " + (zx + s * 17 - 3) + "," + (zy - 18) + " " + (zx + s * 17 + 3) + "," + (zy - 18)} fill={A} /></g>)}
          {[[zx - 6, zy + 12], [zx + 6, zy + 14], [zx - 2, zy + 24]].map((p, i) => <circle key={"co" + i} cx={p[0]} cy={p[1]} r="2.4" fill={WHI} />)}
          <text x={zx} y={zy - 56} textAnchor="middle" fill={T.mute} style={f.mono(600, 6.5, { upper: true, tracking: 0.08 })}>adhesion (to wall)</text>
          <text x={zx} y={zy + 64} textAnchor="middle" fill={T.mute} style={f.mono(600, 6.5, { upper: true, tracking: 0.08 })}>cohesion (water-water)</text>

          {/* height vs bore strip (1/r) */}
          <rect x={lpX} y={lpY} width={lpW} height={lpH} rx="5" fill={T.paper2} stroke={C} strokeWidth="0.8" />
          <text x={lpX + 8} y={lpY - 4} fill={T.mute} style={f.mono(700, 7, { upper: true, tracking: 0.1 })}>rise vs bore</text>
          <polyline points={bores.map((b) => lx(b).toFixed(1) + "," + ly(hMax(b)).toFixed(1)).join(" ")} fill="none" stroke={A} strokeWidth="1.6" />
          {bores.map((b, i) => <circle key={"lp" + i} cx={lx(b)} cy={ly(hMax(b))} r={i === 0 ? 3 : 2} fill={i === 0 ? A : C} />)}
          <text x={lpX + 8} y={lpY + lpH - 4} fill={T.mute} style={f.mono(500, 6.5)}>narrow</text>
          <text x={lpX + lpW - 8} y={lpY + lpH - 4} textAnchor="end" fill={T.mute} style={f.mono(500, 6.5)}>wide</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={wett} set={(v) => { setWett(v); }} min={3} max={12} step={1} color={C} label="Wettability" suffix={wett} />
        <Btn small icon={running ? Pause : Play} color={C} onClick={() => setRunning((r) => !r)}>{running ? "pause" : "run"}</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>

      <Readout items={[
        { l: "Narrowest rise", v: Math.round(hs[0]) + " px", color: A },
        { l: "Widest rise", v: Math.round(hs[4]) + " px", color: C },
        { l: "Ratio narrow:wide", v: (bores[4] / bores[0]).toFixed(1) + "x" },
        { l: "Law", v: "h ~ 1/r" },
      ]} />

      <Caption color={C}>
        Water sticks to the glass (adhesion) and to itself (cohesion), so along a narrow wall it is
        pulled upward and drags a connected column with it against gravity. The thinner the bore, the
        less weight there is for the same wall grip, so the water climbs higher and faster: rise height
        goes as 1 over the radius. More wettable walls pull harder still. Trees use this in their narrow xylem too, but on its own it lifts water only about a
        meter; most of the lift in a tall tree comes from water evaporating at the leaves
        (transpiration), which pulls the whole column up.
      </Caption>
    </div>
  );
}

export { DemoCapillary };
