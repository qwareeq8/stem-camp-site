// ExtraSonarRange component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraSonarRange() {
  // PYS-06 "Echo timing is ranging" (concept 2). Distinct from DemoWave, which
  // shows the longitudinal wave in a medium. Here the focus is the math of
  // ranging: time a pulse's round trip, then distance = speed x time / 2. A
  // stopwatch times the flight; the live equation turns that time into a
  // distance. No medium particles or coils.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [D, setD] = useState(10);          // target distance, meters (2..20)
  const [playing, setPlaying] = useState(true);
  const v = 343;                            // speed of sound in air, m/s
  const tRound = (2 * D) / v;               // round-trip time, seconds
  const tMs = tRound * 1000;                // ms
  const measured = (v * tRound) / 2;        // = D (the ranging result)

  // ---- animation: pulse flies out and echoes back, looping ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  const visDur = 800 + ((D - 2) / 18) * 1500;
  const cycle = visDur + 650;
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const local = clockRef.current % cycle;
  const progress = clamp(local / visDur, 0, 1);
  const phase = progress < 0.5 ? progress * 2 : (1 - progress) * 2;  // 0 -> 1 -> 0
  const returning = progress >= 0.5;
  const displayMs = progress * tMs;

  // ---- scene geometry ----
  const VW = 560, VH = 268;
  const axisY = 94, sensorX = 66;
  const targetX = 130 + ((D - 2) / 18) * (470 - 130);
  const pulseX = sensorX + phase * (targetX - sensorX);

  // ---- stopwatch ----
  const sx = 108, sy = 208, sr = 34;
  const handA = -90 + progress * 330;
  const handRad = (handA * Math.PI) / 180;
  const handX = sx + sr * 0.78 * Math.cos(handRad), handY = sy + sr * 0.78 * Math.sin(handRad);

  // ---- equation boxes ----
  const boxes = [
    { x: 196, w: 88, lab: "round trip", val: tMs.toFixed(0) + " ms", col: A },
    { x: 312, w: 84, lab: "speed", val: v + " m/s", col: C },
    { x: 484, w: 64, lab: "distance", val: measured.toFixed(1) + " m", col: okC },
  ];

  return (
    <div>
      <Field height={280}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>echo timing is ranging</text>
          <text x={40} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>time the round trip, get the distance</text>

          {/* travel axis */}
          <line x1={sensorX} y1={axisY} x2={targetX} y2={axisY} stroke={T.rule22} strokeWidth="1" strokeDasharray="2 4" />

          {/* sensor (emitter + receiver) */}
          <rect x={sensorX - 18} y={axisY - 16} width="20" height="32" rx="2" fill={C} stroke={T.ink} strokeWidth="0.9" />
          <path d={"M" + (sensorX - 2) + " " + (axisY - 9) + " L" + (sensorX + 6) + " " + (axisY - 13) + " L" + (sensorX + 6) + " " + (axisY + 13) + " L" + (sensorX - 2) + " " + (axisY + 9) + " Z"} fill={A} />
          <text x={sensorX - 8} y={axisY + 32} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>sensor</text>

          {/* outgoing wavefront arcs from the sensor (subtle) */}
          {!returning && progress > 0.02 && [0, 1, 2].map((k) => (
            <path key={k} d={"M" + (pulseX - 5 - k * 5) + " " + (axisY - 9) + " Q " + (pulseX - 1 - k * 5) + " " + axisY + " " + (pulseX - 5 - k * 5) + " " + (axisY + 9)}
              fill="none" stroke={C} strokeWidth="1.2" opacity={0.5 - k * 0.13} />
          ))}

          {/* pulse / echo */}
          {progress > 0.001 && progress < 0.999 && (
            <g>
              <circle cx={pulseX} cy={axisY} r="12" fill={returning ? A : C} opacity="0.12" />
              <circle cx={pulseX} cy={axisY} r="5.5" fill={returning ? A : C} />
              <text x={pulseX} y={axisY - 18} textAnchor="middle" fill={returning ? A : C} style={f.mono(700, 8.5, { upper: true, tracking: 0.14 })}>{returning ? "echo" : "ping"}</text>
            </g>
          )}

          {/* target */}
          <rect x={targetX} y={axisY - 26} width="7" height="52" rx="1.5" fill={T.ink} />
          <rect x={targetX} y={axisY - 26} width="7" height="6" fill="#ffffff" opacity="0.18" />
          <text x={targetX + 4} y={axisY + 32} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>target</text>

          {/* distance dimension line */}
          <line x1={sensorX} y1={axisY + 48} x2={targetX} y2={axisY + 48} stroke={T.ink} strokeWidth="0.8" />
          <line x1={sensorX} y1={axisY + 44} x2={sensorX} y2={axisY + 52} stroke={T.ink} strokeWidth="0.8" />
          <line x1={targetX} y1={axisY + 44} x2={targetX} y2={axisY + 52} stroke={T.ink} strokeWidth="0.8" />
          <rect x={(sensorX + targetX) / 2 - 26} y={axisY + 40} width="52" height="16" rx="2" fill={T.paper} />
          <text x={(sensorX + targetX) / 2} y={axisY + 51} textAnchor="middle" fill={C} style={f.mono(700, 10)}>{D} m</text>

          {/* ===== stopwatch (the live timer) ===== */}
          <circle cx={sx} cy={sy} r={sr} fill={T.paper2} stroke={C} strokeWidth="1.4" />
          {Array.from({ length: 12 }).map((_, k) => {
            const a = (k / 12) * Math.PI * 2 - Math.PI / 2;
            return <line key={k} x1={sx + Math.cos(a) * (sr - 4)} y1={sy + Math.sin(a) * (sr - 4)} x2={sx + Math.cos(a) * (sr - 1)} y2={sy + Math.sin(a) * (sr - 1)} stroke={T.mute} strokeWidth="1" />;
          })}
          <line x1={sx} y1={sy} x2={handX} y2={handY} stroke={A} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx={sx} cy={sy} r="3" fill={A} />
          <text x={sx} y={sy + sr + 16} textAnchor="middle" fill={A} style={f.mono(700, 13)}>{displayMs.toFixed(0)} ms</text>
          <text x={sx} y={sy - sr - 8} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>timing the echo</text>

          {/* ===== live equation ===== */}
          {boxes.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={186} width={b.w} height={34} rx={4} fill={T.paper2} stroke={b.col} strokeWidth="1.2" />
              <text x={b.x + b.w / 2} y={199} textAnchor="middle" fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.12 })}>{b.lab}</text>
              <text x={b.x + b.w / 2} y={214} textAnchor="middle" fill={b.col} style={f.mono(700, 12)}>{b.val}</text>
            </g>
          ))}
          <text x={298} y={214} textAnchor="middle" fill={T.ink} style={f.mono(700, 15)}>×</text>
          <text x={426} y={214} textAnchor="middle" fill={T.ink} style={f.mono(700, 14)}>/ 2</text>
          <text x={460} y={214} textAnchor="middle" fill={T.ink} style={f.mono(700, 15)}>=</text>
          <text x={372} y={238} textAnchor="middle" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.12 })}>out and back, so halve the time</text>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={D} set={setD} min={2} max={20} color={A} label="Target distance" suffix={D + " m"} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((p) => !p)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Round trip", v: tMs.toFixed(0) + " ms", color: A },
        { l: "Pulse speed", v: v + " m/s", color: C },
        { l: "Distance", v: measured.toFixed(1) + " m", color: okC },
      ]} />

      <Caption color={C}>
        Send a pulse, then time how long the echo takes to return. Multiply that
        round-trip time by the pulse speed and halve it, because the pulse covers
        the distance twice, out and back. The result is the range. That is how
        SONAR, ultrasonic sensors, and LiDAR measure distance.
      </Caption>
    </div>
  );
}

export { ExtraSonarRange };
