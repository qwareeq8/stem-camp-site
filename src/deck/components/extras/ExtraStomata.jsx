// ExtraStomata component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraStomata() {
  // TTT-12 "Stomata: pores for gas exchange" (concept 1). Distinct from
  // ExtraSampling (the counting method). A stoma is a pore between two guard
  // cells. It opens to take in CO2 (and let O2 out), but an open pore also loses
  // water. The plant balances feeding itself against drying out.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;   // moss, terracotta
  const okC = T.ok, warnC = T.warn;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [light, setLight] = useState(65);   // light level 0..100 drives opening
  const [playing, setPlaying] = useState(true);
  const ap = light / 100;                    // aperture fraction 0..1
  const co2 = Math.round(100 * (1 - Math.exp(-ap * 2.4)));   // saturating uptake
  const water = Math.round(100 * Math.pow(ap, 0.82));        // transpiration loss
  const status = light < 20 ? "closed" : light <= 75 ? "feeding" : "drying out";
  const stC = light < 20 ? A : light <= 75 ? okC : warnC;

  // ---- animation ----
  const clockRef = useRef(0);
  const [, force] = useState(0);
  useRAF(playing, (dt) => { clockRef.current += dt; force((x) => x + 1); });
  const cl = clockRef.current;

  // ---- stoma geometry ----
  const VW = 560, VH = 230;
  const sx = 150, sy = 126, ph = 36, gcW = 13;
  const pw = ap * 13;     // pore half-width
  const lens = (hw) => "M" + sx + "," + (sy - ph) + " Q" + (sx - hw) + "," + sy + " " + sx + "," + (sy + ph) + " Q" + (sx + hw) + "," + sy + " " + sx + "," + (sy - ph) + " Z";
  const guard = (s) => "M" + sx + "," + (sy - ph) + " Q" + (sx + s * (pw + gcW)) + "," + sy + " " + sx + "," + (sy + ph) + " Q" + (sx + s * pw) + "," + sy + " " + sx + "," + (sy - ph) + " Z";

  // ---- tradeoff chart ----
  const pn = { x: 312, y: 52, w: 204, h: 140 };
  const plotL = pn.x + 34, plotR = pn.x + pn.w - 14, plotTop = pn.y + 28, plotBot = pn.y + pn.h - 22;
  const aX = (v) => plotL + (v / 100) * (plotR - plotL);
  const yV = (v) => plotBot - (v / 100) * (plotBot - plotTop);
  const co2Pts = [], waterPts = [];
  for (let l = 0; l <= 100; l += 4) {
    const a = l / 100;
    co2Pts.push(aX(l).toFixed(1) + "," + yV(100 * (1 - Math.exp(-a * 2.4))).toFixed(1));
    waterPts.push(aX(l).toFixed(1) + "," + yV(100 * Math.pow(a, 0.82)).toFixed(1));
  }

  return (
    <div>
      <Field height={242}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x={40} y={24} fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.22 })}>stomata: pores for gas exchange</text>
          <text x={40} y={38} fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>open for co2, but lose water</text>

          {/* leaf epidermis backdrop */}
          <rect x={40} y={52} width={250} height={150} rx={6} fill="#dfe4c9" stroke={T.ink} strokeWidth="0.6" />
          {[[74, 78, 15], [256, 74, 15], [74, 180, 14], [256, 178, 15], [262, 130, 13]].map(([ex, ey, s], i) => (
            <path key={i} d={"M " + (ex - s) + " " + ey + " C " + (ex - s) + " " + (ey - s * 0.9) + " " + (ex - s * 0.5) + " " + (ey - s) + " " + ex + " " + (ey - s * 0.78) + " C " + (ex + s * 0.5) + " " + (ey - s) + " " + (ex + s) + " " + (ey - s * 0.9) + " " + (ex + s) + " " + ey + " C " + (ex + s) + " " + (ey + s * 0.9) + " " + (ex + s * 0.5) + " " + (ey + s) + " " + ex + " " + (ey + s * 0.78) + " C " + (ex - s * 0.5) + " " + (ey + s) + " " + (ex - s) + " " + (ey + s * 0.9) + " " + (ex - s) + " " + ey + " Z"} fill="none" stroke={C} strokeWidth="0.8" opacity="0.2" />
          ))}

          {/* gas flows through the pore (gated by aperture) */}
          {ap > 0.08 && Array.from({ length: 5 }).map((_, i) => {
            const t = ((cl * 0.0006 * (0.4 + ap) + i * 0.2) % 1);
            const yy = (sy - 56) + t * 112;
            const op = clamp(ap * 0.9 * (t < 0.85 ? 1 : (1 - t) * 6), 0, 0.9);
            return <g key={"co2" + i} opacity={op}><circle cx={sx - 6 + (i % 3) * 6} cy={yy} r="3" fill={okC} /></g>;
          })}
          {ap > 0.08 && Array.from({ length: 4 }).map((_, i) => {
            const t = ((cl * 0.00055 * (0.4 + ap) + i * 0.25) % 1);
            const yy = (sy + 46) - t * 102;
            const op = clamp(ap * 0.8 * (t < 0.85 ? 1 : (1 - t) * 6), 0, 0.8);
            return <circle key={"w" + i} cx={sx + 5 - (i % 3) * 5} cy={yy} r="2.4" fill={A} opacity={op} />;
          })}

          {/* pore opening + guard cells */}
          <path d={lens(pw)} fill="#2a241c" />
          <path d={guard(-1)} fill={C} stroke={T.ink} strokeWidth="1.1" />
          <path d={guard(1)} fill={C} stroke={T.ink} strokeWidth="1.1" />
          <path d={"M" + sx + "," + (sy - ph + 4) + " Q" + (sx - pw - gcW * 0.55) + "," + sy + " " + sx + "," + (sy + ph - 4)} fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.3" />
          <path d={"M" + sx + "," + (sy - ph + 4) + " Q" + (sx + pw + gcW * 0.55) + "," + sy + " " + sx + "," + (sy + ph - 4)} fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.3" />
          <text x={sx} y={sy + ph + 18} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>guard cells</text>

          {/* flow labels */}
          <g>
            <path d={"M" + (sx + 34) + "," + (sy - 30) + " l 0 16 l -4 -4 m 4 4 l 4 -4"} fill="none" stroke={okC} strokeWidth="1.4" />
            <text x={sx + 40} y={sy - 24} fill={okC} style={f.mono(700, 8.5, { upper: true, tracking: 0.1 })}>co2 in</text>
            <path d={"M" + (sx - 34) + "," + (sy + 26) + " l 0 -16 l -4 4 m 4 -4 l 4 4"} fill="none" stroke={A} strokeWidth="1.4" />
            <text x={sx - 40} y={sy + 24} textAnchor="end" fill={A} style={f.mono(700, 8.5, { upper: true, tracking: 0.1 })}>water out</text>
          </g>

          {/* ===== tradeoff chart ===== */}
          <g>
            <rect x={pn.x} y={pn.y} width={pn.w} height={pn.h} rx={6} fill={T.paper2} stroke={C} strokeWidth="1" />
            {[["co2 in", okC], ["water out", A]].map(([lab, col], i) => (
              <g key={i} transform={"translate(" + (pn.x + 12 + i * 86) + " " + (pn.y + 14) + ")"}>
                <line x1={0} y1={0} x2={12} y2={0} stroke={col} strokeWidth="2.4" />
                <text x={15} y={3} fill={col} style={f.mono(600, 8, { upper: true, tracking: 0.08 })}>{lab}</text>
              </g>
            ))}
            <line x1={plotL} y1={plotBot} x2={plotR} y2={plotBot} stroke={T.rule22} strokeWidth="0.8" />
            <polyline points={co2Pts.join(" ")} fill="none" stroke={okC} strokeWidth="2.2" />
            <polyline points={waterPts.join(" ")} fill="none" stroke={A} strokeWidth="2.2" />
            <line x1={aX(light)} y1={plotTop} x2={aX(light)} y2={plotBot} stroke={T.ink} strokeDasharray="2 3" strokeWidth="1" opacity="0.6" />
            <circle cx={aX(light)} cy={yV(co2)} r="3" fill={okC} stroke={T.paper} strokeWidth="1" />
            <circle cx={aX(light)} cy={yV(water)} r="3" fill={A} stroke={T.paper} strokeWidth="1" />
            <text x={plotL} y={plotBot + 13} fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>closed</text>
            <text x={plotR} y={plotBot + 13} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.1 })}>wide open</text>
          </g>
        </svg>
      </Field>

      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={light} set={setLight} min={0} max={100} color={okC} label="Light" suffix={light + "%"} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((q) => !q)}>
          {playing ? "pause" : "play"}
        </Btn>
      </div>

      <Readout items={[
        { l: "Aperture", v: light + "%", color: C },
        { l: "CO2 in", v: co2 + "%", color: okC },
        { l: "Water lost", v: water + "%", color: A },
        { l: "Status", v: status, color: stC },
      ]} />

      <Caption color={C}>
        Leaves breathe through tiny pores called stomata, opened and closed by two
        guard cells. An open pore lets carbon dioxide in for food and oxygen out,
        but it also lets water escape. CO2 uptake levels off as the pore widens
        while water loss keeps climbing, so a plant in dry air keeps its stomata
        nearly closed to save water.
      </Caption>
    </div>
  );
}

export { ExtraStomata };
