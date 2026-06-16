// ExtraCircuit component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraCircuit() {
  // TTT-01 "Completing the circuit" (concept 2 of the MudWatt cell). The sibling
  // DemoMudwatt is a soil cross-section about biofilm growth and the meter. This
  // one is the SCHEMATIC LOOP: a circuit only works when charge can travel the
  // whole way around. Electrons take the external WIRE from anode to cathode
  // (through the 100 kohm resistor the multimeter reads); ions take the MUD to close. Cut
  // the wire OR block the mud and current stops, even though the cell still holds
  // voltage. Power is roughly voltage times current.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const MUD = "#5c4a30", GRAPH = "#1d1d20", METAL = "#c9c9cd", IONLINE = "#caa86f";
  const [mode, setMode] = useState("complete"); // complete | wire | mud
  const [supply, setSupply] = useState(3);       // microbe activity 1..5
  const complete = mode === "complete";
  const [t, setT] = useState(0);
  useRAF(complete, (dt) => setT((v) => v + dt));

  const cur = supply / 5;                                       // current proxy 0.2..1
  const voltageMv = 320 + supply * 56;                          // 376..600 mV (chemistry sets this)
  const currentUa = Math.round(supply * 78);                    // 78..390 microamps
  const powerUw = Math.round(voltageMv * currentUa / 1000);     // microwatts = mV * uA / 1000

  // loop geometry
  const Lx = 78, Rx = 362, topY = 64, botY = 166;
  const inset = 16, span = (Rx - inset) - (Lx + inset);
  const wireCut = 152, mudPlug = 286;

  const electrons = complete ? Array.from({ length: 5 }, (_, i) => Lx + inset + (((t * 0.00026 * (0.5 + cur)) + i / 5) % 1) * span) : [];
  const ions = complete ? Array.from({ length: 5 }, (_, i) => Lx + inset + (((t * 0.00026 * (0.5 + cur)) + i / 5) % 1) * span) : [];

  return (
    <div>
      <Field height={232}>
        <svg viewBox="0 0 440 232" style={{ width: "100%", height: "100%" }}>
          <text x="20" y="16" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Completing the circuit</text>
          <text x="20" y="28" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.07 })}>both carriers go anode {"→"} cathode: e{"⁻"} by wire, H{"⁺"} by mud</text>

          {/* air + mud zones */}
          <rect x="40" y="40" width="360" height="110" fill={T.paper3} opacity="0.18" />
          <rect x="40" y="150" width="360" height="58" rx="4" fill={MUD} />
          <rect x="40" y="150" width="360" height="6" fill="#3a5267" opacity="0.35" />
          <text x="90" y="84" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>wire {"·"} electrons</text>
          <text x="90" y="201" fill={T.paper3} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>mud {"·"} H{"⁺"} ions</text>
          {[[340, 102], [352, 116]].map((o, i) => (<text key={"o" + i} x={o[0]} y={o[1]} textAnchor="middle" fill={T.mute} style={f.mono(600, 7)} opacity="0.7">O{"₂"}</text>))}

          {/* electrode labels */}
          <text x={Lx} y="50" textAnchor="middle" fill={T.ink} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>anode {"−"}</text>
          <text x={Rx} y="50" textAnchor="middle" fill={T.ink} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>cathode +</text>

          {/* bottom: mud ion path (intact unless mud is blocked) */}
          {mode !== "mud" ? (
            <line x1={Lx} y1={botY} x2={Rx} y2={botY} stroke={IONLINE} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
          ) : (
            <g>
              <line x1={Lx} y1={botY} x2={mudPlug - 9} y2={botY} stroke={IONLINE} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
              <line x1={mudPlug + 9} y1={botY} x2={Rx} y2={botY} stroke={IONLINE} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
              <rect x={mudPlug - 8} y={botY - 8} width="16" height="16" rx="2" fill="none" stroke={A} strokeWidth="1.6" />
              <line x1={mudPlug - 5} y1={botY - 5} x2={mudPlug + 5} y2={botY + 5} stroke={A} strokeWidth="1.5" />
              <line x1={mudPlug + 5} y1={botY - 5} x2={mudPlug - 5} y2={botY + 5} stroke={A} strokeWidth="1.5" />
            </g>
          )}

          {/* top: external wire (intact unless wire is cut) */}
          {mode !== "wire" ? (
            <line x1={Lx} y1={topY} x2={Rx} y2={topY} stroke={T.ink} strokeWidth="2" strokeLinecap="round" />
          ) : (
            <g>
              <line x1={Lx} y1={topY} x2={wireCut - 10} y2={topY} stroke={T.ink} strokeWidth="2" strokeLinecap="round" />
              <line x1={wireCut + 10} y1={topY} x2={Rx} y2={topY} stroke={T.ink} strokeWidth="2" strokeLinecap="round" />
              <circle cx={wireCut - 10} cy={topY} r="2.6" fill={A} />
              <circle cx={wireCut + 10} cy={topY} r="2.6" fill={A} />
            </g>
          )}

          {/* electrodes form the left and right edges of the loop */}
          <rect x={Lx - 5} y={topY} width="10" height={botY - topY} rx="2" fill={GRAPH} />
          <rect x={Rx - 5} y={topY} width="10" height={botY - topY} rx="2" fill={METAL} stroke={T.ink} strokeWidth="0.8" />


          {/* electrons on the wire (skip the slot under the resistor) */}
          {electrons.map((x, i) => ((x > 206 && x < 234) ? null : (
            <g key={"e" + i}>
              <circle cx={x} cy={topY} r="4.6" fill={C} stroke={T.paper} strokeWidth="0.7" />
              <text x={x} y={topY + 2.6} textAnchor="middle" fill={T.paper} style={f.mono(700, 7)}>e</text>
            </g>
          )))}
          {/* positive ions in the mud */}
          {ions.map((x, i) => (
            <g key={"i" + i}>
              <circle cx={x} cy={botY} r="4.6" fill={A} stroke={T.paper} strokeWidth="0.7" />
              <text x={x} y={botY + 2.6} textAnchor="middle" fill={T.paper} style={f.mono(700, 7)}>+</text>
            </g>
          ))}

          {/* 100 kohm resistor on the wire */}
          <text x="220" y={topY - 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>100 k{"Ω"}</text>
          <rect x="206" y={topY - 6} width="28" height="12" rx="1.5" fill={T.paper2} stroke={T.ink} strokeWidth="1.4" />
          {/* multimeter reads the voltage across the resistor */}
          <line x1="211" y1={topY + 6} x2="211" y2="100" stroke={T.ink} strokeWidth="1" opacity="0.65" />
          <line x1="229" y1={topY + 6} x2="229" y2="100" stroke={T.ink} strokeWidth="1" opacity="0.65" />
          <rect x="198" y="100" width="44" height="22" rx="3" fill={T.paper2} stroke={T.ink} strokeWidth="1.3" />
          <text x="220" y="111" textAnchor="middle" fill={C} style={f.mono(700, 8)}>{complete ? voltageMv : 0} mV</text>
          <text x="220" y="119" textAnchor="middle" fill={T.mute} style={f.mono(600, 5.5, { upper: true, tracking: 0.12 })}>multimeter</text>

          {/* cathode reaction that closes the loop */}
          <text x="220" y="226" textAnchor="middle" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.05 })}>at the cathode: O{"₂"} + 4H{"⁺"} + 4e{"⁻"} {"→"} 2H{"₂"}O</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <Btn small color={complete ? A : C} active={complete} onClick={() => setMode("complete")}>complete loop</Btn>
        <Btn small color={mode === "wire" ? A : C} active={mode === "wire"} onClick={() => setMode("wire")}>cut wire</Btn>
        <Btn small color={mode === "mud" ? A : C} active={mode === "mud"} onClick={() => setMode("mud")}>block mud</Btn>
        <Slider val={supply} set={setSupply} min={1} max={5} step={1} color={A} label="Microbe activity" suffix={supply} />
      </div>

      <Readout items={[
        { l: "Loop", v: complete ? "complete" : "broken", color: complete ? A : T.ink },
        { l: "Voltage", v: voltageMv + " mV", color: C },
        { l: "Current", v: complete ? currentUa + " µA" : "0", color: C },
        { l: "Power", v: complete ? powerUw + " µW" : "0 µW", color: A },
      ]} />

      <Caption color={C}>
        A circuit only works as a complete loop. Electrons leave the buried anode, run through the
        wire, the 100 k{"Ω"} resistor, and the multimeter, then reach the cathode in the air, where
        they join oxygen and protons to make water. Positive ions drift back through the mud to close
        the loop. Cut the wire or block the mud and the current stops, even though the cell still holds
        voltage. More active microbes push more electrons per second, so the voltage, current, and
        power all rise.
      </Caption>
    </div>
  );
}

export { ExtraCircuit };
