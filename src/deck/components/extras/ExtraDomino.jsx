// ExtraDomino component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout } from "../../ui/primitives.jsx";

function ExtraDomino() {
  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const [, force] = useState(0);
  useRAF(running, (dt) => {
    tRef.current += dt;
    force((v) => v + 1);
    if (tRef.current > 3200) setRunning(false);
  });
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const N = 14;
  const SPACING = 26;                       // px between domino centers
  const ANCHOR_OFFSET = 5;                  // rotation pivot at the FORWARD bottom edge
  const FALL_DURATION = 200;                // ms per domino to fall from upright to leaned
  const TRIGGER_DELAY = 140;                // ms from one domino tipping to triggering the next
  const x0 = 40;                            // first domino x
  // wave front position (the x of the most recently tipped domino, lerped)
  const wavePos = running || tRef.current > 0
    ? x0 + Math.min(N - 1, tRef.current / TRIGGER_DELAY) * SPACING
    : null;
  return (
    <div>
      <Field height={190}>
        <svg viewBox="0 0 440 170" style={{ width: "100%", height: "100%" }}>
          {/* ground line */}
          <rect x={20} y={132} width={400} height={5} fill="#000000" opacity="0.05" />
          <line x1={20} y1={132} x2={420} y2={132} stroke={T.ink} strokeWidth="0.8" />
          {/* finger / trigger that taps the first domino */}
          {tRef.current < 600 && (
            <g transform={`translate(${x0 - 14} ${80 - Math.max(0, 40 - tRef.current * 0.07)})`}>
              <circle cx={0} cy={20} r={9} fill={A} opacity="0.8" stroke={T.ink} strokeWidth="0.6" />
              <text x={0} y={24} textAnchor="middle" fill={T.paper} style={f.mono(700, 9, { upper: true, tracking: 0.14 })}>tap</text>
            </g>
          )}
          {Array.from({ length: N }).map((_, i) => {
            // each domino tips after (i * TRIGGER_DELAY) ms; takes FALL_DURATION ms to complete
            const tFall = tRef.current - i * TRIGGER_DELAY;
            const progress = Math.max(0, Math.min(1, tFall / FALL_DURATION));
            // ease-out so the tip looks like a real fall
            const eased = 1 - Math.pow(1 - progress, 2.6);
            const angle = eased * 86;       // fall up to 86° forward
            const cx = x0 + i * SPACING;
            // rotate around the FORWARD bottom edge (positive-x side) so the domino tilts onto the next one
            return (
              <g key={i} transform={`translate(${cx + ANCHOR_OFFSET} 132) rotate(${angle})`}
                 style={{ transition: "none" }}>
                <rect x={-10} y={-52} width={10} height={52} rx={1.5}
                  fill={progress >= 1 ? A : (progress > 0 ? "#a86038" : C)}
                  stroke={T.ink} strokeWidth="0.8" />
                <rect x={-9.2} y={-50} width={2.4} height={48} rx={1} fill="#ffffff" opacity="0.2" />
                <rect x={-2.4} y={-50} width={2} height={48} rx={1} fill="#000000" opacity="0.12" />
                {/* a single contrasting dot on each domino, to feel like a real domino */}
                <circle cx={-5} cy={-39} r={1.6} fill={T.paper} opacity="0.85" />
              </g>
            );
          })}
          {/* wave-front indicator (small triangle on the ground line) */}
          {wavePos != null && tRef.current < N * TRIGGER_DELAY + 200 && (
            <polygon points={`${wavePos - 5},140 ${wavePos + 5},140 ${wavePos},132`}
              fill={A} opacity="0.85" />
          )}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 8, alignItems: "center" }}>
        <Btn small icon={Play} color={A} onClick={() => { tRef.current = 0; setRunning(true); }}>tap first</Btn>
        <Btn small icon={RotateCcw} onClick={() => { tRef.current = 0; setRunning(false); force((v) => v + 1); }}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Signal", v: tRef.current > 0 ? "propagating →" : "ready", color: A },
        { l: "Wave speed", v: (1000 / TRIGGER_DELAY).toFixed(1) + " tiles/s" },
        { l: "Lesson", v: "each tile triggers the next" },
      ]} />

      <Caption color={C}>
        Tap the first domino and the energy passes from one tile to the next: each falling
        domino pushes its neighbour over. That's exactly how a nerve signal travels: a chain of
        local triggers, not one thing flying down the whole line.
      </Caption>
    </div>
  );
}

export { ExtraDomino };
