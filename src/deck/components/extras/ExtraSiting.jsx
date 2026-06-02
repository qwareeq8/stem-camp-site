// ExtraSiting component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { usePointerDrag } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Tag } from "../../ui/primitives.jsx";

function ExtraSiting() {
  // TTT-02 "Evidence-based siting" (concept 2). Sibling ExtraMicroclimate shows
  // the variation. This is the DECISION: a good sensor site reads close to the
  // area's typical value (representative) and sits away from the path (not
  // disturbed). A spot by the hot pavement or the cool tree is an outlier; a
  // spot on the path gets bumped. The map starts with NO sensor so students
  // predict a location first; a tap or drag in the map places it, and the marker
  // is then freely draggable (letterbox toVB + stable handler, 6.1/6.2).
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok, warnC = T.warn, waterC = "#5a93c9";
  const stage = useRef(null);
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [pos, setPos] = useState({ x: 220, y: 120 });
  const [placed, setPlaced] = useState(false);
  // stable handler so a sustained drag is not torn down by re-render (6.2);
  // letterbox-aware pixel -> viewBox mapping so the marker tracks at any zoom (6.1)
  const moveImpl = ({ x, y, w, h }) => {
    const sc = Math.min(w / 440, h / 236);
    const ux = (x - (w - 440 * sc) / 2) / sc, uy = (y - (h - 236 * sc) / 2) / sc;
    setPos({ x: cl(ux, 32, 408), y: cl(uy, 50, 196) });
    setPlaced(true);
  };
  const moveRef = useRef(moveImpl); moveRef.current = moveImpl;
  const onMove = useRef((a) => moveRef.current(a)).current;
  usePointerDrag(stage, onMove);
  const reset = () => setPlaced(false);

  const TREE = { x: 66, y: 116 }, PAVE = { x: 372, y: 74 };
  const fieldTemp = (x, y) => 24 - 8 * Math.exp(-((x - TREE.x) ** 2 + (y - TREE.y) ** 2) / 4900) + 9 * Math.exp(-((x - PAVE.x) ** 2 + (y - PAVE.y) ** 2) / 5625);
  const mean = 24;
  const PA = { x: 16, y: 196 }, PB = { x: 424, y: 152 };
  const distSeg = (p) => { const dx = PB.x - PA.x, dy = PB.y - PA.y, L2 = dx * dx + dy * dy; let t = cl(((p.x - PA.x) * dx + (p.y - PA.y) * dy) / L2, 0, 1); return Math.hypot(p.x - (PA.x + t * dx), p.y - (PA.y + t * dy)); };

  const localT = fieldTemp(pos.x, pos.y);
  const repErr = Math.abs(localT - mean);
  const repScore = Math.max(0, 100 - repErr * 9);
  const pathD = distSeg(pos);
  const distScore = Math.min(100, pathD * 2.2);
  const score = Math.round(0.6 * repScore + 0.4 * distScore);
  const decision = score >= 72 ? "good site" : repScore < 55 ? "unrepresentative" : distScore < 55 ? "on the path" : "marginal";
  const sC = score >= 72 ? okC : score >= 50 ? A : warnC;

  const stations = [[120, 70], [250, 60], [180, 150], [320, 120], [300, 180]];

  return (
    <div>
      <Field height={236}>
        <div ref={stage} style={{ position: "absolute", inset: 0, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: placed ? "grab" : "crosshair" }}>
          <svg viewBox="0 0 440 236" style={{ width: "100%", height: "100%" }}>
            <text x="20" y="15" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.04 })}>Evidence-based siting</text>
            <text x="20" y="27" fill={T.mute} style={f.mono(500, 8, { upper: true, tracking: 0.08 })}>{placed ? "drag the sensor to move it" : "predict first: where should the sensor go?"}</text>

            <defs>
              <clipPath id="siting-map-clip">
                <rect x="16" y="34" width="408" height="184" rx="3" />
              </clipPath>
            </defs>
            <rect x="16" y="34" width="408" height="184" rx="3" fill={T.paper2} stroke={T.rule12} strokeWidth="1" />
            {/* microclimate tints, clipped to the map so they do not spill past its edges */}
            <g clipPath="url(#siting-map-clip)">
              <circle cx={TREE.x} cy={TREE.y} r="86" fill={waterC} opacity="0.13" />
              <circle cx={PAVE.x} cy={PAVE.y} r="88" fill={A} opacity="0.16" />
            </g>
            {/* disturbance path */}
            <line x1={PA.x} y1={PA.y} x2={PB.x} y2={PB.y} stroke={T.mute} strokeWidth="6" opacity="0.3" />
            <line x1={PA.x} y1={PA.y} x2={PB.x} y2={PB.y} stroke={T.mute} strokeWidth="1" strokeDasharray="5 5" opacity="0.7" />
            <text x="404" y="148" textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true })}>foot path</text>
            {/* tree (cool) */}
            <g transform={"translate(" + TREE.x + " " + TREE.y + ")"}>
              <line x1="0" y1="0" x2="0" y2="-12" stroke="#7a5732" strokeWidth="2.5" />
              <circle cx="0" cy="-18" r="11" fill={C} opacity="0.9" />
              <text x="0" y="14" textAnchor="middle" fill={T.mute} style={f.mono(500, 7, { upper: true })}>tree</text>
            </g>
            {/* pavement (hot) */}
            <g transform={"translate(" + PAVE.x + " " + PAVE.y + ")"}>
              <rect x="-20" y="-10" width="40" height="20" rx="2" fill="#b9b0a0" stroke={T.ink} strokeWidth="0.5" />
              <text x="0" y="22" textAnchor="middle" fill={T.mute} style={f.mono(500, 7, { upper: true })}>pavement</text>
            </g>
            {/* field-station readings (the evidence students reason from) */}
            {stations.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="2.6" fill={T.ink} opacity="0.55" />
                <text x={x} y={y - 6} textAnchor="middle" fill={T.mute} style={f.mono(500, 7)}>{fieldTemp(x, y).toFixed(0)}{"°"}</text>
              </g>
            ))}
            {/* area-mean chip */}
            <rect x="22" y="40" width="86" height="16" rx="2" fill={T.paper} stroke={T.rule12} strokeWidth="0.6" />
            <text x="28" y="51" fill={T.mute} style={f.mono(600, 8)}>area avg {mean}{"°"}</text>
            {/* sensor: shown only after the student places it (no default hint) */}
            {placed && (
              <g transform={"translate(" + pos.x + " " + pos.y + ")"}>
                <circle r="11" fill="none" stroke={sC} strokeWidth="2" />
                <line x1="-7" y1="0" x2="7" y2="0" stroke={sC} strokeWidth="1" />
                <line x1="0" y1="-7" x2="0" y2="7" stroke={sC} strokeWidth="1" />
                <rect x={pos.x > 300 ? -64 : 14} y="-10" width="50" height="16" rx="2" fill={T.paper} stroke={sC} strokeWidth="0.8" />
                <text x={pos.x > 300 ? -39 : 39} y="2" textAnchor="middle" fill={sC} style={f.mono(700, 8.5)}>{localT.toFixed(1)}{"°"}</text>
              </g>
            )}
            {/* placement prompt while empty */}
            {!placed && (
              <g>
                <rect x="126" y="199" width="188" height="17" rx="8.5" fill={T.paper} stroke={T.rule22} strokeWidth="0.8" opacity="0.96" />
                <text x="220" y="211" textAnchor="middle" fill={T.ink} style={f.mono(600, 8, { upper: true, tracking: 0.03 })}>tap or drag to place the sensor</text>
              </g>
            )}
          </svg>
        </div>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Btn small icon={RotateCcw} onClick={reset} disabled={!placed}>clear sensor</Btn>
        <span style={{ ...f.mono(600, 9, { upper: true, tracking: 0.08 }), color: T.mute }}>{placed ? "drag to refine the spot" : "no sensor placed yet"}</span>
        <div style={{ flex: 1 }} />
        <Tag color={placed ? sC : T.mute}>{placed ? decision : "predict first"}</Tag>
      </div>

      <Readout items={placed ? [
        { l: "Site score", v: score + " / 100", color: sC },
        { l: "Reading", v: localT.toFixed(1) + "° vs " + mean + "° avg", color: repScore >= 55 ? okC : warnC },
        { l: "From path", v: Math.round(pathD) + " px", color: distScore >= 55 ? okC : warnC },
        { l: "Decision", v: decision, color: sC },
      ] : [
        { l: "Site score", v: "- / 100", color: T.mute },
        { l: "Reading", v: "-", color: T.mute },
        { l: "From path", v: "-", color: T.mute },
        { l: "Decision", v: "predict first", color: T.mute },
      ]} />

      <Caption color={C}>
        A sensor is only useful where its readings stand for the area you care about and where it
        will not be knocked or shaded by traffic. Predict a spot first, then drop the sensor to test
        it: parked against the hot pavement or under the cool tree it reports an outlier, not the
        typical conditions; on the foot path it gets disturbed. The representative, undisturbed
        middle ground is the evidence-based choice.
      </Caption>
    </div>
  );
}

export { ExtraSiting };
