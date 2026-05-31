// ExtraDecision component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraDecision() {
  // Accessibility ramp: same step height to clear, slider sets ramp length.
  // Three live criteria gauges (slope, load, portability) show pass/fail
  // against the client constraints. The on-screen ramp side-view updates.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const okC = T.ok;
  const failC = T.warn;

  // Fixed scenario: step height to overcome
  const stepHeightFt = 1.0;          // ft (real)
  const cartLoadLb = 200;            // lb (load the ramp must hold)

  // Constraints (match DemoRamp's 1:12 standard so the two demos agree):
  const maxRampRatio = 12;           // slope must be >= 1:12 (ratio length/rise)
  const maxSlopeDeg = (Math.atan(1 / maxRampRatio) * 180) / Math.PI;  // ~4.76°
  const maxPortableLb = 35;          // ramp itself must weigh <= 35 lb to be portable
  const minLoadLb = 250;             // ramp must support >= 250 lb

  // Knobs
  const [lengthFt, setLengthFt] = useState(18);   // ramp length in feet (slider)

  // Derived
  const slopeRad = Math.atan(stepHeightFt / lengthFt);
  const slopeDeg = (slopeRad * 180) / Math.PI;
  // Ramp weight grows with length (simple linear model: 2.5 lb / ft)
  const rampWeight = lengthFt * 2.0;
  // Load capacity drops as length grows past a sweet spot (beam-bending-ish):
  // capacity = base - (length - sweet)^2 * k
  const sweetFt = 12;
  const baseCap = 380;
  const k = 1.3;
  const loadCapacity = Math.max(80, baseCap - Math.pow(Math.max(0, lengthFt - sweetFt), 2) * k);

  // Pass/fail
  const slopeOK = lengthFt / stepHeightFt >= maxRampRatio;
  const portOK = rampWeight <= maxPortableLb;
  const loadOK = loadCapacity >= minLoadLb;
  const allOK = slopeOK && portOK && loadOK;

  // ===== Geometry =====
  const W = 540, H = 320;
  // Left card: ramp side-view
  const sceneX = 20, sceneY = 36, sceneW = 320, sceneH = 230;
  // Ramp scene local coords:
  // ground line at sceneY + sceneH - 30
  // step on the LEFT at height stepHeightPx
  const groundY = sceneY + sceneH - 36;
  const stepHeightPx = 80;            // visual representation of 2 ft step
  const stepX = sceneX + 30;
  const stepTopY = groundY - stepHeightPx;
  // Ramp length on-screen: scale length in ft to px
  // We want length range 6..36 ft to map roughly to length 80..280 px
  const lengthPx = Math.min(sceneW - 60, 60 + (lengthFt - 6) * 7);
  // Ramp goes from (stepX, stepTopY) down to (stepX + lengthPx, groundY)

  // Right card: criteria gauges
  const panelX = sceneX + sceneW + 16;
  const panelY = sceneY;
  const panelW = W - panelX - 18;
  const panelH = sceneH;

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* Title */}
          <text x={sceneX} y={22} fill={C}
            style={f.mono(700, 11, { upper: true, tracking: 0.22 })}>accessibility ramp design</text>

          {/* ===== Scene card ===== */}
          <rect x={sceneX} y={sceneY} width={sceneW} height={sceneH} rx={6}
            fill={T.paper2} stroke={C} strokeWidth="1" />

          {/* ground */}
          <line x1={sceneX + 10} y1={groundY} x2={sceneX + sceneW - 10} y2={groundY}
            stroke={T.ink} strokeWidth="1.4" />
          {(() => {
            const lx = sceneX + 14;          // start
            const rx = sceneX + sceneW - 14; // end
            const step = 16;
            const count = Math.floor((rx - lx) / step);
            return Array.from({ length: count }, (_, k) => (
              <line key={"g" + k}
                x1={lx + k * step + 6} y1={groundY + 1}
                x2={lx + k * step} y2={groundY + 7}
                stroke={T.ink} strokeWidth="0.6" opacity="0.55" />
            ));
          })()}

          {/* step (landing) */}
          <rect x={sceneX + 8} y={stepTopY} width={stepX - (sceneX + 8) + 14}
            height={groundY - stepTopY} fill={T.paper3} stroke={T.ink} strokeWidth="1" />
          {/* step-height dimension line on the LEFT edge of the step */}
          {(() => {
            const dx = sceneX + 4;
            return (
              <g>
                <line x1={dx} y1={stepTopY} x2={dx} y2={groundY}
                  stroke={T.mute} strokeWidth="0.7" />
                <line x1={dx - 3} y1={stepTopY} x2={dx + 3} y2={stepTopY}
                  stroke={T.mute} strokeWidth="0.7" />
                <line x1={dx - 3} y1={groundY} x2={dx + 3} y2={groundY}
                  stroke={T.mute} strokeWidth="0.7" />
                <text x={dx - 6} y={(stepTopY + groundY) / 2 + 3}
                  textAnchor="end" fill={T.mute}
                  style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>
                  {stepHeightFt} ft
                </text>
                <text x={dx - 6} y={(stepTopY + groundY) / 2 + 14}
                  textAnchor="end" fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.16 })}>
                  step
                </text>
              </g>
            );
          })()}

          {/* ramp */}
          {(() => {
            const rampX1 = stepX + 14;
            const rampY1 = stepTopY;
            const rampX2 = rampX1 + lengthPx;
            const rampY2 = groundY;
            // perpendicular-up unit vector for label positioning
            const nX = -Math.sin(slopeRad);
            const nY = -Math.cos(slopeRad);
            return (
              <g>
                {/* slope angle arc, drawn BEFORE the ramp so the ramp line (added below) sits
                    on top of it: the arc reaches and touches the ramp but never shows over it */}
                {(() => {
                  const arcR = 26;
                  // Draw the arc against the ramp AS DRAWN: the on-screen slope is
                  // exaggerated for visibility, so a real-degree arc (~2-9 deg) would
                  // be an invisible sliver. A filled wedge keeps it readable at every length.
                  const vis = Math.atan2(rampY2 - rampY1, rampX2 - rampX1);
                  // end exactly at the ramp; the ramp line draws on top so the arc touches it without crossing over
                  const end = vis;
                  const gx = rampX2 - arcR;
                  const ex = rampX2 - arcR * Math.cos(end), ey = rampY2 - arcR * Math.sin(end);
                  return (
                    <g>
                      {/* horizontal reference dashed line that the arc opens from */}
                      <line x1={gx - 4} y1={rampY2} x2={rampX2} y2={rampY2}
                        stroke={T.mute} strokeWidth="0.7" strokeDasharray="3 3" />
                      {/* filled wedge so the angle is clearly visible across the whole range */}
                      <path d={`M ${rampX2} ${rampY2} L ${gx} ${rampY2} A ${arcR} ${arcR} 0 0 1 ${ex} ${ey} Z`}
                        fill={A} opacity="0.16" />
                      {/* arc stroke along the ramp */}
                      <path d={`M ${gx} ${rampY2} A ${arcR} ${arcR} 0 0 1 ${ex} ${ey}`}
                        fill="none" stroke={A} strokeWidth="2" strokeLinecap="round" />
                    </g>
                  );
                })()}
                {/* ramp line on TOP of the arc so the copper can touch it but never crosses over */}
                <line x1={rampX1} y1={rampY1} x2={rampX2} y2={rampY2}
                  stroke={C} strokeWidth="3.6" strokeLinecap="butt" />
                {/* Angle pill: always above the ramp, weighted to the RIGHT of the
                    ramp so it never collides with the step at steep angles. */}
                {(() => {
                  const labW = 52, labH = 18;
                  // anchor point on the ramp at 0.7 along its length, then walk up the perpendicular
                  const u = 0.7;
                  const anchorX = rampX1 + u * (rampX2 - rampX1);
                  const anchorY = rampY1 + u * (rampY2 - rampY1);
                  const offset = 28;
                  const desiredCx = anchorX + nX * offset;
                  const desiredCy = anchorY + nY * offset;
                  const labX = Math.max(sceneX + 10,
                                Math.min(sceneX + sceneW - 10 - labW, desiredCx - labW / 2));
                  const labY = Math.max(sceneY + 12, desiredCy - labH / 2);
                  // leader endpoint: midpoint of the (as-drawn) angle arc near the toe
                  const arcMidA = Math.atan2(rampY2 - rampY1, rampX2 - rampX1) / 2;
                  const arcMidX = rampX2 - 26 * Math.cos(arcMidA);
                  const arcMidY = rampY2 - 26 * Math.sin(arcMidA);
                  // leader starts from the pill edge facing the arc
                  const pillCx = labX + labW / 2;
                  const pillCy = labY + labH / 2;
                  const dx0 = arcMidX - pillCx, dy0 = arcMidY - pillCy;
                  const ang0 = Math.atan2(dy0, dx0);
                  // intersect with pill bounding box to start the leader at its border
                  const halfW = labW / 2 - 2, halfH = labH / 2 - 2;
                  const tx = Math.abs(Math.cos(ang0)) > 1e-6 ? halfW / Math.abs(Math.cos(ang0)) : 1e9;
                  const ty = Math.abs(Math.sin(ang0)) > 1e-6 ? halfH / Math.abs(Math.sin(ang0)) : 1e9;
                  const tMin = Math.min(tx, ty);
                  const leadStartX = pillCx + Math.cos(ang0) * tMin;
                  const leadStartY = pillCy + Math.sin(ang0) * tMin;
                  // arrowhead
                  const ah = 5;
                  const a1x = arcMidX - ah * Math.cos(ang0 - 0.45);
                  const a1y = arcMidY - ah * Math.sin(ang0 - 0.45);
                  const a2x = arcMidX - ah * Math.cos(ang0 + 0.45);
                  const a2y = arcMidY - ah * Math.sin(ang0 + 0.45);
                  return (
                    <g>
                      <line x1={leadStartX} y1={leadStartY} x2={arcMidX} y2={arcMidY}
                        stroke={T.ink} strokeWidth="0.9" />
                      <polygon points={`${arcMidX},${arcMidY} ${a1x},${a1y} ${a2x},${a2y}`}
                        fill={T.ink} />
                      <rect x={labX} y={labY + 2} width={labW} height={labH} rx={3}
                        fill="#000" opacity="0.12" />
                      <rect x={labX} y={labY} width={labW} height={labH} rx={3}
                        fill={T.paper} stroke={T.ink} strokeWidth="0.9" />
                      <text x={labX + labW / 2} y={labY + labH / 2 + 4}
                        textAnchor="middle" fill={slopeOK ? okC : failC}
                        style={f.mono(700, 11)}>{slopeDeg.toFixed(1)}°</text>
                    </g>
                  );
                })()}
              </g>
            );
          })()}

          {/* wheelchair user - cleaner profile silhouette */}
          {(() => {
            // Anchor: feet rest on the step landing (top), looking right toward the ramp.
            const ux = stepX + 4;
            const uy = stepTopY;
            return (
              <g transform={`translate(${ux} ${uy})`}>
                {/* large wheel (back) */}
                <circle cx={-2} cy={-8} r={9} fill="none" stroke={C} strokeWidth="2" />
                <circle cx={-2} cy={-8} r={2} fill={C} />
                {/* wheel spokes */}
                {[0, 45, 90, 135].map((deg) => {
                  const a = (deg * Math.PI) / 180;
                  return (
                    <line key={deg}
                      x1={-2 + Math.cos(a) * 8} y1={-8 + Math.sin(a) * 8}
                      x2={-2 - Math.cos(a) * 8} y2={-8 - Math.sin(a) * 8}
                      stroke={C} strokeWidth="0.7" opacity="0.7" />
                  );
                })}
                {/* small front wheel */}
                <circle cx={10} cy={-3} r={3.5} fill="none" stroke={C} strokeWidth="1.4" />
                <circle cx={10} cy={-3} r={1} fill={C} />
                {/* seat */}
                <rect x={-2} y={-16} width={12} height={3} rx={1} fill={C} />
                {/* backrest */}
                <rect x={-2} y={-26} width={3} height={11} rx={1} fill={C} />
                {/* footrest connector */}
                <line x1={3} y1={-12} x2={11} y2={-7} stroke={C} strokeWidth="1.3"
                  strokeLinecap="round" />
                {/* person torso */}
                <rect x={2} y={-26} width={6} height={10} rx={2} fill={C} />
                {/* head */}
                <circle cx={5} cy={-30} r={3.4} fill={C} />
              </g>
            );
          })()}

          {/* length dimension at the bottom */}
          {(() => {
            const rampX1 = stepX + 14;
            const rampX2 = rampX1 + lengthPx;
            const ly = groundY + 18;
            return (
              <g>
                <line x1={rampX1} y1={ly} x2={rampX2} y2={ly}
                  stroke={T.mute} strokeWidth="0.8" />
                <line x1={rampX1} y1={ly - 4} x2={rampX1} y2={ly + 4}
                  stroke={T.mute} strokeWidth="0.8" />
                <line x1={rampX2} y1={ly - 4} x2={rampX2} y2={ly + 4}
                  stroke={T.mute} strokeWidth="0.8" />
                <text x={(rampX1 + rampX2) / 2} y={ly + 12} textAnchor="middle" fill={T.mute}
                  style={f.mono(700, 9, { upper: true, tracking: 0.18 })}>
                  length {lengthFt} ft
                </text>
              </g>
            );
          })()}

          {/* ===== Criteria panel ===== */}
          {(() => {
            const px = panelX, py = panelY, pw = panelW, ph = panelH;
            // Compact gauge row: row height ~ 36 px. Value and threshold sit on
            // the same line (current / limit pair) so all three gauges fit cleanly
            // above the DESIGN status box without colliding labels.
            const gauge = (gy, label, value, unit, ok, fmt, minV, maxV, target, direction) => {
              const frac = Math.max(0, Math.min(1, (value - minV) / (maxV - minV)));
              const targetFrac = Math.max(0, Math.min(1, (target - minV) / (maxV - minV)));
              const barX = px + 12, barY = gy + 18, barW = pw - 24, barH = 6;
              const limitText = (direction === "leq" ? "max " : "min ") + fmt(target) + unit;
              return (
                <g>
                  {/* row title (left) */}
                  <text x={px + 12} y={gy} fill={T.mute}
                    style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>{label}</text>
                  {/* pass/fail chip (right) */}
                  <rect x={px + pw - 38} y={gy - 10} width={30} height={13} rx={3}
                    fill={ok ? okC : failC} />
                  <text x={px + pw - 23} y={gy} textAnchor="middle" fill={T.paper}
                    style={f.mono(700, 7.5, { upper: true, tracking: 0.18 })}>
                    {ok ? "pass" : "fail"}
                  </text>
                  {/* current value (left) and limit (right) on the same line */}
                  <text x={px + 12} y={gy + 12} fill={ok ? okC : failC}
                    style={f.mono(700, 11)}>{fmt(value)}{unit}</text>
                  <text x={px + pw - 12} y={gy + 12} textAnchor="end" fill={T.mute}
                    style={f.mono(600, 7.5, { upper: true, tracking: 0.16 })}>{limitText}</text>
                  {/* bar */}
                  <rect x={barX} y={barY} width={barW} height={barH} rx={2}
                    fill={T.paper3} stroke={T.ink} strokeWidth="0.4" />
                  <rect x={barX} y={barY} width={barW * frac} height={barH} rx={2}
                    fill={ok ? okC : failC} opacity="0.85" />
                  {/* threshold tick (on the bar) */}
                  <line x1={barX + barW * targetFrac} y1={barY - 3}
                    x2={barX + barW * targetFrac} y2={barY + barH + 3}
                    stroke={T.ink} strokeWidth="1.2" />
                </g>
              );
            };
            const fmtNum = (v) => v.toFixed(1);
            const fmtInt = (v) => Math.round(v).toString();
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" />
                <text x={px + pw / 2} y={py + 18} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>criteria check</text>

                {gauge(py + 42, "slope", slopeDeg, "°", slopeOK, fmtNum, 0, 20, maxSlopeDeg, "leq")}
                {gauge(py + 88, "portable", rampWeight, " lb", portOK, fmtInt, 0, 90, maxPortableLb, "leq")}
                {gauge(py + 134, "load", loadCapacity, " lb", loadOK, fmtInt, 0, 400, minLoadLb, "geq")}

                {/* overall verdict */}
                <line x1={px + 10} y1={py + ph - 36} x2={px + pw - 10} y2={py + ph - 36}
                  stroke={T.rule22} strokeWidth="0.6" />
                <rect x={px + 12} y={py + ph - 30} width={pw - 24} height={22} rx={4}
                  fill={allOK ? okC : failC} />
                <text x={px + pw / 2} y={py + ph - 15} textAnchor="middle" fill={T.paper}
                  style={f.mono(700, 10, { upper: true, tracking: 0.22 })}>
                  {allOK ? "design passes" : "design fails"}
                </text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px" }}>
        <Slider val={lengthFt} set={setLengthFt} min={6} max={36} color={A}
          label="Ramp length" suffix={lengthFt + " ft"} />
      </div>
      <Readout items={[
        { l: "Slope", v: slopeDeg.toFixed(1) + "°", color: slopeOK ? okC : failC },
        { l: "Weight", v: Math.round(rampWeight) + " lb", color: portOK ? okC : failC },
        { l: "Capacity", v: Math.round(loadCapacity) + " lb", color: loadOK ? okC : failC },
      ]} />

      <Caption color={C}>
        Three client constraints fight each other. Longer ramps make the slope
        gentler (good for the user) but add weight (worse portability) and bend
        more under load (lower capacity). A real design has to clear all three
        bars at once.
      </Caption>
    </div>
  );
}

export { ExtraDecision };
