// ExtraAperture component for the STEM Camp interactive deck.
import { useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraAperture() {
  // PYS-07 "The aperture tradeoff" (concept 2). Distinct from DemoPinhole,
  // which covers straight-line rays and the flipped image. Here the focus is
  // the optimization: a smaller hole gives a sharper but dimmer spot; a bigger
  // hole gives a brighter but blurrier spot. The image-quality curve (the
  // product of sharpness and brightness) peaks at an in-between aperture, the
  // sweet spot. No rays, no flipped image.
  const C = CAMP.pystem.ink, AC = CAMP.pystem.acc;   // indigo, copper
  const okC = T.ok;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [a, setA] = useState(5);            // aperture 1..12
  const sharpN = (12 - a) / 11;             // 1 (small hole) -> 0 (big hole)
  const brightN = Math.pow(a / 12, 0.7);    // rises with hole area
  const quality = sharpN * brightN;
  // optimum + peak quality (sample integer apertures)
  let optA = 1, qPeak = 0;
  for (let k = 1; k <= 12; k++) {
    const q = ((12 - k) / 11) * Math.pow(k / 12, 0.7);
    if (q > qPeak) { qPeak = q; optA = k; }
  }
  const qN = quality / qPeak;
  let result, resultC;
  if (a < optA - 1) { result = "sharp, dim"; resultC = C; }
  else if (a > optA + 1) { result = "bright, blurry"; resultC = AC; }
  else { result = "balanced"; resultC = okC; }

  // ---- scene geometry ----
  const VW = 560, VH = 240;
  const cy = 128;
  const srcX = 56, plateX0 = 94, plateX1 = 126, plateCx = 110, screenX = 208;
  const plateY0 = 58, plateY1 = 198;
  const rHole = 3 + ((a - 1) / 11) * 12;     // 3 -> 15
  const rSpot = 5 + ((a - 1) / 11) * 15;     // 5 -> 20
  const blurPx = ((a - 1) / 11) * 4.5;       // 0 -> 4.5
  const holePath =
    "M" + plateX0 + " " + plateY0 + " L" + plateX1 + " " + plateY0 +
    " L" + plateX1 + " " + plateY1 + " L" + plateX0 + " " + plateY1 + " Z " +
    "M" + (plateCx - rHole) + " " + cy +
    " A " + rHole + " " + rHole + " 0 1 0 " + (plateCx + rHole) + " " + cy +
    " A " + rHole + " " + rHole + " 0 1 0 " + (plateCx - rHole) + " " + cy + " Z";

  // ---- chart geometry ----
  const pn = { x: 250, y: 50, w: 266, h: 174 };
  const plotL = pn.x + 40, plotR = pn.x + pn.w - 16, plotTop = pn.y + 40, plotBot = pn.y + pn.h - 24;
  const aX = (v) => plotL + ((v - 1) / 11) * (plotR - plotL);
  const vY = (v) => plotBot - v * (plotBot - plotTop);
  const sharpPts = [], brightPts = [], qualPts = [];
  for (let k = 1; k <= 12; k += 0.5) {
    const s = (12 - k) / 11, b = Math.pow(k / 12, 0.7);
    sharpPts.push(aX(k).toFixed(1) + "," + vY(clamp(s, 0, 1)).toFixed(1));
    brightPts.push(aX(k).toFixed(1) + "," + vY(clamp(b, 0, 1)).toFixed(1));
    qualPts.push(aX(k).toFixed(1) + "," + vY(clamp((s * b) / qPeak, 0, 1)).toFixed(1));
  }

  return (
    <div>
      <Field height={250}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={26} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>the aperture tradeoff</text>
          <text x={40} y={40} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>sharp vs bright, find the sweet spot</text>

          {/* light beam funnelling through the hole to the spot (drawn behind the plate) */}
          <polygon points={srcX + ",126 " + plateCx + "," + (cy - rHole) + " " + plateCx + "," + (cy + rHole) + " " + srcX + ",130"} fill={AC} opacity="0.10" />
          <polygon points={plateCx + "," + (cy - rHole) + " " + screenX + "," + (cy - rSpot) + " " + screenX + "," + (cy + rSpot) + " " + plateCx + "," + (cy + rHole)} fill={AC} opacity="0.10" />

          {/* light source */}
          <circle cx={srcX} cy={cy} r="9" fill={AC} opacity="0.25" />
          <circle cx={srcX} cy={cy} r="5" fill={AC} stroke={T.ink} strokeWidth="0.8" />
          {Array.from({ length: 6 }).map((_, i) => {
            const ang = (i / 6) * Math.PI * 2;
            return <line key={i} x1={srcX + Math.cos(ang) * 8} y1={cy + Math.sin(ang) * 8} x2={srcX + Math.cos(ang) * 12} y2={cy + Math.sin(ang) * 12} stroke={AC} strokeWidth="1" strokeLinecap="round" opacity="0.7" />;
          })}
          <text x={srcX} y={212} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>light</text>

          {/* foil plate with a round hole (the aperture) */}
          <path d={holePath} fill={T.ink} fillRule="evenodd" />
          <circle cx={plateCx} cy={cy} r={rHole} fill="none" stroke={AC} strokeWidth="1.2" />
          <text x={plateCx} y={212} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>aperture</text>

          {/* screen + image spot */}
          <rect x={screenX} y={plateY0} width="3" height={plateY1 - plateY0} fill={T.ink} opacity="0.55" />
          <g style={{ filter: "blur(" + blurPx.toFixed(2) + "px)" }}>
            <circle cx={screenX + 1} cy={cy} r={rSpot} fill={AC} opacity={brightN} />
            <circle cx={screenX + 1} cy={cy} r={rSpot * 0.5} fill={AC} opacity={clamp(brightN + 0.15, 0, 1)} />
          </g>
          <text x={screenX + 1} y={212} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>image spot</text>

          {/* ===== optimization chart ===== */}
          <g>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            <text x={pn.x + 12} y={pn.y + 16} fill={T.mute} style={f.mono(700, 9, { upper: true, tracking: 0.2 })}>image quality</text>
            {/* legend */}
            {[["sharp", C], ["bright", AC], ["quality", okC]].map(([lab, col], i) => (
              <g key={i} transform={"translate(" + (pn.x + 92 + i * 58) + " " + (pn.y + 12) + ")"}>
                <line x1={0} y1={0} x2={12} y2={0} stroke={col} strokeWidth="2.4" />
                <text x={15} y={3} fill={col} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{lab}</text>
              </g>
            ))}
            {/* sweet-spot band + marker */}
            <line x1={aX(optA)} y1={plotTop} x2={aX(optA)} y2={plotBot} stroke={okC} strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
            <text x={aX(optA)} y={plotTop - 13} textAnchor="middle" fill={okC} style={f.mono(700, 8, { upper: true, tracking: 0.1 })}>best</text>
            <polygon points={aX(optA) + "," + (plotTop - 2) + " " + (aX(optA) - 3) + "," + (plotTop - 9) + " " + (aX(optA) + 3) + "," + (plotTop - 9)} fill={okC} />
            {/* baseline */}
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            {/* curves */}
            <polyline points={sharpPts.join(" ")} fill="none" stroke={C} strokeWidth="1.6" opacity="0.85" />
            <polyline points={brightPts.join(" ")} fill="none" stroke={AC} strokeWidth="1.6" opacity="0.85" />
            <polyline points={qualPts.join(" ")} fill="none" stroke={okC} strokeWidth="2.6" />
            {/* current aperture marker */}
            <line x1={aX(a)} y1={plotTop} x2={aX(a)} y2={plotBot} stroke={T.ink} strokeDasharray="2 3" strokeWidth="1" opacity="0.6" />
            <circle cx={aX(a)} cy={vY(clamp(qN, 0, 1))} r="3.6" fill={okC} stroke={T.paper} strokeWidth="1.2" />
            {/* axis labels */}
            <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>small hole</text>
            <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>big hole</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={a} set={setA} min={1} max={12} color={AC} label="Aperture" suffix={a} />
      </div>

      <Readout items={[
        { l: "Sharpness", v: Math.round(sharpN * 100) + "%", color: C },
        { l: "Brightness", v: Math.round(brightN * 100) + "%", color: AC },
        { l: "Image quality", v: Math.round(qN * 100) + "%", color: okC },
        { l: "Verdict", v: result, color: resultC },
      ]} />

      <Caption color={C}>
        A pinhole has no lens, so hole size sets the result. A small hole passes
        a narrow bundle of light: the spot is sharp but dim. A big hole floods
        the screen: bright but blurry. Image quality is best at an in-between
        aperture, the sweet spot, where sharpness and brightness balance.
      </Caption>
    </div>
  );
}

export { ExtraAperture };
