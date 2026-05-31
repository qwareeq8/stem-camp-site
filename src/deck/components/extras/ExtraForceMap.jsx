// ExtraForceMap component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraForceMap() {
  // PYS-08 "Mapping forces" (concept 2). Distinct from ExtraCenterMass, which
  // covers center of mass over the base of support. Here a person on a
  // low-ropes element hangs from two support ropes. We MAP each force as an
  // arrow where it acts: gravity (weight) pulls straight down; each rope pulls
  // along its length. For the body to stay still the arrows must add to zero,
  // shown by the closed tip-to-tail triangle. Spreading the ropes wider makes
  // each rope pull much harder, so balance becomes difficult.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [ang, setAng] = useState(38);    // rope spread half-angle from vertical, deg
  const [load, setLoad] = useState(60);  // body weight, percent
  const th = (ang * Math.PI) / 180;
  const cos = Math.cos(th), sin = Math.sin(th);

  // ---- force model (load sets magnitude; angle sets the tension ratio) ----
  const Wf = 100 * load / 60;            // weight
  const Tn = Wf / (2 * cos);             // tension in each rope
  const ratio = Tn / Wf;                 // 1 / (2 cos th)
  const hold = ang <= 45 ? "easy" : ang <= 66 ? "moderate" : "hard";
  const holdC = ang <= 45 ? okC : ang <= 66 ? A : warnC;

  // ---- scene geometry (viewBox 560x320; bounded zones) ----
  const VW = 560, VH = 320;
  const px = 192, py = 150;              // person (the load point)
  const Ra = 92;                         // rope length to anchor (kept short so anchors clear the titles)
  const aLx = px - Ra * sin, aLy = py - Ra * cos;
  const aRx = px + Ra * sin, aRy = py - Ra * cos;
  const kp = 0.5;
  const Lw = clamp(Wf * kp, 28, 76);     // weight arrow length (min 28 so it is always clearly visible)
  const Lt = clamp(Tn * kp, 24, 82);     // tension arrow length (< Ra so tip stays inside)
  const wTy = py + Lw;
  const tLx = px - Lt * sin, tLy = py - Lt * cos;
  const tRx = px + Lt * sin, tRy = py - Lt * cos;

  // arrowhead: triangle at tip (x,y) pointing along (dx,dy)
  const head = (x, y, dx, dy, s) => {
    const m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m;
    const bx = x - s * ux, by = y - s * uy, ox = -uy * s * 0.55, oy = ux * s * 0.55;
    return x + "," + y + " " + (bx + ox) + "," + (by + oy) + " " + (bx - ox) + "," + (by - oy);
  };

  // ---- force-sum panel: tip-to-tail W + Tleft + Tright closes to zero ----
  const sp = { x: 372, y: 20, w: 148, h: 196 };
  const triW = Tn * sin, triH = Wf;      // bbox in force units
  const ssum = Math.min((sp.w - 54) / Math.max(triW, 1), (sp.h - 80) / triH);
  const cxp = sp.x + sp.w / 2, cyp = sp.y + 46 + (sp.h - 80) / 2;
  const ox0 = cxp + (triW / 2) * ssum, oy0 = cyp - (triH / 2) * ssum;
  const SO = { x: ox0, y: oy0 };
  const SA = { x: ox0, y: oy0 + Wf * ssum };
  const SB = { x: ox0 - Tn * sin * ssum, y: oy0 + (Wf - Tn * cos) * ssum };

  // ---- tradeoff panel: rope force vs spread angle ----
  const tp = { x: 40, y: 234, w: 480, h: 74 };
  const plotL = tp.x + 64, plotR = tp.x + tp.w - 26, plotTop = tp.y + 16, plotBot = tp.y + tp.h - 18;
  const aMin = 20, aMax = 78;
  const rMin = 1 / (2 * Math.cos((aMin * Math.PI) / 180));
  const rMax = 1 / (2 * Math.cos((aMax * Math.PI) / 180));
  const angX = (d) => plotL + ((d - aMin) / (aMax - aMin)) * (plotR - plotL);
  const ratY = (r) => plotBot - ((r - rMin) / (rMax - rMin)) * (plotBot - plotTop);
  const curve = [];
  for (let d = aMin; d <= aMax; d += 2) {
    curve.push(angX(d).toFixed(1) + "," + ratY(1 / (2 * Math.cos((d * Math.PI) / 180))).toFixed(1));
  }
  const hardX = angX(67);

  return (
    <div>
      <Field height={330}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          {/* titles */}
          <text x={40} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>mapping forces</text>
          <text x={40} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>low-ropes force map</text>

          {/* vertical reference through the body */}
          <line x1={px} y1={py - Ra - 4} x2={px} y2={224} stroke={T.ink} strokeDasharray="2 5" strokeWidth="0.5" opacity="0.3" />

          {/* ropes to anchors (animated tension flow) */}
          {[[aLx, aLy], [aRx, aRy]].map(([axx, ayy], i) => (
            <line key={"rope" + i} x1={px} y1={py} x2={axx} y2={ayy} stroke={C} strokeWidth="1.5"
              strokeDasharray="5 4" style={{ animation: "dash 0.9s linear infinite" }} opacity="0.5" />
          ))}
          {/* anchors */}
          {[[aLx, aLy], [aRx, aRy]].map(([axx, ayy], i) => (
            <g key={"anc" + i}>
              <line x1={axx - 7} y1={ayy - 7} x2={axx + 7} y2={ayy - 7} stroke={T.ink} strokeWidth="2" />
              {[-5, 0, 5].map((o, k) => (
                <line key={k} x1={axx + o} y1={ayy - 7} x2={axx + o - 3} y2={ayy - 12} stroke={T.ink} strokeWidth="0.9" />
              ))}
              <circle cx={axx} cy={ayy} r="3.4" fill={T.paper} stroke={T.ink} strokeWidth="1.3" />
            </g>
          ))}

          {/* tension force arrows (indigo) */}
          {[[tLx, tLy, -sin, -cos], [tRx, tRy, sin, -cos]].map(([ex, ey, dx, dy], i) => (
            <g key={"ten" + i}>
              <line x1={px} y1={py} x2={ex} y2={ey} stroke={C} strokeWidth="3" strokeLinecap="round" />
              <polygon points={head(ex, ey, dx, dy, 9)} fill={C} />
            </g>
          ))}

          {/* weight arrow (copper, down) */}
          <line x1={px} y1={py} x2={px} y2={wTy} stroke={A} strokeWidth="3" strokeLinecap="round" />
          <polygon points={head(px, wTy, 0, 1, 9)} fill={A} />

          {/* person */}
          <ellipse cx={px + 2} cy={py + 5} rx="11" ry="4" fill="#000" opacity="0.12" />
          <circle cx={px} cy={py} r="9" fill={T.paper2} stroke={T.ink} strokeWidth="1.4" />
          <circle cx={px} cy={py} r="3" fill={C} />

          {/* label: weight */}
          {(() => {
            const lx = px + 16, ly = py + Math.min(Lw - 6, 40);
            return (
              <g>
                <line x1={px + 3} y1={ly} x2={lx} y2={ly} stroke={A} strokeWidth="0.8" />
                <rect x={lx} y={ly - 9} width={58} height={17} rx={3} fill={T.paper} stroke={A} strokeWidth="1" />
                <text x={lx + 29} y={ly + 3} textAnchor="middle" fill={A} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>weight</text>
              </g>
            );
          })()}
          {/* label: rope pull */}
          {(() => {
            const mx = (px + tRx) / 2, my = (py + tRy) / 2;
            const lx = 300, ly = 150;
            return (
              <g>
                <line x1={lx} y1={ly} x2={mx} y2={my} stroke={C} strokeWidth="0.8" />
                <polygon points={head(mx, my, mx - lx, my - ly, 5)} fill={C} />
                <rect x={lx} y={ly - 9} width={70} height={17} rx={3} fill={T.paper} stroke={C} strokeWidth="1" />
                <text x={lx + 35} y={ly + 3} textAnchor="middle" fill={C} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>rope pull</text>
              </g>
            );
          })()}

          {/* ===== force-sum panel ===== */}
          <g>
            <rect x={sp.x} y={sp.y} width={sp.w} height={sp.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={sp.x + 12} y={sp.y + 17} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>force sum</text>
            <text x={sp.x + 12} y={sp.y + 29} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.14 })}>arrows add tip to tail</text>
            {/* weight segment */}
            <line x1={SO.x} y1={SO.y} x2={SA.x} y2={SA.y} stroke={A} strokeWidth="2.4" strokeLinecap="round" />
            <polygon points={head(SA.x, SA.y, 0, 1, 8)} fill={A} />
            {/* left tension segment */}
            <line x1={SA.x} y1={SA.y} x2={SB.x} y2={SB.y} stroke={C} strokeWidth="2.4" strokeLinecap="round" />
            <polygon points={head(SB.x, SB.y, -sin, -cos, 8)} fill={C} />
            {/* right tension segment back to origin */}
            <line x1={SB.x} y1={SB.y} x2={SO.x} y2={SO.y} stroke={C} strokeWidth="2.4" strokeLinecap="round" />
            <polygon points={head(SO.x, SO.y, sin, -cos, 8)} fill={C} />
            {/* closure marker */}
            <circle cx={SO.x} cy={SO.y} r="4.2" fill="none" stroke={okC} strokeWidth="1.6" />
            <text x={sp.x + sp.w / 2} y={sp.y + sp.h - 14} textAnchor="middle" fill={okC} style={f.mono(700, 9.5, { upper: true, tracking: 0.12 })}>sum = 0 balanced</text>
          </g>

          {/* ===== tradeoff panel: rope force vs angle ===== */}
          <g>
            <rect x={tp.x} y={tp.y} width={tp.w} height={tp.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={tp.x + 12} y={tp.y + 15} fill={T.mute} style={f.mono(700, 8.5, { upper: true, tracking: 0.18 })}>rope force vs spread</text>
            <rect x={hardX} y={plotTop} width={plotR - hardX} height={plotBot - plotTop} fill={warnC} opacity="0.1" />
            <text x={(hardX + plotR) / 2} y={plotTop + 9} textAnchor="middle" fill={warnC} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>hard</text>
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={curve.join(" ")} fill="none" stroke={A} strokeWidth="2" />
            <line x1={angX(ang)} y1={plotTop} x2={angX(ang)} y2={plotBot} stroke={T.ink} strokeDasharray="3 3" strokeWidth="1" opacity="0.7" />
            <circle cx={angX(ang)} cy={ratY(ratio)} r="3.4" fill={A} stroke={T.paper} strokeWidth="1" />
            <text x={tp.x + 12} y={plotBot + 1} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.12 })}>force</text>
            <text x={plotL} y={plotBot + 14} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>narrow</text>
            <text x={plotR} y={plotBot + 14} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>wide ropes</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={ang} set={setAng} min={20} max={78} color={C} label="Rope angle" suffix={ang + "°"} />
        <Slider val={load} set={setLoad} min={20} max={120} color={A} label="Load" suffix={load + " %"} />
      </div>

      <Readout items={[
        { l: "Rope force", v: ratio.toFixed(2) + "x wt", color: C },
        { l: "Net force", v: "0 (balanced)", color: okC },
        { l: "Holding", v: hold, color: holdC },
      ]} />

      <Caption color={C}>
        Map every force as an arrow where it acts: gravity pulls the body
        straight down, and each rope pulls along its own length. For the body to
        stay still the arrows must add to zero, which the closed triangle shows.
        Spreading the ropes wider forces each one to pull much harder than the
        body weighs, so balance gets hard long before the ropes look steep.
      </Caption>
    </div>
  );
}

export { ExtraForceMap };
