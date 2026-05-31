// ExtraReactionTime component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraReactionTime() {
  // PYS-05 "From signal to muscle" (concept 1). Distinct from ExtraMedian, which
  // is the statistics view. Here the focus is the reaction-time PATHWAY: the eye
  // sees a signal, the brain decides, nerves carry it, the muscle moves. A pulse
  // travels eye -> brain -> nerve -> muscle over the reaction time. The classic
  // ruler-drop test turns that delay into a catch distance, d = 1/2 g t^2.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [t, setT] = useState(250);        // reaction time, ms (150..400)
  const [playing, setPlaying] = useState(true);
  const dCm = Math.round(0.5 * 9.8 * Math.pow(t / 1000, 2) * 100 * 10) / 10;  // ruler drop, cm

  // ---- animation: pulse along the pathway + synced ruler drop, looping ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  const visDur = t * 3.6;
  const cycle = visDur + 650;
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const local = clockRef.current % cycle;
  const p = clamp(local / visDur, 0, 1);          // 0 -> 1 across the reaction
  const caught = p >= 0.999;

  // ---- pathway geometry ----
  const VW = 560, VH = 268;
  const ny = 84;
  const nodes = [
    { x: 86, lab: "eye", sub: "see" },
    { x: 208, lab: "brain", sub: "decide" },
    { x: 330, lab: "nerve", sub: "send" },
    { x: 452, lab: "muscle", sub: "move" },
  ];
  const seg = Math.min(Math.floor(p * 3), 2);
  const localp = p * 3 - seg;
  const pulseX = nodes[seg].x + localp * (nodes[seg + 1].x - nodes[seg].x);

  // ---- ruler geometry ----
  const rx = 100, rw = 18, ryBot = 252, ryTop = 158, maxCm = 90;
  const scale = (ryBot - ryTop) / maxCm;          // px per cm
  const fallCm = dCm * p * p;                      // accelerating leading edge
  const fallEdgeY = ryBot - fallCm * scale;
  const catchY = ryBot - dCm * scale;              // fixed final catch point

  return (
    <div>
      <Field height={280}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>from signal to muscle</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>the reaction-time pathway</text>

          {/* ===== pathway ===== */}
          {/* base path */}
          <line x1={nodes[0].x} y1={ny} x2={nodes[3].x} y2={ny} stroke={T.rule22} strokeWidth="2" />
          {/* travelled portion */}
          <line x1={nodes[0].x} y1={ny} x2={pulseX} y2={ny} stroke={A} strokeWidth="2.4" />
          {nodes.map((n, i) => {
            const active = p * 3 >= i - 0.02;
            return (
              <g key={i}>
                <circle cx={n.x} cy={ny} r="15" fill={active ? A : T.paper2} stroke={T.ink} strokeWidth="1.2" opacity={active ? 0.95 : 1} />
                {n.lab === "eye" && <g><ellipse cx={n.x} cy={ny} rx="8" ry="5" fill={T.paper} stroke={T.ink} strokeWidth="0.8" /><circle cx={n.x} cy={ny} r="2.4" fill={T.ink} /></g>}
                {n.lab === "brain" && <g><path d={"M" + (n.x - 6) + " " + (ny + 2) + " Q " + (n.x - 7) + " " + (ny - 6) + " " + n.x + " " + (ny - 5) + " Q " + (n.x + 7) + " " + (ny - 6) + " " + (n.x + 6) + " " + (ny + 3)} fill="none" stroke={active ? T.paper : T.ink} strokeWidth="1.1" /></g>}
                {n.lab === "nerve" && <path d={"M" + (n.x - 7) + " " + (ny + 3) + " q 3 -8 7 -6 q -4 -2 0 -8" } fill="none" stroke={active ? T.paper : T.ink} strokeWidth="1.2" />}
                {n.lab === "muscle" && <ellipse cx={n.x} cy={ny} rx="6" ry="8" fill="none" stroke={active ? T.paper : T.ink} strokeWidth="1.4" />}
                <text x={n.x} y={ny + 28} textAnchor="middle" fill={active ? A : C} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>{n.lab}</text>
                <text x={n.x} y={ny + 39} textAnchor="middle" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>{n.sub}</text>
              </g>
            );
          })}
          {/* signal light at the eye */}
          {!caught && <circle cx={nodes[0].x} cy={ny - 26} r="5" fill={okC} opacity={p > 0 ? 0.9 : 0.3} />}
          {!caught && <text x={nodes[0].x} y={ny - 34} textAnchor="middle" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>signal</text>}
          {/* travelling pulse */}
          {!caught && (
            <g>
              <circle cx={pulseX} cy={ny} r="11" fill={A} opacity="0.18" />
              <circle cx={pulseX} cy={ny} r="5" fill={A} stroke={T.paper} strokeWidth="1" />
            </g>
          )}
          {caught && <text x={nodes[3].x} y={ny - 26} textAnchor="middle" fill={okC} style={f.mono(700, 8.5, { upper: true, tracking: 0.12 })}>move</text>}

          {/* ===== ruler-drop ===== */}
          <text x={rx + rw / 2} y={ryTop - 8} textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>ruler drop</text>
          <rect x={rx} y={ryTop} width={rw} height={ryBot - ryTop} fill={T.paper3} stroke={T.ink} strokeWidth="1" />
          {[0, 15, 30, 45, 60, 75, 90].map((cm) => (
            <g key={cm}>
              <line x1={rx} y1={ryBot - cm * scale} x2={rx + rw} y2={ryBot - cm * scale} stroke={T.ink} strokeWidth="0.6" opacity="0.5" />
              <text x={rx - 4} y={ryBot - cm * scale + 3} textAnchor="end" fill={T.mute} style={f.mono(500, 7)}>{cm}</text>
            </g>
          ))}
          {/* fallen distance highlighted (animated edge) + fixed catch line */}
          <rect x={rx} y={fallEdgeY} width={rw} height={ryBot - fallEdgeY} fill={A} opacity="0.45" />
          <line x1={rx - 3} y1={catchY} x2={rx + rw + 3} y2={catchY} stroke={C} strokeWidth="1.4" strokeDasharray="3 2" />
          {/* catch hand */}
          <path d={"M" + (rx + rw + 2) + " " + catchY + " l 12 -5 l 0 10 Z"} fill={C} />
          <text x={rx + rw + 18} y={catchY + 3} fill={C} style={f.mono(700, 10)}>{dCm} cm</text>
          {/* ground hand at 0 */}
          <text x={rx + rw / 2} y={ryBot + 12} textAnchor="middle" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>catch</text>

          {/* ===== formula + mapping ===== */}
          <text x={250} y={150} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.18 })}>delay to distance</text>
          <text x={250} y={178} fill={C} style={f.mono(700, 17)}>d = &#189; g t&#178;</text>
          <text x={250} y={200} fill={T.mute} style={f.mono(500, 9)}>{"t = " + t + " ms  =>  d = " + dCm + " cm"}</text>
          <text x={250} y={216} fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.1 })}>slower reaction, ruler falls farther</text>
          {/* typical reference */}
          <line x1={250} y1={228} x2={500} y2={228} stroke={T.rule22} strokeWidth="0.6" />
          <text x={250} y={242} fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.12 })}>typical human reaction near 250 ms</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={t} set={setT} min={150} max={400} step={5} color={A} label="Reaction time" suffix={t + " ms"} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Reaction time", v: t + " ms", color: A },
        { l: "Ruler drop", v: dCm + " cm", color: C },
        { l: "Signal path", v: "eye to muscle", color: okC },
      ]} />

      <Caption color={C}>
        Reaction time is the delay between seeing a signal and moving. The eye
        sends the signal to the brain, the brain decides, and nerves fire the
        muscle. The classic ruler-drop test turns that delay into a catch
        distance, d = 1/2 g t squared, so a slower reaction lets the ruler fall
        farther before you grab it.
      </Caption>
    </div>
  );
}

export { ExtraReactionTime };
