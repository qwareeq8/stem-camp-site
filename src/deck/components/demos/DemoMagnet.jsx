// DemoMagnet component for the STEM Camp interactive deck.
import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { usePointerDrag, useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider, Tag } from "../../ui/primitives.jsx";

function DemoMagnet() {
  // PYS-01 "Remote actuation" (concept 1). Sibling ExtraPathPlan (concept 2) owns
  // the maze, the planned route, and the speed-vs-wall-touches tradeoff. This demo
  // owns the physics of contactless control: a body wall (barrier) splits outside
  // from inside; you DRAG the magnet on the outside and a steel capsule camera on
  // the inside follows it, pinned against the wall, never touching the magnet. The
  // field reaches through the barrier and the pull falls off as ~1/r^2, so far away
  // it is too weak to steer. Drag uses the letterbox mapping and stable handlers.
  const A = CAMP.pystem.acc, ink = CAMP.pystem.ink;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const [strength, setStrength] = useState(6);
  const [, force] = useState(0);
  const stage = useRef(null);

  // ----- bounded geometry -----
  const VBW = 500, VBH = 300;
  const arenaX0 = 12, arenaX1 = 488, arenaY0 = 46, arenaY1 = 278;
  const wallL = 242, wallR = 256, wallCx = (wallL + wallR) / 2;
  const MX0 = 46, MX1 = wallL - 22, MY0 = 74, MY1 = 250;      // magnet center clamp (outside)
  const innerX = wallR + 18;                                   // capsule rest x just inside wall

  const magRef = useRef({ x: 120, y: 150 });
  const capRef = useRef({ x: innerX, y: 150 });
  const strengthRef = useRef(strength); useEffect(() => { strengthRef.current = strength; }, [strength]);

  // ----- letterbox-correct pointer -> viewBox, stable handlers -----
  const toVB = (x, y, w, h) => { const sc = Math.min(w / VBW, h / VBH); return { ux: (x - (w - VBW * sc) / 2) / sc, uy: (y - (h - VBH * sc) / 2) / sc }; };
  const moveImpl = ({ x, y, w, h }) => { const { ux, uy } = toVB(x, y, w, h); magRef.current = { x: cl(ux, MX0, MX1), y: cl(uy, MY0, MY1) }; force((n) => (n + 1) % 1000000); };
  const moveRef = useRef(moveImpl); moveRef.current = moveImpl;
  const onMove = useRef((a) => moveRef.current(a)).current;
  usePointerDrag(stage, onMove);

  // ----- capsule follows: pulled toward magnet, blocked by wall, eases by grip -----
  useRAF(true, (dt) => {
    const m = magRef.current, c = capRef.current;
    const r = Math.max(24, Math.hypot(c.x - m.x, c.y - m.y));
    const pull = strengthRef.current * 9000 / (r * r);
    const gripN = cl((pull - 2) / 12, 0, 1);
    const ease = Math.min(1, (0.02 + gripN * 0.26) * (dt / 16));
    const tx = innerX + (1 - gripN) * 52;                      // weak pull: drifts deeper inside
    const ty = cl(m.y, MY0 - 2, MY1 + 2);
    capRef.current = { x: cl(c.x + (tx - c.x) * ease, innerX, 440), y: c.y + (ty - c.y) * ease };
    force((n) => (n + 1) % 1000000);
  });

  const reset = () => { magRef.current = { x: 120, y: 150 }; capRef.current = { x: innerX, y: 150 }; force((n) => (n + 1) % 1000000); };

  // ----- derived -----
  const m = magRef.current, c = capRef.current;
  const r = Math.hypot(c.x - m.x, c.y - m.y);
  const pull = strength * 9000 / (Math.max(24, r) ** 2);
  const grip = pull >= 10 ? "locked" : pull >= 3 ? "steering" : "too weak";
  const gripC = pull >= 10 ? T.ok : pull >= 3 ? A : T.warn;
  const badgeW = grip.length * 5.6 + 12;
  const nLoops = 3 + Math.round(strength / 3), magHalf = 17, vyMax = Math.min(58, m.y - 50, 274 - m.y), hxMax = 34 + strength * 7;

  return (
    <div>
      <Field height={310}>
        <div ref={stage} style={{ position: "absolute", inset: 0, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: "grab" }}>
          <svg viewBox={"0 0 " + VBW + " " + VBH} style={{ width: "100%", height: "100%" }}>
            {/* ===== header ===== */}
            <text x="16" y="24" fill={ink} style={f.mono(700, 12, { upper: true, tracking: 0.12 })}>Remote actuation</text>
            <text x="16" y="38" fill={T.mute} style={f.mono(500, 9, { upper: true, tracking: 0.16 })}>steer steel through a wall, no contact</text>

            {/* ===== arena ===== */}
            <rect x={arenaX0} y={arenaY0} width={arenaX1 - arenaX0} height={arenaY1 - arenaY0} rx="12" fill={T.paper3} opacity="0.3" stroke={T.ink} strokeWidth="0.8" />
            <rect x={wallR} y={arenaY0} width={arenaX1 - wallR} height={arenaY1 - arenaY0} rx="0" fill={A} opacity="0.05" />
            <text x={(arenaX0 + wallL) / 2} y={62} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>outside the body</text>
            <text x={(wallR + arenaX1) / 2} y={62} textAnchor="middle" fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.14 })}>inside the body</text>

            {/* ===== body wall (barrier) ===== */}
            <rect x={wallL} y={arenaY0 + 6} width={wallR - wallL} height={arenaY1 - arenaY0 - 12} fill={T.paper2} stroke={T.ink} strokeWidth="1" />
            {Array.from({ length: 11 }, (_, i) => <line key={"hatch" + i} x1={wallL} y1={arenaY0 + 14 + i * 20} x2={wallR} y2={arenaY0 + 6 + i * 20} stroke={T.ink} strokeWidth="0.6" opacity="0.4" />)}
            <text x={wallCx} y={292} textAnchor="middle" fill={ink} style={f.mono(700, 8, { upper: true, tracking: 0.12 })}>body wall (barrier)</text>

            {/* ===== field lines (cross the wall) ===== */}
            {Array.from({ length: nLoops }, (_, k) => { const t = (k + 1) / nLoops, vy = t * vyMax, hx = t * hxMax, nxp = m.x + magHalf, sxp = m.x - magHalf; const d = "M " + nxp + " " + m.y + " C " + (nxp + hx) + " " + (m.y - vy) + " " + (sxp - hx) + " " + (m.y - vy) + " " + sxp + " " + m.y + " C " + (sxp - hx) + " " + (m.y + vy) + " " + (nxp + hx) + " " + (m.y + vy) + " " + nxp + " " + m.y + " Z"; return <path key={"fl" + k} d={d} fill="none" stroke={A} strokeWidth={cl(0.6 + strength * 0.07, 0.6, 1.4)} opacity={cl(0.46 - t * 0.3, 0.1, 0.46) * (0.6 + strength * 0.04)} />; })}

            {/* ===== field reach / pull line magnet -> capsule (through wall) ===== */}
            <line x1={m.x} y1={m.y} x2={c.x} y2={c.y} stroke={A} strokeWidth={cl(pull * 0.12, 0.8, 3.2)} strokeDasharray="2 3" opacity="0.7" />
            

            {/* ===== capsule camera (steel, inside) ===== */}
            <g transform={"translate(" + c.x.toFixed(1) + " " + c.y.toFixed(1) + ")"}>
              <rect x="-11" y="-6" width="22" height="12" rx="6" fill="#c2c2c2" stroke={T.ink} strokeWidth="0.8" />
              <path d="M -11 -6 A 6 6 0 0 0 -11 6 Z" fill={ink} opacity="0.85" />
              <circle cx="-8" cy="0" r="2.2" fill={A} />
              <circle cx="-8" cy="0" r="1" fill={T.paper} />
              <text x="4" y="2.5" textAnchor="middle" fill={T.ink} style={f.mono(700, 7)}>Fe</text>
            </g>
            <g transform={"translate(" + c.x.toFixed(1) + " " + (c.y - 18).toFixed(1) + ")"}>
              <rect x={-badgeW / 2} y="-8" width={badgeW} height="13" rx="3" fill={T.paper} stroke={gripC} strokeWidth="1" />
              <text x="0" y="1" textAnchor="middle" fill={gripC} style={f.mono(700, 8, { upper: true, tracking: 0.08 })}>{grip}</text>
            </g>
            <text x={c.x} y={c.y + 17} textAnchor="middle" fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.1 })}>capsule</text>

            {/* ===== magnet (outside, draggable) ===== */}
            <g transform={"translate(" + m.x.toFixed(1) + " " + m.y.toFixed(1) + ")"}>
              <rect x="-8" y="-18" width="16" height="5" rx="2" fill={T.ink} opacity="0.55" />
              <rect x="-17" y="-12" width="34" height="24" rx="3" fill={ink} stroke={T.ink} strokeWidth="0.8" />
              <rect x="0" y="-12" width="17" height="24" rx="3" fill={A} />
              <text x="-8" y="4" textAnchor="middle" fill={T.paper} style={f.mono(700, 9, { upper: true })}>S</text>
              <text x="8" y="4" textAnchor="middle" fill={T.paper} style={f.mono(700, 9, { upper: true })}>N</text>
            </g>
            <text x={m.x} y={m.y - 24} textAnchor="middle" fill={ink} style={f.mono(700, 7.5, { upper: true, tracking: 0.1 })}>magnet</text>

            {/* montage probes (invisible) */}
            <circle data-mag="1" cx={m.x} cy={m.y} r="0" />
            <circle data-cap="1" cx={c.x} cy={c.y} r="0" />
            {/* ===== no-contact note ===== */}
            <text x={arenaX0 + 12} y={arenaY1 - 8} fill={T.mute} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>magnet never touches the capsule</text>
          </svg>
        </div>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={strength} set={setStrength} min={1} max={10} step={1} color={A} label="Magnet strength" suffix={strength} />
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
        <div style={{ flex: 1 }} />
        <Tag color={gripC}>{grip}</Tag>
      </div>

      <Readout items={[
        { l: "Gap", v: r.toFixed(0) + " px", color: A },
        { l: "Pull (1/r^2)", v: pull.toFixed(1), color: ink },
        { l: "Grip", v: grip, color: gripC },
        { l: "Contact", v: "none" },
      ]} />

      <Caption color={ink}>
        The magnet stays outside the body wall and never touches the capsule, yet its field reaches
        through the barrier and pulls the steel capsule along. Drag the magnet and the capsule follows
        on the far side of the wall. The pull falls off as roughly 1/r^2, so up close the grip is
        firm and you can steer, but far away the field is too weak and the capsule drifts and lags.
        This is how doctors guide a swallowed capsule camera through the gut from outside the body.
      </Caption>
    </div>
  );
}

export { DemoMagnet };
