// ExtraCenterMass component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraCenterMass() {
  // PYS-08 "Center of mass" (concept 1). Distinct from ExtraForceMap, which
  // maps force vectors and equilibrium. Here a figure stands on a base of
  // support carrying a load. The center of mass is the average spot of its
  // weight; a line of gravity drops straight down from it. The body stays
  // balanced while that line lands inside the base. Lean until the line passes
  // the base edge and it tips. Carrying the load low keeps the center of mass
  // low, which raises the lean it can survive.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [lean, setLean] = useState(12);   // tilt deg, -50..50
  const [hgt, setHgt] = useState(4);       // load height 1..10 (low -> high CoM)
  const rad = (lean * Math.PI) / 180;

  // ---- scene geometry ----
  const VW = 560, VH = 320;
  const gy = 208, bx = 168, d = 40;        // ground, base center, base half-width
  const loadY = gy - (34 + ((hgt - 1) / 9) * 86);  // waist (gy-34) up to overhead (gy-120)
  const comY = 0.56 * (gy - 44) + 0.44 * loadY;    // combined center of mass (y)
  const comH = gy - comY;                  // CoM height above ground
  const tipDeg = (Math.atan(d / comH) * 180) / Math.PI;

  // pivot = base edge in the lean direction; rotate (bx,comY) about it
  const sgn = lean > 0 ? 1 : lean < 0 ? -1 : 0;
  const pvx = bx + sgn * d, pvy = gy;
  const dxp = bx - pvx, dyp = comY - pvy;
  const comX = pvx + dxp * Math.cos(rad) - dyp * Math.sin(rad);
  const comWy = pvy + dxp * Math.sin(rad) + dyp * Math.cos(rad);
  const inBase = comX >= bx - d - 0.5 && comX <= bx + d + 0.5;
  const tipping = !inBase;
  const margin = tipDeg - Math.abs(lean);
  const stC = tipping ? warnC : okC;

  // figure landmarks (upright; rotated as a group about the pivot)
  const hipY = gy - 36, shoY = gy - 66, headY = gy - 80;

  // ---- right tip meter (protractor fan opening upward) ----
  const gp = { x: 372, y: 56, w: 148, h: 158 };
  const gcx = gp.x + gp.w / 2, gcy = gp.y + 104, rg = 60, gMax = 56;
  const ga = (a) => [gcx + rg * Math.sin((a * Math.PI) / 180), gcy - rg * Math.cos((a * Math.PI) / 180)];
  const arc = (a1, a2) => {
    const p = ga(a1), q = ga(a2);
    return "M" + p[0].toFixed(1) + "," + p[1].toFixed(1) + " A" + rg + " " + rg + " 0 0 1 " + q[0].toFixed(1) + "," + q[1].toFixed(1);
  };
  const ndl = ga(clamp(lean, -gMax, gMax));
  const tickL = ga(-tipDeg), tickR = ga(tipDeg);
  const tickLo = [gcx + (rg + 7) * Math.sin((-tipDeg * Math.PI) / 180), gcy - (rg + 7) * Math.cos((-tipDeg * Math.PI) / 180)];
  const tickRo = [gcx + (rg + 7) * Math.sin((tipDeg * Math.PI) / 180), gcy - (rg + 7) * Math.cos((tipDeg * Math.PI) / 180)];

  // ---- bottom panel: tip angle vs load height ----
  const bp = { x: 40, y: 234, w: 480, h: 74 };
  const plotL = bp.x + 74, plotR = bp.x + bp.w - 26, plotTop = bp.y + 26, plotBot = bp.y + bp.h - 18;
  const tipAt = (hh) => {
    const ly = gy - (34 + ((hh - 1) / 9) * 86);
    const cy = 0.56 * (gy - 44) + 0.44 * ly;
    return (Math.atan(d / (gy - cy)) * 180) / Math.PI;
  };
  const tMin = tipAt(10), tMax = tipAt(1);
  const hX = (hh) => plotL + ((hh - 1) / 9) * (plotR - plotL);
  const tY = (t) => plotBot - ((t - tMin) / (tMax - tMin)) * (plotBot - plotTop);
  const curve = [];
  for (let hh = 1; hh <= 10; hh += 0.5) curve.push(hX(hh).toFixed(1) + "," + tY(tipAt(hh)).toFixed(1));
  const tippyX = hX(7);

  return (
    <div>
      <Field height={330}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>center of mass</text>
          <text x={40} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>balance over the base</text>

          {/* ground */}
          <line x1={28} y1={gy} x2={356} y2={gy} stroke={T.ink} strokeWidth="1" />
          {/* base of support */}
          <rect x={bx - d} y={gy} width={2 * d} height={7} fill={stC} opacity="0.32" />
          <rect x={bx - d} y={gy} width={2 * d} height={7} fill="none" stroke={stC} strokeWidth="1.4" />
          <line x1={bx - d} y1={gy - 5} x2={bx - d} y2={gy + 12} stroke={T.ink} strokeWidth="1" />
          <line x1={bx + d} y1={gy - 5} x2={bx + d} y2={gy + 12} stroke={T.ink} strokeWidth="1" />
          <text x={bx} y={gy + 24} textAnchor="middle" fill={T.mute} style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>base of support</text>

          {/* foot shadow (stays on ground) */}
          <ellipse cx={bx} cy={gy - 1} rx="20" ry="3.5" fill="#000" opacity="0.12" />

          {/* figure + load + CoM dot, rotated about the pivot edge */}
          <g transform={"rotate(" + lean + " " + pvx + " " + pvy + ")"}>
            <line x1={bx - 10} y1={gy} x2={bx} y2={hipY} stroke={T.ink} strokeWidth="3" strokeLinecap="round" />
            <line x1={bx + 10} y1={gy} x2={bx} y2={hipY} stroke={T.ink} strokeWidth="3" strokeLinecap="round" />
            <line x1={bx} y1={hipY} x2={bx} y2={shoY} stroke={T.ink} strokeWidth="3.4" strokeLinecap="round" />
            <line x1={bx - 7} y1={shoY + 2} x2={bx - 5} y2={loadY + 4} stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" />
            <line x1={bx + 7} y1={shoY + 2} x2={bx + 5} y2={loadY + 4} stroke={T.ink} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx={bx} cy={headY} r="8" fill={T.paper2} stroke={T.ink} strokeWidth="1.5" />
            {/* load */}
            <rect x={bx - 9} y={loadY - 6} width="18" height="13" rx="2" fill={A} stroke={T.ink} strokeWidth="1" />
            <rect x={bx - 9} y={loadY - 6} width="18" height="4" rx="2" fill="#ffffff" opacity="0.25" />
            {/* center of mass dot */}
            <circle cx={bx} cy={comY} r="6.5" fill={A} stroke={stC} strokeWidth="2" />
            <circle cx={bx} cy={comY} r="2" fill={T.paper} />
          </g>

          {/* line of gravity (world-vertical from CoM) */}
          <line x1={comX} y1={comWy} x2={comX} y2={gy} stroke={stC} strokeWidth="1.4" strokeDasharray="3 3" />
          <polygon points={comX + "," + (gy) + " " + (comX - 4) + "," + (gy - 7) + " " + (comX + 4) + "," + (gy - 7)} fill={stC} />

          {/* labels with leaders */}
          {/* legend: copper dot = center of mass, dashed line = line of gravity */}
          <g>
            <circle cx={54} cy={64} r="5.5" fill={A} stroke={T.ink} strokeWidth="1.2" />
            <text x={66} y={67} fill={T.ink} style={f.mono(600, 9, { upper: true, tracking: 0.06 })}>center of mass</text>
            <line x1={49} y1={80} x2={59} y2={90} stroke={T.ink} strokeWidth="1.6" strokeDasharray="3 2" />
            <text x={66} y={87} fill={T.ink} style={f.mono(600, 9, { upper: true, tracking: 0.06 })}>line of gravity</text>
          </g>

          {/* ===== right tip meter ===== */}
          <g>
            <rect x={gp.x} y={gp.y} width={gp.w} height={gp.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={gp.x + 12} y={gp.y + 17} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>tip meter</text>
            <path d={arc(-gMax, -tipDeg)} fill="none" stroke={warnC} strokeWidth="6" opacity="0.85" strokeLinecap="round" />
            <path d={arc(tipDeg, gMax)} fill="none" stroke={warnC} strokeWidth="6" opacity="0.85" strokeLinecap="round" />
            <path d={arc(-tipDeg, tipDeg)} fill="none" stroke={okC} strokeWidth="6" opacity="0.9" strokeLinecap="round" />
            <line x1={tickL[0]} y1={tickL[1]} x2={tickLo[0]} y2={tickLo[1]} stroke={T.ink} strokeWidth="1" />
            <line x1={tickR[0]} y1={tickR[1]} x2={tickRo[0]} y2={tickRo[1]} stroke={T.ink} strokeWidth="1" />
            <text x={gcx} y={gp.y + 30} textAnchor="middle" fill={okC} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>safe lean</text>
            <line x1={gcx} y1={gcy} x2={ndl[0]} y2={ndl[1]} stroke={A} strokeWidth="2.4" strokeLinecap="round" />
            <circle cx={gcx} cy={gcy} r="4" fill={A} />
            <text x={gcx} y={gcy + 22} textAnchor="middle" fill={C} style={f.mono(700, 13)}>{Math.abs(lean) + "°"}</text>
            <text x={gcx} y={gcy + 34} textAnchor="middle" fill={stC} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>{tipping ? "tips over" : "holds"}</text>
          </g>

          {/* ===== bottom panel: tip angle vs load height ===== */}
          <g>
            <rect x={bp.x} y={bp.y} width={bp.w} height={bp.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={bp.x + 12} y={bp.y + 15} fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>tip angle vs load height</text>
            <rect x={tippyX} y={plotTop} width={plotR - tippyX} height={plotBot - plotTop} fill={warnC} opacity="0.1" />
            <text x={(tippyX + plotR) / 2} y={plotTop + 9} textAnchor="middle" fill={warnC} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>tippy</text>
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={curve.join(" ")} fill="none" stroke={A} strokeWidth="2" />
            <line x1={hX(hgt)} y1={plotTop} x2={hX(hgt)} y2={plotBot} stroke={T.ink} strokeDasharray="3 3" strokeWidth="1" opacity="0.7" />
            <circle cx={hX(hgt)} cy={tY(tipDeg)} r="3.4" fill={A} stroke={T.paper} strokeWidth="1" />
            <text x={bp.x + 12} y={plotBot + 1} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>tip angle</text>
            <text x={plotL} y={plotBot + 14} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>low CoM</text>
            <text x={plotR} y={plotBot + 14} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>high CoM</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={lean} set={setLean} min={-50} max={50} color={A} label="Lean" suffix={lean + "°"} />
        <Slider val={hgt} set={setHgt} min={1} max={10} color={C} label="Load height" suffix={hgt} />
      </div>

      <Readout items={[
        { l: "Line of gravity", v: inBase ? "in base" : "past edge", color: stC },
        { l: "Tip angle", v: tipDeg.toFixed(0) + "°", color: C },
        { l: "Margin", v: (margin >= 0 ? margin.toFixed(0) : "0") + "°", color: margin >= 0 ? okC : warnC },
        { l: "Stance", v: tipping ? "tipping" : "stable", color: stC },
      ]} />

      <Caption color={C}>
        The center of mass is the average position of your weight. The dashed
        line of gravity drops straight down from it. You stay balanced while that
        line lands inside the base of support; lean until it passes the edge and
        you tip. Carrying the load low keeps the center of mass low, which raises
        the lean angle you can survive before tipping.
      </Caption>
    </div>
  );
}

export { ExtraCenterMass };
