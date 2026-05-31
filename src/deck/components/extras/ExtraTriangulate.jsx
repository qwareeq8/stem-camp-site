// ExtraTriangulate component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraTriangulate() {
  // Triangulate a tree's height by sighting from a known baseline.
  // h = d * tan(theta). The drawing auto-scales so the tree top stays
  // inside the figure at any angle, and the angle arc is anchored at
  // the observer with a clear horizontal reference line.
  const [angle, setAngle] = useState(35);
  const dFeet = 100;
  const theta = (angle * Math.PI) / 180;
  const hFeet = dFeet * Math.tan(theta);
  const A = CAMP.trees.acc, C = CAMP.trees.ink;

  // ----- Geometry -----
  const W = 540, H = 270;
  const groundY = 220;
  const obsX = 90;
  const maxH = 170;           // most the tree can fill vertically
  const maxD = 360;           // longest the baseline gets on screen
  // Compute on-screen dimensions, scaling down if the tree would overflow.
  let dScreen = maxD;
  let hScreen = dScreen * Math.tan(theta);
  if (hScreen > maxH) {
    const r = maxH / hScreen;
    dScreen *= r;
    hScreen = maxH;
  }
  const treeX = obsX + dScreen;
  const topY = groundY - hScreen;

  // Angle arc (centered at observer)
  const arcR = 28;
  // theta label is placed just left of the vertex so a close (high-angle) tree never overlaps it

  return (
    <div>
      <Field height={280}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ===== sky + ground ===== */}
          <defs>
            <linearGradient id="triSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef2ec" />
              <stop offset="1" stopColor="#f6efe0" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={groundY} fill="url(#triSky)" />
          <rect x={0} y={groundY} width={W} height={H - groundY} fill="#e7dcc4" opacity="0.55" />
          <ellipse cx={treeX} cy={groundY + 3} rx={26} ry={5} fill="#000" opacity="0.10" />
          <line x1={20} y1={groundY} x2={W - 20} y2={groundY}
            stroke={C} strokeWidth="1.5" />
          {Array.from({ length: 26 }, (_, k) => (
            <line key={k} x1={20 + k * 20} y1={groundY} x2={12 + k * 20} y2={groundY + 12}
              stroke={C} strokeWidth="0.55" opacity="0.7" />
          ))}

          {/* right-angle marker at the tree base, drawn before the tree so the trunk covers any overlap */}
          <rect x={treeX - 8} y={groundY - 8} width={8} height={8}
            fill="none" stroke={T.mute} strokeWidth="0.7" />
          {/* ===== Tree (canopy + trunk) ===== */}
          <line x1={treeX} y1={groundY} x2={treeX} y2={topY}
            stroke="#6b4a2a" strokeWidth="5" strokeLinecap="round" />
          {/* canopy: layered conifer tiers (back dark -> front light) for depth */}
          {hScreen > 18 && (
            <g>
              <polygon points={`${treeX},${topY + 16} ${treeX - 24},${topY + 38} ${treeX + 24},${topY + 38}`}
                fill="#1f5030" />
              <polygon points={`${treeX},${topY + 2} ${treeX - 20},${topY + 22} ${treeX + 20},${topY + 22}`}
                fill="#2f6b3a" />
              <polygon points={`${treeX},${topY - 10} ${treeX - 16},${topY + 8} ${treeX + 16},${topY + 8}`}
                fill="#46834a" />
            </g>
          )}
          {hScreen <= 18 && (
            <circle cx={treeX} cy={topY} r={6} fill={C} />
          )}

          {/* ===== Horizontal eye-level reference (dashed) ===== */}
          <line x1={obsX} y1={groundY} x2={treeX} y2={groundY}
            stroke={T.mute} strokeWidth="0.7" strokeDasharray="4 4" opacity="0.7" />

          {/* ===== Sight line (observer -> tree top) ===== */}
          <line x1={obsX} y1={groundY} x2={treeX} y2={topY}
            stroke={A} strokeWidth="1.8" />
          {/* arrowhead at tree top */}
          {(() => {
            const ang = Math.atan2(topY - groundY, treeX - obsX);
            const ah = 8;
            const p1x = treeX - ah * Math.cos(ang - 0.45);
            const p1y = topY - ah * Math.sin(ang - 0.45);
            const p2x = treeX - ah * Math.cos(ang + 0.45);
            const p2y = topY - ah * Math.sin(ang + 0.45);
            return <polygon points={`${treeX},${topY} ${p1x},${p1y} ${p2x},${p2y}`} fill={A} />;
          })()}

          {/* (right-angle marker is drawn earlier, behind the tree) */}

          {/* ===== Angle arc + label at observer ===== */}
          <path d={`M ${obsX + arcR} ${groundY} A ${arcR} ${arcR} 0 0 0 ${obsX + arcR * Math.cos(theta)} ${groundY - arcR * Math.sin(theta)}`}
            fill="none" stroke={A} strokeWidth="1.2" />
          <text x={obsX - 8} y={groundY - 9} textAnchor="end" fill={A}
            style={f.mono(700, 11)}>{angle}°</text>

          {/* ===== Observer figure ===== */}
          <g transform={`translate(${obsX} ${groundY})`}>
            <line x1={0} y1={0} x2={0} y2={-22} stroke={C} strokeWidth="2.5" />
            <circle cx={0} cy={-26} r={5} fill={C} />
            {/* clinometer: a sighting tube aimed up the sight line, with a hanging plumb */}
            <g transform="translate(3 -27)">
              <line x1={0} y1={0} x2={15 * Math.cos(theta)} y2={-15 * Math.sin(theta)} stroke={A} strokeWidth="2.6" strokeLinecap="round" />
              <circle cx={15 * Math.cos(theta)} cy={-15 * Math.sin(theta)} r={1.7} fill={A} />
              <circle cx={0} cy={0} r={2.2} fill={T.paper} stroke={T.ink} strokeWidth="0.8" />
              <line x1={0} y1={0} x2={0} y2={8} stroke={T.ink} strokeWidth="0.8" />
              <circle cx={0} cy={9} r={1.4} fill={T.ink} />
            </g>
          </g>

          {/* ===== Baseline label (always visible regardless of dScreen) ===== */}
          <line x1={obsX} y1={groundY + 20} x2={treeX} y2={groundY + 20}
            stroke={T.mute} strokeWidth="0.8" />
          <line x1={obsX} y1={groundY + 16} x2={obsX} y2={groundY + 24}
            stroke={T.mute} strokeWidth="0.8" />
          <line x1={treeX} y1={groundY + 16} x2={treeX} y2={groundY + 24}
            stroke={T.mute} strokeWidth="0.8" />
          <text x={(obsX + treeX) / 2} y={groundY + 38} textAnchor="middle" fill={T.mute}
            style={f.mono(700, 10, { upper: true, tracking: 0.2 })}>baseline d = {dFeet} ft</text>

          {/* ===== Height label (along the tree, right side) ===== */}
          <line x1={treeX + 30} y1={topY} x2={treeX + 30} y2={groundY}
            stroke={T.mute} strokeWidth="0.8" />
          <line x1={treeX + 26} y1={topY} x2={treeX + 34} y2={topY}
            stroke={T.mute} strokeWidth="0.8" />
          <line x1={treeX + 26} y1={groundY} x2={treeX + 34} y2={groundY}
            stroke={T.mute} strokeWidth="0.8" />
          <text x={treeX + 40} y={(topY + groundY) / 2 + 4} fill={C}
            style={f.mono(700, 12)}>h = {hFeet.toFixed(0)} ft</text>
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={angle} set={setAngle} min={5} max={75} color={A}
          label="Sight angle θ" suffix={angle + "°"} />
      </div>
      <Readout items={[
        { l: "Height", v: hFeet.toFixed(0) + " ft", color: C },
        { l: "Formula", v: "h = d · tan θ" },
        { l: "Tool", v: "clinometer" },
      ]} />

      <Caption color={C}>
        Stand a known distance from the tree, then sight the top with a
        clinometer. The angle you measure plus the baseline distance gives
        the tree's height by simple trig: height equals baseline times the
        tangent of the angle.
      </Caption>
    </div>
  );
}

export { ExtraTriangulate };
