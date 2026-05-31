// ExtraPulley component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraPulley() {
  // Block-and-tackle visualization: a ceiling beam, N supporting rope
  // segments between fixed pulleys on the beam and movable pulleys on the
  // load. Effort = load / N. Hand pulls the free end on the right side.
  const [n, setN] = useState(2);
  const load = 100;
  const effort = (load / n).toFixed(0);
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;
  // Geometry
  const W = 460, H = 280;
  const beamY = 36;
  const blockTopY = 184;
  const blockBotY = 224;
  // Fixed-side and movable-side anchors are alternated across X.
  // Spacing tuned so n up to 6 fits cleanly inside the load block.
  const blockW = 80 + (n - 1) * 28;          // load block grows a bit with n
  const blockLeft = (W - blockW) / 2;
  const blockRight = blockLeft + blockW;
  const segSpacing = blockW / (n + 1);
  const segXs = Array.from({ length: n }, (_, k) => blockLeft + segSpacing * (k + 1));
  // Free end of the rope exits to the right of the rightmost fixed pulley
  const freeEndX = Math.min(W - 30, segXs[n - 1] + 30);

  return (
    <div>
      <Field height={290}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* hatched ceiling */}
          <rect x={20} y={beamY - 18} width={W - 40} height={18}
            fill={T.paper3} stroke={C} strokeWidth="1.2" />
          {Array.from({ length: 16 }, (_, k) => (
            <line key={k} x1={28 + k * 26} y1={beamY - 18} x2={20 + k * 26} y2={beamY - 4}
              stroke={C} strokeWidth="0.6" opacity="0.7" />
          ))}
          {/* beam line */}
          <line x1={20} y1={beamY} x2={W - 20} y2={beamY} stroke={C} strokeWidth="1.4" />

          {/* === ROPES === */}
          {/* anchor at the left of the beam */}
          <line x1={blockLeft + 2} y1={beamY} x2={blockLeft + 2} y2={beamY - 18}
            stroke={C} strokeWidth="1.4" />
          {/* alternating segments: anchor -> down to first movable pulley ->
              up to first fixed pulley -> down to next movable ... -> up to last
              fixed -> out to the hand (free end) */}
          {segXs.map((x, k) => (
            <g key={"seg" + k}>
              {/* down segment from previous fixed (or anchor) to this movable */}
              <line x1={k === 0 ? blockLeft + 2 : segXs[k - 1]} y1={k === 0 ? beamY : beamY + 10}
                x2={x} y2={blockTopY - 4} stroke={A} strokeWidth="1.8" />
              {/* up segment from movable to its fixed pulley */}
              <line x1={x} y1={blockTopY - 4} x2={x} y2={beamY + 10}
                stroke={A} strokeWidth="1.8" />
            </g>
          ))}
          {/* free end: from the last fixed pulley up over a redirector pulley on the right,
              then straight down to the hand. Routed via a small "guide" pulley so the corner reads cleanly. */}
          <line x1={segXs[n - 1]} y1={beamY + 10} x2={freeEndX} y2={beamY + 10}
            stroke={A} strokeWidth="1.8" />
          <line x1={freeEndX} y1={beamY + 10} x2={freeEndX} y2={H - 50}
            stroke={A} strokeWidth="1.8" />
          {/* guide / redirector pulley */}
          <line x1={freeEndX} y1={beamY} x2={freeEndX} y2={beamY + 4} stroke={C} strokeWidth="1" />
          <circle cx={freeEndX} cy={beamY + 10} r={7} fill={T.paper} stroke={C} strokeWidth="1.2" />
          <circle cx={freeEndX} cy={beamY + 10} r={1.6} fill={C} />

          {/* === Fixed pulleys on the beam === */}
          {segXs.map((x, k) => (
            <g key={"fix" + k}>
              <line x1={x} y1={beamY} x2={x} y2={beamY + 4} stroke={C} strokeWidth="1" />
              <circle cx={x} cy={beamY + 10} r={7} fill={T.paper} stroke={C} strokeWidth="1.2" />
              <circle cx={x} cy={beamY + 10} r={1.6} fill={C} />
            </g>
          ))}

          {/* === Load block + movable pulleys === */}
          <rect x={blockLeft} y={blockTopY} width={blockW} height={blockBotY - blockTopY}
            fill={C} stroke={T.ink} strokeWidth="1.2" />
          <text x={blockLeft + blockW / 2} y={blockTopY + 26} textAnchor="middle"
            fill={T.paper} style={f.mono(700, 14)}>{load} N</text>
          <text x={blockLeft + blockW / 2} y={blockBotY - 6} textAnchor="middle"
            fill={T.paper2} style={f.mono(500, 8.5, { upper: true, tracking: 0.16 })}>load</text>
          {/* movable pulleys sit on top of the load block */}
          {segXs.map((x, k) => (
            <g key={"mov" + k}>
              <circle cx={x} cy={blockTopY - 4} r={6} fill={T.paper} stroke={C} strokeWidth="1.2" />
              <circle cx={x} cy={blockTopY - 4} r={1.5} fill={C} />
            </g>
          ))}

          {/* === Hand / effort indicator === */}
          <g transform={`translate(${freeEndX} ${H - 50})`}>
            <rect x={-9} y={0} width={18} height={20} rx={3}
              fill={A} stroke={T.ink} strokeWidth="1" />
            {/* downward effort arrow */}
            <line x1={0} y1={22} x2={0} y2={42} stroke={A} strokeWidth="2.2" />
            <polyline points={`-5,38 0,44 5,38`} fill="none" stroke={A} strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x={freeEndX + 14} y={H - 22} fill={A}
            style={f.mono(700, 14)}>{effort} N</text>
          <text x={freeEndX + 14} y={H - 8} fill={T.mute}
            style={f.mono(500, 9, { upper: true, tracking: 0.18 })}>pull (effort)</text>

          {/* === Side readouts === */}
          <text x={28} y={beamY + 34} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>fixed pulleys</text>
          <text x={28} y={beamY + 46} fill={C}
            style={f.mono(700, 11)}>{n}</text>
          <text x={28} y={blockTopY - 6} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>movable pulleys</text>
          <text x={28} y={blockTopY + 6} fill={C}
            style={f.mono(700, 11)}>{n}</text>
          <text x={28} y={blockTopY + 36} fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>rope segments</text>
          <text x={28} y={blockTopY + 48} fill={C}
            style={f.mono(700, 11)}>{n}</text>
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={n} set={setN} min={1} max={5} color={A}
          label="Supporting rope segments" suffix={n} />
      </div>
      <Readout items={[
        { l: "Effort", v: effort + " N", color: A },
        { l: "Advantage", v: n + "x easier" },
        { l: "Tradeoff", v: "pull " + n + "x more rope" },
      ]} />

      <Caption color={C}>
        A single fixed pulley only changes the direction of your pull. Add movable
        pulleys and each extra rope segment supporting the load cuts the effort
        you need. The price is rope length: you pull farther to lift the same
        distance. More segments mean less force, more rope.
      </Caption>
    </div>
  );
}

export { ExtraPulley };
