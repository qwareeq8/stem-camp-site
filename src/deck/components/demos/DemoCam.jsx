// DemoCam component for the STEM Camp interactive deck.
import { useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function DemoCam() {
  // PYS-03 "Cams, followers, linkages" (concept 1). Sibling ExtraReliability
  // (concept 2) owns the jam/reliability story with a crank wheel and a slider-
  // crank connecting rod. This demo owns the mechanism: a crank turns a SHAPED
  // cam, a roller follower rides the profile and rises/falls, and a pivoted lever
  // (a linkage) passes that motion on to a small task that rocks. The right panel
  // plots follower lift vs cam angle, so changing the cam shape visibly changes
  // the motion. The cam shape decides the movement.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [shape, setShape] = useState("egg");
  const [speed, setSpeed] = useState(6);
  const [running, setRunning] = useState(true);
  const angRef = useRef(0);
  const [, force] = useState(0);
  const TAU = Math.PI * 2;

  const profile = (a) => {
    const u = ((a % TAU) + TAU) % TAU;
    if (shape === "circle") return 42;
    if (shape === "egg") return 34 + Math.cos(u) * 14;          // one smooth rise
    if (shape === "snail") return 26 + 22 * (u / TAU);          // gradual rise, sharp drop
    if (shape === "double") return 32 + 13 * Math.abs(Math.cos(u)); // two lifts per turn
    return 42;
  };

  useRAF(running, (dt) => { angRef.current += (dt / 1000) * speed * 0.5; force((n) => (n + 1) % 1000000); });

  const camPath = useMemo(() => {
    const steps = 120, pts = [];
    for (let i = 0; i <= steps; i++) { const a = (i / steps) * TAU; const r = profile(a); pts.push((Math.cos(a) * r).toFixed(2) + "," + (Math.sin(a) * r).toFixed(2)); }
    return "M " + pts.join(" L ") + " Z";
  }, [shape]);
  const stats = useMemo(() => { let mn = 1e9, mx = -1e9; for (let i = 0; i < 360; i++) { const r = profile(i * Math.PI / 180); if (r < mn) mn = r; if (r > mx) mx = r; } return { baseR: mn, maxR: mx }; }, [shape]);
  const maxLift = Math.max(1, stats.maxR - stats.baseR);

  // ----- geometry (bounded) -----
  const VW = 560, VH = 280, camC = { x: 116, y: 176 }, guideR = 54, rollerR = 6, rodLen = 52;
  const ang = angRef.current;
  const rTop = profile(-Math.PI / 2 - ang);
  const L = Math.max(0, rTop - stats.baseR);
  const contactY = camC.y - (stats.baseR + L);
  const rollerCenterY = contactY - rollerR;
  const rodTopY = rollerCenterY - rodLen;
  const Fp = { x: camC.x + 56, y: 82 };               // lever fulcrum
  const ndx = Fp.x - camC.x, ndy = Fp.y - rodTopY, nlen = Math.hypot(ndx, ndy);
  const ux = ndx / nlen, uy = ndy / nlen, farLen = 62;
  const farX = Fp.x + ux * farLen, farY = Fp.y + uy * farLen;
  const peck = -8 + (L / maxLift) * 26;
  const curDeg = ((ang * 180 / Math.PI) % 360 + 360) % 360;
  const motion = shape === "circle" ? "dwell (no lift)" : shape === "egg" ? "smooth rise and fall" : shape === "snail" ? "slow rise, fast drop" : "two lifts per turn";

  // ----- plot -----
  const pX = 330, pY = 58, pW = 212, pH = 188;
  const plotL = pX + 34, plotR = pX + pW - 14, plotTop = pY + 28, plotBot = pY + pH - 24;
  const xAng = (deg) => plotL + (deg / 360) * (plotR - plotL);
  const yLift = (lv) => plotBot - (lv / maxLift) * (plotBot - plotTop);
  const liftAt = (deg) => Math.max(0, profile(-Math.PI / 2 - deg * Math.PI / 180) - stats.baseR);
  const curvePts = useMemo(() => { const a = []; for (let d = 0; d <= 360; d += 3) a.push(xAng(d).toFixed(1) + "," + yLift(liftAt(d)).toFixed(1)); return a.join(" "); }, [shape]);

  return (
    <div>
      <Field height={290}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          {/* ===== header ===== */}
          <text x="18" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Cams, followers, linkages</text>
          <text x="18" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>the cam shape sets the motion</text>

          {/* ===== base / bench ===== */}
          <rect x={36} y={236} width={250} height={10} fill={T.paper3} stroke={T.ink} strokeWidth="0.8" />

          {/* ===== lever (linkage) + fulcrum + task ===== */}
          <line x1={camC.x} y1={rodTopY} x2={farX} y2={farY} stroke={C} strokeWidth="3.4" strokeLinecap="round" />
          <polygon points={Fp.x + "," + Fp.y + " " + (Fp.x - 7) + "," + (Fp.y + 16) + " " + (Fp.x + 7) + "," + (Fp.y + 16)} fill={T.ink} />
          <circle cx={Fp.x} cy={Fp.y} r="3" fill={T.paper} stroke={T.ink} strokeWidth="1" />
          <text x={Fp.x} y={Fp.y - 18} textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>linkage</text>
          {/* task character (rocks/pecks with the lift) */}
          <g transform={"translate(" + farX.toFixed(1) + " " + farY.toFixed(1) + ") rotate(" + peck.toFixed(1) + ")"}>
            <line x1="0" y1="0" x2="0" y2="10" stroke={T.ink} strokeWidth="1.6" />
            <ellipse cx="0" cy="-5" rx="11" ry="8" fill={A} stroke={T.ink} strokeWidth="0.7" />
            <circle cx="7" cy="-11" r="5.5" fill={A} stroke={T.ink} strokeWidth="0.7" />
            <polygon points="11,-12 21,-10 11,-8" fill={C} />
            <circle cx="8" cy="-12" r="1.2" fill={T.paper} />
          </g>
          <text x={farX} y={farY + 26} textAnchor="middle" fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.1 })}>task</text>

          {/* ===== follower rod + guides + roller ===== */}
          <line x1={camC.x - 9} y1={104} x2={camC.x + 9} y2={104} stroke={T.ink} strokeWidth="2.6" strokeLinecap="round" />
          <line x1={camC.x - 9} y1={122} x2={camC.x + 9} y2={122} stroke={T.ink} strokeWidth="2.6" strokeLinecap="round" />
          <rect x={camC.x - 3.5} y={rodTopY} width="7" height={rollerCenterY - rodTopY} fill="#bdbdbd" stroke={T.ink} strokeWidth="0.6" />
          <circle cx={camC.x} cy={rollerCenterY} r={rollerR} fill={T.paper} stroke={T.ink} strokeWidth="1" />
          <circle cx={camC.x} cy={rollerCenterY} r="1.6" fill={T.ink} />
          <text x={camC.x + 16} y={113} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>follower</text>

          {/* lift bracket (shows current rise) */}
          <line x1={camC.x - 50} y1={camC.y - stats.baseR} x2={camC.x - 50} y2={contactY} stroke={A} strokeWidth="1.2" />
          <line x1={camC.x - 53} y1={camC.y - stats.baseR} x2={camC.x - 47} y2={camC.y - stats.baseR} stroke={A} strokeWidth="1.2" />
          <line x1={camC.x - 53} y1={contactY} x2={camC.x - 47} y2={contactY} stroke={A} strokeWidth="1.2" />
          <text x={camC.x - 56} y={(camC.y - stats.baseR + contactY) / 2 + 3} textAnchor="end" fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.06 })}>lift</text>

          {/* ===== cam + crank ===== */}
          <circle cx={camC.x} cy={camC.y} r={guideR} fill="none" stroke={T.rule12} strokeWidth="0.6" strokeDasharray="2 4" />
          <g transform={"rotate(" + (ang * 180 / Math.PI).toFixed(2) + " " + camC.x + " " + camC.y + ")"}>
            <path d={camPath} fill={T.ink} stroke={A} strokeWidth="1.3" transform={"translate(" + camC.x + " " + camC.y + ")"} />
            <circle cx={camC.x} cy={camC.y} r="4" fill={A} stroke={T.paper} strokeWidth="0.8" />
            {/* crank knob on the cam face */}
            <line x1={camC.x} y1={camC.y} x2={camC.x + 14} y2={camC.y} stroke={A} strokeWidth="2.2" />
            <circle cx={camC.x + 14} cy={camC.y} r="4" fill={A} stroke={T.ink} strokeWidth="0.8" />
          </g>
          {/* contact marker (roller touches cam here) */}
          <circle cx={camC.x} cy={contactY} r="2.6" fill={A} stroke={T.paper} strokeWidth="0.8" />
          <text x={camC.x} y={camC.y + guideR + 4} textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.12 })}>cam: {shape}</text>

          {/* ===== displacement plot ===== */}
          <rect x={pX} y={pY} width={pW} height={pH} rx="6" fill={T.paper2} stroke={C} strokeWidth="1" />
          <text x={pX + 12} y={pY + 17} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.16 })}>follower lift vs cam angle</text>
          <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
          <line x1={plotL} y1={plotTop} x2={plotL} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
          <polyline points={curvePts} fill="none" stroke={A} strokeWidth="2" />
          <line x1={xAng(curDeg)} y1={plotTop} x2={xAng(curDeg)} y2={plotBot} stroke={T.ink} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          <circle cx={xAng(curDeg)} cy={yLift(L)} r="3.6" fill={A} stroke={T.paper} strokeWidth="1.2" />
          <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>0</text>
          <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>360 deg</text>
          
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        {["circle", "egg", "snail", "double"].map((s) => (
          <Btn key={s} small color={A} active={shape === s} onClick={() => setShape(s)}>{s}</Btn>
        ))}
        <Btn small icon={running ? Pause : Play} color={C} onClick={() => setRunning((r) => !r)}>{running ? "pause" : "spin"}</Btn>
        <Slider val={speed} set={setSpeed} min={1} max={10} step={1} color={A} label="Crank speed" suffix={speed} />
      </div>

      <Readout items={[
        { l: "Cam shape", v: shape, color: A },
        { l: "Lift now", v: L.toFixed(0) + " px", color: C },
        { l: "Motion", v: motion },
        { l: "Cam angle", v: curDeg.toFixed(0) + " deg" },
      ]} />

      <Caption color={C}>
        Turning the crank spins the cam. The roller follower rests on the cam edge and rises or falls
        by the radius of the profile under it, so the cam shape alone decides the motion: a round cam
        gives a steady dwell, an egg gives a smooth rise and fall, a snail gives a slow rise then a
        sharp drop, and a double lobe lifts twice per turn. The pivoted lever is a linkage that passes
        that motion along, turning the follower's up and down into a back-and-forth rock of the task.
        This is how valves, music boxes, and animatronics work.
      </Caption>
    </div>
  );
}

export { DemoCam };
