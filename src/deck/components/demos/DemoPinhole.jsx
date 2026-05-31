// DemoPinhole component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function DemoPinhole() {
  // PYS-07 "Light travels in straight lines" (concept 1). Sibling ExtraAperture
  // (concept 2) owns the hole-size sharpness/brightness optimization with a
  // quality chart and explicitly no rays and no flip. This demo is the straight-
  // line geometry: an extended object emits rays that travel in straight lines,
  // cross at one fixed tiny pinhole, and land as an upside-down image. Photons
  // stream along the rays. Two sliders set object distance u and screen distance
  // v, so the magnification m = v/u and the inversion are both visible live.
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [u, setU] = useState(5);          // object distance 1..10
  const [v, setV] = useState(6);          // screen distance 1..10
  const [playing, setPlaying] = useState(true);
  const [, force] = useState(0);
  const phaseRef = useRef(0);
  useRAF(playing, (dt) => { phaseRef.current += dt; force((n) => (n + 1) % 1000000); });

  // ----- bounded geometry -----
  const VW = 560, VH = 280, yAxis = 140, OH = 26;
  const holeX = 280, barTop = 68, barBot = 212;
  const u_px = 90 + ((u - 1) / 9) * 80;     // 90..170
  const v_px = 90 + ((v - 1) / 9) * 120;    // 90..210
  const objX = holeX - u_px;                // 190..110
  const screenX = holeX + v_px;             // 370..490
  const m = v_px / u_px;                    // 0.53..2.33
  const imgHalf = OH * m;                   // 13.8..60.6
  const phase = phaseRef.current;

  // emitter offsets from the axis (negative = above the axis = object top)
  const offs = [-26, -13, 0, 13, 26];
  const rays = offs.map((off) => {
    const objPt = { x: objX, y: yAxis + off };
    const hole = { x: holeX, y: yAxis };
    const imgPt = { x: screenX, y: yAxis - off * m };   // inverted through the hole
    const lenA = Math.hypot(hole.x - objPt.x, hole.y - objPt.y);
    const lenB = Math.hypot(imgPt.x - hole.x, imgPt.y - hole.y);
    return { off, objPt, hole, imgPt, lenA, lenB, L: lenA + lenB, color: off < 0 ? A : off > 0 ? C : T.mute, major: Math.abs(off) === 26 };
  });
  const ppr = 2;   // photons per ray
  const photonAt = (ray, k) => {
    const s = (((phase * 0.00045) + k / ppr + (ray.off + 26) * 0.013) % 1 + 1) % 1;
    const d = s * ray.L;
    if (d < ray.lenA) { const t = ray.lenA ? d / ray.lenA : 0; return { x: ray.objPt.x + (ray.hole.x - ray.objPt.x) * t, y: ray.objPt.y + (ray.hole.y - ray.objPt.y) * t, pre: true }; }
    const t = ray.lenB ? (d - ray.lenA) / ray.lenB : 0;
    return { x: ray.hole.x + (ray.imgPt.x - ray.hole.x) * t, y: ray.hole.y + (ray.imgPt.y - ray.hole.y) * t, pre: false };
  };
  const headW = cl(7 * m, 5, 12), headH = cl(9 * m, 6, 14);

  return (
    <div>
      <Field height={285}>
        <svg viewBox={"0 0 " + VW + " " + VH} style={{ width: "100%", height: "100%" }}>
          {/* ===== header ===== */}
          <text x="20" y="26" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Light travels in straight lines</text>
          <text x="20" y="40" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>a pinhole flips the picture</text>

          {/* ray-source legend (top-right) */}
          <text x={446} y={16} fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.12 })}>ray source</text>
          <line x1={446} y1={26} x2={462} y2={26} stroke={A} strokeWidth="2.4" strokeLinecap="round" />
          <text x={467} y={29} fill={T.mute} style={f.mono(600, 8, { tracking: 0.02 })}>top of object</text>
          <line x1={446} y1={37} x2={462} y2={37} stroke={C} strokeWidth="2.4" strokeLinecap="round" />
          <text x={467} y={40} fill={T.mute} style={f.mono(600, 8, { tracking: 0.02 })}>base of object</text>

          {/* ===== optical axis ===== */}
          <line x1={Math.min(objX, 92) - 6} y1={yAxis} x2={screenX + 14} y2={yAxis} stroke={T.ink} strokeWidth="0.6" strokeDasharray="2 4" opacity="0.5" />

          {/* ===== rays (straight lines) + flowing photons ===== */}
          {rays.map((ray, i) => (
            <g key={"ray" + i}>
              <line x1={ray.objPt.x} y1={ray.objPt.y} x2={ray.hole.x} y2={ray.hole.y} stroke={ray.color} strokeWidth={ray.major ? 1.4 : 0.8} opacity={ray.major ? 0.7 : 0.4} />
              <line x1={ray.hole.x} y1={ray.hole.y} x2={ray.imgPt.x} y2={ray.imgPt.y} stroke={ray.color} strokeWidth={ray.major ? 1.4 : 0.8} opacity={ray.major ? 0.7 : 0.4} />
            </g>
          ))}
          {rays.map((ray, i) => Array.from({ length: ppr }, (_, k) => {
            const p = photonAt(ray, k);
            return <circle key={"ph" + i + "_" + k} cx={p.x} cy={p.y} r={ray.major ? 2 : 1.5} fill={ray.color} opacity="0.95" />;
          }))}

          {/* ===== object (extended, upright) ===== */}
          <line x1={objX} y1={yAxis - OH} x2={objX} y2={yAxis + OH} stroke={A} strokeWidth="4" strokeLinecap="round" />
          <polygon points={objX + "," + (yAxis - OH - 4) + " " + (objX - 7) + "," + (yAxis - OH + 8) + " " + (objX + 7) + "," + (yAxis - OH + 8)} fill={A} />
          <line x1={objX - 7} y1={yAxis + OH} x2={objX + 7} y2={yAxis + OH} stroke={A} strokeWidth="3" strokeLinecap="round" />
          {offs.map((off, i) => <circle key={"e" + i} cx={objX} cy={yAxis + off} r="1.8" fill={off < 0 ? A : off > 0 ? C : T.mute} />)}
          <circle cx={objX} cy={yAxis - OH - 7} r="3.2" fill={A} stroke={T.paper} strokeWidth="0.8" />
          <text x={objX} y={yAxis - OH - 15} textAnchor="middle" fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.1 })}>top</text>

          {/* ===== barrier with one tiny pinhole ===== */}
          <rect x={holeX - 3} y={barTop} width="6" height={barBot - barTop} fill={T.ink} />
          <rect x={holeX - 3} y={yAxis - 4} width="6" height="8" fill={T.paper} />
          <circle cx={holeX} cy={yAxis} r="7" fill="none" stroke={A} strokeWidth="0.9" strokeDasharray="2 2" opacity="0.7" />
          <circle cx={holeX} cy={yAxis} r="2" fill={A} />

          {/* ===== screen + inverted image ===== */}
          <rect x={screenX - 1.5} y={barTop} width="3" height={barBot - barTop} fill={T.ink} opacity="0.6" />
          <g style={{ filter: "blur(0.6px)" }}>
            <line x1={screenX} y1={yAxis - imgHalf} x2={screenX} y2={yAxis + imgHalf} stroke={A} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
            <polygon points={screenX + "," + (yAxis + imgHalf + headH * 0.45) + " " + (screenX - headW) + "," + (yAxis + imgHalf - headH * 0.55) + " " + (screenX + headW) + "," + (yAxis + imgHalf - headH * 0.55)} fill={A} opacity="0.9" />
            <line x1={screenX - 7} y1={yAxis - imgHalf} x2={screenX + 7} y2={yAxis - imgHalf} stroke={A} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          </g>
          <circle cx={screenX} cy={yAxis + imgHalf + headH * 0.45 + 3} r="3.2" fill={A} stroke={T.paper} strokeWidth="0.8" />
          <text x={screenX + 8} y={yAxis + imgHalf + headH * 0.45 + 6} fill={A} style={f.mono(700, 7.5, { upper: true, tracking: 0.1 })}>top</text>

          {/* ===== element labels ===== */}
          <text x={objX} y={230} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>object</text>
          <text x={holeX} y={230} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>pinhole</text>
          <text x={screenX} y={230} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>image (flipped)</text>

          {/* ===== u / v dimension brackets ===== */}
          <g stroke={C} strokeWidth="0.8" opacity="0.8">
            <line x1={objX} y1={244} x2={holeX} y2={244} />
            <line x1={objX} y1={240} x2={objX} y2={248} /><line x1={holeX} y1={240} x2={holeX} y2={248} />
            <line x1={holeX} y1={244} x2={screenX} y2={244} />
            <line x1={screenX} y1={240} x2={screenX} y2={248} />
          </g>
          <text x={(objX + holeX) / 2} y={258} textAnchor="middle" fill={C} style={f.mono(700, 8.5, { tracking: 0.04 })}>u = object dist</text>
          <text x={(holeX + screenX) / 2} y={258} textAnchor="middle" fill={C} style={f.mono(700, 8.5, { tracking: 0.04 })}>v = screen dist</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={u} set={setU} min={1} max={10} step={1} color={A} label="Object distance (u)" suffix={u} />
        <Slider val={v} set={setV} min={1} max={10} step={1} color={C} label="Screen distance (v)" suffix={v} />
        <Btn small icon={playing ? Pause : Play} active={playing} onClick={() => setPlaying((p) => !p)}>{playing ? "pause" : "play"}</Btn>
      </div>

      <Readout items={[
        { l: "Object dist u", v: u + " / 10", color: A },
        { l: "Screen dist v", v: v + " / 10", color: C },
        { l: "Magnification", v: m.toFixed(1) + "x", color: C },
        { l: "Image", v: "inverted" },
      ]} />

      <Caption color={C}>
        Each point of the object sends out light that travels in a straight line. With no lens, the
        only rays that reach the screen are the ones passing through the tiny pinhole, so the rays
        from the top and the base cross at the hole and keep going straight. The top of the object
        therefore lands at the bottom of the screen and the image is flipped. Moving the screen
        farther out or the object closer in raises the magnification m = v / u, so the same scene
        projects a larger inverted image.
      </Caption>
    </div>
  );
}

export { DemoPinhole };
