// ExtraRunoff component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraRunoff() {
  // Cross-section of a hillside. Rain falls from a cloud, splatters the
  // slope, then water and sediment run downhill into a collection trough.
  // The slope wedge auto-scales so the figure always fits the viewBox even
  // at the steepest setting.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const okC = T.ok;
  const failC = T.warn;
  const SOIL = "#9a774a";
  const SOIL_DARK = "#6d4f2c";
  const WATER = "#3a7aa6";
  const SKY = "#dfe9e8";

  const [tilt, setTilt] = useState(15);
  const theta = (tilt * Math.PI) / 180;

  // ===== Geometry (everything fits inside viewBox at any angle) =====
  const W = 540, H = 300;
  // Sky region: 0..skyBot
  const skyBot = 70;
  // Hill region
  const mapL = 30, mapR = 510;
  const baseY = 240;             // ground line / hill toe
  const maxSlopeH = baseY - skyBot - 6;  // 164
  // Slope geometry: hill is higher on the LEFT, water runs down to the RIGHT
  // Slope rises by slopeH over slopeBase horizontal distance.
  // Cap slopeBase so the rise never exceeds maxSlopeH.
  const maxBase = 360;
  let slopeBase = maxBase;
  let slopeH = slopeBase * Math.tan(theta);
  if (slopeH > maxSlopeH) {
    slopeH = maxSlopeH;
    slopeBase = slopeH / Math.tan(theta);
  }
  const slopeRightX = mapR - 60;             // bottom of slope, before the trough
  const slopeLeftX = slopeRightX - slopeBase;
  const slopeTopY = baseY - slopeH;          // top-left of slope surface

  // Trough on the right
  const troughLeftX = slopeRightX;
  const troughRightX = mapR;
  const troughTopY = baseY;
  const troughBotY = baseY + 30;

  // Cloud above the slope (centered above its midpoint)
  const cloudCx = (slopeLeftX + slopeRightX) / 2;
  const cloudCy = 28;

  // ===== Animation =====
  const tRef = useRef(0);
  const rainRef = useRef([]);        // drops falling from cloud
  const runoffRef = useRef([]);      // water sliding along slope
  const sedimentRef = useRef([]);    // soil particles moving with runoff
  const collectedWaterRef = useRef(0);
  const collectedSoilRef = useRef(0);
  const [, force] = useState(0);

  useRAF(true, (dt) => {
    tRef.current += dt;
    // base spawn rate of rain drops
    const rainPerSec = 18;
    if (Math.random() < rainPerSec * dt / 1000) {
      const cw = 80;
      rainRef.current.push({
        id: Math.random(),
        x: cloudCx + (Math.random() - 0.5) * cw,
        y: cloudCy + 10,
        vy: 0.18 + Math.random() * 0.04,
      });
    }

    // Update rain drops
    const newRain = [];
    for (const d of rainRef.current) {
      d.y += d.vy * dt;
      // If it lands on the slope (slope surface line) convert to runoff
      // Slope surface: y = baseY - (slopeRightX - x) * tan(theta), for x in [slopeLeftX, slopeRightX]
      const slopeYAtX = baseY - Math.max(0, (slopeRightX - d.x)) * Math.tan(theta);
      if (d.x >= slopeLeftX && d.x <= slopeRightX && d.y >= slopeYAtX) {
        // spawn a runoff droplet, starting at its slope position
        const u = (d.x - slopeLeftX) / slopeBase;   // 0 at top of slope, 1 at toe
        runoffRef.current.push({
          id: Math.random(),
          u: u,
          jitter: (Math.random() - 0.5) * 3,
        });
        // 30% chance to also dislodge a sediment particle
        if (Math.random() < 0.3) {
          sedimentRef.current.push({
            id: Math.random(),
            u: u,
            jitter: (Math.random() - 0.5) * 2,
            life: 0,
          });
        }
        continue; // remove this drop
      }
      // If it lands on the bare ground (left of slope OR to the right of trough), splash and disappear
      if (d.y >= baseY) continue;
      if (d.y < H + 10) newRain.push(d);
    }
    rainRef.current = newRain;

    // Update runoff: move down the slope (u -> 1) at speed prop to sin(theta)
    const runoffSpeed = 0.0015 * Math.sin(theta) + 0.0001;  // small floor so any tilt moves
    const newRunoff = [];
    for (const r of runoffRef.current) {
      r.u += runoffSpeed * dt;
      if (r.u >= 1) {
        collectedWaterRef.current += 1;
        continue;
      }
      newRunoff.push(r);
    }
    runoffRef.current = newRunoff;

    // Update sediment (slightly slower than water)
    const sedSpeed = runoffSpeed * 0.85;
    const newSed = [];
    for (const s of sedimentRef.current) {
      s.u += sedSpeed * dt;
      s.life += dt;
      if (s.u >= 1) {
        collectedSoilRef.current += 1;
        continue;
      }
      newSed.push(s);
    }
    sedimentRef.current = newSed;

    force((v) => v + 1);
  });

  const reset = () => {
    rainRef.current = [];
    runoffRef.current = [];
    sedimentRef.current = [];
    collectedWaterRef.current = 0;
    collectedSoilRef.current = 0;
    tRef.current = 0;
    force((v) => v + 1);
  };

  // Helpers to project (u) along the slope to (x, y)
  const slopePoint = (u) => ({
    x: slopeLeftX + u * slopeBase,
    y: slopeTopY + u * slopeH,
  });

  const risk = tilt >= 22 ? "high" : tilt >= 12 ? "moderate" : "low";
  const riskColor = tilt >= 22 ? failC : tilt >= 12 ? A : okC;
  const speedRel = Math.round(Math.sin(theta) / Math.sin(30 * Math.PI / 180) * 100);

  return (
    <div>
      <Field height={310}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          {/* ===== sky ===== */}
          <defs>
            <linearGradient id="runoffSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef4f3" />
              <stop offset="1" stopColor={SKY} />
            </linearGradient>
            <linearGradient id="runoffSoil" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#a8855a" />
              <stop offset="0.4" stopColor={SOIL} />
              <stop offset="1" stopColor={SOIL_DARK} />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={W} height={skyBot} fill="url(#runoffSky)" />

          {/* ===== cloud (dimensional, gradient-shaded) ===== */}
          {(() => {
            const cx = cloudCx, cy = cloudCy;
            const gradId = "runoffCloudGrad";
            // Lobes: a wide flat base + 3 rounder bumps on top, then a single
            // smooth outline path traced around the silhouette.
            const lobes = [
              { x: cx - 32, y: cy + 4,  r: 14 },
              { x: cx - 10, y: cy - 4,  r: 18 },
              { x: cx + 12, y: cy - 8,  r: 16 },
              { x: cx + 30, y: cy + 2,  r: 14 },
            ];
            // Silhouette path that wraps around the union (computed by hand to look smooth)
            const silhouette = `
              M ${cx - 46} ${cy + 12}
              C ${cx - 60} ${cy + 12} ${cx - 60} ${cy - 8} ${cx - 40} ${cy - 6}
              C ${cx - 40} ${cy - 22} ${cx - 14} ${cy - 26} ${cx - 6} ${cy - 14}
              C ${cx + 0} ${cy - 28} ${cx + 26} ${cy - 26} ${cx + 30} ${cy - 12}
              C ${cx + 50} ${cy - 14} ${cx + 56} ${cy + 8} ${cx + 40} ${cy + 12}
              Z`;
            return (
              <g>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="60%" stopColor="#f4f3ee" />
                    <stop offset="100%" stopColor="#c5c8c1" />
                  </linearGradient>
                </defs>
                {/* soft drop shadow */}
                <path d={silhouette} fill="#000" opacity="0.12"
                  transform={`translate(2 4)`} />
                {/* main body filled with gradient */}
                <path d={silhouette} fill={`url(#${gradId})`}
                  stroke={T.ink} strokeWidth="1" />
                {/* darker undercurve to suggest the bottom shadow */}
                <path d={`M ${cx - 38} ${cy + 10}
                          Q ${cx} ${cy + 16} ${cx + 36} ${cy + 10}`}
                  fill="none" stroke="#9aa0a0" strokeWidth="2"
                  strokeLinecap="round" opacity="0.45" />
                {/* highlight bumps on top of the lobes */}
                {lobes.map((l, i) => (
                  <ellipse key={i} cx={l.x - l.r * 0.3} cy={l.y - l.r * 0.4}
                    rx={l.r * 0.5} ry={l.r * 0.22}
                    fill="#ffffff" opacity="0.7" />
                ))}
              </g>
            );
          })()}

          {/* ===== ground line (behind hill) ===== */}
          <line x1={0} y1={baseY} x2={mapL} y2={baseY} stroke={T.ink} strokeWidth="1" />
          <line x1={mapR} y1={baseY + 30} x2={W} y2={baseY + 30} stroke={T.ink} strokeWidth="1" />

          {/* ===== HILL (solid wedge that stays inside the viewBox) ===== */}
          <path d={`
              M ${mapL} ${baseY}
              L ${slopeLeftX} ${baseY}
              L ${slopeLeftX} ${slopeTopY}
              L ${slopeRightX} ${baseY}
              Z`}
            fill="url(#runoffSoil)" stroke={T.ink} strokeWidth="1.2" />

          {/* Slope surface accent line + grass clumps */}
          <line x1={slopeLeftX} y1={slopeTopY} x2={slopeRightX} y2={baseY}
            stroke={SOIL_DARK} strokeWidth="1" />
          {(() => {
            const N = 14;
            const nx = -Math.sin(theta), ny = -Math.cos(theta);
            const tx = Math.cos(theta), ty = Math.sin(theta);
            const clumps = [];
            for (let k = 0; k < N; k++) {
              const u = (k + 0.5) / N;
              const p = slopePoint(u);
              const hMid = 7 + ((k * 13) % 3);
              const hSide = hMid - 2;
              const lateral = 2.4;
              const mk = (off, len, lean) => {
                const bx = p.x + tx * off;
                const by = p.y + ty * off;
                const tipX = bx + nx * len + tx * lean;
                const tipY = by + ny * len + ty * lean;
                return [bx, by, tipX, tipY];
              };
              const [a1x, a1y, a1tx, a1ty] = mk(-lateral, hSide, -0.8);
              const [a2x, a2y, a2tx, a2ty] = mk(0, hMid, 0.0);
              const [a3x, a3y, a3tx, a3ty] = mk(+lateral, hSide, 0.8);
              clumps.push(
                <g key={"g" + k}>
                  <line x1={a1x} y1={a1y} x2={a1tx} y2={a1ty}
                    stroke="#3e7b3a" strokeWidth="1" strokeLinecap="round" />
                  <line x1={a2x} y1={a2y} x2={a2tx} y2={a2ty}
                    stroke="#2e6b3f" strokeWidth="1.1" strokeLinecap="round" />
                  <line x1={a3x} y1={a3y} x2={a3tx} y2={a3ty}
                    stroke="#3e7b3a" strokeWidth="1" strokeLinecap="round" />
                </g>
              );
            }
            return clumps;
          })()}

          {/* ===== Trough on the right ===== */}
          <path d={`M ${troughLeftX} ${troughTopY}
                    L ${troughLeftX} ${troughBotY}
                    L ${troughRightX} ${troughBotY}
                    L ${troughRightX} ${troughTopY - 4}`}
            fill="none" stroke={T.ink} strokeWidth="1.4" />
          {/* trough water level grows with collectedWater */}
          {(() => {
            const cap = 600;
            const lvl = Math.min(1, collectedWaterRef.current / cap);
            const wH = (troughBotY - troughTopY - 4) * lvl;
            return (
              <g>
                <rect x={troughLeftX + 1} y={troughBotY - wH - 1}
                  width={troughRightX - troughLeftX - 2} height={wH}
                  fill={WATER} opacity="0.7" />
                {/* sediment layer at the bottom */}
                <rect x={troughLeftX + 1} y={troughBotY - 1}
                  width={troughRightX - troughLeftX - 2}
                  height={Math.min(8, collectedSoilRef.current * 0.08)}
                  fill={SOIL_DARK} />
              </g>
            );
          })()}
          <text x={(troughLeftX + troughRightX) / 2} y={troughBotY + 14} textAnchor="middle" fill={T.mute}
            style={f.mono(600, 8.5, { upper: true, tracking: 0.18 })}>runoff</text>

          {/* ===== Rain drops ===== */}
          {rainRef.current.map((d) => (
            <line key={d.id} x1={d.x} y1={d.y - 4} x2={d.x} y2={d.y}
              stroke={WATER} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
          ))}

          {/* ===== Runoff on slope ===== */}
          {runoffRef.current.map((r) => {
            const p = slopePoint(r.u);
            // offset perpendicular to slope so droplets sit on top of the surface
            const nx = -Math.sin(theta), ny = -Math.cos(theta);
            return (
              <circle key={r.id}
                cx={p.x + nx * 3 + r.jitter}
                cy={p.y + ny * 3}
                r={1.8} fill={WATER} opacity="0.85" />
            );
          })}

          {/* ===== Sediment on slope ===== */}
          {sedimentRef.current.map((s) => {
            const p = slopePoint(s.u);
            const nx = -Math.sin(theta), ny = -Math.cos(theta);
            return (
              <circle key={s.id}
                cx={p.x + nx * 1.5 + s.jitter}
                cy={p.y + ny * 1.5}
                r={1.4} fill={SOIL_DARK} opacity="0.95" />
            );
          })}

          {/* ===== Right-side stats panel ===== */}
          {(() => {
            const px = 30, py = 6, pw = 150, ph = 56;
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={6}
                  fill={T.paper2} stroke={C} strokeWidth="1" opacity="0.95" />
                <text x={px + 10} y={py + 16} fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>storm gauge</text>

                <text x={px + 10} y={py + 32} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>angle</text>
                <text x={px + pw - 10} y={py + 32} textAnchor="end" fill={C}
                  style={f.mono(700, 11)}>{tilt}°</text>

                <text x={px + 10} y={py + 48} fill={T.mute}
                  style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>risk</text>
                <text x={px + pw - 10} y={py + 48} textAnchor="end" fill={riskColor}
                  style={f.mono(700, 11, { upper: true, tracking: 0.18 })}>{risk}</text>
              </g>
            );
          })()}

          {/* ===== Slope-angle arc near the toe of the hill (visual cue) ===== */}
          {(() => {
            const arcR = 28;
            const cx = slopeRightX;
            const cy = baseY;
            const ex = cx - arcR * Math.cos(theta);
            const ey = cy - arcR * Math.sin(theta);
            const useExternalLabel = tilt < 22;
            return (
              <g>
                <line x1={cx} y1={cy} x2={cx - arcR - 8} y2={cy}
                  stroke={T.mute} strokeWidth="0.7" strokeDasharray="3 3" />
                <path d={`M ${cx - arcR} ${cy} A ${arcR} ${arcR} 0 0 1 ${ex} ${ey}`}
                  fill="none" stroke={T.mute} strokeWidth="1" />
                {useExternalLabel ? (
                  (() => {
                    const midA = theta / 2;
                    const midX = cx - arcR * Math.cos(midA);
                    const midY = cy - arcR * Math.sin(midA);
                    const labX = cx + 28;
                    const labY = cy - 38;
                    const labW = 42, labH = 20;
                    // leader line endpoint (just outside the label)
                    const lx2 = labX - 2;
                    const ly2 = labY + labH / 2;
                    // arrowhead at the line origin pointing at the arc
                    const ang = Math.atan2(midY - ly2, midX - lx2);
                    const ah = 5;
                    const a1x = midX - ah * Math.cos(ang - 0.45);
                    const a1y = midY - ah * Math.sin(ang - 0.45);
                    const a2x = midX - ah * Math.cos(ang + 0.45);
                    const a2y = midY - ah * Math.sin(ang + 0.45);
                    return (
                      <g>
                        {/* leader line with arrowhead at the arc end */}
                        <line x1={lx2} y1={ly2} x2={midX} y2={midY}
                          stroke={T.ink} strokeWidth="0.9" />
                        <polygon points={`${midX},${midY} ${a1x},${a1y} ${a2x},${a2y}`}
                          fill={T.ink} />
                        {/* shadow */}
                        <rect x={labX} y={labY + 2} width={labW} height={labH} rx={4}
                          fill="#000" opacity="0.14" />
                        {/* label pill */}
                        <rect x={labX - 2} y={labY} width={labW} height={labH} rx={4}
                          fill={T.paper} stroke={T.ink} strokeWidth="0.9" />
                        <text x={labX + labW / 2 - 2} y={labY + labH / 2 + 4}
                          textAnchor="middle" fill={T.ink}
                          style={f.mono(700, 11)}>{tilt}°</text>
                      </g>
                    );
                  })()
                ) : (
                  <text x={cx - arcR - 12} y={cy - 6} textAnchor="end" fill={T.ink}
                    style={f.mono(700, 11)}>{tilt}°</text>
                )}
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={tilt} set={setTilt} min={2} max={30} color={A}
          label="Slope angle" suffix={tilt + "°"} />
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Runoff speed", v: speedRel + " (rel)", color: A },
        { l: "Water collected", v: collectedWaterRef.current, color: WATER },
        { l: "Soil washed off", v: collectedSoilRef.current, color: SOIL_DARK },
      ]} />

      <Caption color={C}>
        Rain falling on a slope turns into runoff. The steeper the slope,
        the faster the water moves and the more soil it carries away. A
        gentle slope holds the soil; a steep slope strips it. The trough
        catches what the slope loses.
      </Caption>
    </div>
  );
}

export { ExtraRunoff };
