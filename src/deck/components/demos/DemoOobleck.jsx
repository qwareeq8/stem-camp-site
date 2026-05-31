// DemoOobleck component for the STEM Camp interactive deck.
import { useMemo, useRef, useState } from "react";
import { CAMP, T, f } from "../../theme.js";
import { usePointerDrag, useRAF } from "../../ui/hooks.js";
import { Caption, Field, Readout } from "../../ui/primitives.jsx";

function DemoOobleck() {
  // PYS-02 "Shear-thickening fluids" (concept 1). Sibling (Material efficiency)
  // is the least-material optimization. This demo owns the physics: press slowly
  // and the grains flow so your finger sinks (liquid); shear fast and the grains
  // jam into a solid that resists and even cracks. The viscosity-vs-shear strip
  // shows the defining behavior: resistance rises with shear rate. PY-STEM navy
  // and copper. Drag uses the letterbox mapping and stable handlers (6.1, 6.2).
  const C = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const VBW = 460, VBH = 280, stage = useRef(null);
  const [, force] = useState(0);
  const posRef = useRef({ x: 230, y: 120, active: false });
  const velRef = useRef(0);
  const prevRef = useRef({ x: 230, y: 120, t: 0 });
  const cracksRef = useRef([]); const idRef = useRef(0); const lastCrackRef = useRef(0);

  const particles = useMemo(() => { const out = []; for (let i = 0; i < 22; i++) for (let j = 0; j < 11; j++) out.push({ x: 32 + i * 18 + (j % 2 ? 7 : 0), y: 38 + j * 16 }); return out; }, []);

  const toVB = (x, y, w, h) => { const sc = Math.min(w / VBW, h / VBH); return { ux: (x - (w - VBW * sc) / 2) / sc, uy: (y - (h - VBH * sc) / 2) / sc }; };
  const moveImpl = ({ x, y, w, h }) => {
    let { ux, uy } = toVB(x, y, w, h); ux = cl(ux, 22, 438); uy = cl(uy, 30, 206); const now = performance.now();
    const dt = Math.max(8, now - prevRef.current.t), dx = ux - prevRef.current.x, dy = uy - prevRef.current.y;
    const v = Math.hypot(dx, dy) / dt * 1000;
    velRef.current = velRef.current * 0.7 + v * 0.3;
    posRef.current = { x: ux, y: uy, active: true };
    if (v > 1100 && now - lastCrackRef.current > 110) { cracksRef.current = [...cracksRef.current.slice(-4), { x: ux, y: uy, a: Math.atan2(dy, dx), id: idRef.current++, born: now }]; lastCrackRef.current = now; }
    prevRef.current = { x: ux, y: uy, t: now }; force((n) => (n + 1) % 1000000);
  };
  const moveRef = useRef(moveImpl); moveRef.current = moveImpl;
  const onMove = useRef((a) => moveRef.current(a)).current;
  const onUp = useRef(() => { posRef.current = { ...posRef.current, active: false }; force((n) => (n + 1) % 1000000); }).current;
  usePointerDrag(stage, onMove, onUp);

  useRAF(true, (dt) => { velRef.current *= Math.exp(-dt / 240); const now = performance.now(); cracksRef.current = cracksRef.current.filter((c) => now - c.born < 700); force((n) => (n + 1) % 1000000); });

  const vel = velRef.current, pos = posRef.current, stiff = vel > 1100;
  const state = vel > 1100 ? "solid" : vel > 350 ? "thickening" : "liquid";
  const stateC = vel > 1100 ? A : vel > 350 ? C : T.mute;
  const viscFn = (s) => cl(1 + Math.pow(s / 300, 1.7), 1, 14);
  const visc = viscFn(vel);
  const trayY0 = 22, trayY1 = 214, gx0 = 20, gx1 = 440, gy0 = 230, gy1 = 262;
  const sxp = (s) => gx0 + cl(s / 1400, 0, 1) * (gx1 - gx0);
  const vyp = (vv) => gy1 - (vv / 14) * (gy1 - gy0);
  const curve = []; for (let s = 0; s <= 1400; s += 70) curve.push(sxp(s).toFixed(1) + "," + vyp(viscFn(s)).toFixed(1));

  return (
    <div>
      <Field height={290}>
        <div ref={stage} style={{ position: "absolute", inset: 0, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: pos.active ? "grabbing" : "grab" }}>
          <svg viewBox={"0 0 " + VBW + " " + VBH} style={{ width: "100%", height: "100%" }}>
            <text x="16" y="16" fill={C} style={f.mono(700, 11, { upper: true, tracking: 0.1 })}>Shear-thickening fluid</text>
            <text x="444" y="16" textAnchor="end" fill={stateC} style={f.mono(700, 10, { upper: true, tracking: 0.12 })}>{state}</text>

            {/* tray */}
            <rect x="14" y={trayY0} width="432" height={trayY1 - trayY0} rx="4" fill={T.paper3} opacity="0.5" stroke={T.ink} strokeWidth="0.7" />

            {/* particles */}
            {particles.map((p, i) => {
              const dx = pos.x - p.x, dy = pos.y - p.y, d = Math.hypot(dx, dy);
              const push = Math.max(0, 36 - d) * (stiff ? 0.05 : vel > 350 ? 0.18 : 0.36);
              const ang = Math.atan2(dy, dx);
              const r = stiff ? 4.4 : vel > 350 ? 3.7 : 3.0;
              const col = stiff ? C : vel > 350 ? "#3f5a82" : T.mute;
              return <circle key={i} cx={p.x - Math.cos(ang) * push} cy={p.y - Math.sin(ang) * push} r={r} fill={col} opacity={pos.y > trayY1 - 6 ? 0.5 : 0.9} />;
            })}

            {/* slow dimple */}
            {!stiff && pos.active && pos.y < trayY1 && <ellipse cx={pos.x} cy={pos.y + 7} rx={Math.max(6, 28 - vel * 0.006)} ry="6" fill={C} opacity="0.16" />}

            {/* cracks (fast shear) */}
            {cracksRef.current.map((c) => { const age = (performance.now() - c.born) / 700; const ease = 1 - Math.pow(1 - Math.min(1, age * 2.4), 3); const len = 16 + ease * 74; const ex = cl(c.x + Math.cos(c.a + 0.4) * len, 18, 442); const ey = cl(c.y + Math.sin(c.a + 0.4) * len, trayY0 + 2, trayY1 - 2); return <line key={c.id} x1={c.x} y1={c.y} x2={ex} y2={ey} stroke={A} strokeWidth="1.4" opacity={1 - age} />; })}

            {/* finger */}
            {pos.active && pos.y < trayY1 && <g transform={"translate(" + pos.x.toFixed(1) + " " + pos.y.toFixed(1) + ")"} style={{ pointerEvents: "none" }}><circle r="14" fill={T.paper} stroke={T.ink} strokeWidth="1.2" opacity="0.92" /><circle r="3" fill={stiff ? A : C} /></g>}

            <text x="20" y={trayY0 + 12} fill={T.mute} style={f.mono(600, 8, { upper: true, tracking: 0.12 })}>press slow to sink, flick fast to jam</text>

            {/* viscosity vs shear strip */}
            <line x1={gx0} y1={gy1} x2={gx1} y2={gy1} stroke={T.rule22} strokeWidth="0.7" />
            <polyline points={curve.join(" ")} fill="none" stroke={A} strokeWidth="2" />
            <line x1={sxp(vel)} y1={gy0 - 4} x2={sxp(vel)} y2={gy1} stroke={C} strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <circle cx={sxp(vel)} cy={vyp(visc)} r="3.4" fill={A} stroke={T.paper} strokeWidth="1.1" />
            <text x={gx0} y={gy0 - 6} fill={T.mute} style={f.mono(700, 7.5, { upper: true, tracking: 0.12 })}>viscosity vs shear rate</text>
            <text x={gx1} y={gy1 + 12} textAnchor="end" fill={T.mute} style={f.mono(500, 7, { upper: true, tracking: 0.1 })}>faster shear</text>
          </svg>
        </div>
      </Field>

      <Readout items={[
        { l: "Shear rate", v: vel.toFixed(0) + " px/s", color: C },
        { l: "State", v: state, color: stateC },
        { l: "Resistance", v: Math.round(cl(visc / 14 * 100, 0, 100)) + "%", color: A },
        { l: "Grains", v: stiff ? "jammed" : vel > 350 ? "locking" : "free" },
      ]} />

      <Caption color={C}>
        Oobleck is cornstarch grains suspended in water. Press slowly and the grains have time to slide
        past each other, so the mix flows like a liquid and your finger sinks in. Shear it fast and the
        grains cannot get out of the way in time, so they jam together into a solid that resists the
        push and can even crack. Its viscosity rises with how fast you shear it, which is exactly how
        shear-thickening impact armor stiffens on a hit.
      </Caption>
    </div>
  );
}

export { DemoOobleck };
