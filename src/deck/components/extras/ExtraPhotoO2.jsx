// ExtraPhotoO2 component for the STEM Camp interactive deck.
import { useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CAMP, T, f } from "../../theme.js";
import { useRAF } from "../../ui/hooks.js";
import { Btn, Caption, Field, Readout, Slider } from "../../ui/primitives.jsx";

function ExtraPhotoO2() {
  // Photosynthesis Float-Off: leaf disks at the bottom of a beaker of baking
  // soda solution. Light drives O2 production, each disk slowly fills, then
  // floats. Bubbles emit from active disks. Stats track time-to-half-float.
  const A = CAMP.trees.acc, C = CAMP.trees.ink;
  const okC = T.ok;
  const NUM_DISKS = 8;

  const [light, setLight] = useState(70);
  const [co2, setCo2] = useState(60);
  const [running, setRunning] = useState(false);
  const tRef = useRef(0);
  const disksRef = useRef(null);
  const bubblesRef = useRef([]);
  const halfTimeRef = useRef(null);
  const [, force] = useState(0);

  // Geometry: narrower beaker so the side panel has room
  const W = 540, H = 320;
  const beakerLeft = 110, beakerRight = 360;
  const beakerTop = 70, beakerBot = 280;
  const surfaceY = beakerTop + 18;
  const bottomY = beakerBot - 10;
  const lampCx = (beakerLeft + beakerRight) / 2;

  const initDisks = () => {
    const span = beakerRight - beakerLeft - 32;
    return Array.from({ length: NUM_DISKS }, (_, i) => ({
      i,
      x: beakerLeft + 16 + (span * (i + 0.5)) / NUM_DISKS,
      yFrac: 0,
      fill: 0,
      floated: false,
      vigor: 0.7 + Math.random() * 0.6,   // 0.7..1.3 so disks float at different times
    }));
  };
  if (disksRef.current == null) disksRef.current = initDisks();

  const reset = () => {
    tRef.current = 0;
    disksRef.current = initDisks();
    bubblesRef.current = [];
    halfTimeRef.current = null;
    setRunning(false);
    force((v) => v + 1);
  };
  const toggle = () => {
    if (running) {
      setRunning(false);
    } else {
      if (disksRef.current.every((d) => d.floated)) reset();
      setRunning(true);
    }
  };

  useRAF(running, (dt) => {
    tRef.current += dt;
    const lightF = light / 100;
    const co2F = co2 / 100;
    const ratePerSec = 0.00045 * Math.pow(lightF, 0.75) * (0.3 + co2F * 0.7);

    let floatedCount = 0;
    disksRef.current.forEach((d) => {
      if (d.floated) { floatedCount += 1; return; }
      d.fill = Math.min(1, d.fill + ratePerSec * d.vigor * dt);
      if (d.fill >= 0.6) {
        const rise = (d.fill - 0.5) * ratePerSec * dt * 12;
        d.yFrac = Math.min(1, d.yFrac + rise);
        if (d.yFrac >= 1) {
          d.floated = true;
          floatedCount += 1;
        }
      }
      const pBub = ratePerSec * dt * 80 * Math.max(0.1, d.fill);
      if (Math.random() < pBub) {
        const dy = bottomY - d.yFrac * (bottomY - surfaceY);
        bubblesRef.current.push({
          id: Math.random(),
          x: d.x + (Math.random() - 0.5) * 14,
          y: dy - 4,
          vy: 0.04 + Math.random() * 0.03,
          r: 1.5 + Math.random() * 1.8,
          life: 0,
        });
      }
    });
    bubblesRef.current = bubblesRef.current
      .map((b) => ({ ...b, y: b.y - b.vy * dt, life: b.life + dt }))
      .filter((b) => b.y > surfaceY - 2);

    if (halfTimeRef.current == null && floatedCount >= NUM_DISKS / 2) {
      halfTimeRef.current = tRef.current;
    }
    if (floatedCount >= NUM_DISKS) setRunning(false);
    force((v) => v + 1);
  });

  const elapsed = tRef.current;
  const floatedCount = disksRef.current.filter((d) => d.floated).length;
  const halfTime = halfTimeRef.current;

  return (
    <div>
      <Field height={330}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="o2Water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d6e8de" />
              <stop offset="0.45" stopColor="#c5dccf" />
              <stop offset="1" stopColor="#aecabb" />
            </linearGradient>
            <radialGradient id="o2Glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff3c4" stopOpacity="0.95" />
              <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* ===== LAMP at top (bell pendant) ===== */}
          {/* ceiling mount */}
          <rect x={lampCx - 14} y={0} width={28} height={4} fill={T.paper3} stroke={C} strokeWidth="1" />
          {/* hanging cord */}
          <line x1={lampCx} y1={4} x2={lampCx} y2={14} stroke={C} strokeWidth="1.1" />
          {/* lamp shade - bell curve */}
          <path d={`M ${lampCx - 6} 14
                    L ${lampCx + 6} 14
                    Q ${lampCx + 22} 18 ${lampCx + 30} 38
                    L ${lampCx - 30} 38
                    Q ${lampCx - 22} 18 ${lampCx - 6} 14 Z`}
            fill={T.paper3} stroke={C} strokeWidth="1.4" />
          {/* lamp inner rim */}
          <line x1={lampCx - 30} y1={38} x2={lampCx + 30} y2={38}
            stroke={C} strokeWidth="1" />
          {/* warm pool of light below the lamp, brightening with the light slider */}
          <ellipse cx={lampCx} cy={42} rx={30} ry={18} fill="url(#o2Glow)" opacity={0.1 + light / 100 * 0.5} />
          {/* glowing bulb (off at light=0, bright at 100) */}
          <ellipse cx={lampCx} cy={36} rx={10} ry={5}
            fill="#fff3c4" opacity={0.12 + light / 100 * 0.78} />
          {/* light cone */}
          <path d={`M ${lampCx - 28} 40
                    L ${lampCx + 28} 40
                    L ${beakerRight - 6} ${beakerTop - 2}
                    L ${beakerLeft + 6} ${beakerTop - 2} Z`}
            fill={A} opacity={0.02 + light / 100 * 0.24} />
          {/* sun rays */}
          {Array.from({ length: 9 }, (_, k) => {
            const x1 = lampCx - 24 + k * 6;
            const x2 = beakerLeft + 14 + k * (beakerRight - beakerLeft - 28) / 8;
            return (
              <line key={k} x1={x1} y1={42} x2={x2} y2={beakerTop - 2}
                stroke={A} strokeWidth="0.9"
                strokeDasharray="3 4"
                opacity={0.03 + light / 100 * 0.85} />
            );
          })}

          {/* ===== BEAKER ===== */}
          <path d={`M ${beakerLeft - 8} ${beakerTop}
                    L ${beakerLeft - 8} ${beakerBot - 14}
                    Q ${beakerLeft - 8} ${beakerBot} ${beakerLeft + 8} ${beakerBot}
                    L ${beakerRight - 8} ${beakerBot}
                    Q ${beakerRight + 8} ${beakerBot} ${beakerRight + 8} ${beakerBot - 14}
                    L ${beakerRight + 8} ${beakerTop}`}
            fill="none" stroke={C} strokeWidth="2" />
          {/* glass shine */}
          <line x1={beakerLeft - 4} y1={beakerTop + 18} x2={beakerLeft - 4} y2={beakerBot - 26}
            stroke={T.paper} strokeWidth="1.5" opacity="0.5" />

          {/* liquid */}
          <path d={`M ${beakerLeft - 6} ${surfaceY}
                    L ${beakerLeft - 6} ${beakerBot - 14}
                    Q ${beakerLeft - 6} ${beakerBot - 2} ${beakerLeft + 8} ${beakerBot - 2}
                    L ${beakerRight - 8} ${beakerBot - 2}
                    Q ${beakerRight + 6} ${beakerBot - 2} ${beakerRight + 6} ${beakerBot - 14}
                    L ${beakerRight + 6} ${surfaceY} Z`}
            fill="url(#o2Water)" opacity="0.92" />
          {/* water surface ripples - tiled to fit the full liquid width with no gap */}
          {(() => {
            const liqLeft = beakerLeft - 4;
            const liqRight = beakerRight + 4;
            const liqW = liqRight - liqLeft;
            const count = Math.max(1, Math.round(liqW / 28));   // how many wavelets fit
            const rippleW = liqW / count;                       // exact tile width
            const half = rippleW / 2;
            return Array.from({ length: count }, (_, k) => {
              const x = liqLeft + k * rippleW;
              return (
                <path key={k}
                  d={`M ${x} ${surfaceY} q ${half / 2} -3 ${half} 0 q ${half / 2} 3 ${half} 0`}
                  fill="none" stroke={C} strokeWidth="0.7" opacity="0.55" />
              );
            });
          })()}
          <text x={(beakerLeft + beakerRight) / 2} y={beakerBot + 18} textAnchor="middle" fill={T.mute}
            style={f.mono(600, 9, { upper: true, tracking: 0.18 })}>baking-soda solution</text>

          {/* ===== Bubbles ===== */}
          {bubblesRef.current.map((b) => (
            <g key={b.id}>
              <circle cx={b.x} cy={b.y} r={b.r}
                fill="#ffffff" stroke={C} strokeWidth="0.5" opacity="0.85" />
              <circle cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.35} r={b.r * 0.35}
                fill="#ffffff" opacity="0.85" />
            </g>
          ))}

          {/* ===== Leaf disks ===== */}
          {disksRef.current.map((d) => {
            const dy = bottomY - d.yFrac * (bottomY - surfaceY - 4);
            return (
              <g key={d.i}>
                <ellipse cx={d.x} cy={dy + 1} rx={11} ry={3.5}
                  fill={T.ink} opacity="0.15" />
                <ellipse cx={d.x} cy={dy} rx={11} ry={4.5}
                  fill="#5c8a4d" stroke={C} strokeWidth="1" />
                <ellipse cx={d.x} cy={dy - 1.4} rx={7} ry={1.5} fill="#86ad70" opacity="0.75" />
                <ellipse cx={d.x} cy={dy - 0.5} rx={9} ry={3}
                  fill="#9bb98a" opacity={d.fill} />
                {d.fill > 0.4 && !d.floated && (
                  <circle cx={d.x + 3} cy={dy - 0.5} r={1.4}
                    fill="#ffffff" opacity={0.8 * (d.fill - 0.3)} />
                )}
                {d.floated && (
                  <circle cx={d.x} cy={dy - 8} r={3} fill={okC} stroke={T.ink} strokeWidth="0.4" />
                )}
              </g>
            );
          })}

          {/* ===== Stats panel (right) - stacked labels above values to avoid collision ===== */}
          {(() => {
            const px = beakerRight + 24, py = beakerTop, pw = W - px - 16, ph = beakerBot - beakerTop;
            const block = (y, label, value, valColor) => (
              <g>
                <text x={px + 12} y={y} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>{label}</text>
                <text x={px + 12} y={y + 16} fill={valColor}
                  style={f.mono(700, 14)}>{value}</text>
              </g>
            );
            return (
              <g>
                <rect x={px} y={py} width={pw} height={ph} rx={8}
                  fill={T.paper2} stroke={C} strokeWidth="1.1" />
                <text x={px + pw / 2} y={py + 16} textAnchor="middle" fill={T.mute}
                  style={f.mono(600, 9, { upper: true, tracking: 0.22 })}>experiment</text>
                {block(py + 34, "floated", floatedCount + "/" + NUM_DISKS, okC)}
                {block(py + 70, "elapsed", (elapsed / 1000).toFixed(1) + "s", C)}
                {block(py + 106, "half float", halfTime == null ? "-" : (halfTime / 1000).toFixed(1) + "s", A)}
                {/* Mini progress bar of floated disks */}
                <text x={px + 12} y={py + 146} fill={T.mute}
                  style={f.mono(600, 8.5, { upper: true, tracking: 0.16 })}>progress</text>
                <rect x={px + 12} y={py + 152} width={pw - 24} height={8} rx={2}
                  fill={T.paper3} stroke={C} strokeWidth="0.6" />
                <rect x={px + 12} y={py + 152}
                  width={Math.max(0, (pw - 24) * (floatedCount / NUM_DISKS))} height={8} rx={2}
                  fill={okC} />
                {/* tick marks on the progress bar for each disk */}
                {Array.from({ length: NUM_DISKS - 1 }, (_, k) => (
                  <line key={"tk" + k}
                    x1={px + 12 + ((pw - 24) * (k + 1)) / NUM_DISKS} y1={py + 152}
                    x2={px + 12 + ((pw - 24) * (k + 1)) / NUM_DISKS} y2={py + 160}
                    stroke={C} strokeWidth="0.4" opacity="0.6" />
                ))}
                {/* status pill at the bottom */}
                <rect x={px + 10} y={py + ph - 28} width={pw - 20} height={22} rx={4}
                  fill={running ? okC : T.paper3} stroke={C} strokeWidth="0.8" />
                <text x={px + pw / 2} y={py + ph - 13} textAnchor="middle"
                  fill={running ? T.paper : T.ink}
                  style={f.mono(700, 9.5, { upper: true, tracking: 0.2 })}>
                  {running ? "running" : (floatedCount === NUM_DISKS ? "done" : "paused")}
                </text>
              </g>
            );
          })()}
        </svg>
      </Field>
      <div style={{ padding: "0 4px", display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Slider val={light} set={setLight} min={0} max={100} color={A}
          label="Light" suffix={light + "%"} />
        <Slider val={co2} set={setCo2} min={0} max={100} color={C}
          label="CO₂ (baking soda)" suffix={co2 + "%"} />
        <Btn small icon={running ? Pause : Play} color={A} onClick={toggle}>{running ? "pause" : "start"}</Btn>
        <Btn small icon={RotateCcw} onClick={reset}>reset</Btn>
      </div>
      <Readout items={[
        { l: "Floated", v: floatedCount + " / " + NUM_DISKS, color: okC },
        { l: "Half float", v: halfTime == null ? "-" : (halfTime / 1000).toFixed(1) + " s", color: A },
        { l: "Reaction", v: "6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂" },
      ]} />

      <Caption color={C}>
        Sunken leaf disks make oxygen when light hits them and carbon dioxide is
        in the water. The oxygen builds up inside each disk until it floats.
        More light and more CO₂ both speed the rate; the time until half the
        disks float is your measurement.
      </Caption>
    </div>
  );
}

export { ExtraPhotoO2 };
