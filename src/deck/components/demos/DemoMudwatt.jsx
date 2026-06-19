// DemoMudwatt component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider, Tag } from "../../ui/primitives.jsx";

function DemoMudwatt() {
  // TTT "Electrogenic bacteria" (concept 1). Sibling ExtraCircuit (concept 2) owns
  // completing the circuit, the resistor and multimeter, and power. This demo owns the source: in
  // oxygen-free mud, electrogenic microbes colonize a buried carbon-felt anode and,
  // as they digest nutrients, push spare electrons onto the rod. More food grows
  // more biofilm and a faster electron output. A zoom shows one microbe donating
  // electrons to the carbon felt. Only a stub leaves "to the circuit". Trees palette.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [food, setFood] = useState(3);
  const [, force] = useState(0);
  const bioRef = useRef(0.2), phaseRef = useRef(0), feedRef = useRef(0);
  useRAF(true, (dt) => { phaseRef.current += dt; const eq = 0.18 + food * 0.14; bioRef.current += (eq - bioRef.current) * 0.0007 * dt; if (feedRef.current > 0) feedRef.current = Math.max(0, feedRef.current - dt); force((n) => (n + 1) % 1000000); });
  const feed = () => { bioRef.current = Math.min(1, bioRef.current + 0.08); feedRef.current = 900; };
  const reset = () => { bioRef.current = 0.2; };

  const bio = bioRef.current, phase = phaseRef.current;
  const rate = cl(bio * (0.45 + food * 0.11), 0.05, 1);
  const microbeN = 5 + food * 3;
  // deterministic microbe positions on the anode
  const anX0 = 104, anX1 = 300, anY = 196, bioTop = anY - bio * 16;
  const microbes = Array.from({ length: microbeN }, (_, i) => { const h = Math.sin(i * 12.9898 + 4.1) * 43758.5453; const u = h - Math.floor(h); return { x: anX0 + 8 + u * (anX1 - anX0 - 16), y: bioTop + 3 + (i % 3) * 3 }; });
  const stubX = 268, stubTop = 50, eN = Math.round(3 + rate * 7);
  const zx = 446, zy = 116, zr = 46;

  return (
    <div>
      <Field height={300}>
        <svg viewBox="0 0 500 280" style={{ width: "100%", height: "100%" }}>
          <text x="16" y="20" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.1 })}>Electrogenic bacteria</text>
          <text x="16" y="34" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.14 })}>microbes feed electrons to a buried anode</text>

          {/* mud */}
          <rect x="36" y="58" width="356" height="200" fill="#5c4a30" />
          <rect x="36" y="58" width="356" height="10" fill="#7a6442" opacity="0.6" />
          <rect x="36" y="150" width="356" height="3" fill="#3a5267" opacity="0.4" />
          <text x="44" y="76" fill="#d4af74" style={f.mono(700, 8, { upper: true, tracking: 0.14 })}>oxygen-free mud (anaerobic)</text>

          {/* food particles in the mud */}
          {Array.from({ length: food * 3 }, (_, i) => { const h1 = Math.sin(i * 7.13 + 1.3) * 19349.1, h2 = Math.sin(i * 3.71 + 9.7) * 27817.3; const u = h1 - Math.floor(h1), w = h2 - Math.floor(h2); const drift = (phase * 0.01 + i * 7) % 40; return <circle key={"fd" + i} cx={48 + u * 330} cy={84 + w * 60 + drift * 0.2} r="2.2" fill="#a07a3a" opacity="0.8" />; })}

          {/* biofilm on anode */}
          <rect x={anX0} y={bioTop} width={anX1 - anX0} height={anY - bioTop} fill="#2c2014" opacity="0.9" />
          <rect x={anX0} y={bioTop} width={anX1 - anX0} height={anY - bioTop} fill={A} opacity={cl(bio * 0.35, 0, 0.35)} />

          {/* anode rod */}
          <rect x={anX0} y={anY} width={anX1 - anX0} height="8" rx="2" fill="#1d1d20" />
          <text x={(anX0 + anX1) / 2} y={anY + 22} textAnchor="middle" fill="#d4af74" style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>carbon-felt anode (-)</text>

          {/* microbes + electron donation hops */}
          {microbes.map((m, i) => { const hop = (phase * 0.002 + i * 0.37) % 1; const ey = m.y + hop * (anY - 1 - m.y); return (<g key={"m" + i}><ellipse cx={m.x} cy={m.y} rx="3.4" ry="2.3" fill="#cbe3c0" stroke={C} strokeWidth="0.5" /><circle cx={m.x} cy={ey} r="2.1" fill={A} /></g>); })}

          {/* wire stub OUT to the circuit (not the full loop) */}
          <path d={"M " + stubX + " " + anY + " L " + stubX + " " + stubTop} fill="none" stroke={T.ink} strokeWidth="2" />
          <polygon points={stubX + "," + (stubTop - 2) + " " + (stubX - 5) + "," + (stubTop + 8) + " " + (stubX + 5) + "," + (stubTop + 8)} fill={T.ink} />
          {Array.from({ length: eN }, (_, k) => { const s = ((phase * 0.0004 * (0.5 + rate) + k / eN) % 1 + 1) % 1; const y = anY - s * (anY - stubTop); return <g key={"e" + k}><circle cx={stubX} cy={y} r="4" fill={C} stroke={T.paper} strokeWidth="0.5" /><text x={stubX} y={y + 2.4} textAnchor="middle" fill={T.paper} style={f.mono(700, 6)}>e</text></g>; })}
          <text x={stubX + 10} y={stubTop - 6} fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.1 })}>to the circuit</text>

          {/* electron-output meter */}
          <rect x="40" y="232" width="180" height="10" rx="3" fill={T.paper2} stroke={T.rule22} strokeWidth="0.7" />
          <rect x="40" y="232" width={180 * rate} height="10" rx="3" fill={A} />
          <text x="40" y="254" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>electron output</text>

          {/* zoom: one microbe donating electrons to carbon felt */}
          <circle cx={zx} cy={zy} r={zr} fill={T.paper2} stroke={C} strokeWidth="1" />
          <rect x={zx - 40} y={zy + 22} width="80" height="14" fill="#1d1d20" />
          <text x={zx} y={zy + zr + 14} textAnchor="middle" fill={T.mute} style={f.mono(600, 6.5, { upper: true, tracking: 0.06 })}>carbon-felt anode</text>
          <ellipse cx={zx} cy={zy - 2} rx="16" ry="11" fill="#cbe3c0" stroke={C} strokeWidth="0.8" />
          <text x={zx} y={zy} textAnchor="middle" fill={C} style={f.mono(600, 6)}>microbe</text>
          {Array.from({ length: 3 }, (_, k) => { const s = ((phase * 0.0012 + k / 3) % 1 + 1) % 1; const y = (zy + 9) + s * 13; return <g key={"ze" + k}><circle cx={zx - 8 + k * 8} cy={y} r="2.6" fill={A} /><text x={zx - 8 + k * 8} y={y + 2.4} textAnchor="middle" fill={T.paper} style={f.mono(700, 5.5)}>e</text></g>; })}
          <text x={zx} y={zy - zr - 4} textAnchor="middle" fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.08 })}>electron donation (zoom)</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={food} set={setFood} min={1} max={5} step={1} color={C} label="Food for microbes" suffix={food} />
        <Btn small icon={Plus} color={A} onClick={feed}>feed</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset biofilm</Btn>
        <div style={{ flex: 1 }} />
        <Tag color={rate > 0.55 ? A : C}>biofilm {Math.round(bio * 100)}%</Tag>
      </div>

      <Readout items={[
        { l: "Biofilm", v: Math.round(bio * 100) + "%", color: A },
        { l: "Electron output", v: Math.round(rate * 100) + "%", color: C },
        { l: "Microbes", v: microbeN },
        { l: "Mud oxygen", v: "none" },
      ]} />

      <Caption color={C}>
        Ordinary soil already holds electrogenic bacteria. Buried in oxygen-free mud, they cannot
        breathe with oxygen, so as they digest nutrients they offload their spare electrons onto the
        nearest solid surface instead. Give them a carbon-felt anode and they coat it in a living biofilm
        and feed it a steady stream of electrons. More food grows more healthy microbes, so the
        electron output rises. Those electrons then leave up the wire to do work in the circuit.
      </Caption>
    </div>
  );
}

export { DemoMudwatt };
