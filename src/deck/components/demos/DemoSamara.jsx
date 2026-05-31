// DemoSamara component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Play, Wind } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function DemoSamara() {
  // TTT "Drag, lift, and hang time" (concept 1). Sibling ExtraOneVar (concept 2)
  // is the change-one-variable-at-a-time method. This demo owns the physics of one
  // samara: it autorotates as it falls, the spinning wing makes lift that opposes
  // gravity so terminal velocity is low, hang time is long, and a breeze carries
  // the seed beyond the parent's shade. The air is drawn as drifting streamlines,
  // the canopy is opaque so the trunk never shows through, and the zone labels sit
  // below the ground so they never cover the leaf or the seed.
  const C = CAMP.trees.ink, A = CAMP.trees.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [wing, setWing] = useState(8);
  const [windOn, setWindOn] = useState(true);
  const [running, setRunning] = useState(false);
  const [, force] = useState(0);
  const tRef = useRef(0), angRef = useRef(0), windRef = useRef(0);
  const posRef = useRef({ x: 110, y: 58, landed: false, landX: 0, tEnd: 0 });
  const traceRef = useRef([]);

  const VW = 480, VH = 300, rx = 110, ry = 58, gy = 250, shadeX0 = 36, shadeX1 = 172;
  const leafDark = "#1f4a2b", leafLight = "#3f7a45", bark = "#6b4a2a";
  const vT = cl(0.182 - wing * 0.0118, 0.045, 0.182);   // px/ms terminal velocity
  const vx = windOn ? 0.05 : 0;
  const reset = () => { tRef.current = 0; angRef.current = 0; posRef.current = { x: rx, y: ry, landed: false, landX: 0, tEnd: 0 }; traceRef.current = []; setRunning(true); };

  // always-on RAF: the air drifts even while idle; the fall advances only when running (6.6)
  useRAF(true, (dt) => {
    windRef.current += dt;
    if (running) {
      tRef.current += dt; angRef.current += (0.35 + wing * 0.05) * dt;
      const p = posRef.current;
      if (!p.landed) {
        let ny = p.y + vT * dt;
        let nx = p.x + vx * dt + Math.cos(angRef.current * Math.PI / 180) * 0.25;
        const tr = traceRef.current; tr.push({ x: nx, y: ny }); if (tr.length > 260) tr.shift();
        if (ny >= gy) posRef.current = { x: nx, y: gy, landed: true, landX: nx, tEnd: tRef.current };
        else posRef.current = { x: nx, y: ny, landed: false, landX: 0, tEnd: 0 };
      }
      if (posRef.current.landed) setRunning(false);
    }
    force((n) => (n + 1) % 1000000);
  });

  const p = posRef.current, ang = angRef.current;
  const hang = (p.landed ? p.tEnd : tRef.current) / 1000;
  const fallLbl = vT > 0.13 ? "fast" : vT > 0.085 ? "medium" : "slow";
  const landX = p.landed ? p.landX : p.x;
  const beyond = landX > shadeX1;
  const fx = 392, fy = 96;                                  // force-diagram center
  const liftLen = cl(8 + wing * 1.5, 12, 26), wLen = 26;

  const Seed = ({ x, y, a, scale }) => { const L = 14 + wing * 1.8, wWid = 4 + wing * 0.5; return (
    <g transform={"translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + a.toFixed(1) + ") scale(" + scale + ")"}>
      <path d={"M 0 0 Q " + (L * 0.5) + " " + (-wWid) + " " + L + " " + (-wWid * 0.4) + " Q " + (L * 0.95) + " 0 " + L + " " + (wWid * 0.4) + " Q " + (L * 0.5) + " " + wWid + " 0 0 Z"} fill={A} opacity="0.92" stroke={T.ink} strokeWidth="0.5" />
      <line x1="0" y1="0" x2={L * 0.88} y2="0" stroke={T.ink} strokeWidth="0.4" opacity="0.5" />
      <ellipse cx="-3" cy="0" rx="5.5" ry="4" fill="#7a5732" stroke={T.ink} strokeWidth="0.5" />
    </g>
  ); };

  // drifting air: faint traveling sine streamlines flowing left to right
  const wT = windRef.current;
  const streamPts = (yBase, x0, x1, amp, k, sp) => { let out = ""; for (let x = x0; x <= x1; x += 7) { const yy = yBase + amp * Math.sin(k * (x - x0) - wT * sp); out += x.toFixed(1) + "," + yy.toFixed(1) + " "; } return out.trim(); };
  const streams = [
    { y: 78, x0: 150, x1: 300, amp: 5, k: 0.060, sp: 0.0040 },
    { y: 112, x0: 165, x1: 300, amp: 7, k: 0.050, sp: 0.0050 },
    { y: 150, x0: 150, x1: 300, amp: 6, k: 0.055, sp: 0.0045 },
    { y: 192, x0: 170, x1: 300, amp: 8, k: 0.050, sp: 0.0038 },
    { y: 226, x0: 150, x1: 296, amp: 5, k: 0.060, sp: 0.0050 },
  ];

  return (
    <div>
      <Field height={300}>
        <svg viewBox="0 0 480 300" style={{ width: "100%", height: "100%" }}>
          <text x="16" y="24" fill={C} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Drag, lift, and hang time</text>
          <text x="16" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>a spinning wing slows the fall and spreads the seed</text>

          {/* ground */}
          <line x1="24" y1={gy} x2="456" y2={gy} stroke={T.ink} strokeWidth="0.9" />

          {/* below-ground zone strip: region labels live here, never over the leaf or seed */}
          <line x1={shadeX1} y1={gy} x2={shadeX1} y2={gy + 22} stroke={T.rule22} strokeWidth="1" />
          <text x={(shadeX0 + shadeX1) / 2 + 6} y={gy + 16} textAnchor="middle" fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.08 })}>parent shade</text>
          <text x={(shadeX1 + 456) / 2} y={gy + 16} textAnchor="middle" fill={T.ok} style={f.mono(600, 7.5, { upper: true, tracking: 0.08 })}>open, more light</text>

          {/* cast shadow on the ground under the canopy */}
          <ellipse cx={shadeX0 + 56} cy={gy} rx="74" ry="7" fill={C} opacity="0.16" />

          {/* faint shade-edge marker in the air, behind the seed */}
          <line x1={shadeX1} y1={gy} x2={shadeX1} y2="72" stroke={T.mute} strokeWidth="0.8" strokeDasharray="3 5" opacity="0.3" />

          {/* parent tree: tapered trunk, then an opaque layered canopy that hides the trunk top */}
          <path d={"M " + (shadeX0 + 48) + " " + gy + " L " + (shadeX0 + 53) + " 132 L " + (shadeX0 + 61) + " 132 L " + (shadeX0 + 66) + " " + gy + " Z"} fill={bark} />
          <ellipse cx={shadeX0 + 56} cy="96" rx="56" ry="44" fill={leafDark} />
          <ellipse cx={shadeX0 + 34} cy="106" rx="30" ry="26" fill={C} />
          <ellipse cx={shadeX0 + 78} cy="104" rx="30" ry="25" fill={C} />
          <ellipse cx={shadeX0 + 54} cy="84" rx="34" ry="28" fill={leafLight} opacity="0.92" />

          {/* release height line (stops before the force inset) */}
          <line x1={rx} y1={ry} x2="320" y2={ry} stroke={T.ink} strokeWidth="0.5" strokeDasharray="3 4" opacity="0.5" />
          <text x="320" y={ry - 4} textAnchor="end" fill={T.mute} style={f.mono(500, 7.5, { upper: true, tracking: 0.12 })}>release height</text>

          {/* drifting air */}
          {windOn && streams.map((sm, i) => { const pts = streamPts(sm.y, sm.x0, sm.x1, sm.amp, sm.k, sm.sp); const ye = sm.y + sm.amp * Math.sin(sm.k * (sm.x1 - sm.x0) - wT * sm.sp); return (
            <g key={"air" + i} opacity="0.5">
              <polyline points={pts} fill="none" stroke={T.mute} strokeWidth="1.1" strokeLinecap="round" />
              <polygon points={(sm.x1 + 6).toFixed(1) + "," + ye.toFixed(1) + " " + sm.x1.toFixed(1) + "," + (ye - 3).toFixed(1) + " " + sm.x1.toFixed(1) + "," + (ye + 3).toFixed(1)} fill={T.mute} />
            </g>
          ); })}

          {/* helical fall trace */}
          <polyline points={traceRef.current.map((q) => q.x.toFixed(1) + "," + q.y.toFixed(1)).join(" ")} fill="none" stroke={A} strokeWidth="0.8" opacity="0.5" />

          {/* landing marker, drawn before the seed so the seed sits on top */}
          {p.landed && <g><line x1={landX} y1={gy} x2={landX} y2={gy - 14} stroke={beyond ? T.ok : T.warn} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" /><circle cx={landX} cy={gy} r="4.5" fill={beyond ? T.ok : T.warn} stroke={T.paper} strokeWidth="0.8" /></g>}

          {/* the samara */}
          <Seed x={p.x} y={p.y} a={ang} scale={1} />

          {/* force diagram inset (separate box, right) */}
          <rect x={fx - 64} y={fy - 44} width="128" height="126" rx="6" fill={T.paper2} stroke={C} strokeWidth="1" />
          <text x={fx} y={fy - 31} textAnchor="middle" fill={T.mute} style={f.mono(700, 8, { upper: true, tracking: 0.14 })}>forces on the seed</text>
          <Seed x={fx} y={fy + 14} a={20} scale={0.85} />
          <line x1={fx} y1={fy + 14} x2={fx} y2={fy + 14 + wLen} stroke={T.ink} strokeWidth="2" />
          <polygon points={fx + "," + (fy + 16 + wLen) + " " + (fx - 4) + "," + (fy + 8 + wLen) + " " + (fx + 4) + "," + (fy + 8 + wLen)} fill={T.ink} />
          <text x={fx + 7} y={fy + 14 + wLen} fill={T.ink} style={f.mono(600, 7)}>weight</text>
          <line x1={fx} y1={fy + 14} x2={fx} y2={fy + 14 - liftLen} stroke={A} strokeWidth="2.4" />
          <polygon points={fx + "," + (fy + 12 - liftLen) + " " + (fx - 4) + "," + (fy + 20 - liftLen) + " " + (fx + 4) + "," + (fy + 20 - liftLen)} fill={A} />
          <text x={fx + 7} y={fy + 18 - liftLen} fill={A} style={f.mono(600, 7)}>lift</text>
          <text x={fx} y={fy + 70} textAnchor="middle" fill={T.mute} style={f.mono(600, 6.5, { upper: true, tracking: 0.06 })}>net fall: {fallLbl}</text>
        </svg>
      </Field>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={wing} set={setWing} min={3} max={12} step={1} color={A} label="Wing area" suffix={wing} />
        <Btn small icon={Wind} active={windOn} color={C} onClick={() => setWindOn((w) => !w)}>wind</Btn>
        <Btn small icon={Play} color={A} onClick={reset}>drop seed</Btn>
      </div>

      <Readout items={[
        { l: "Wing area", v: wing + " / 12", color: A },
        { l: "Fall speed", v: fallLbl, color: C },
        { l: "Hang time", v: hang.toFixed(2) + " s" },
        { l: "Dispersal", v: p.landed ? (beyond ? "beyond shade" : "in shade") : "falling", color: p.landed ? (beyond ? T.ok : T.warn) : T.mute },
      ]} />

      <Caption color={C}>
        A maple samara does not just drop; the offset wing makes it autorotate, and the spinning wing
        generates lift that pushes up against gravity. With lift opposing weight the seed reaches a low
        terminal velocity, so it falls slowly and stays aloft long enough for even a light breeze to
        carry it past the shade of its parent, where there is light to grow. More wing area for the
        same seed mass means more lift, a slower fall, and a longer hang time.
      </Caption>
    </div>
  );
}

export { DemoSamara };
