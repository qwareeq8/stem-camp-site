// ExtraReliability component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraReliability() {
  // PYS-03 "Reliability" (concept 2). Distinct from DemoCam (the cam/follower
  // mechanism). A hand-cranked automaton must run the SAME every turn. Smooth
  // holes and low friction make it repeatable; friction makes it jam. Reliability
  // is how many cranks complete without jamming over many runs.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [friction, setFriction] = useState(3);   // 0 smooth .. 10 rough
  const [playing, setPlaying] = useState(true);
  const N = 12;
  const jams = Math.round((friction / 10) * N * 0.85);   // 0..~10
  const rel = Math.round(((N - jams) / N) * 100);
  const isJam = (i) => Math.floor(((i + 1) * jams) / N) > Math.floor((i * jams) / N);  // spread evenly
  const verdict = rel >= 80 ? "reliable" : rel >= 50 ? "occasional jams" : "jams a lot";
  const vC = rel >= 80 ? okC : rel >= 50 ? A : warnC;

  // ---- animation ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const cycleMs = 1300;
  const idx = Math.floor(clockRef.current / cycleMs) % N;
  const prog = (clockRef.current % cycleMs) / cycleMs;
  const jamNow = isJam(idx);
  let theta, stalled = false;
  if (!jamNow) { theta = prog * 360; }
  else if (prog < 0.42) { theta = (prog / 0.42) * 150; }
  else { theta = 150 + Math.sin(clockRef.current * 0.05) * 4; stalled = true; }
  const thr = (theta * Math.PI) / 180;
  const bob = 0.5 + 0.5 * Math.sin((theta - 90) * Math.PI / 180);

  // ---- geometry ----
  const VW = 560, VH = 230;
  const cwx = 104, cwy = 134, R = 30, xf = 178;
  const pinX = cwx + R * 0.6 * Math.cos(thr), pinY = cwy + R * 0.6 * Math.sin(thr);
  const fby = 158 - bob * 20;          // follower lower pin
  const fTop = fby - 46;               // follower rod top (task)

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>reliability</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>does it run the same every crank?</text>

          {/* base / box */}
          <rect x={56} y={170} width={210} height={16} fill={T.paper3} stroke={T.ink} strokeWidth="1" />
          <text x={70} y={200} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>hand-cranked automaton</text>

          {/* follower guide bearings (the smooth holes) */}
          <line x1={xf - 8} y1={120} x2={xf + 8} y2={120} stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" />
          <line x1={xf - 8} y1={150} x2={xf + 8} y2={150} stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" />
          <text x={xf + 16} y={138} fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>bearings</text>

          {/* connecting rod */}
          <line x1={pinX} y1={pinY} x2={xf} y2={fby} stroke={C} strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />

          {/* follower rod + task flag */}
          <line x1={xf} y1={fby} x2={xf} y2={fTop} stroke={T.ink} strokeWidth="3" strokeLinecap="round" />
          <g transform={"translate(" + xf + " " + fTop + ")"}>
            <line x1="0" y1="0" x2="0" y2="-12" stroke={T.ink} strokeWidth="1.6" />
            <polygon points="0,-12 18,-8 0,-4" fill={stalled ? warnC : A} />
          </g>

          {/* crank wheel */}
          <circle cx={cwx} cy={cwy} r={R} fill={T.paper2} stroke={T.ink} strokeWidth="1.4" />
          <circle cx={cwx} cy={cwy} r={R * 0.16} fill={C} />
          <g transform={"rotate(" + theta.toFixed(1) + " " + cwx + " " + cwy + ")"}>
            <line x1={cwx} y1={cwy} x2={cwx + R * 0.62} y2={cwy} stroke={A} strokeWidth="3" strokeLinecap="round" />
            <circle cx={cwx + R * 0.62} cy={cwy} r="4.5" fill={A} stroke={T.ink} strokeWidth="0.8" />
          </g>
          <text x={cwx} y={cwy + R + 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>crank</text>

          {/* jam badge */}
          {stalled && (
            <g>
              <rect x={cwx - 22} y={cwy - R - 24} width="44" height="18" rx="3" fill={T.paper} stroke={warnC} strokeWidth="1.2" />
              <text x={cwx} y={cwy - R - 11} textAnchor="middle" fill={warnC} style={f.mono(700, 10, { upper: true, tracking: 0.12 })}>jam</text>
            </g>
          )}

          {/* ===== reliability panel ===== */}
          {(() => {
            const px = 312, py = 50, pw = 204, ph = 140;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + 12} y={py + 17} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.18 })}>12-crank test</text>
                {Array.from({ length: N }).map((_, i) => {
                  const dx = px + 28 + (i % 6) * 30, dy = py + 42 + Math.floor(i / 6) * 30;
                  const jam = isJam(i), cur = i === idx;
                  return (
                    <g key={i}>
                      {cur && <circle cx={dx} cy={dy} r="11" fill="none" stroke={T.ink} strokeWidth="1.2" />}
                      <circle cx={dx} cy={dy} r="8" fill={jam ? warnC : okC} opacity="0.9" />
                      <text x={dx} y={dy + 3.5} textAnchor="middle" fill={T.paper} style={f.mono(700, 10)}>{jam ? "×" : "✓"}</text>
                    </g>
                  );
                })}
                <text x={px + pw / 2} y={py + ph - 26} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>reliability</text>
                <text x={px + pw / 2} y={py + ph - 6} textAnchor="middle" fill={vC} style={f.mono(700, 22)}>{rel}%</text>
              </g>
            );
          })()}
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={friction} set={setFriction} min={0} max={10} color={A} label="Friction" suffix={friction} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Friction", v: friction <= 3 ? "low" : friction <= 6 ? "medium" : "high", color: A },
        { l: "Jams", v: jams + " / " + N, color: warnC },
        { l: "Reliability", v: rel + "%", color: vC },
        { l: "Verdict", v: verdict, color: vC },
      ]} />

      <Caption color={C}>
        A machine that jams is a failed machine. Smooth holes, low friction, and a
        steady crank make the motion repeat the same way every turn. Reliability is
        how many cranks complete without jamming, so you test it over many runs and
        reduce friction until it is dependable.
      </Caption>
    </div>
  );
}

export { ExtraReliability };
