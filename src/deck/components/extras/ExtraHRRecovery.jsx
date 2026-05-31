// ExtraHRRecovery component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraHRRecovery() {
  // PYS-04 "Heart rate and recovery" (concept 2). Distinct from ExtraSoundMedia
  // (sound transmission). Heart rate sits at rest, climbs with exercise, then
  // recovers toward rest. How many bpm it drops in the first minute after peak
  // is a fitness signal: a fitter heart recovers faster (a steeper drop).
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [fitness, setFitness] = useState(6);   // 0 (slow recovery) .. 10 (fast)
  const [playing, setPlaying] = useState(true);
  const restHR = 72, peakHR = 165;
  const tau = 240 - (fitness / 10) * 190;       // recovery time constant, s (240..50)
  const tRest = 30, tEx = 70, tEnd = 190;       // phase boundaries (s)
  const hrAt = (tt) => {
    if (tt < tRest) return restHR;
    if (tt < tEx) return restHR + (peakHR - restHR) * ((tt - tRest) / (tEx - tRest));
    return restHR + (peakHR - restHR) * Math.exp(-(tt - tEx) / tau);
  };
  const hr130 = hrAt(tEx + 60);
  const HRR1 = Math.round(peakHR - hr130);       // HR recovery in 1 minute
  const fit = HRR1 >= 50 ? "fast" : HRR1 >= 35 ? "moderate" : "slow";
  const fitC = HRR1 >= 50 ? okC : HRR1 >= 35 ? A : warnC;

  // ---- chart geometry ----
  const VW = 560, VH = 230;
  const plotL = 66, plotR = 512, plotTop = 58, plotBot = 176;
  const bpmMin = 60, bpmMax = 180;
  const X = (t) => plotL + (t / tEnd) * (plotR - plotL);
  const Y = (h) => plotBot - ((h - bpmMin) / (bpmMax - bpmMin)) * (plotBot - plotTop);
  const curve = [];
  for (let tt = 0; tt <= tEnd; tt += 2) curve.push(X(tt).toFixed(1) + "," + Y(hrAt(tt)).toFixed(1));

  // ---- playhead (a heart beating along the curve) ----
  const clockRef = useRef(2400);
  const [, force] = useState(0);
  const cycle = 7200;
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const tp = (clockRef.current % cycle) / cycle * tEnd;
  const hrp = hrAt(tp);
  const px = X(tp), py = Y(hrp);
  const beat = 1 + 0.16 * Math.max(0, Math.sin(clockRef.current * 0.018 * (hrp / 72)));
  const heart = (s) => "M0," + (s * 0.28).toFixed(2) + " C0," + (-s * 0.22).toFixed(2) + " " + (-s).toFixed(2) + "," + (-s * 0.5).toFixed(2) + " " + (-s).toFixed(2) + "," + (s * 0.12).toFixed(2) + " C" + (-s).toFixed(2) + "," + (s * 0.52).toFixed(2) + " 0," + (s * 0.72).toFixed(2) + " 0," + s.toFixed(2) + " C0," + (s * 0.72).toFixed(2) + " " + s.toFixed(2) + "," + (s * 0.52).toFixed(2) + " " + s.toFixed(2) + "," + (s * 0.12).toFixed(2) + " C" + s.toFixed(2) + "," + (-s * 0.5).toFixed(2) + " 0," + (-s * 0.22).toFixed(2) + " 0," + (s * 0.28).toFixed(2) + " Z";

  const phases = [
    { a: 0, b: tRest, lab: "rest" },
    { a: tRest, b: tEx, lab: "exercise" },
    { a: tEx, b: tEnd, lab: "recover" },
  ];

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>heart rate and recovery</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>how fast it returns to rest</text>

          {/* phase bands */}
          {phases.map((ph, i) => (
            <g key={i}>
              <rect x={X(ph.a)} y={plotTop} width={X(ph.b) - X(ph.a)} height={plotBot - plotTop}
                fill={ph.lab === "exercise" ? A : C} opacity={ph.lab === "exercise" ? 0.07 : 0.035} />
              <text x={(X(ph.a) + X(ph.b)) / 2} y={plotBot + 14} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>{ph.lab}</text>
            </g>
          ))}

          {/* axes + bpm ticks */}
          <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.ink} strokeWidth="0.8" />
          <line x1={plotL} y1={plotTop} x2={plotL} y2={plotBot} stroke={T.ink} strokeWidth="0.8" />
          {[60, 90, 120, 150, 180].map((b) => (
            <g key={b}>
              <line x1={plotL - 3} y1={Y(b)} x2={plotL} y2={Y(b)} stroke={T.ink} strokeWidth="0.7" />
              <text x={plotL - 6} y={Y(b) + 3} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5)}>{b}</text>
            </g>
          ))}
          <text x={plotL - 6} y={plotTop - 4} textAnchor="end" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>bpm</text>

          {/* resting reference line */}
          <line x1={plotL} y1={Y(restHR)} x2={plotR} y2={Y(restHR)} stroke={C} strokeDasharray="3 3" strokeWidth="0.9" opacity="0.6" />
          <text x={plotR + 5} y={Y(restHR) + 3} textAnchor="start" fill={C} style={f.mono(600, 7.5)}>resting {restHR}</text>

          {/* HR curve */}
          <polyline points={curve.join(" ")} fill="none" stroke={A} strokeWidth="2.4" />

          {/* peak marker */}
          <circle cx={X(tEx)} cy={Y(peakHR)} r="3.6" fill={A} stroke={T.paper} strokeWidth="1" />
          <text x={X(tEx) - 9} y={Y(peakHR) - 1} textAnchor="end" fill={A} style={f.mono(700, 8.5)}>peak {peakHR}</text>

          {/* 1-minute recovery measure */}
          {(() => {
            const xm = X(tEx + 60), yTop = Y(peakHR), yBot = Y(hr130);
            return (
              <g>
                <line x1={X(tEx)} y1={yTop} x2={xm} y2={yTop} stroke={T.mute} strokeDasharray="2 3" strokeWidth="0.7" />
                <line x1={xm} y1={yTop} x2={xm} y2={yBot} stroke={okC} strokeWidth="1.6" />
                <polygon points={xm + "," + yBot + " " + (xm - 3) + "," + (yBot - 6) + " " + (xm + 3) + "," + (yBot - 6)} fill={okC} />
                <polygon points={xm + "," + yTop + " " + (xm - 3) + "," + (yTop + 6) + " " + (xm + 3) + "," + (yTop + 6)} fill={okC} />
                {/* dot removed: the double-headed arrow already marks the drop span */}
                <rect x={xm + 6} y={(yTop + yBot) / 2 - 14} width="92" height="28" rx="3" fill={T.paper} stroke={okC} strokeWidth="1" />
                <text x={xm + 52} y={(yTop + yBot) / 2 - 2} textAnchor="middle" fill={okC} style={f.mono(700, 10)}>{HRR1} bpm</text>
                <text x={xm + 52} y={(yTop + yBot) / 2 + 9} textAnchor="middle" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>drop in 1 min</text>
              </g>
            );
          })()}

          {/* playhead heart */}
          <g transform={"translate(" + px.toFixed(1) + " " + py.toFixed(1) + ") scale(" + beat.toFixed(3) + ")"}>
            <path d={heart(7)} fill={A} stroke={T.paper} strokeWidth="0.8" />
          </g>
          {(px < 358 || px > 480) && <text x={clamp(px, plotL + 16, plotR - 16)} y={py - 14} textAnchor="middle" fill={C} style={f.mono(700, 9)}>{hrp.toFixed(0)}</text>}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={fitness} set={setFitness} min={0} max={10} color={A} label="Fitness" suffix={fitness} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Resting", v: restHR + " bpm", color: C },
        { l: "Peak", v: peakHR + " bpm", color: A },
        { l: "HR recovery", v: HRR1 + " bpm/min", color: okC },
        { l: "Recovery", v: fit, color: fitC },
      ]} />

      <Caption color={C}>
        At rest the heart beats slowly; light exercise drives it up to a peak;
        then it recovers toward rest. The number of beats per minute it drops in
        the first minute after peak is a fitness signal: a fitter heart recovers
        faster, a steeper fall. Measure resting and post-activity rates with
        consent.
      </Caption>
    </div>
  );
}

export { ExtraHRRecovery };
