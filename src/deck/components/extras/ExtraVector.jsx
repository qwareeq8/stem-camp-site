// ExtraVector component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraVector() {
  // Pulling a box with a rope at an angle. F = 100 N along the rope.
  // Letter labels (F, Fx, Fy, theta) sit next to the arrows; a fixed
  // numbers panel on the right reports magnitudes so nothing collides
  // at extreme angles.
  const [angle, setAngle] = useState(35);
  const F = 100;
  const theta = (angle * Math.PI) / 180;
  const Fx = F * Math.cos(theta);
  const Fy = F * Math.sin(theta);
  const A = CAMP.pystem.acc, C = CAMP.pystem.ink;

  // ----- Geometry (fixed) -----
  const W = 500, H = 280;
  const groundY = 220;
  const boxW = 64, boxH = 30;
  const boxX = 70, boxY = groundY - boxH;
  const ax = boxX + boxW;          // anchor: top-right corner of box
  const ay = boxY;
  const SCALE = 1.4;               // 100 N -> 140 px, fits at any angle
  const tipX = ax + Fx * SCALE;
  const tipY = ay - Fy * SCALE;

  // Number-panel position (top-right of the figure, fixed)
  const PX = 360, PY = 28;

  // Arrow helper
  const arrow = (x1, y1, x2, y2, color, w = 2.2, key = "") => {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return <g key={key} />;
    const ang = Math.atan2(dy, dx);
    const ah = Math.min(9, Math.max(4, len * 0.35));
    const p1x = x2 - ah * Math.cos(ang - 0.45);
    const p1y = y2 - ah * Math.sin(ang - 0.45);
    const p2x = x2 - ah * Math.cos(ang + 0.45);
    const p2y = y2 - ah * Math.sin(ang + 0.45);
    return (
      <g key={key}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} />
        <polygon points={`${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} />
      </g>
    );
  };

  // Letter-label positions:
  // F: perpendicular to the rope at its midpoint, offset by 14 px on the upper side
  const perpAng = theta + Math.PI / 2;
  const Fmx = (ax + tipX) / 2 + Math.cos(perpAng) * 14;
  const Fmy = (ay + tipY) / 2 - Math.sin(perpAng) * 14;

  // Fx letter: always BELOW the horizontal arrow on the ground line
  const FxLabelX = ax + Math.max(28, Fx * SCALE * 0.5);
  const FxLabelY = ay + 18;

  // Fy letter: always to the RIGHT of the vertical line
  const FyLabelX = ax + Fx * SCALE + 12;
  const FyLabelY = ay - Math.max(20, Fy * SCALE * 0.5);

  // Arc shrinks to stay inside the rope-Fx triangle; at steep angles (>= 76 deg) the
  // triangle base is tiny, so theta becomes a label with an arrow pointing to the small arc.
  const baseLen = Fx * SCALE;
  const arcR = Math.max(7, Math.min(22, baseLen * 0.6));
  const useArrow = angle >= 76;
  const arcTX = ax + arcR * Math.cos(theta / 2);
  const arcTY = ay - arcR * Math.sin(theta / 2);
  const thetaLabelX = useArrow ? boxX + 8 : ax + 30;
  const thetaLabelY = useArrow ? boxY - 24 : ay - 9;

  return (
    <div>
      <Field height={290}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* === GROUND === */}
          <line x1={20} y1={groundY} x2={W - 20} y2={groundY} stroke={C} strokeWidth="1.4" />
          {Array.from({ length: 24 }, (_, k) => (
            <line key={"g" + k} x1={20 + k * 20} y1={groundY} x2={12 + k * 20} y2={groundY + 12}
              stroke={C} strokeWidth="0.55" opacity="0.7" />
          ))}

          {/* === BOX === */}
          <rect x={boxX} y={boxY} width={boxW} height={boxH}
            fill={T.paper3} stroke={C} strokeWidth="1.5" />
          <text x={boxX + boxW / 2} y={boxY + boxH / 2 + 4} textAnchor="middle" fill={C}
            style={f.mono(600, 9.5, { upper: true, tracking: 0.18 })}>box</text>

          {/* === Horizontal dashed reference at anchor height === */}
          <line x1={ax} y1={ay} x2={ax + 180} y2={ay}
            stroke={T.mute} strokeWidth="0.55" strokeDasharray="3 3" opacity="0.6" />

          {/* === COMPONENT ARROWS === */}
          {arrow(ax, ay, ax + Fx * SCALE, ay, A, 2, "fx")}
          {arrow(ax + Fx * SCALE, ay, ax + Fx * SCALE, tipY, C, 2, "fy")}

          {/* === ROPE ARROW (drawn after components so it sits on top) === */}
          {arrow(ax, ay, tipX, tipY, T.ink, 2.6, "f")}

          {/* === Angle arc === */}
          <path d={`M ${ax + arcR} ${ay} A ${arcR} ${arcR} 0 0 0 ${ax + arcR * Math.cos(theta)} ${ay - arcR * Math.sin(theta)}`}
            fill="none" stroke={T.mute} strokeWidth="1" />

          {/* === HAND at the rope tip === */}
          <g transform={`translate(${tipX} ${tipY}) rotate(${angle - 90})`}>
            <rect x={-6} y={-4} width={12} height={18} rx={3}
              fill={A} stroke={T.ink} strokeWidth="0.9" />
          </g>

          {/* === LETTER LABELS (always inside the figure, never overlap) === */}
          {/* F label, on the rope side */}
          <text x={Fmx} y={Fmy + 4} textAnchor="middle" fill={T.ink}
            style={f.mono(700, 12)}>F</text>
          {/* Fx label below horizontal arrow */}
          <text x={FxLabelX} y={FxLabelY} textAnchor="middle" fill={A}
            style={f.mono(700, 12)}>Fx</text>
          {/* Fy label right of vertical arrow */}
          <text x={FyLabelX} y={FyLabelY + 4} fill={C}
            style={f.mono(700, 12)}>Fy</text>
          {/* theta label; at steep angles an arrow points in to the small arc */}
          {useArrow && (() => {
            const sx = thetaLabelX + 10, sy = thetaLabelY + 1;
            const ex = arcTX, ey = arcTY;
            const aang = Math.atan2(ey - sy, ex - sx), ah = 5;
            return (
              <g stroke={T.mute} fill={T.mute} strokeWidth="0.9">
                <line x1={sx} y1={sy} x2={ex} y2={ey} />
                <polygon stroke="none" points={`${ex},${ey} ${ex - ah * Math.cos(aang - 0.5)},${ey - ah * Math.sin(aang - 0.5)} ${ex - ah * Math.cos(aang + 0.5)},${ey - ah * Math.sin(aang + 0.5)}`} />
              </g>
            );
          })()}
          <text x={thetaLabelX} y={thetaLabelY + 4} textAnchor="middle" fill={T.mute}
            style={f.mono(700, 11)}>θ</text>

          {/* === FIXED NUMBERS PANEL (top-right) === */}
          <g transform={`translate(${PX} ${PY})`}>
            <rect x={0} y={0} width={120} height={130} rx={6}
              fill={T.paper2} stroke={C} strokeWidth="1" opacity="0.95" />
            <text x={10} y={18} fill={T.mute}
              style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>readings</text>

            <text x={10} y={36} fill={T.ink} style={f.mono(700, 11)}>F</text>
            <text x={110} y={36} textAnchor="end" fill={T.ink}
              style={f.mono(700, 12)}>{F} N</text>

            <text x={10} y={56} fill={A} style={f.mono(700, 11)}>Fx</text>
            <text x={110} y={56} textAnchor="end" fill={A}
              style={f.mono(700, 12)}>{Fx.toFixed(0)} N</text>
            <text x={10} y={67} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.16 })}>forward</text>

            <text x={10} y={86} fill={C} style={f.mono(700, 11)}>Fy</text>
            <text x={110} y={86} textAnchor="end" fill={C}
              style={f.mono(700, 12)}>{Fy.toFixed(0)} N</text>
            <text x={10} y={97} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.16 })}>up</text>

            <line x1={10} y1={106} x2={110} y2={106} stroke={C} strokeWidth="0.5" opacity="0.3" />
            <text x={10} y={122} fill={T.ink} style={f.mono(700, 11)}>θ</text>
            <text x={110} y={122} textAnchor="end" fill={T.ink} style={f.mono(700, 12)}>{angle}°</text>
          </g>

          {/* angle value is shown in the readings box (top-right) to avoid the crowded anchor */}
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={angle} set={setAngle} min={5} max={85} color={A}
          label="Rope angle" suffix={angle + "°"} />
      </div>
      <Readout items={[
        { l: "Forward pull (Fx)", v: Fx.toFixed(0) + " N", color: A },
        { l: "Upward pull (Fy)", v: Fy.toFixed(0) + " N", color: C },
        { l: "Along rope (F)", v: F + " N" },
      ]} />

      <Caption color={C}>
        Pulling a box with a rope at an angle splits the force in two. Part of the
        pull drags the box forward, part lifts it upward. A flatter rope sends more
        force forward but less lift. A steeper rope lifts more but pulls less forward.
        The total stays the same; only the share changes.
      </Caption>
    </div>
  );
}

export { ExtraVector };
