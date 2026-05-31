// ExtraFoodWeb component for the STEM Camp interactive deck.
import { useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Tag } from "../../ui/primitives.jsx";

function ExtraFoodWeb() {
  // TTT-08 "Ecosystems in place" (concept 2). Sibling ExtraObservation is the
  // field-log checklist. Distinct from ExtraCascade (knockout cascade): this
  // classifies an ecosystem by ENERGY FLOW. Click an organism for its trophic
  // role, what it eats, and what eats it; the chart shows the ~10x energy loss
  // at each step up the chain, which is why apex predators are rare.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn;
  const LCOL = ["#cf9b3f", C, "#6f9b3f", A, "#7a2f1e"];
  const LNAME = ["energy source", "producer", "herbivore", "carnivore", "apex predator"];
  const LSHORT = ["sun", "producer", "herbivore", "carnivore", "apex"];
  const ENERGY = [0, 100, 10, 1, 0.1];

  const ORG = [
    { id: "sun", lv: 0, x: 40, y: 124 },
    { id: "oak", lv: 1, x: 94, y: 72 }, { id: "grass", lv: 1, x: 94, y: 124 }, { id: "berry", lv: 1, x: 94, y: 176 },
    { id: "caterpillar", lv: 2, x: 148, y: 98 }, { id: "rabbit", lv: 2, x: 148, y: 152 },
    { id: "warbler", lv: 3, x: 200, y: 98 }, { id: "snake", lv: 3, x: 200, y: 152 },
    { id: "hawk", lv: 4, x: 226, y: 124 },
  ];
  const EAT = [
    ["sun", "oak"], ["sun", "grass"], ["sun", "berry"],
    ["oak", "caterpillar"], ["grass", "rabbit"], ["berry", "rabbit"],
    ["caterpillar", "warbler"], ["rabbit", "snake"],
    ["warbler", "hawk"], ["snake", "hawk"],
  ];
  const O = {}; ORG.forEach((o) => { O[o.id] = o; });

  const [sel, setSel] = useState("rabbit");
  const [playing, setPlaying] = useState(true);
  const [clk, setClk] = useState(0);
  useRAF(playing, (dt) => setClk((v) => (v + dt * 0.0007) % 1));

  const prey = EAT.filter(([a, b]) => b === sel).map(([a]) => a);
  const preds = EAT.filter(([a, b]) => a === sel).map(([, b]) => b);
  const selLv = sel ? O[sel].lv : -1;
  const rows = [{ lv: 4, y: 80 }, { lv: 3, y: 114 }, { lv: 2, y: 148 }, { lv: 1, y: 182 }];
  const barLen = (lv) => Math.max(5, (Math.log10(ENERGY[lv]) + 1.2) * 26.25);

  return (
    <div>
      <Field height={248}>
        <svg viewBox="0 0 440 248" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Ecosystems in place</text>
          <text x="20" y="27" fill={T.mute} style={f.mono(500, 8.5, { upper: true, tracking: 0.1 })}>an ecosystem runs on the flow of energy</text>

          {/* ===== LEFT: trophic food web ===== */}
          <rect x="16" y="34" width="232" height="200" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
          {/* energy-flow edges */}
          {EAT.map(([a, b], i) => {
            const na = O[a], nb = O[b], dx = nb.x - na.x, dy = nb.y - na.y, L = Math.hypot(dx, dy) || 1;
            const ux = dx / L, uy = dy / L;
            const x1 = na.x + ux * 12, y1 = na.y + uy * 12, x2 = nb.x - ux * 12, y2 = nb.y - uy * 12;
            const on = sel && (a === sel || b === sel);
            const col = on ? A : T.rule22;
            const fr = (clk + i * 0.1) % 1;
            const dpx = x1 + (x2 - x1) * fr, dpy = y1 + (y2 - y1) * fr;
            return (
              <g key={i} opacity={on || !sel ? 1 : 0.45}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={on ? 1.8 : 1} />
                <polygon points={(x2) + "," + (y2) + " " + (x2 - ux * 5 - uy * 3.5) + "," + (y2 - uy * 5 + ux * 3.5) + " " + (x2 - ux * 5 + uy * 3.5) + "," + (y2 - uy * 5 - ux * 3.5)} fill={col} />
                {playing && <circle cx={dpx} cy={dpy} r={on ? 2.6 : 2} fill={on ? A : "#cf9b3f"} opacity="0.85" />}
              </g>
            );
          })}
          {/* organisms */}
          {ORG.map((o) => {
            const isSel = o.id === sel, isPrey = prey.includes(o.id), isPred = preds.includes(o.id);
            const r = o.lv === 0 ? 12 : 11;
            return (
              <g key={o.id} data-org={o.id} style={{ cursor: "pointer" }} onClick={() => setSel(o.id)}>
                {o.lv === 0 && [0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
                  <line key={k} x1={o.x + Math.cos(k * 0.785) * 13} y1={o.y + Math.sin(k * 0.785) * 13} x2={o.x + Math.cos(k * 0.785) * 17} y2={o.y + Math.sin(k * 0.785) * 17} stroke="#cf9b3f" strokeWidth="1.4" />
                ))}
                {isSel && <circle cx={o.x} cy={o.y} r={r + 4} fill="none" stroke={A} strokeWidth="2" />}
                {isPrey && <circle cx={o.x} cy={o.y} r={r + 4} fill="none" stroke={okC} strokeWidth="1.6" strokeDasharray="2 2" />}
                {isPred && <circle cx={o.x} cy={o.y} r={r + 4} fill="none" stroke={warnC} strokeWidth="1.6" strokeDasharray="2 2" />}
                <circle cx={o.x} cy={o.y} r={r} fill={LCOL[o.lv]} stroke={T.ink} strokeWidth={isSel ? 1.8 : 1} />
                <text x={o.x} y={o.y - r - 6} textAnchor="middle" fill={isSel ? A : T.ink} style={f.mono(isSel ? 700 : 500, 8.5, { tracking: 0.02 })}>{o.id}</text>
              </g>
            );
          })}
          {/* prey/predator key */}
          <line x1="26" y1="224" x2="38" y2="224" stroke={okC} strokeWidth="1.6" strokeDasharray="2 2" />
          <text x="42" y="227" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>eats</text>
          <line x1="92" y1="224" x2="104" y2="224" stroke={warnC} strokeWidth="1.6" strokeDasharray="2 2" />
          <text x="108" y="227" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>eaten by</text>

          {/* ===== RIGHT: energy by trophic level ===== */}
          <rect x="258" y="34" width="166" height="200" rx="3" fill={T.paper} stroke={T.rule12} strokeWidth="1" />
          <text x="268" y="54" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.1 })}>energy by level</text>
          {rows.map((rw) => {
            const hot = rw.lv === selLv;
            return (
              <g key={rw.lv} opacity={selLv < 0 || hot ? 1 : 0.5}>
                <text x="306" y={rw.y + 3} textAnchor="end" fill={hot ? LCOL[rw.lv] : T.mute} style={f.mono(hot ? 700 : 500, 8.5)}>{LSHORT[rw.lv]}</text>
                <rect x="312" y={rw.y - 8} width={barLen(rw.lv)} height="16" rx="2" fill={LCOL[rw.lv]} opacity={hot ? 1 : 0.42} />
                <text x="418" y={rw.y + 3} textAnchor="end" fill={hot ? T.ink : T.mute} style={f.mono(hot ? 700 : 500, 8.5)}>{ENERGY[rw.lv]}%</text>
              </g>
            );
          })}
          <text x="268" y="214" fill={T.mute} style={f.sans(400, 8.5, { lh: 1.3 })}>{"≈"}10x energy is lost at each step up,</text>
          <text x="268" y="225" fill={T.mute} style={f.sans(400, 8.5, { lh: 1.3 })}>so top predators are few.</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small icon={playing ? Pause : Play} color={C} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "energy on" : "energy off"}</Btn>
        <Btn small icon={RotateCcw} color={C} onClick={() => setSel(null)}>clear</Btn>
        <Tag color={C} style={{ marginLeft: 2 }}>click an organism</Tag>
      </div>

      <Readout items={[
        { l: "Selected", v: sel || "-", color: sel ? A : T.mute },
        { l: "Role", v: sel ? LNAME[selLv] : "-", color: sel ? LCOL[selLv] : T.mute },
        { l: "Eats", v: sel ? (prey.length ? prey.join(", ") : "nothing (it is the base)") : "-", color: okC },
        { l: "Eaten by", v: sel ? (preds.length ? preds.join(", ") : "nothing (apex)") : "-", color: warnC },
      ]} />

      <Caption color={C}>
        An ecosystem is organized by who eats whom: energy flows from the sun into producers, then
        up through herbivores, carnivores, and apex predators. Classifying each organism by its
        trophic role is how you read an ecosystem in place. Only about a tenth of the energy passes
        to the next level, so each step up supports far fewer animals.
      </Caption>
    </div>
  );
}

export { ExtraFoodWeb };
