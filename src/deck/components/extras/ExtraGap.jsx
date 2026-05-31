// ExtraGap component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraGap() {
  // Middle-school synapse model: sender neuron tip on top, gap in the middle,
  // receiver neuron on the bottom. Signal packets release, cross the gap, and
  // bind to receivers (or scatter if the gap is too wide). Palette matches
  // the rest of the deck (PY-STEM indigo + copper, warm paper background).
  const [gap, setGap] = useState(26);
  const A = CAMP.pystem.acc;     // copper
  const C = CAMP.pystem.ink;     // indigo
  const okC = T.ok;
  const failC = T.warn;
  const transmits = gap < 48;

  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const [, force] = useState(0);
  useRAF(running, (dt) => {
    tRef.current += dt; force((v) => v + 1);
    if (tRef.current > 4800) setRunning(false);
  });

  // Geometry: vertical layout. Gap is a horizontal band.
  const W = 540, H = 300;
  const cx = 270;
  const preY = 122;             // bottom of sender / top of gap
  const postY = preY + gap;     // top of receiver / bottom of gap

  // Phases (ms)
  const t = tRef.current;
  const apTravel     = Math.min(1, Math.max(0, t / 280));
  const apInside     = Math.min(1, Math.max(0, (t - 200) / 220));
  const dockStage    = Math.min(1, Math.max(0, (t - 280) / 420));
  const releaseStage = Math.min(1, Math.max(0, (t - 720) / 420));
  const diffuseStage = Math.min(1, Math.max(0, (t - 1140) / 950));
  const bindStage    = Math.min(1, Math.max(0, (t - 2090) / 400));
  const activated    = transmits && bindStage > 0.55;

  // Signal packets inside the sender (16 in a cluster). Each one docks and
  // fires at the cleft-facing edge in sequence.
  const packets = Array.from({ length: 14 }, (_, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const homeX = cx - 88 + col * 44 + (row % 2 === 0 ? 0 : 18);
    const homeY = 46 + row * 20;
    const tgtX  = cx - 96 + col * 48;
    const tgtY  = preY - 10;
    const dock = Math.min(1, Math.max(0, dockStage * 1.25 - i * 0.04));
    const x = homeX + (tgtX - homeX) * dock;
    const y = homeY + (tgtY - homeY) * dock;
    const released = releaseStage > (i + 1) / 15;
    return { i, x, y, released };
  });

  // Messengers crossing the gap (small copper dots moving downward)
  const molecules = [];
  if (diffuseStage > 0) {
    const nMols = 22;
    for (let k = 0; k < nMols; k++) {
      const phase = Math.max(0, diffuseStage - k * 0.025);
      if (phase <= 0) continue;
      const startX = cx - 110 + (k % 8) * 30;
      const xJitter = Math.sin(k * 1.4 + phase * 4.2) * 14;
      const y = preY + 6 + phase * (gap - 12);
      const x = startX + xJitter;
      const fade = transmits ? Math.max(0, 1.25 - phase) : Math.max(0, 0.55 - phase * 0.55);
      if (fade > 0.05) molecules.push({ id: k, x, y, opacity: fade });
    }
  }

  // Receivers along the post-synaptic edge (6 evenly spaced)
  const receiverXs = [cx - 130, cx - 78, cx - 26, cx + 26, cx + 78, cx + 130];

  const apGlow = Math.min(0.45, apInside * 0.45);
  const reset = () => { tRef.current = 0; setRunning(false); force((v) => v + 1); };
  const fire = () => { tRef.current = 0; setRunning(true); };
  // organic synapse shapes: presynaptic bouton + postsynaptic dendritic spine
  const bouton = `M ${cx - 16} 28 C ${cx - 72} 40 ${cx - 156} 56 ${cx - 160} ${preY - 56} C ${cx - 162} ${preY - 18} ${cx - 138} ${preY} ${cx - 110} ${preY} Q ${cx - 55} ${preY - 6} ${cx} ${preY - 3} Q ${cx + 55} ${preY - 6} ${cx + 110} ${preY} C ${cx + 138} ${preY} ${cx + 162} ${preY - 18} ${cx + 160} ${preY - 56} C ${cx + 156} 56 ${cx + 72} 40 ${cx + 16} 28 Z`;
  const spine = `M ${cx - 178} ${H - 10} L ${cx - 178} ${postY + 40} C ${cx - 150} ${postY + 34} ${cx - 120} ${postY + 6} ${cx - 70} ${postY + 4} Q ${cx - 35} ${postY + 2} ${cx} ${postY} Q ${cx + 35} ${postY + 2} ${cx + 70} ${postY + 4} C ${cx + 120} ${postY + 6} ${cx + 150} ${postY + 34} ${cx + 178} ${postY + 40} L ${cx + 178} ${H - 10} Z`;
  const recpY = (rcx) => postY + Math.pow((rcx - cx) / 178, 2) * 38;

  return (
    <div>
      <Field height={310}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="gpMembrane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3ece0" /><stop offset="1" stopColor="#e6dac4" /></linearGradient>
          </defs>
          {/* ===== AXON entering from top ===== */}
          <rect x={cx - 18} y={0} width={36} height={28} fill={T.paper3} stroke={C} strokeWidth="1.2" />
          {/* myelin segments */}
          <rect x={cx - 22} y={4} width={44} height={10} rx={5} fill={T.paper2} stroke={C} strokeWidth="0.9" />
          <rect x={cx - 22} y={16} width={44} height={10} rx={5} fill={T.paper2} stroke={C} strokeWidth="0.9" />
          {/* AP pulse traveling down */}
          {apTravel > 0 && apTravel < 1 && (
            <circle cx={cx} cy={apTravel * 26} r={9}
              fill={A} opacity={0.5 * (1 - apTravel * 0.3)} />
          )}

          {/* ===== PRESYNAPTIC TERMINAL (bouton) ===== */}
          <path d={bouton} fill="url(#gpMembrane)" stroke={C} strokeWidth="1.6" />
          {/* AP glow inside the terminal */}
          {apInside > 0 && (
            <path d={bouton} fill={A} opacity={apGlow * (1 - bindStage * 0.6)} />
          )}

          {/* Signal packets inside the sender */}
          {packets.map((v) => (
            !v.released && (
              <g key={"p" + v.i}>
                <circle cx={v.x} cy={v.y} r={9} fill={T.paper} stroke={C} strokeWidth="1.1" />
                <circle cx={v.x - 3} cy={v.y - 1} r={1.6} fill={A} />
                <circle cx={v.x + 2.6} cy={v.y + 0.8} r={1.4} fill={A} />
                <circle cx={v.x - 0.5} cy={v.y + 3} r={1.3} fill={A} />
              </g>
            )
          ))}

          {/* ===== SYNAPSE GAP ===== */}
          <rect x={cx - 170} y={preY} width={340} height={gap}
            fill={T.paper2} stroke={C} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.85" />

          {/* Messengers crossing the gap */}
          {molecules.map((m) => (
            <circle key={m.id} cx={m.x} cy={m.y} r={3.2}
              fill={transmits ? A : failC} opacity={m.opacity}
              stroke={C} strokeWidth="0.45" />
          ))}

          {/* ===== POSTSYNAPTIC DENDRITIC SPINE ===== */}
          <path d={spine}
            fill={activated ? "#d4e3c2" : "url(#gpMembrane)"} stroke={C} strokeWidth="1.6"
            style={{ transition: "fill .35s" }} />
          {/* faint glow in the spine when activated */}
          {activated && (
            <path d={spine} fill={okC} opacity="0.18" />
          )}

          {/* Receptors: small cups on the spine crown, opening toward the cleft */}
          {receiverXs.map((rcx, i) => (
            <g key={"r" + i} transform={`translate(${rcx} ${recpY(rcx)})`} style={{ transition: "fill .35s" }}>
              <path d="M -8 7 L -6 -4 Q 0 -8 6 -4 L 8 7 Z"
                fill={activated ? okC : C} stroke={T.ink} strokeWidth="0.9"
                style={{ transition: "fill .35s" }} />
              <path d="M -4 -1 Q 0 -5 4 -1" fill="none"
                stroke={activated ? "#ffffff" : T.paper2} strokeWidth="1.4" strokeLinecap="round" />
              {activated && <circle cx={0} cy={-3} r={1.9} fill={A} stroke={T.ink} strokeWidth="0.3" />}
            </g>
          ))}

          {/* ===== LABELS (only the essentials, with thin leader lines) ===== */}
          {/* SENDER NEURON */}
          <line x1={cx + 130} y1={62} x2={cx + 196} y2={42}
            stroke={T.mute} strokeWidth="0.55" />
          <text x={cx + 200} y={40} fill={T.mute}
            style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>sender neuron</text>

          {/* SIGNAL PACKETS */}
          <line x1={cx - 80} y1={56} x2={cx - 196} y2={42}
            stroke={T.mute} strokeWidth="0.55" />
          <text x={cx - 200} y={40} textAnchor="end" fill={T.mute}
            style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>signal packets</text>

          {/* GAP / SYNAPSE: centered above the band, no overlap with anatomy */}
          <line x1={cx + 130} y1={preY + gap / 2} x2={cx + 196} y2={preY + gap / 2}
            stroke={T.mute} strokeWidth="0.55" />
          <text x={cx + 200} y={preY + gap / 2 - 3} fill={C}
            style={f.mono(700, 10, { upper: true, tracking: 0.22 })}>synapse gap</text>
          <text x={cx + 200} y={preY + gap / 2 + 10} fill={T.mute}
            style={f.mono(500, 9)}>{gap} px wide</text>

          {/* RECEIVERS */}
          <line x1={cx - 100} y1={postY + 8} x2={cx - 196} y2={postY + 22}
            stroke={T.mute} strokeWidth="0.55" />
          <text x={cx - 200} y={postY + 24} textAnchor="end" fill={T.mute}
            style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>receivers</text>

          {/* RECEIVER NEURON  (bottom-right) */}
          <text x={cx + 200} y={H - 26} fill={T.mute}
            style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>receiver neuron</text>
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={gap} set={(v) => { setGap(v); reset(); }} min={10} max={80}
          color={A} label="Synapse gap" suffix={gap + " px"} />
        <Btn small icon={Play} color={A} onClick={fire}>fire signal</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Verdict", v: transmits ? "signal reaches the next neuron" : "signal scatters in the gap",
          color: transmits ? okC : failC },
        { l: "Steps", v: "fire, release packets, cross the gap, bind to receivers" },
        { l: "Threshold", v: "narrow gap survives, wide gap fails" },
      ]} />

      <Caption color={C}>
        Neurons pass a signal one link at a time. At a synapse the wire is interrupted by
        a tiny gap. The sender shoots packets of messenger molecules across, and receivers
        on the next neuron catch them. If the gap is narrow, the catch works and the signal
        keeps moving. If the gap is too wide, the messengers scatter and the signal dies.
      </Caption>
    </div>
  );
}

export { ExtraGap };
