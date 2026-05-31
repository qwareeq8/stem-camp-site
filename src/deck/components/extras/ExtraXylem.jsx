// ExtraXylem component for the STEM Camp interactive deck.
import { useState } from "react";
import { Droplets } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraXylem() {
  // TTT-04 "Material and geometry" (concept 2). Sibling DemoCapillary covers
  // capillary rise vs tube bore. This is the DELIVERY problem: pick a wick
  // material and a route (length, slope) to move the most water to the target.
  // A good wick over a short, low route delivers fast; a weak wick up a long
  // climb wastes most of it.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, waterC = "#5a93c9";
  const MATS = [{ id: "felt", n: "felt", r: 0.58 }, { id: "cotton", n: "cotton wick", r: 1.0 }, { id: "paper", n: "paper towel", r: 0.82 }];
  const [mi, setMi] = useState(1);
  const [len, setLen] = useState(3);
  const [rise, setRise] = useState(20);
  const [clk, setClk] = useState(0);
  useRAF(true, (dt) => setClk((v) => (v + dt * 0.001) % 1));
  const mat = MATS[mi];

  const geomF = Math.max(0.05, (1 - (len - 1) / 12) * (1 - rise / 150));
  const rateOf = (mr) => Math.max(3, Math.min(100, Math.round(mr * 100 * geomF)));
  const rate = rateOf(mat.r);
  const bestId = "cotton";
  const losses = [["weak wick", 1 - mat.r], ["long path", (len - 1) / 12], ["steep climb", rise / 150]];
  losses.sort((a, b) => b[1] - a[1]);
  const limit = rate >= 70 ? "well routed" : losses[0][0];

  // route geometry (quadratic bezier source -> apex -> target)
  const groundY = 196;
  const P0 = { x: 46, y: 180 };
  const tx = 138 + len * 8;
  const targetBottom = groundY - rise * 0.9;
  const ty = targetBottom - 20;
  const P2 = { x: tx, y: ty };
  const P1 = { x: (P0.x + tx) / 2, y: Math.max(54, Math.min(P0.y, ty) - 32) };
  const B = (u) => ({ x: (1 - u) * (1 - u) * P0.x + 2 * (1 - u) * u * P1.x + u * u * P2.x, y: (1 - u) * (1 - u) * P0.y + 2 * (1 - u) * u * P1.y + u * u * P2.y });
  const path = "M " + P0.x + " " + P0.y + " Q " + P1.x + " " + P1.y + " " + P2.x + " " + P2.y;
  const spill = rate < 45;

  return (
    <div>
      <Field height={236}>
        <svg viewBox="0 0 440 236" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Material + geometry</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>pick the wick and the route to deliver the most</text>

          {/* ===== LEFT: source, wick route, target cup ===== */}
          <rect x="16" y="34" width="232" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          <text x="24" y="48" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.06 })}>route len {len} {"·"} rise {rise}%</text>
          <line x1="20" y1={groundY} x2="244" y2={groundY} stroke={T.rule22} strokeWidth="1" />
          <path d={path} fill="none" stroke="#caa676" strokeWidth="7" strokeLinecap="round" />
          <path d={path} fill="none" stroke={waterC} strokeWidth="3" strokeLinecap="round" opacity={0.35 + rate / 200} />
          {Array.from({ length: 6 }, (_, i) => {
            const u = (clk * (0.4 + rate / 60) + i / 6) % 1, p = B(u);
            return <circle key={i} cx={p.x} cy={p.y} r="3" fill={waterC} />;
          })}
          {spill && Array.from({ length: 3 }, (_, i) => {
            const p = B(0.5), fall = (clk * 2 + i * 0.33) % 1;
            return <circle key={"sp" + i} cx={p.x + (i - 1) * 5} cy={p.y + 6 + fall * 40} r="1.8" fill={waterC} opacity={0.6 * (1 - fall)} />;
          })}
          {/* source cup */}
          <path d="M30 178 L62 178 L58 196 L34 196 Z" fill={T.paper} stroke={T.ink} strokeWidth="0.8" />
          <path d="M33 187 L59 187 L57 195 L35 195 Z" fill={waterC} opacity="0.5" />
          <text x="46" y="208" textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true })}>source</text>
          {/* target cup (fills with delivery rate) */}
          {targetBottom < groundY - 1 && <line x1={tx} y1={targetBottom} x2={tx} y2={groundY} stroke={T.rule22} strokeWidth="1.5" strokeDasharray="2 2" />}
          <path d={"M " + (tx - 13) + " " + ty + " L " + (tx + 13) + " " + ty + " L " + (tx + 10) + " " + (ty + 20) + " L " + (tx - 10) + " " + (ty + 20) + " Z"} fill={T.paper} stroke={T.ink} strokeWidth="0.8" />
          <path d={"M " + (tx - 13 + 13 * (1 - rate / 100)) + " " + (ty + 20 - 18 * rate / 100) + " L " + (tx + 13 - 13 * (1 - rate / 100)) + " " + (ty + 20 - 18 * rate / 100) + " L " + (tx + 10) + " " + (ty + 20) + " L " + (tx - 10) + " " + (ty + 20) + " Z"} fill={waterC} opacity="0.6" />
          <text x={tx} y={groundY + 12} textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true })}>target</text>

          {/* ===== RIGHT: material comparison ===== */}
          <rect x="258" y="34" width="166" height="184" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="270" y="52" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>wick materials</text>
          <text x="270" y="65" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.06 })}>delivery on this route</text>
          {MATS.map((m, k) => {
            const r = rateOf(m.r), cur = k === mi, best = m.id === bestId, y = 92 + k * 34;
            return (
              <g key={m.id}>
                <text x="270" y={y - 5} fill={cur ? C : T.mute} style={f.mono(cur ? 700 : 500, 8.5, { upper: true })}>{m.n}{cur ? "  ◀" : ""}</text>
                <rect x="270" y={y} width="108" height="12" rx="2" fill={T.rule12} />
                <rect x="270" y={y} width={Math.max(2, 108 * r / 100)} height="12" rx="2" fill={best ? okC : cur ? C : A} opacity={cur || best ? 1 : 0.5} />
                <text x="410" y={y + 10} textAnchor="end" fill={cur ? C : T.mute} style={f.mono(700, 8)}>{r}</text>
              </g>
            );
          })}
          <text x="270" y="206" fill={T.mute} style={f.sans(400, 8.5, { lh: 1.3 })}>cotton pulls hardest of the three</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={Droplets} color={C} onClick={() => setMi((v) => (v + 1) % MATS.length)}>{mat.n}</Btn>
        <Slider val={len} set={setLen} min={1} max={10} step={1} color={C} label="Path length" suffix={len} />
        <Slider val={rise} set={setRise} min={0} max={100} step={1} color={A} label="Climb" suffix={rise + "%"} />
      </div>

      <Readout items={[
        { l: "Wick", v: mat.n, color: C },
        { l: "Delivery rate", v: rate, color: rate >= 70 ? okC : rate >= 40 ? A : warnC },
        { l: "Best wick", v: mat.id === bestId ? "this one" : "cotton wick", color: mat.id === bestId ? okC : A },
        { l: "Limiting", v: limit, color: limit === "well routed" ? okC : warnC },
      ]} />

      <Caption color={C}>
        Wicking moves water without a pump, but how fast depends on the material and the route. A
        cotton wick pulls harder than felt, and a short, nearly level path beats a long uphill one
        because gravity and friction fight the climb. To win the relay you match a strong wick to
        the easiest route and lose the least to spill along the way.
      </Caption>
    </div>
  );
}

export { ExtraXylem };
