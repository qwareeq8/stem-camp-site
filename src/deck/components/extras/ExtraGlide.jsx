// ExtraGlide component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraGlide() {
  // PYS-09 Hovercraft Hockey: GLIDE vs CONTROL (concept 2, distinct from
  // DemoHover which covers "air cushion cuts friction"). Top-down gym lane:
  // a CD-disc hovercraft puck launches from the start line and glides to a
  // stop near the target. A bigger air cushion (lift) buys reach but widens
  // the spread of where the puck stops, so control drops. Repeated launches
  // leave a grouping of landing marks: tight = controlled, scattered = wild.
  // The lower panel shows the glide-vs-control tradeoff across lift.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const DISC = "#cdcdcd", DISC_DK = "#9a9a9a";

  const [lift, setLift] = useState(5);    // air cushion 1..10
  const [push, setPush] = useState(9);    // launch strength 1..10
  const [playing, setPlaying] = useState(true);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---- Geometry: every zone bounded; nothing overlaps at any setting ----
  const W = 560, H = 320;
  const laneL = 44, laneR = 516;
  const floorTop = 92, floorBot = 156, yMid = (floorTop + floorBot) / 2;
  const startX = 70, wallX = 512;
  const maxTravel = wallX - startX - 12;            // 430
  const targetCx = 372, targetHW = 30;
  const targetL = targetCx - targetHW, targetR = targetCx + targetHW;

  // ---- Glide vs control model ----
  const pushF = 0.32 + 0.68 * (push - 1) / 9;        // 0.32..1.0
  const liftReach = 0.46 + 0.54 * (lift - 1) / 9;    // 0.46..1.0
  const reachFrac = clamp(pushF * liftReach, 0, 1);
  const center = startX + reachFrac * maxTravel;
  const sMin = 8, sMax = 92;
  const S = sMin + (lift - 1) / 9 * (sMax - sMin);   // spread half-width
  const controlPct = clamp(Math.round(100 * (1 - (S - sMin) / (sMax - sMin))), 0, 100);
  const bandL = clamp(center - S, laneL + 4, wallX);
  const bandR = clamp(center + S, laneL + 4, wallX);

  let result, resultC;
  if (center < targetL) { result = "stalls short"; resultC = warnC; }
  else if (center > targetR) { result = "overshoots"; resultC = warnC; }
  else if (S <= 46) { result = "on target"; resultC = okC; }
  else { result = "no control"; resultC = A; }
  const onTarget = result === "on target";

  // ---- Landing grouping (deterministic so the static frame is complete) ----
  const offsets = [-0.92, -0.62, -0.34, -0.12, 0.08, 0.3, 0.55, 0.78, 0.95];

  // ---- Animation: puck glides start -> a landing point, looping ----
  const clockRef = useRef(900);
  const idxRef = useRef(4);
  const [, force] = useState(0);
  const cycle = 1500, glideDur = 1050;
  useRAF(playing, (dt) => {
    clockRef.current += dt;
    if (clockRef.current >= cycle) {
      clockRef.current = 0;
      idxRef.current = (idxRef.current + 1) % offsets.length;
    }
    force((v) => v + 1);
  });
  const progress = clamp(clockRef.current / glideDur, 0, 1);
  const ease = 1 - Math.pow(1 - progress, 3);
  const landingX = clamp(center + offsets[idxRef.current] * S, laneL + 8, wallX - 16);
  const puckX = startX + ease * (landingX - startX);
  const shimmer = clockRef.current;

  // ---- Tradeoff panel geometry ----
  const pX = 44, pY = 202, pW = 472, pH = 104;
  const plotL = pX + 54, plotR = pX + pW - 56, plotTop = pY + 26, plotBot = pY + pH - 22;
  const liftX = (L) => plotL + ((L - 1) / 9) * (plotR - plotL);
  const glideY = (L) => plotBot - ((L - 1) / 9) * (plotBot - plotTop);
  const ctrlY = (L) => plotBot - (1 - (L - 1) / 9) * (plotBot - plotTop);
  const lifts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const glidePts = lifts.map((L) => liftX(L).toFixed(1) + "," + glideY(L).toFixed(1)).join(" ");
  const ctrlPts = lifts.map((L) => liftX(L).toFixed(1) + "," + ctrlY(L).toFixed(1)).join(" ");
  const balL = liftX(4.5), balR = liftX(6.5);

  return (
    <div>
      <Field height={330}>
        <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", height: "100%" }}>
          {/* ===== titles ===== */}
          <text x={laneL} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>glide vs control</text>
          <text x={laneL} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>hovercraft target hockey</text>

          {/* ===== lane floor ===== */}
          <rect x={laneL} y={floorTop} width={laneR - laneL} height={floorBot - floorTop} fill={T.paper3} stroke={T.ink} strokeWidth="1" />
          <line x1={laneL} y1={yMid} x2={laneR} y2={yMid} stroke={T.ink} strokeDasharray="2 5" strokeWidth="0.5" opacity="0.45" />

          {/* ===== reach bracket (above floor) ===== */}
          <line x1={startX} y1={80} x2={center} y2={80} stroke={A} strokeWidth="1" />
          <line x1={startX} y1={76} x2={startX} y2={84} stroke={A} strokeWidth="1" />
          <line x1={center} y1={76} x2={center} y2={84} stroke={A} strokeWidth="1" />
          <text x={(startX + center) / 2} y={73} textAnchor="middle" fill={A} style={f.mono(600, 8.5, { upper: true, tracking: 0.14 })}>reach</text>

          {/* ===== spread band (where the puck might stop) ===== */}
          <rect x={bandL} y={floorTop} width={Math.max(0, bandR - bandL)} height={floorBot - floorTop} fill={A} opacity="0.16" />

          {/* ===== target crease ===== */}
          <rect x={targetL} y={floorTop} width={targetHW * 2} height={floorBot - floorTop} fill={onTarget ? okC : C} opacity={onTarget ? 0.16 : 0.07} />
          <line x1={targetL} y1={floorTop} x2={targetL} y2={floorBot} stroke={onTarget ? okC : C} strokeWidth="1.4" />
          <line x1={targetR} y1={floorTop} x2={targetR} y2={floorBot} stroke={onTarget ? okC : C} strokeWidth="1.4" />
          <text x={targetCx} y={86} textAnchor="middle" fill={onTarget ? okC : C} style={f.mono(700, 9, { upper: true, tracking: 0.18 })}>target</text>

          {/* ===== start line + wall ===== */}
          <line x1={startX} y1={floorTop} x2={startX} y2={floorBot} stroke={T.ink} strokeWidth="1.2" />
          <line x1={wallX} y1={floorTop} x2={wallX} y2={floorBot} stroke={T.ink} strokeWidth="2" />
          <text x={startX} y={168} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>start</text>
          <text x={wallX} y={168} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.16 })}>wall</text>

          {/* ===== landing grouping ===== */}
          {offsets.map((off, i) => {
            const dx = clamp(center + off * S, laneL + 8, wallX - 4);
            const dy = 132 + ((i % 3) - 1) * 5;
            const cur = i === idxRef.current;
            return <circle key={i} cx={dx} cy={dy} r={cur ? 3.6 : 2.5} fill={C} opacity={cur ? 0.95 : 0.4} />;
          })}

          {/* ===== center (stop) marker ===== */}
          <line x1={center} y1={floorTop} x2={center} y2={floorBot} stroke={C} strokeWidth="1.1" strokeDasharray="3 3" opacity="0.8" />
          <polygon points={(center - 4) + "," + floorTop + " " + (center + 4) + "," + floorTop + " " + center + "," + (floorTop + 6)} fill={C} />

          {/* ===== glide path + puck ===== */}
          <line x1={startX} y1={yMid} x2={puckX} y2={yMid} stroke={A} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <g>
            <ellipse cx={puckX + 2} cy={yMid + 8} rx="14" ry="4.5" fill="#000" opacity="0.12" />
            <ellipse cx={puckX} cy={yMid + 7} rx="16" ry={3 + lift * 0.7} fill={A} opacity="0.22" />
            {Array.from({ length: 5 }).map((_, i) => {
              const lx = puckX - 10 + i * 5;
              const len = 5 + lift * 0.8 + Math.sin(shimmer * 0.02 + i) * 2.2;
              return <line key={"a" + i} x1={lx} y1={yMid + 7} x2={lx} y2={yMid + 7 + len} stroke={A} strokeWidth="1.1" opacity="0.45" strokeLinecap="round" />;
            })}
            <ellipse cx={puckX} cy={yMid} rx="14" ry="7" fill={DISC} stroke={T.ink} strokeWidth="0.9" />
            <ellipse cx={puckX} cy={yMid + 1.5} rx="14" ry="7" fill="none" stroke={DISC_DK} strokeWidth="0.5" opacity="0.6" />
            <ellipse cx={puckX} cy={yMid - 5} rx="8" ry="5.5" fill={A} opacity="0.92" stroke={T.ink} strokeWidth="0.6" />
            <circle cx={puckX} cy={yMid - 6} r="1.8" fill={T.ink} />
            <ellipse cx={puckX - 3.5} cy={yMid - 6.5} rx="2.6" ry="1.2" fill="#ffffff" opacity="0.6" />
          </g>

          {/* ===== verdict pill + leader ===== */}
          {(() => {
            const pw = 116, ph = 22, px = laneR - pw, py = 12;
            const mx = clamp(center, laneL + 8, wallX - 4), my = floorTop - 1;
            const lx = px + 14, ly = py + ph;
            const ang = Math.atan2(my - ly, mx - lx);
            const ah = 5;
            const a1x = mx - ah * Math.cos(ang - 0.5), a1y = my - ah * Math.sin(ang - 0.5);
            const a2x = mx - ah * Math.cos(ang + 0.5), a2y = my - ah * Math.sin(ang + 0.5);
            return (
              <g>
                <line x1={lx} y1={ly} x2={mx} y2={my} stroke={resultC} strokeWidth="0.9" />
                <polygon points={mx + "," + my + " " + a1x + "," + a1y + " " + a2x + "," + a2y} fill={resultC} />
                <rect x={px} y={py + 2} width={pw} height={ph} rx={4} fill="#000" opacity="0.12" />
                <rect x={px} y={py} width={pw} height={ph} rx={4} fill={T.paper} stroke={resultC} strokeWidth="1.1" />
                <circle cx={px + 12} cy={py + ph / 2} r="3.5" fill={resultC} />
                <text x={px + 24} y={py + ph / 2 + 4} fill={resultC} style={f.mono(700, 10.5, { upper: true, tracking: 0.08 })}>{result}</text>
              </g>
            );
          })()}

          {/* ===== tradeoff panel ===== */}
          <g>
            <rect x={pX} y={pY} width={pW} height={pH} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={pX + 12} y={pY + 16} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>lift tradeoff</text>
            <rect x={balL} y={plotTop} width={balR - balL} height={plotBot - plotTop} fill={okC} opacity="0.12" />
            <text x={(balL + balR) / 2} y={plotTop - 4} textAnchor="middle" fill={okC} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>balanced</text>
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={glidePts} fill="none" stroke={A} strokeWidth="2" />
            <polyline points={ctrlPts} fill="none" stroke={C} strokeWidth="2" />
            <text x={plotR + 5} y={glideY(10) + 3} fill={A} style={f.mono(700, 8.5, { upper: true, tracking: 0.12 })}>glide</text>
            <text x={plotR + 5} y={ctrlY(10) + 3} fill={C} style={f.mono(700, 8.5, { upper: true, tracking: 0.12 })}>control</text>
            <line x1={liftX(lift)} y1={plotTop} x2={liftX(lift)} y2={plotBot} stroke={T.ink} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <circle cx={liftX(lift)} cy={glideY(lift)} r="3.2" fill={A} stroke={T.paper} strokeWidth="1" />
            <circle cx={liftX(lift)} cy={ctrlY(lift)} r="3.2" fill={C} stroke={T.paper} strokeWidth="1" />
            <polygon points={(liftX(lift) - 4) + "," + (plotBot + 2) + " " + (liftX(lift) + 4) + "," + (plotBot + 2) + " " + liftX(lift) + "," + (plotBot + 8)} fill={T.ink} />
            <text x={plotL} y={plotBot + 16} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>low lift</text>
            <text x={plotR} y={plotBot + 16} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>high lift</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={lift} set={setLift} min={1} max={10} color={A} label="Air cushion" suffix={lift} />
        <Slider val={push} set={setPush} min={1} max={10} color={C} label="Push" suffix={push} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((p) => !p)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Reach", v: Math.round(reachFrac * 100) + " (rel)", color: A },
        { l: "Control", v: controlPct + "%", color: C },
        { l: "Result", v: result, color: resultC },
      ]} />

      <Caption color={C}>
        A big air cushion gives a long, low-friction glide, but the puck becomes
        hard to stop where you aim, so it scatters past the target. A small
        cushion keeps tight control yet stalls short. Winning target hockey means
        balancing lift and push: enough glide to reach the target, enough control
        to stop on it.
      </Caption>
    </div>
  );
}

export { ExtraGlide };
