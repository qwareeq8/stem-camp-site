// DemoLotus component for the STEM Camp interactive deck.
import { useMemo, useRef, useState } from "react";
import { Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function DemoLotus() {
  // TTT "Hydrophobic micro-texture" (concept 1). Sibling ExtraRoughCoat (concept 2)
  // races droplets down a ramp and scores residue. This demo owns the micro-scale
  // mechanism: wax plus tiny bumps trap an air layer so water cannot wet the
  // surface, the contact angle climbs past 150 degrees, the drop beads into a near
  // sphere and rolls off carrying dirt. A zoom inset shows the air pockets and a
  // gauge shows wetting vs hydrophobic vs superhydrophobic.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const WAT = "#4f8ec9", WHI = "#9cc2e5", DIRT = "#a07a3a";
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [textured, setTextured] = useState(true);
  const [tilt, setTilt] = useState(12);
  const [running, setRunning] = useState(false);
  const [, force] = useState(0);
  const pRef = useRef(0);
  const removedRef = useRef(0);
  const dirt = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ u: 0.2 + i * 0.1 })), []);
  const dirtRef = useRef(dirt.map((d) => ({ u: d.u, taken: false })));
  const reset = () => { pRef.current = 0; removedRef.current = 0; dirtRef.current = dirt.map((d) => ({ u: d.u, taken: false })); setRunning(true); };

  const VW = 480, VH = 300, sx0 = 34, sx1 = 320, syMid = 176;
  const tr = tilt * Math.PI / 180, dropH = (sx1 - sx0) * Math.tan(tr) * 0.5;
  const sy0 = syMid - dropH / 2, sy1 = syMid + dropH / 2;
  const at = (u) => ({ x: sx0 + (sx1 - sx0) * u, y: sy0 + (sy1 - sy0) * u });

  useRAF(running, (dt) => {
    pRef.current = Math.min(1, pRef.current + dt * 0.00045 * (0.4 + tilt / 20));
    const p = pRef.current, dp = at(p);
    if (textured) dirtRef.current.forEach((d) => { if (!d.taken) { const q = at(d.u); if (Math.abs(q.x - dp.x) < 15 && p >= d.u) { d.taken = true; removedRef.current++; } } });
    if (p >= 1) setRunning(false);
    force((n) => (n + 1) % 1000000);
  });

  const p = pRef.current, dp = at(p);
  const ca = textured ? Math.round(cl(150 + tilt * 0.5, 150, 168)) : Math.round(cl(58 - tilt * 0.6, 30, 60));
  const regime = ca >= 150 ? "superhydrophobic" : ca >= 90 ? "hydrophobic" : "wetting";
  const regC = ca >= 150 ? A : ca >= 90 ? C : T.mute;
  const removed = removedRef.current;
  const dcx = dp.x, dcy = dp.y - (textured ? 20 : 9);
  const mcx = 408, mcy = 98, mr = 60;                 // magnifier
  const gx0 = 34, gx1 = 320, gy = 270;                // regime gauge
  const gpos = (deg) => gx0 + (deg / 180) * (gx1 - gx0);

  return (
    <div>
      <Field height={300}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          <text x="16" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Hydrophobic micro-texture</text>
          <text x="16" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>bumps plus wax make water bead and self-clean</text>

          {/* leaf surface */}
          <line x1={sx0} y1={sy0} x2={sx1} y2={sy1} stroke={C} strokeWidth="3" strokeLinecap="round" />
          {textured && Array.from({ length: 24 }, (_, i) => { const u = i / 23; const q = at(u); return <path key={"b" + i} d={"M " + (q.x - 3) + " " + (q.y) + " Q " + q.x + " " + (q.y - 6) + " " + (q.x + 3) + " " + q.y} fill="none" stroke={C} strokeWidth="1.4" />; })}
          {!textured && <line x1={sx0} y1={sy0 - 2} x2={sx1} y2={sy1 - 2} stroke={WHI} strokeWidth="1" opacity="0.5" />}
          <text x={sx0} y={sy1 + 22} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>leaf surface ({textured ? "rough + waxy" : "smooth"})</text>

          {/* dirt on surface */}
          {dirtRef.current.map((d, i) => !d.taken && (() => { const q = at(d.u); return <circle key={"d" + i} cx={q.x} cy={q.y - 3} r="2.4" fill={DIRT} />; })())}

          {/* droplet */}
          {textured ? (
            <g>
              <circle cx={dcx} cy={dcy} r="18" fill={WAT} opacity="0.9" />
              <ellipse cx={dcx - 6} cy={dcy - 6} rx="4" ry="3" fill={WHI} opacity="0.7" />
              {Array.from({ length: Math.min(removed, 7) }, (_, i) => <circle key={"pd" + i} cx={dcx + Math.cos(i * 1.3) * 9} cy={dcy + Math.sin(i * 1.3) * 7} r="1.7" fill={DIRT} />)}
            </g>
          ) : (
            <g transform={"rotate(" + (Math.atan2(sy1 - sy0, sx1 - sx0) * 180 / Math.PI).toFixed(2) + " " + dp.x + " " + dp.y + ")"}>
              <path d={"M " + (dcx - 30) + " " + (dp.y - 1) + " Q " + (dcx - 14) + " " + (dp.y - 16) + " " + dcx + " " + (dp.y - 16) + " Q " + (dcx + 14) + " " + (dp.y - 16) + " " + (dcx + 30) + " " + (dp.y - 1) + " Z"} fill={WAT} opacity="0.85" />
            </g>
          )}

          {/* contact-angle wedge at the drop base */}
          {(() => { const phiDeg = Math.atan2(sy1 - sy0, sx1 - sx0) * 180 / Math.PI; const a2 = ca * Math.PI / 180, r1 = 26; const e1x = dp.x + r1, e2x = dp.x + Math.cos(a2) * r1, e2y = dp.y - Math.sin(a2) * r1; const axx = dp.x + Math.cos(a2) * 14, ayy = dp.y - Math.sin(a2) * 14; return (<g><g transform={"rotate(" + phiDeg.toFixed(1) + " " + dp.x + " " + dp.y + ")"}><line x1={dp.x} y1={dp.y} x2={e1x} y2={dp.y} stroke={regC} strokeWidth="1" /><line x1={dp.x} y1={dp.y} x2={e2x} y2={e2y} stroke={regC} strokeWidth="1.6" /><path d={"M " + (dp.x + 14) + " " + dp.y + " A 14 14 0 0 0 " + axx + " " + ayy} fill="none" stroke={regC} strokeWidth="1" /></g><text x={dp.x} y={dp.y + 18} textAnchor="middle" fill={regC} style={f.mono(700, 9.5)}>{ca} deg</text></g>); })()}

          {/* magnifier zoom of the contact */}
          <line x1={dcx} y1={dcy} x2={mcx} y2={mcy + mr} stroke={T.rule22} strokeWidth="0.6" strokeDasharray="2 3" />
          <circle cx={mcx} cy={mcy} r={mr} fill={T.paper2} stroke={C} strokeWidth="1" />
          {textured ? (
            <g>
              {Array.from({ length: 6 }, (_, i) => { const bx = mcx - 40 + i * 16; return <path key={"mb" + i} d={"M " + (bx - 6) + " " + (mcy + 28) + " Q " + bx + " " + (mcy + 14) + " " + (bx + 6) + " " + (mcy + 28)} fill={C} />; })}
              <path d={"M " + (mcx - 46) + " " + (mcy + 14) + " Q " + mcx + " " + (mcy - 30) + " " + (mcx + 46) + " " + (mcy + 14)} fill={WAT} opacity="0.9" />
              {Array.from({ length: 5 }, (_, i) => <ellipse key={"ap" + i} cx={mcx - 32 + i * 16} cy={mcy + 22} rx="5" ry="3.5" fill={T.paper} opacity="0.9" />)}
              <text x={mcx} y={mcy + mr + 14} textAnchor="middle" fill={C} style={f.mono(600, 7, { upper: true, tracking: 0.08 })}>air pockets: no wetting</text>
            </g>
          ) : (
            <g>
              <line x1={mcx - 46} y1={mcy + 24} x2={mcx + 46} y2={mcy + 24} stroke={C} strokeWidth="2.4" />
              <path d={"M " + (mcx - 44) + " " + (mcy + 23) + " Q " + mcx + " " + (mcy - 6) + " " + (mcx + 44) + " " + (mcy + 23) + " Z"} fill={WAT} opacity="0.8" />
              <text x={mcx} y={mcy + mr + 14} textAnchor="middle" fill={C} style={f.mono(600, 7, { upper: true, tracking: 0.08 })}>water wets the surface</text>
            </g>
          )}
          <text x={mcx} y={mcy - mr - 4} textAnchor="middle" fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.1 })}>micro-texture (zoom)</text>

          {/* contact-angle regime gauge */}
          <rect x={gx0} y={gy} width={gpos(90) - gx0} height="8" fill={T.mute} opacity="0.25" />
          <rect x={gpos(90)} y={gy} width={gpos(150) - gpos(90)} height="8" fill={C} opacity="0.3" />
          <rect x={gpos(150)} y={gy} width={gx1 - gpos(150)} height="8" fill={A} opacity="0.4" />
          <polygon points={gpos(ca) + "," + (gy - 2) + " " + (gpos(ca) - 4) + "," + (gy - 9) + " " + (gpos(ca) + 4) + "," + (gy - 9)} fill={regC} />
          <text x={gx0} y={gy + 18} fill={T.mute} style={f.mono(500, 6.5, { upper: true, tracking: 0.06 })}>wetting</text>
          <text x={gpos(120)} y={gy + 18} textAnchor="middle" fill={T.mute} style={f.mono(500, 6.5, { upper: true, tracking: 0.06 })}>hydrophobic</text>
          <text x={gx1} y={gy + 18} textAnchor="end" fill={T.mute} style={f.mono(500, 6.5, { upper: true, tracking: 0.06 })}>superhydrophobic</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Btn small active={textured} color={C} onClick={() => setTextured((t) => !t)}>{textured ? "textured + waxy" : "smooth"}</Btn>
        <Slider val={tilt} set={setTilt} min={4} max={28} step={1} color={C} label="Tilt" suffix={tilt + " deg"} />
        <Btn small icon={Play} color={A} onClick={reset}>release drop</Btn>
      </div>

      <Readout items={[
        { l: "Contact angle", v: ca + " deg", color: regC },
        { l: "State", v: regime, color: regC },
        { l: "Air layer", v: textured ? "yes" : "no" },
        { l: "Dirt removed", v: removed + " / 7" },
      ]} />

      <Caption color={C}>
        A lotus leaf is rough and waxy, not smooth. The wax repels water and the tiny bumps trap a
        layer of air, so a drop cannot sink into the texture and instead beads into a near-sphere with
        a contact angle past 150 degrees. Tip the leaf and the bead rolls off, picking up dirt as it
        goes, which is why the leaf cleans itself. A smooth surface loses the air layer, the water wets
        it, and dirt stays put.
      </Caption>
    </div>
  );
}

export { DemoLotus };
