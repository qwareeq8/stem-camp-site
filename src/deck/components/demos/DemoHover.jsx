// DemoHover component for the STEM Camp interactive deck.
import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { usePointerDrag, useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider, Tag } from "../../ui/primitives.jsx";

function DemoHover() {
  // PYS-09 "Air cushion cuts friction" (concept 1). Sibling ExtraGlide covers
  // GLIDE vs CONTROL (concept 2: a side-on lane plus a lift-tradeoff chart). This
  // demo is the interactive top-down rink: GRAB the hovercraft puck and flick it.
  // A thicker air cushion (slider) lifts the CD-disc higher, so sliding friction
  // nearly vanishes and the same flick glides much farther and bounces longer. A
  // faded "cushion off" ghost shows where the identical flick would stop with the
  // disc scraping the table, and a live speed-decay sparkline shows how slowly the
  // speed bleeds away at high lift. Drag uses letterbox-corrected coordinates and
  // stable handlers, so it tracks at any size or zoom.
  const VBW = 460, VBH = 300;
  const ink = CAMP.pystem.ink, A = CAMP.pystem.acc;
  const DISC = "#cdcdcd", DISC_DK = "#9a9a9a";
  const stage = useRef(null);

  const [lift, setLift] = useState(7);
  const [held, setHeld] = useState(false);
  const [score, setScore] = useState(0);
  const [glide, setGlide] = useState(0);
  const [, force] = useState(0);
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));

  // ----- bounded zones -----
  const RX0 = 14, RY0 = 48, RX1 = 446, RY1 = 264;     // rink rect
  const BX0 = 34, BX1 = 426, BY0 = 74, BY1 = 246;     // puck-center play bounds
  const START = { x: 66, y: 160 };
  const target = { x: 360, y: 150, r: 17 };
  const spX = 300, spY = 8, spW = 146, spH = 32;       // speed-decay card

  // ----- refs: stable drag + latest values for the animation loop -----
  const puckRef = useRef({ x: START.x, y: START.y, vx: 0, vy: 0 });
  const liftRef = useRef(lift); useEffect(() => { liftRef.current = lift; }, [lift]);
  const heldRef = useRef(false), draggingRef = useRef(false), grabbedRef = useRef(false);
  const lastPtRef = useRef({ x: 0, y: 0 }), velRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef([]), ghostRef = useRef(null), histRef = useRef([]);
  const glideAccRef = useRef(0), hitRef = useRef(false), hitFlashRef = useRef(-1e9);
  const phaseRef = useRef(0);

  // ----- letterbox-correct pointer (px in element) -> viewBox coords -----
  const toVB = (x, y, w, h) => { const sc = Math.min(w / VBW, h / VBH); return { ux: (x - (w - VBW * sc) / 2) / sc, uy: (y - (h - VBH * sc) / 2) / sc }; };

  // ----- "cushion off" ghost: same flick, disc scraping the table (high friction) -----
  const simGhost = (x0, y0, vx0, vy0) => {
    const pts = [[x0, y0]];
    let x = x0, y = y0, vx = vx0, vy = vy0;
    for (let i = 0; i < 260; i++) {
      vx *= 0.8; vy *= 0.8;
      x += vx; y += vy;
      if (x < BX0) { x = BX0; vx = -vx * 0.45; } if (x > BX1) { x = BX1; vx = -vx * 0.45; }
      if (y < BY0) { y = BY0; vy = -vy * 0.45; } if (y > BY1) { y = BY1; vy = -vy * 0.45; }
      pts.push([x, y]);
      if (Math.hypot(vx, vy) < 0.25) break;
    }
    return pts;
  };

  const moveImpl = ({ x, y, w, h }) => {
    const { ux, uy } = toVB(x, y, w, h);
    if (!draggingRef.current) {                 // first call of a gesture = grab
      draggingRef.current = true;
      const p = puckRef.current;
      const near = Math.hypot(ux - p.x, uy - p.y) <= 46;
      grabbedRef.current = near;
      if (near) {
        heldRef.current = true; setHeld(true);
        lastPtRef.current = { x: ux, y: uy }; velRef.current = { x: 0, y: 0 };
        trailRef.current = []; ghostRef.current = null; histRef.current = [];
        glideAccRef.current = 0; hitRef.current = false;
        puckRef.current = { x: p.x, y: p.y, vx: 0, vy: 0 };
      }
      return;
    }
    if (grabbedRef.current) {                    // subsequent moves = carry the puck
      const last = lastPtRef.current;
      velRef.current = { x: velRef.current.x * 0.35 + (ux - last.x) * 0.65, y: velRef.current.y * 0.35 + (uy - last.y) * 0.65 };
      lastPtRef.current = { x: ux, y: uy };
      puckRef.current = { x: cl(ux, BX0, BX1), y: cl(uy, BY0, BY1), vx: 0, vy: 0 };
      force((n) => (n + 1) % 1000000);
    }
  };
  const upImpl = () => {
    draggingRef.current = false;
    if (!grabbedRef.current) return;
    grabbedRef.current = false; heldRef.current = false; setHeld(false);
    const cap = 16, v = velRef.current;
    const vx = cl(v.x, -cap, cap), vy = cl(v.y, -cap, cap);
    const p = puckRef.current;
    puckRef.current = { x: p.x, y: p.y, vx, vy };
    ghostRef.current = (Math.hypot(vx, vy) > 0.4) ? simGhost(p.x, p.y, vx, vy) : null;
    glideAccRef.current = 0; hitRef.current = false; histRef.current = [];
  };
  const moveRef = useRef(moveImpl); moveRef.current = moveImpl;
  const upRef = useRef(upImpl); upRef.current = upImpl;
  const onMove = useRef((a) => moveRef.current(a)).current;   // stable identity
  const onUp = useRef(() => upRef.current()).current;
  usePointerDrag(stage, onMove, onUp);

  useRAF(true, (dt) => {
    phaseRef.current += dt;
    if (!heldRef.current) {
      const p = puckRef.current;
      if (Math.hypot(p.vx, p.vy) >= 0.04) {
        const fr = dt / 16;
        const decay = Math.pow(1 - (11 - liftRef.current) * 0.0045, fr);
        let vx = p.vx * decay, vy = p.vy * decay;
        let x = p.x + vx * fr, y = p.y + vy * fr;
        if (x < BX0) { x = BX0; vx = -vx * 0.82; } if (x > BX1) { x = BX1; vx = -vx * 0.82; }
        if (y < BY0) { y = BY0; vy = -vy * 0.82; } if (y > BY1) { y = BY1; vy = -vy * 0.82; }
        glideAccRef.current += Math.hypot(x - p.x, y - p.y);
        const tr = trailRef.current; tr.push({ x, y }); if (tr.length > 42) tr.shift();
        const hs = histRef.current; hs.push(Math.hypot(vx, vy)); if (hs.length > 80) hs.shift();
        const sp = Math.hypot(vx, vy);
        if (Math.hypot(x - target.x, y - target.y) < target.r && !hitRef.current && sp < 0.7) {
          hitRef.current = true; hitFlashRef.current = phaseRef.current; setScore((s) => s + 1);
        }
        if (sp < 0.05) setGlide(Math.round(glideAccRef.current));
        puckRef.current = { x, y, vx, vy };
      }
    }
    force((n) => (n + 1) % 1000000);
  });

  const reset = () => { trailRef.current = []; ghostRef.current = null; histRef.current = []; glideAccRef.current = 0; hitRef.current = false; puckRef.current = { x: START.x, y: START.y, vx: 0, vy: 0 }; setGlide(0); };

  // ---- derived (render runs every animation tick; read latest refs) ----
  const p = puckRef.current;
  const speed = Math.hypot(p.vx, p.vy);
  const fricLabel = lift >= 8 ? "very low" : lift >= 5 ? "low" : lift >= 3 ? "medium" : "high";
  const cushionR = 14 + lift * 1.0;            // air-cushion halo grows with lift
  const shadowR = Math.max(5, 16 - lift * 0.8); // contact shadow shrinks as lift rises
  const shadowOp = Math.max(0.04, 0.2 - lift * 0.013);
  const phase = phaseRef.current;

  // escaping-air ticks (radial, top-down); length/opacity scale with lift
  const jetN = 12;
  const jets = Array.from({ length: jetN }, (_, i) => {
    const ang = (i / jetN) * Math.PI * 2, ca = Math.cos(ang), sa = Math.sin(ang);
    const puff = 0.5 + 0.5 * Math.sin(phase * 0.012 + i * 1.7);
    const r0 = 13, len = 3 + lift * 0.9 * (0.45 + 0.55 * puff);
    return { x1: p.x + ca * r0, y1: p.y + sa * r0, x2: p.x + ca * (r0 + len), y2: p.y + sa * (r0 + len), op: cl(0.16 + lift * 0.03 * puff, 0, 0.6) };
  });

  // speed-decay sparkline
  const hist = histRef.current;
  const plX = spX + 8, plX2 = spX + spW - 8, plYt = spY + 14, plYb = spY + spH - 5;
  const sparkPts = hist.length > 1 ? hist.map((s, i) => (plX + (i / (hist.length - 1)) * (plX2 - plX)).toFixed(1) + "," + (plYb - cl(s / 16, 0, 1) * (plYb - plYt)).toFixed(1)).join(" ") : "";
  const lastH = hist.length ? cl(hist[hist.length - 1] / 16, 0, 1) : 0;

  // ghost path + stop marker
  const gp = ghostRef.current;
  const ghostPts = gp ? gp.map((q) => q[0].toFixed(1) + "," + q[1].toFixed(1)).join(" ") : "";
  const ghostStop = gp ? gp[gp.length - 1] : null;

  // target hit flash
  const sinceHit = phase - hitFlashRef.current;
  const hitOn = hitFlashRef.current > 0 && sinceHit < 800;
  const hitT = hitOn ? sinceHit / 800 : 0;

  // light table texture (dot grid), built once
  const texture = useMemo(() => {
    const a = [];
    for (let gx = RX0 + 18; gx < RX1 - 6; gx += 26) for (let gy = RY0 + 16; gy < RY1 - 6; gy += 26) a.push(<circle key={"d" + gx + "_" + gy} cx={gx} cy={gy} r="0.8" fill={ink} opacity="0.07" />);
    return a;
  }, []);

  return (
    <div>
      <Field height={300}>
        <div ref={stage} style={{ position: "absolute", inset: 0, touchAction: "none", userSelect: "none", WebkitUserSelect: "none", cursor: held ? "grabbing" : "grab" }}>
          <svg viewBox={"0 0 " + VBW + " " + VBH} style={{ width: "100%", height: "100%" }}>
            {/* ===== header ===== */}
            <text x="14" y="24" fill={ink} style={f.mono(700, 12, { upper: true, tracking: 0.1 })}>Air cushion cuts friction</text>

            {/* speed-decay sparkline card */}
            <rect x={spX} y={spY} width={spW} height={spH} rx="5" fill={T.paper2} stroke={ink} strokeWidth="0.8" opacity="0.95" />
            <text x={spX + 8} y={spY + 10} fill={T.mute} style={f.mono(600, 7, { upper: true, tracking: 0.14 })}>speed decay</text>
            <line x1={plX} y1={plYb} x2={plX2} y2={plYb} stroke={T.rule22} strokeWidth="0.6" />
            {sparkPts && <polyline points={sparkPts} fill="none" stroke={A} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />}
            {hist.length > 0 && <circle cx={plX2} cy={plYb - lastH * (plYb - plYt)} r="1.6" fill={A} />}

            {/* ===== rink floor + texture ===== */}
            <rect x={RX0} y={RY0} width={RX1 - RX0} height={RY1 - RY0} rx="7" fill={T.paper3} opacity="0.32" stroke={T.ink} strokeWidth="0.8" />
            {texture}

            {/* ===== target ===== */}
            {hitOn && <circle cx={target.x} cy={target.y} r={target.r} fill={A} opacity={0.14 * (1 - hitT)} />}
            <circle cx={target.x} cy={target.y} r={target.r} fill="none" stroke={ink} strokeWidth="1.4" strokeDasharray="2 3" />
            <circle cx={target.x} cy={target.y} r={target.r * 0.55} fill="none" stroke={ink} strokeWidth="0.8" opacity="0.5" />
            <circle cx={target.x} cy={target.y} r="2.2" fill={ink} />
            <text x={target.x} y={target.y - target.r - 5} textAnchor="middle" fill={ink} style={f.mono(600, 8.5, { upper: true, tracking: 0.12 })}>target</text>
            {hitOn && <circle cx={target.x} cy={target.y} r={target.r + hitT * 22} fill="none" stroke={A} strokeWidth={1.6 * (1 - hitT)} opacity={0.85 * (1 - hitT)} />}
            {hitOn && <text x={target.x} y={target.y + target.r + 14} textAnchor="middle" fill={A} opacity={1 - hitT} style={f.mono(700, 8.5, { upper: true, tracking: 0.14 })}>on target</text>}

            {/* ===== cushion-off ghost path (same flick, high friction) ===== */}
            {ghostPts && <polyline points={ghostPts} fill="none" stroke={DISC_DK} strokeWidth="1.4" strokeDasharray="3 3" opacity="0.7" />}
            {ghostStop && (
              <g opacity="0.78">
                <circle cx={ghostStop[0]} cy={ghostStop[1]} r="4.5" fill="none" stroke={DISC_DK} strokeWidth="1.1" />
                <line x1={ghostStop[0] - 3} y1={ghostStop[1] - 3} x2={ghostStop[0] + 3} y2={ghostStop[1] + 3} stroke={DISC_DK} strokeWidth="1.1" />
                <line x1={ghostStop[0] - 3} y1={ghostStop[1] + 3} x2={ghostStop[0] + 3} y2={ghostStop[1] - 3} stroke={DISC_DK} strokeWidth="1.1" />
                <text x={ghostStop[0]} y={ghostStop[1] - 8} textAnchor="middle" fill={DISC_DK} style={f.mono(600, 7.5, { upper: true, tracking: 0.1 })}>cushion off</text>
              </g>
            )}

            {/* ===== live glide trail ===== */}
            {trailRef.current.map((pt, i) => (<circle key={"tr" + i} cx={pt.x} cy={pt.y} r="2.3" fill={A} opacity={(i / trailRef.current.length) * 0.45} />))}

            {/* ===== hovercraft puck (top-down): shadow, cushion halo, escaping air, CD disc, balloon ===== */}
            <ellipse cx={p.x} cy={p.y + 2} rx={shadowR} ry={shadowR * 0.62} fill="#000" opacity={shadowOp} />
            <circle cx={p.x} cy={p.y} r={cushionR} fill={A} opacity="0.12" />
            <circle cx={p.x} cy={p.y} r={cushionR} fill="none" stroke={A} strokeWidth="0.8" opacity="0.3" />
            {jets.map((j, i) => <line key={"j" + i} x1={j.x1} y1={j.y1} x2={j.x2} y2={j.y2} stroke={A} strokeWidth="1.2" opacity={j.op} strokeLinecap="round" />)}
            <circle data-puck="disc" cx={p.x} cy={p.y} r="13" fill={DISC} stroke={T.ink} strokeWidth="0.9" />
            <circle cx={p.x} cy={p.y} r="13" fill="none" stroke={DISC_DK} strokeWidth="0.6" opacity="0.7" />
            <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={DISC_DK} strokeWidth="0.5" opacity="0.5" />
            <circle cx={p.x} cy={p.y} r="9.5" fill={A} opacity="0.9" />
            <circle cx={p.x} cy={p.y} r="9.5" fill="none" stroke={T.ink} strokeWidth="0.5" opacity="0.5" />
            <ellipse cx={p.x - 3} cy={p.y - 3.2} rx="3" ry="2" fill="#ffffff" opacity="0.55" />
            <circle cx={p.x} cy={p.y} r="2.4" fill={T.paper} stroke={T.ink} strokeWidth="0.6" />
            {held && <circle cx={p.x} cy={p.y} r="22" fill="none" stroke={A} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.85" />}

            {/* ===== footer: friction legend + helper ===== */}
            <line x1="16" y1="282" x2="32" y2="282" stroke={A} strokeWidth="2.4" strokeLinecap="round" />
            <text x="37" y="285" fill={T.mute} style={f.mono(600, 8, { tracking: 0.03 })}>cushion on: long glide</text>
            <line x1="16" y1="293" x2="32" y2="293" stroke={DISC_DK} strokeWidth="1.4" strokeDasharray="3 3" />
            <text x="37" y="296" fill={T.mute} style={f.mono(600, 8, { tracking: 0.03 })}>cushion off: stops fast</text>
            <text x="446" y="290" textAnchor="end" fill={ink} style={f.mono(700, 9, { upper: true, tracking: 0.1 })}>{held ? "release to throw" : "grab the puck and flick it"}</text>
          </svg>
        </div>
      </Field>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", padding: "0 4px" }}>
        <Slider val={lift} set={setLift} min={1} max={10} step={1} color={A} label="Air cushion" suffix={lift + " / 10"} />
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
        <div style={{ flex: 1 }} />
        <Tag color={ink}>hits {score}</Tag>
      </div>

      <Readout items={[
        { l: "Speed", v: speed.toFixed(1), color: A },
        { l: "Air cushion", v: lift + " / 10", color: ink },
        { l: "Friction", v: fricLabel },
        { l: "Last glide", v: glide + " px" },
      ]} />

      <Caption color={ink}>
        A balloon pushes air down through the hole in the disc, lifting it on a thin cushion so it
        barely touches the table. With almost no contact, sliding friction nearly vanishes and only a
        small aerodynamic drag remains, so the same flick glides far and each wall bounce takes a long
        time to die out, just as Newton's first law predicts. The faded "cushion off" path shows where
        the identical flick would stop with the disc scraping the table, and the speed-decay readout
        shows how slowly the speed bleeds away when the cushion is thick.
      </Caption>
    </div>
  );
}

export { DemoHover };
